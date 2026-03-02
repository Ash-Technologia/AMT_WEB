const express = require('express');
const router = express.Router();
const { getDashboard, getCustomers, updateCustomerRole, deleteCustomer, updateSettings, getSettings } = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/dashboard', protect, adminOnly, getDashboard);
router.get('/stats', protect, adminOnly, getDashboard);        // alias used by frontend
router.get('/customers', protect, adminOnly, getCustomers);
router.patch('/customers/:id/role', protect, adminOnly, updateCustomerRole);
router.delete('/customers/:id', protect, adminOnly, deleteCustomer);
router.get('/settings', protect, adminOnly, getSettings);
router.put('/settings', protect, adminOnly, updateSettings);

module.exports = router;

