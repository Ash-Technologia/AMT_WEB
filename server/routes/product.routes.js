const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getCategories, createProduct, updateProduct, deleteProduct, toggleVisibility, adminGetProducts, getSuggestions, bulkUpdateProducts } = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', getProducts);
router.get('/suggestions', getSuggestions);
router.get('/categories', getCategories);
router.get('/admin/all', protect, adminOnly, adminGetProducts);
router.get('/:slug', getProduct);

router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.patch('/bulk-update', protect, adminOnly, bulkUpdateProducts);
router.patch('/:id/visibility', protect, adminOnly, toggleVisibility);

module.exports = router;
