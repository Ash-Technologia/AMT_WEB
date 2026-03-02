const Product = require('../models/Product.model');
const Review = require('../models/Review.model');
const cloudinary = require('../config/cloudinary');
const { getIO } = require('../socket');

// ─── GET ALL PRODUCTS ─────────────────────────────────────────────────────────
exports.getProducts = async (req, res) => {
    try {
        const { search, sort, minPrice, maxPrice, inStock, category, page = 1, limit = 12 } = req.query;
        // Match products that are explicitly visible OR where the field doesn't exist yet (legacy docs)
        const query = { isVisible: { $ne: false } };

        if (search) query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
        ];
        if (category) query.category = { $regex: `^${category}$`, $options: 'i' };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (inStock === 'true') query.stock = { $gt: 0 };

        const sortOptions = {
            'price-asc': { price: 1 }, 'price_asc': { price: 1 },
            'price-desc': { price: -1 }, 'price_desc': { price: -1 },
            'rating': { 'ratings.average': -1 },
            'newest': { createdAt: -1 },
        };
        const sortBy = sortOptions[sort] || { createdAt: -1 };

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Product.countDocuments(query);
        const products = await Product.find(query).sort(sortBy).skip(skip).limit(Number(limit));

        res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET CATEGORIES ───────────────────────────────────────────────────────────
exports.getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isVisible: { $ne: false }, category: { $ne: '' } });
        res.json({ success: true, categories: categories.sort() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ─── GET SINGLE PRODUCT ───────────────────────────────────────────────────────
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isVisible: { $ne: false } });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

        const reviews = await Review.find({ product: product._id, isApproved: true })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        res.json({ success: true, product, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── CREATE PRODUCT (Admin) ───────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPDATE PRODUCT (Admin) ───────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, product });

        // ── Real-time: notify all clients of stock/product update ──
        try {
            getIO().emit('stock:update', { ids: [req.params.id], updates: req.body });
        } catch (_) { /* Socket not critical */ }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── DELETE PRODUCT (Admin) ───────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

        // Delete images from Cloudinary
        for (const img of product.images) {
            if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
        }
        await product.deleteOne();
        res.json({ success: true, message: 'Product deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── TOGGLE VISIBILITY (Admin) ────────────────────────────────────────────────
exports.toggleVisibility = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        product.isVisible = !product.isVisible;
        await product.save();
        res.json({ success: true, isVisible: product.isVisible });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET ALL PRODUCTS (Admin — includes hidden) ───────────────────────────────
exports.adminGetProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPDATE PRODUCT RATINGS ───────────────────────────────────────────────────
exports.updateProductRatings = async (productId) => {
    const reviews = await Review.find({ product: productId, isApproved: true });
    if (reviews.length === 0) {
        await Product.findByIdAndUpdate(productId, { 'ratings.average': 0, 'ratings.count': 0 });
        return;
    }
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, {
        'ratings.average': Math.round(avg * 10) / 10,
        'ratings.count': reviews.length,
    });
};
// ─── GET PRODUCT SUGGESTIONS (Smart Search) ──────────────────────────────────
exports.getSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json({ success: true, suggestions: [] });

        const suggestions = await Product.find({
            isVisible: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } }
            ]
        })
            .select('name slug images price discountPrice')
            .limit(5)
            .lean();

        res.json({ success: true, suggestions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── BULK UPDATE PRODUCTS (Admin) ──────────────────────────────────────────
exports.bulkUpdateProducts = async (req, res) => {
    try {
        const { ids, updates } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No product IDs provided' });
        }

        const allowedUpdates = ['stock', 'isVisible', 'category', 'tags'];
        const finalUpdates = {};

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                if (key === 'tags' && typeof updates[key] === 'string') {
                    finalUpdates[key] = updates[key].split(',').map(t => t.trim());
                } else {
                    finalUpdates[key] = updates[key];
                }
            }
        });

        if (Object.keys(finalUpdates).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid updates provided' });
        }

        await Product.updateMany(
            { _id: { $in: ids } },
            { $set: finalUpdates }
        );

        res.json({ success: true, message: `Updated ${ids.length} products successfully` });

        // ── Real-time: broadcast stock changes to all clients ──
        try {
            getIO().emit('stock:update', { ids, updates: finalUpdates });
        } catch (_) { /* Socket not critical */ }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

