const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true },
        content: { type: String, required: true },
        excerpt: { type: String, default: '' },
        coverImage: { url: String, publicId: String },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        tags: [String],
        isPublished: { type: Boolean, default: false },
        views: { type: Number, default: 0 },
    },
    { timestamps: true }
);

blogSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Blog', blogSchema);
