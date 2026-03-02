const Coupon = require('../models/Coupon.model');

// ─── VALIDATE COUPON ──────────────────────────────────────────────────────────
exports.validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
        if (coupon.expiryDate < new Date()) return res.status(400).json({ success: false, message: 'Coupon has expired.' });
        if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });
        if (orderAmount < coupon.minOrderAmount) return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}.` });

        const discount = coupon.discountType === 'percent'
            ? Math.round((orderAmount * coupon.discountValue) / 100)
            : coupon.discountValue;

        res.json({ success: true, coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, discount } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: GET ALL COUPONS ───────────────────────────────────────────────────
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: CREATE COUPON ─────────────────────────────────────────────────────
exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, coupon });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: UPDATE COUPON ─────────────────────────────────────────────────────
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
        res.json({ success: true, coupon });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: DELETE COUPON ─────────────────────────────────────────────────────
exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Coupon deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
