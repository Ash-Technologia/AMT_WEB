const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order.model');
const User = require('../models/User.model');
const Coupon = require('../models/Coupon.model');
const Settings = require('../models/Settings.model');
const { sendEmail, emailTemplates } = require('../services/email.service');
const { getIO } = require('../socket');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── CREATE RAZORPAY ORDER ────────────────────────────────────────────────────
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body; // amount in paise
        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };
        const razorpayOrder = await razorpay.orders.create(options);
        res.json({ success: true, order: razorpayOrder });
    } catch (err) {
        console.error('Razorpay Create Order Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── VERIFY RAZORPAY PAYMENT ──────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature)
            return res.status(400).json({ success: false, message: 'Payment verification failed.' });

        res.json({ success: true, message: 'Payment verified.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, razorpayOrderId, razorpayPaymentId, couponCode, notes } = req.body;

        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Get shipping charge from settings
        const shippingSetting = await Settings.findOne({ key: 'shippingCharge' });
        const shippingCharge = shippingSetting ? shippingSetting.value : 60;

        // Apply coupon
        let couponApplied = { code: '', discount: 0 };
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (coupon && coupon.expiryDate > new Date() && coupon.usedCount < coupon.maxUses && subtotal >= coupon.minOrderAmount) {
                const discount = coupon.discountType === 'percent'
                    ? Math.round((subtotal * coupon.discountValue) / 100)
                    : coupon.discountValue;
                couponApplied = { code: coupon.code, discount };
                coupon.usedCount += 1;
                await coupon.save();
            }
        }

        const totalAmount = subtotal + shippingCharge - couponApplied.discount;

        // Delivery estimate from settings
        const deliverySetting = await Settings.findOne({ key: 'deliveryEstimate' });
        const deliveryEstimate = deliverySetting ? deliverySetting.value : '5-7 business days';

        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending',
            razorpayOrderId: razorpayOrderId || '',
            razorpayPaymentId: razorpayPaymentId || '',
            subtotal,
            shippingCharge,
            couponApplied,
            totalAmount,
            deliveryEstimate,
            notes: notes || '',
        });

        // Clear user cart
        await User.findByIdAndUpdate(req.user._id, { cart: [] });

        // Send confirmation email to User
        await sendEmail(
            req.user.email,
            `Order Confirmed — #${order._id}`,
            emailTemplates.orderConfirmation(req.user.name, order._id, items, totalAmount)
        );

        // Send notification email to Admin
        await sendEmail(
            process.env.ADMIN_EMAIL,
            `New Order Received — #${order._id}`,
            emailTemplates.adminOrderNotification(req.user.name, order._id, items, totalAmount)
        );

        res.status(201).json({ success: true, order });

        // ── Real-time: Notify admin of new order ──
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
        const { orderStatus, trackingInfo, deliveryEstimate } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus, ...(trackingInfo && { trackingInfo }), ...(deliveryEstimate && { deliveryEstimate }) },
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

