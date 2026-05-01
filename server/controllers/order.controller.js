const Order = require('../models/Order.model');
const User = require('../models/User.model');
const Product = require('../models/Product.model');
const Coupon = require('../models/Coupon.model');
const Settings = require('../models/Settings.model');
const { sendEmail, emailTemplates } = require('../services/email.service');
const { getIO } = require('../socket');

// ─── CREATE BOOKING ───────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, notes, couponCode } = req.body;

        // ── Feature #1: Real-time stock validation ──────────────────────────────
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ success: false, message: `Product not found: ${item.name || item.product}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `"${product.name}" only has ${product.stock} units in stock, but you requested ${item.quantity}.`,
                    outOfStock: true,
                    productId: product._id,
                });
            }
        }

        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Get shipping charge from settings
        const shippingSetting = await Settings.findOne({ key: 'shippingCharge' });
        const shippingCharge = shippingSetting ? Number(shippingSetting.value) : 0;

        // ── Feature #9: Coupon validation & discount ────────────────────────────
        let couponApplied = { code: '', discount: 0 };
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (coupon && coupon.expiryDate > new Date() && coupon.usedCount < coupon.maxUses && subtotal >= coupon.minOrderAmount) {
                const discount = coupon.discountType === 'percent'
                    ? Math.round((subtotal * coupon.discountValue) / 100)
                    : coupon.discountValue;
                couponApplied = { code: coupon.code, discount };
                // Increment usage count
                await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
            }
        }

        const totalAmount = Math.max(0, subtotal + shippingCharge - couponApplied.discount);

        // Delivery estimate from settings
        const deliverySetting = await Settings.findOne({ key: 'deliveryEstimate' });
        const deliveryEstimate = deliverySetting ? deliverySetting.value : '5-7 business days';

        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress,
            paymentMethod: 'booking',
            paymentStatus: 'pending',
            subtotal,
            shippingCharge,
            couponApplied,
            totalAmount,
            deliveryEstimate,
            notes: notes || '',
        });

        // Decrement product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }

        // Clear user cart
        await User.findByIdAndUpdate(req.user._id, { cart: [] });

        // Send confirmation email to User
        try {
            await sendEmail(
                req.user.email,
                `Booking Confirmed — #${order._id}`,
                emailTemplates.orderConfirmation(req.user.name, order._id, items, totalAmount)
            );
        } catch (_) { /* Email not critical */ }

        // Send notification email to Admin
        try {
            await sendEmail(
                process.env.ADMIN_EMAIL,
                `New Booking Received — #${order._id}`,
                emailTemplates.adminOrderNotification(req.user.name, order._id, items, totalAmount)
            );
        } catch (_) { /* Email not critical */ }

        res.status(201).json({ success: true, order });

        // ── Real-time: Notify admin of new booking ──
        try {
            getIO().to('admin').emit('order:new', {
                orderId: order._id,
                totalAmount: order.totalAmount,
                userName: req.user.name,
            });
        } catch (_) { /* Socket not critical */ }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET MY ORDERS ────────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, orders: orders || [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET SINGLE ORDER ─────────────────────────────────────────────────────────
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email phone');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
            return res.status(403).json({ success: false, message: 'Access denied.' });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Feature #6: USER CANCEL ORDER ────────────────────────────────────────────
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        // Only the owner can cancel their order
        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        // Can only cancel if still in 'Placed' status
        if (!['Placed', 'Confirmed'].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled — it is already "${order.orderStatus}".`,
            });
        }

        order.orderStatus = 'Cancelled';
        await order.save();

        // Restore stock
        for (const item of order.items) {
            if (item.product) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
            }
        }

        // Send cancellation email
        try {
            await sendEmail(
                order.user.email,
                `Order Cancelled — #${order._id}`,
                emailTemplates.orderCancelled(order.user.name, order._id, order.items, order.totalAmount)
            );
        } catch (_) { /* Email not critical */ }

        res.json({ success: true, order });

        // Notify admin dashboard
        try {
            getIO().to('admin').emit('dashboard:refresh', {});
        } catch (_) {}
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: GET ALL ORDERS ────────────────────────────────────────────────────
exports.adminGetOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = status ? { orderStatus: status } : {};
        const skip = (Number(page) - 1) * Number(limit);
        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        res.json({ success: true, orders, total });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: UPDATE ORDER STATUS ───────────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, paymentStatus, trackingInfo, deliveryEstimate } = req.body;
        const update = {
            ...(orderStatus && { orderStatus }),
            ...(paymentStatus && { paymentStatus }),
            ...(trackingInfo && { trackingInfo }),
            ...(deliveryEstimate && { deliveryEstimate }),
        };
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        ).populate('user', 'name email');

        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
        res.json({ success: true, order });

        // ── Feature #10: Send email notification on status change ──────────────
        if (orderStatus === 'Shipped' || orderStatus === 'Delivered') {
            try {
                const subject = orderStatus === 'Shipped'
                    ? `Your Order Has Been Shipped — #${order._id}`
                    : `Your Order Has Been Delivered — #${order._id}`;
                const template = orderStatus === 'Shipped'
                    ? emailTemplates.orderShipped(order.user.name, order._id, order.items, order.totalAmount, trackingInfo)
                    : emailTemplates.orderDelivered(order.user.name, order._id, order.items, order.totalAmount);
                await sendEmail(order.user.email, subject, template);
            } catch (_) { /* Email not critical */ }
        }

        // ── Real-time: notify user + refresh admin dashboard ──
        try {
            const io = getIO();
            io.to(`user:${order.user._id}`).emit('order:status', {
                orderId: order._id,
                orderStatus: order.orderStatus,
                trackingInfo: order.trackingInfo,
            });
            io.to('admin').emit('dashboard:refresh', {});
        } catch (_) { /* Socket not critical */ }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PUBLIC TRACK ORDER ──────────────────────────────────────────────────────
exports.trackOrder = async (req, res) => {
    try {
        const { email } = req.query;
        const order = await Order
            .findById(req.params.id)
            .populate('user', 'email')
            .select('items orderStatus trackingInfo shippingAddress totalAmount createdAt user deliveryEstimate');

        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        // Verify email matches to prevent enumeration attacks
        if (email?.toLowerCase() !== order.user?.email?.toLowerCase()) {
            return res.status(403).json({ success: false, message: 'Order not found or email mismatch.' });
        }

        // Sanitize — strip user reference from response
        const safe = order.toObject();
        delete safe.user;
        res.json({ success: true, order: safe });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
