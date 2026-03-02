const Order = require('../models/Order.model');
const User = require('../models/User.model');
const Product = require('../models/Product.model');
const Settings = require('../models/Settings.model');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
    try {
        const [totalOrders, totalCustomers, totalProducts, paidOrders] = await Promise.all([
            Order.countDocuments(),
            User.countDocuments({ role: 'user' }),
            Product.countDocuments(),
            Order.find({ paymentStatus: 'paid' }).select('total totalAmount createdAt').lean(),
        ]);

        const totalRevenue = (paidOrders || []).reduce((sum, o) => sum + (Number(o.total) || Number(o.totalAmount) || 0), 0);
        const totalOrdersCount = totalOrders || 0;
        const totalCustomersCount = totalCustomers || 0;
        const totalProductsCount = totalProducts || 0;

        // Monthly revenue (last 6 months) — shaped for Recharts
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyAgg = await Order.aggregate([
            { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    revenue: { $sum: { $ifNull: ['$total', '$totalAmount'] } },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);
        const revenueByMonth = monthlyAgg.map(m => ({
            month: (m._id && m._id.month) ? MONTHS[m._id.month - 1] : 'Unknown',
            revenue: m.revenue || 0,
        }));

        // New Users Over Time (last 6 months)
        const userAgg = await User.aggregate([
            { $match: { role: 'user', createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);
        const newUsersOverTime = userAgg.map(u => ({
            month: (u._id && u._id.month) ? MONTHS[u._id.month - 1] : 'Unknown',
            users: u.count || 0,
        }));

        // Top Selling Products (top 5)
        const topSellingAgg = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    sales: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: [{ $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 0] }] } },
                },
            },
            { $sort: { sales: -1 } },
            { $limit: 5 },
        ]);

        // Recent orders
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const mappedOrders = (recentOrders || []).map(o => ({
            ...o,
            status: o.status || o.orderStatus || 'pending',
            total: o.total || o.totalAmount || 0,
        }));

        res.json({
            success: true,
            totalRevenue,
            totalOrders,
            totalProducts,
            totalCustomers,
            revenueByMonth,
            newUsersOverTime,
            topSellingProducts: topSellingAgg,
            recentOrders: mappedOrders,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET ALL CUSTOMERS ────────────────────────────────────────────────────────
exports.getCustomers = async (req, res) => {
    try {
        const customers = await User.find().sort({ createdAt: -1 }).select('-password');
        res.json({ success: true, customers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPDATE CUSTOMER ROLE ─────────────────────────────────────────────────────
exports.updateCustomerRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role))
            return res.status(400).json({ success: false, message: 'Invalid role.' });
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, message: `${user.name} is now a ${role}.`, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPDATE SETTINGS ──────────────────────────────────────────────────────────
exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        for (const [key, value] of Object.entries(updates)) {
            await Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
        }
        res.json({ success: true, message: 'Settings updated.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: DELETE CUSTOMER ───────────────────────────────────────────────────
exports.deleteCustomer = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // PROTECT SUPER ADMIN
        if (user.email === process.env.ADMIN_EMAIL) {
            return res.status(403).json({ success: false, message: 'Cannot delete Super Admin account' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET SETTINGS ─────────────────────────────────────────────────────────────
exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.find();
        const settingsMap = {};
        settings.forEach(s => { settingsMap[s.key] = s.value; });
        res.json({ success: true, settings: settingsMap });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPDATE SETTINGS ──────────────────────────────────────────────────────────
exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        // updates is { deliveryCharge: 60, ... }
        // We need to update each key in the Settings collection
        const keys = Object.keys(updates);

        for (const key of keys) {
            await Settings.findOneAndUpdate(
                { key },
                { value: updates[key] },
                { upsert: true, new: true }
            );
        }

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
