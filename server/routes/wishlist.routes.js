const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist } = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getWishlist);
router.post('/toggle/:productId', protect, toggleWishlist);

module.exports = router;
