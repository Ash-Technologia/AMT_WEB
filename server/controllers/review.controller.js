const Review = require('../models/Review.model');
const Product = require('../models/Product.model');
const { updateProductRatings } = require('./product.controller');

// ─── ADD REVIEW ───────────────────────────────────────────────────────────────
exports.addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;

        const existing = await Review.findOne({ product: productId, user: req.user._id });
        if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });

        const review = await Review.create({ product: productId, user: req.user._id, rating, comment });
        await updateProductRatings(productId);

        res.status(201).json({ success: true, review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET REVIEWS FOR PRODUCT ──────────────────────────────────────────────────
exports.getReviews = async (req, res) => {
    try {
        const param = req.params.productId;
        // param can be a slug (string) or a MongoDB ObjectId
        const isObjectId = /^[a-f\d]{24}$/i.test(param);
        let productId;
        if (isObjectId) {
            productId = param;
        } else {
            const product = await Product.findOne({ slug: param });
            if (!product) return res.json({ success: true, reviews: [] });
            productId = product._id;
        }
        const reviews = await Review.find({ product: productId, isApproved: true })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ─── ADMIN: GET ALL REVIEWS ───────────────────────────────────────────────────
exports.adminGetReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name email')
            .populate('product', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: APPROVE REVIEW ────────────────────────────────────────────────────
exports.approveReview = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: isApproved !== undefined ? isApproved : true }, { new: true });
        if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
        await updateProductRatings(review.product);
        res.json({ success: true, review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: DELETE REVIEW ─────────────────────────────────────────────────────
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
        await updateProductRatings(review.product);
        res.json({ success: true, message: 'Review deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
