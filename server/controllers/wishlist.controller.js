const User = require('../models/User.model');

// ─── GET WISHLIST ─────────────────────────────────────────────────────────────
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist', 'name price discountPrice images slug ratings stock');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, wishlist: user.wishlist || [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── TOGGLE WISHLIST ──────────────────────────────────────────────────────────
exports.toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user._id);
        const index = user.wishlist.indexOf(productId);

        let action;
        if (index > -1) {
            user.wishlist.splice(index, 1);
            action = 'removed';
        } else {
            user.wishlist.push(productId);
            action = 'added';
        }
        await user.save();
        res.json({ success: true, action, wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
