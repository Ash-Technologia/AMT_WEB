const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, unique: true },
        description: { type: String, default: '' },
        howToUse: { type: String, default: '' },
        instructions: { type: String, default: '' },
        videoUrl: { type: String, default: '' },
        price: { type: Number, required: true, min: 0 },
        discountPrice: { type: Number, default: 0 },
        stock: { type: Number, required: true, default: 0, min: 0 },
        images: [{ url: String, publicId: String }],
        isVisible: { type: Boolean, default: true },
        ratings: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
        },
        tags: [String],
    },
    { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function () {
    if (this.discountPrice && this.price > 0) {
        return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
