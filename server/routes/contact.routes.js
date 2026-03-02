const express = require('express');
const router = express.Router();
const { submitQuery, getQueries, replyToQuery, deleteQuery, confirmFulfillment } = require('../controllers/contact.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.post('/', submitQuery);
router.get('/', protect, adminOnly, getQueries);
router.post('/:id/reply', protect, adminOnly, replyToQuery);
router.delete('/:id', protect, adminOnly, deleteQuery);
router.get('/fulfill/:id', confirmFulfillment);

module.exports = router;
