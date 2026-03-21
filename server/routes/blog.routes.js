const express = require('express');
const router = express.Router();
const { getBlogs, getBlog, adminGetBlogs, createBlog, updateBlog, deleteBlog } = require('../controllers/blog.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', getBlogs);
router.get('/admin/all', protect, adminOnly, adminGetBlogs);
router.get('/:slug', getBlog);
router.post('/', protect, adminOnly, upload.single('coverImage'), createBlog);
router.put('/:id', protect, adminOnly, upload.single('coverImage'), updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

module.exports = router;
