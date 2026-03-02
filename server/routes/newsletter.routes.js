const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, getSubscribers, sendNewsletter } = require('../controllers/newsletter.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/', protect, adminOnly, getSubscribers);
router.post('/send', protect, adminOnly, sendNewsletter);

module.exports = router;
