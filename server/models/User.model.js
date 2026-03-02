const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, select: false },
        phone: { type: String, default: '' },
        avatar: { type: String, default: '' },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        googleId: { type: String, default: '' },
        isVerified: { type: Boolean, default: false },

        // ── Optional profile details (user-controlled privacy) ──────────────────
        profession: { type: String, default: '' },
        dob: { type: Date, default: null },
        gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say', ''], default: '' },
        city: { type: String, default: '' },
        bio: { type: String, default: '', maxlength: 500 },
        website: { type: String, default: '' },
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        shareProfileWithAdmin: { type: Boolean, default: false }, // consent flag

        // ── OTP fields ──────────────────────────────────────────────────────────
        otp: { type: String, select: false },
        otpExpiry: { type: Date, select: false },
        phoneOtp: { type: String, select: false },
        phoneOtpExpiry: { type: Date, select: false },
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpiry: { type: Date, select: false },

        // ── Phone change (pending verification) ─────────────────────────────────
        pendingPhone: { type: String, select: false },
        pendingPhoneOtp: { type: String, select: false },
        pendingPhoneOtpExpiry: { type: Date, select: false },

        addresses: [addressSchema],
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        cart: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                quantity: { type: Number, default: 1, min: 1 },
            },
        ],
        recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
