const Order = require('../models/Order.model');
const User = require('../models/User.model');
const Coupon = require('../models/Coupon.model');
const Settings = require('../models/Settings.model');
const { sendEmail, emailTemplates } = require('../services/email.service');
const { getIO } = require('../socket');

// ─── CREATE BOOKING ───────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, notes } = req.body;

        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Get shipping charge from settings
        const shippingSetting = await Settings.findOne({ key: 'shippingCharge' });
        const shippingCharge = shippingSetting ? shippingSetting.value : 0;

        const totalAmount = subtotal + shippingCharge;

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
            couponApplied: { code: '', discount: 0 },
            totalAmount,
            deliveryEstimate,
            notes: notes || '',
        });

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
            .select('items orderStatus trackingInfo shippingAddress totalAmount createdAt user');

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
