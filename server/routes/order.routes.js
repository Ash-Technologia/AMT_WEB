const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, createOrder, getMyOrders, getOrder, adminGetOrders, updateOrderStatus, trackOrder } = require('../controllers/order.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Public: track order by ID + email
router.get('/track/:id', trackOrder);

router.post('/razorpay/create', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyPayment);
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/admin/all', protect, adminOnly, adminGetOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
