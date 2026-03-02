const ContactQuery = require('../models/ContactQuery.model');
const { sendEmail, emailTemplates } = require('../services/email.service');

// ─── SUBMIT QUERY ─────────────────────────────────────────────────────────────
exports.submitQuery = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        const query = await ContactQuery.create({ name, email, phone, subject, message });

        // Notify admin
        await sendEmail(
            process.env.ADMIN_EMAIL,
            `New Contact Query: ${subject || 'No Subject'} — AMT`,
            emailTemplates.contactSubmission(name, email, phone, subject, message)
        );

        // Auto-acknowledge to user
        await sendEmail(
            email,
            'We received your query — AMT',
            emailTemplates.contactAck(name, subject)
        );

        res.status(201).json({ success: true, message: 'Your query has been submitted. We will get back to you soon!', query });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: GET ALL QUERIES ───────────────────────────────────────────────────
exports.getQueries = async (req, res) => {
    try {
        const { replied } = req.query;
        const filter = replied !== undefined ? { isReplied: replied === 'true' } : {};
        const queries = await ContactQuery.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, queries });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: REPLY TO QUERY ────────────────────────────────────────────────────
exports.replyToQuery = async (req, res) => {
    try {
        const { replyMessage } = req.body;
        const query = await ContactQuery.findByIdAndUpdate(
            req.params.id,
            { isReplied: true, replyMessage, repliedAt: new Date() },
            { new: true }
        );
        if (!query) return res.status(404).json({ success: false, message: 'Query not found.' });

        await sendEmail(
            query.email,
            `Re: ${query.subject || 'Your Query'} — AMT`,
            emailTemplates.contactReply(query.name, replyMessage, query._id)
        );
        res.json({ success: true, message: 'Reply sent successfully.', query });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADMIN: DELETE QUERY ──────────────────────────────────────────────────────
exports.deleteQuery = async (req, res) => {
    try {
        const query = await ContactQuery.findByIdAndDelete(req.params.id);
        if (!query) return res.status(404).json({ success: false, message: 'Query not found.' });
        res.json({ success: true, message: 'Query deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── USER: CONFIRM FULFILLMENT (AUTO-DELETE) ──────────────────────────────────
exports.confirmFulfillment = async (req, res) => {
    try {
        const query = await ContactQuery.findByIdAndDelete(req.params.id);
        if (!query) {
            return res.send(`
                <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #2D6A4F;">Link Expired</h1>
                    <p>This query has already been fulfilled or removed. Thank you!</p>
                    <a href="/" style="color: #52B788;">Return to Home</a>
                </div>
            `);
        }
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #2D6A4F;">Query Fulfilled</h1>
                <p>Thank you for your feedback! We're glad we could help. Your query has been resolved.</p>
                <a href="/" style="color: #52B788;">Return to Home</a>
            </div>
        `);
    } catch (err) {
        res.status(500).send('An error occurred.');
    }
};
