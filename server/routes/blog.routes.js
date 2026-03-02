const express = require('express');
const router = express.Router();
const { getBlogs, getBlog, adminGetBlogs, createBlog, updateBlog, deleteBlog } = require('../controllers/blog.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', getBlogs);
router.get('/admin/all', protect, adminOnly, adminGetBlogs);
router.get('/:slug', getBlog);
router.post('/', protect, adminOnly, createBlog);
router.put('/:id', protect, adminOnly, updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

module.exports = router;
