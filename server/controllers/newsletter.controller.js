const Newsletter = require('../models/Newsletter.model');
const { sendEmail } = require('../services/email.service');

// ─── SUBSCRIBE ────────────────────────────────────────────────────────────────
exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        const existing = await Newsletter.findOne({ email });
        if (existing) {
            if (existing.isSubscribed) return res.status(400).json({ success: false, message: 'Already subscribed.' });
            existing.isSubscribed = true;
            existing.subscribedAt = new Date();
            await existing.save();
        } else {
            await Newsletter.create({ email });
        }
        res.json({ success: true, message: 'Subscribed successfully! 🌿' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UNSUBSCRIBE ──────────────────────────────────────────────────────────────
exports.unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;
        await Newsletter.findOneAndUpdate({ email }, { isSubscribed: false, unsubscribedAt: new Date() });
        res.json({ success: true, message: 'Unsubscribed successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: GET SUBSCRIBERS ───────────────────────────────────────────────────
exports.getSubscribers = async (req, res) => {
    try {
        const subscribers = await Newsletter.find({ isSubscribed: true }).sort({ subscribedAt: -1 });
        res.json({ success: true, subscribers, total: subscribers.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: SEND NEWSLETTER ───────────────────────────────────────────────────
exports.sendNewsletter = async (req, res) => {
    try {
        const { subject, html } = req.body;
        const subscribers = await Newsletter.find({ isSubscribed: true });
        const emails = subscribers.map(s => s.email);

        // Send in batches of 50
        const batchSize = 50;
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            await Promise.all(batch.map(email => sendEmail(email, subject, html)));
        }

        res.json({ success: true, message: `Newsletter sent to ${emails.length} subscribers.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
