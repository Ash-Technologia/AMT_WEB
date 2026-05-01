const express = require('express');
const router = express.Router();
const {
    createOrder, getMyOrders, getOrder,
    adminGetOrders, updateOrderStatus, trackOrder, cancelOrder
} = require('../controllers/order.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { validateOrder } = require('../middleware/validate.middleware');

// Public: track order by ID + email verification
router.get('/track/:id', trackOrder);

// User routes
router.post('/', protect, validateOrder, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrder);

// ── Feature #6: User can cancel their own order ──
router.patch('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/admin/all', protect, adminOnly, adminGetOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
