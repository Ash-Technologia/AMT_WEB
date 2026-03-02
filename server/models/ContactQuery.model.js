const mongoose = require('mongoose');

const contactQuerySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, default: '' },
        subject: { type: String, default: 'General Inquiry' },
        message: { type: String, required: true },
        isReplied: { type: Boolean, default: false },
        replyMessage: { type: String, default: '' },
        repliedAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ContactQuery', contactQuerySchema);
