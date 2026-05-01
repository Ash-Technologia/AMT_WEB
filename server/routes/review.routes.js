const express = require('express');
const router = express.Router();
const { addReview, getReviews, adminGetReviews, approveReview, deleteReview } = require('../controllers/review.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { validateReview } = require('../middleware/validate.middleware');

router.get('/admin/all', protect, adminOnly, adminGetReviews);
router.get('/:productId', getReviews);
router.post('/:productId', protect, validateReview, addReview);
router.patch('/:id/approve', protect, adminOnly, approveReview);
router.delete('/:id', protect, adminOnly, deleteReview);

module.exports = router;
