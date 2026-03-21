const Blog = require('../models/Blog.model');
const cloudinary = require('../config/cloudinary');

// ─── GET ALL PUBLISHED BLOGS ──────────────────────────────────────────────────
exports.getBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 9, tag } = req.query;
        const query = { isPublished: true };
        if (tag) query.tags = tag;
        const skip = (Number(page) - 1) * Number(limit);
        const total = await Blog.countDocuments(query);
        const blogs = await Blog.find(query)
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select('-content');
        res.json({ success: true, blogs, total, pages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET SINGLE BLOG ──────────────────────────────────────────────────────────
exports.getBlog = async (req, res) => {
    try {
        const blog = await Blog.findOneAndUpdate(
            { slug: req.params.slug, isPublished: true },
            { $inc: { views: 1 } },
            { new: true }
        ).populate('author', 'name avatar');
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
        res.json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: GET ALL BLOGS ─────────────────────────────────────────────────────
exports.adminGetBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().populate('author', 'name').sort({ createdAt: -1 }).select('-content');
        res.json({ success: true, blogs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: CREATE BLOG ───────────────────────────────────────────────────────
exports.createBlog = async (req, res) => {
    try {
        if (req.file) {
            req.body.coverImage = { url: req.file.path, publicId: req.file.filename };
        }
        const blog = await Blog.create({ ...req.body, author: req.user._id });
        res.status(201).json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: UPDATE BLOG ───────────────────────────────────────────────────────
exports.updateBlog = async (req, res) => {
    try {
        if (req.file) {
            req.body.coverImage = { url: req.file.path, publicId: req.file.filename };
        } else if (req.body.removeCover === 'true') {
            req.body.coverImage = null; // or empty obj
        }
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
        res.json({ success: true, blog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: DELETE BLOG ───────────────────────────────────────────────────────
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
        if (blog.coverImage?.publicId) await cloudinary.uploader.destroy(blog.coverImage.publicId);
        await blog.deleteOne();
        res.json({ success: true, message: 'Blog deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
