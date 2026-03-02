const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"AMT — Advanced Medical Therapeutics" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

// ─── Email Templates ───────────────────────────────────────────────────────────

const emailTemplates = {
  welcome: (name) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0A0F0D;color:#F0F4F1;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2D6A4F,#1B4332);padding:40px;text-align:center;">
        <h1 style="color:#C9A84C;font-size:28px;margin:0;">AMT</h1>
        <p style="color:#B7E4C7;margin:8px 0 0;">Advanced Medical Therapeutics</p>
      </div>
      <div style="padding:40px;">
        <h2 style="color:#52B788;">Welcome, ${name}! 🌿</h2>
        <p style="color:#A8C5B5;line-height:1.8;">Thank you for joining AMT. Your journey to better health starts here.</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:linear-gradient(135deg,#2D6A4F,#52B788);color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:20px;">Explore Products</a>
      </div>
      <div style="background:#111;padding:20px;text-align:center;color:#666;font-size:12px;">
        © 2024 AMT — Advanced Medical Therapeutics | Amravati, Maharashtra
      </div>
    </div>
  `,

  orderConfirmation: (name, orderId, items, total) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0A0F0D;color:#F0F4F1;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2D6A4F,#1B4332);padding:40px;text-align:center;">
        <h1 style="color:#C9A84C;font-size:28px;margin:0;">AMT</h1>
        <p style="color:#B7E4C7;">Order Confirmed ✅</p>
      </div>
      <div style="padding:40px;">
        <h2 style="color:#52B788;">Thank you, ${name}!</h2>
        <p style="color:#A8C5B5;">Your order <strong style="color:#C9A84C;">#${orderId}</strong> has been placed successfully.</p>
        <div style="background:#111;border-radius:12px;padding:20px;margin:20px 0;">
          ${items.map(i => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #222;"><span style="color:#B7E4C7;">${i.name} x${i.quantity}</span><span style="color:#C9A84C;">₹${i.price}</span></div>`).join('')}
          <div style="display:flex;justify-content:space-between;padding:12px 0;font-weight:700;"><span style="color:#F0F4F1;">Total</span><span style="color:#C9A84C;">₹${total}</span></div>
        </div>
        <a href="${process.env.CLIENT_URL}/orders" style="display:inline-block;background:linear-gradient(135deg,#2D6A4F,#52B788);color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;">Track Order</a>
      </div>
      <div style="background:#111;padding:20px;text-align:center;color:#666;font-size:12px;">
        © 2024 AMT — Advanced Medical Therapeutics
      </div>
    </div>
  `,

  passwordReset: (name, resetUrl) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0A0F0D;color:#F0F4F1;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2D6A4F,#1B4332);padding:40px;text-align:center;">
        <h1 style="color:#C9A84C;font-size:28px;margin:0;">AMT</h1>
      </div>
      <div style="padding:40px;">
        <h2 style="color:#52B788;">Password Reset Request</h2>
        <p style="color:#A8C5B5;">Hi ${name}, click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#2D6A4F,#52B788);color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:20px;">Reset Password</a>
        <p style="color:#666;font-size:12px;margin-top:20px;">If you didn't request this, ignore this email.</p>
      </div>
    </div>
  `,

  otpEmail: (name, otp) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0A0F0D;color:#F0F4F1;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2D6A4F,#1B4332);padding:40px;text-align:center;">
        <h1 style="color:#C9A84C;font-size:28px;margin:0;">AMT</h1>
      </div>
      <div style="padding:40px;text-align:center;">
        <h2 style="color:#52B788;">Verify Your Email</h2>
        <p style="color:#A8C5B5;">Hi ${name}, use the OTP below to verify your account:</p>
        <div style="background:#111;border:2px solid #2D6A4F;border-radius:16px;padding:30px;margin:20px 0;">
          <span style="font-size:48px;font-weight:700;color:#C9A84C;letter-spacing:12px;">${otp}</span>
        </div>
        <p style="color:#666;font-size:12px;">This OTP expires in 10 minutes.</p>
      </div>
    </div>
  `,

  contactReply: (name, replyMessage, queryId) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0A0F0D;color:#F0F4F1;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2D6A4F,#1B4332);padding:40px;text-align:center;">
        <h1 style="color:#C9A84C;font-size:28px;margin:0;">AMT</h1>
      </div>
      <div style="padding:40px;">
        <h2 style="color:#52B788;">Reply to Your Query</h2>
        <p style="color:#A8C5B5;">Hi ${name}, here is our response to your query:</p>
        <div style="background:#111;border-left:4px solid #2D6A4F;border-radius:8px;padding:20px;margin:20px 0;color:#B7E4C7;line-height:1.8;">${replyMessage}</div>
        
        <!-- Fulfillment Link -->
        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #222; padding-top: 20px;">
            <p style="color: #9DBFAD; font-size: 14px; margin-bottom: 20px;">Was this response helpful? If your query is resolved, you can close it by clicking below:</p>
            <a href="${process.env.BACKEND_URL}/api/contact/fulfill/${queryId}" style="display:inline-block;background:rgba(82,183,136,0.15);color:#52B788;padding:10px 24px;border-radius:50px;text-decoration:none;font-weight:600;border:1px solid rgba(82,183,136,0.3);font-size:13px;">Mark as Fulfilled & Close Query</a>
        </div>

        <p style="color:#666;font-size:12px;margin-top: 30px;">For further assistance, contact us at amrutsinghavi@gmail.com</p>
      </div>
    </div>
  `,

  contactSubmission: (name, email, phone, subject, message) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0A0F0D;color:#F0F4F1;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2D6A4F,#1B4332);padding:32px;text-align:center;">
        <h1 style="color:#C9A84C;font-size:24px;margin:0;">AMT — New Contact Query</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#52B788;margin-top:0;">📬 New Query Received</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#9DBFAD;width:100px;">Name</td><td style="padding:8px 0;color:#F0F4F1;font-weight:600;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#9DBFAD;">Email</td><td style="padding:8px 0;color:#F0F4F1;"><a href="mailto:${email}" style="color:#52B788;">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#9DBFAD;">Phone</td><td style="padding:8px 0;color:#F0F4F1;">${phone || 'Not provided'}</td></tr>
          <tr><td style="padding:8px 0;color:#9DBFAD;">Subject</td><td style="padding:8px 0;color:#C9A84C;font-weight:600;">${subject || 'No subject'}</td></tr>
        </table>
        <div style="background:#111;border-left:4px solid #C9A84C;border-radius:8px;padding:20px;margin:20px 0;color:#B7E4C7;line-height:1.8;">${message}</div>
        <a href="mailto:${email}?subject=Re: ${subject || 'Your Query'}" style="display:inline-block;background:linear-gradient(135deg,#2D6A4F,#52B788);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;">Reply to ${name}</a>
      </div>
    </div>
  `,

  contactAck: (name, subject) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0A0F0D;color:#F0F4F1;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2D6A4F,#1B4332);padding:32px;text-align:center;">
        <h1 style="color:#C9A84C;font-size:24px;margin:0;">AMT</h1>
        <p style="color:#B7E4C7;margin:8px 0 0;">Advanced Medical Therapeutics</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#52B788;">We Got Your Message! ✅</h2>
        <p style="color:#A8C5B5;line-height:1.8;">Hi <strong style="color:#F0F4F1;">${name}</strong>,</p>
        <p style="color:#A8C5B5;line-height:1.8;">Thank you for reaching out. We've received your query about <strong style="color:#C9A84C;">"${subject || 'your inquiry'}"</strong> and our team will get back to you within 24–48 hours.</p>
        <div style="background:#111;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
          <p style="color:#9DBFAD;margin:0;font-size:14px;">Need urgent help? Email us directly at</p>
          <a href="mailto:amrutsinghavi@gmail.com" style="color:#52B788;font-weight:600;">amrutsinghavi@gmail.com</a>
        </div>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:linear-gradient(135deg,#2D6A4F,#52B788);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;">Visit AMT</a>
      </div>
      <div style="background:#111;padding:20px;text-align:center;color:#666;font-size:12px;">
        © 2024 AMT — Advanced Medical Therapeutics | Amravati, Maharashtra
      </div>
    </div>
  `,
  adminOrderNotification: (customerName, orderId, items, totalAmount) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0A0F0D;color:#F0F4F1;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2D6A4F,#1B4332);padding:32px;text-align:center;">
        <h1 style="color:#C9A84C;font-size:24px;margin:0;">AMT — New Order</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#52B788;margin-top:0;">💰 New Order Received</h2>
        <p style="color:#9DBFAD;">Order ID: <strong style="color:#F0F4F1;">#${orderId}</strong></p>
        <p style="color:#9DBFAD;">Customer: <strong style="color:#F0F4F1;">${customerName}</strong></p>
        
        <div style="margin:24px 0;background:#111;border-radius:12px;overflow:hidden;">
            ${items.map(item => `
            <div style="display:flex;padding:16px;border-bottom:1px solid #222;">
                <div style="flex:1;">
                    <p style="margin:0;color:#EEF2EF;font-weight:500;">${item.name || 'Product'}</p>
                    <p style="margin:4px 0 0;color:#9DBFAD;font-size:12px;">Qty: ${item.quantity} × ₹${item.price}</p>
                </div>
            </div>
            `).join('')}
            <div style="padding:16px;background:#1A1F1D;text-align:right;">
                <span style="color:#9DBFAD;margin-right:12px;">Total:</span>
                <strong style="color:#C9A84C;font-size:18px;">₹${totalAmount.toLocaleString('en-IN')}</strong>
            </div>
        </div>
        
        <a href="${process.env.CLIENT_URL}/admin/orders" style="display:inline-block;background:linear-gradient(135deg,#2D6A4F,#52B788);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;">View in Admin Panel</a>
      </div>
    </div>
  `,
};

module.exports = { sendEmail, emailTemplates };
