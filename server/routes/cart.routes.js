const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCart, removeFromCart, clearCart, syncCart } = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.post('/sync', protect, syncCart);
router.put('/update', protect, updateCart);
router.delete('/remove/:productId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router;
