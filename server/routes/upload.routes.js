const express = require('express');
const router = express.Router();
const { uploadImage, uploadImages, deleteImage } = require('../controllers/upload.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Admin-only image uploads (products, blogs, etc.)
router.post('/image', protect, adminOnly, upload.single('image'), uploadImage);
router.post('/images', protect, adminOnly, upload.array('images', 10), uploadImages);
router.delete('/image', protect, adminOnly, deleteImage);

// Any logged-in user can upload their avatar
router.post('/avatar', protect, upload.single('image'), uploadImage);

module.exports = router;
