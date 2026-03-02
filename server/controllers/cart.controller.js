const User = require('../models/User.model');
const Product = require('../models/Product.model');

// ─── GET CART ─────────────────────────────────────────────────────────────────
exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('cart.product', 'name price discountPrice images stock slug');
        res.json({ success: true, cart: user.cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADD TO CART ──────────────────────────────────────────────────────────────
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock.' });

        const user = await User.findById(req.user._id);
        const existingItem = user.cart.find(item => item.product.toString() === productId);

        if (existingItem) {
            existingItem.quantity = Math.min(existingItem.quantity + quantity, product.stock);
        } else {
            user.cart.push({ product: productId, quantity });
        }
        await user.save();

        const updatedUser = await User.findById(req.user._id).populate('cart.product', 'name price discountPrice images stock slug');
        res.json({ success: true, cart: updatedUser.cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPDATE CART ITEM ─────────────────────────────────────────────────────────
exports.updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const user = await User.findById(req.user._id);
        const item = user.cart.find(i => i.product.toString() === productId);
        if (!item) return res.status(404).json({ success: false, message: 'Item not in cart.' });

        if (quantity <= 0) {
            user.cart = user.cart.filter(i => i.product.toString() !== productId);
        } else {
            item.quantity = quantity;
        }
        await user.save();

        const updatedUser = await User.findById(req.user._id).populate('cart.product', 'name price discountPrice images stock slug');
        res.json({ success: true, cart: updatedUser.cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── REMOVE FROM CART ─────────────────────────────────────────────────────────
exports.removeFromCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.cart = user.cart.filter(i => i.product.toString() !== req.params.productId);
        await user.save();
        res.json({ success: true, message: 'Item removed from cart.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── CLEAR CART ───────────────────────────────────────────────────────────────
exports.clearCart = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { cart: [] });
        res.json({ success: true, message: 'Cart cleared.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── SYNC CART (from localStorage on login) ───────────────────────────────────
exports.syncCart = async (req, res) => {
    try {
        const { items } = req.body; // [{ productId, quantity }]
        const user = await User.findById(req.user._id);

        for (const item of items) {
            const existing = user.cart.find(c => c.product.toString() === item.productId);
            if (existing) {
                existing.quantity = Math.max(existing.quantity, item.quantity);
            } else {
                user.cart.push({ product: item.productId, quantity: item.quantity });
            }
        }
        await user.save();
        const updatedUser = await User.findById(req.user._id).populate('cart.product', 'name price discountPrice images stock slug');
        res.json({ success: true, cart: updatedUser.cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
