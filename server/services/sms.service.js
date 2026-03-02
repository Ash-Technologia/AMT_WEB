/**
 * Twilio SMS Service — AMT
 * Sends OTP via SMS. Falls back to email gracefully on any error.
 */

let twilioClient = null;

const initTwilio = () => {
    if (twilioClient) return twilioClient;
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN ||
        TWILIO_ACCOUNT_SID.startsWith('ACxx') || TWILIO_ACCOUNT_SID === 'your_sid') {
        return null;
    }
    const twilio = require('twilio');
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    return twilioClient;
};

/**
 * Send an SMS OTP. Returns { sent: false } on any error so caller can email-fallback.
 * @param {string} toPhone  - E.164 format e.g. "+919876543210"
 * @param {string} otp      - 6-digit OTP
 */
const sendSmsOTP = async (toPhone, otp) => {
    const client = initTwilio();
    if (!client) return { sent: false, via: 'email_fallback' };

    const cleaned = toPhone.replace(/[\s\-]/g, '');
    const e164 = cleaned.startsWith('+') ? cleaned : `+91${cleaned.replace(/^91/, '')}`;

    try {
        await client.messages.create({
            from: process.env.TWILIO_PHONE,
            to: e164,
            body: `Your AMT OTP is: ${otp}. Valid for 10 minutes. Do not share.`,
        });
        return { sent: true, via: 'sms' };
    } catch (err) {
        console.warn('Twilio SMS failed (falling back to email):', err.message);
        return { sent: false, via: 'email_fallback', error: err.message };
    }
};

module.exports = { sendSmsOTP };
