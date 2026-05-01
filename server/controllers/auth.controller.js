const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const { sendEmail, emailTemplates } = require('../services/email.service');
const { sendSmsOTP } = require('../services/sms.service');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Generate JWT ──────────────────────────────────────────────────────────────
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ─── Generate 6-digit OTP ─────────────────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── REGISTER ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

        const existing = await User.findOne({ email });
        if (existing)
            return res.status(400).json({ success: false, message: 'Email already registered.' });

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        const user = await User.create({ name, email, password, phone: phone || '', otp, otpExpiry });

        await sendEmail(email, 'Verify Your AMT Account', emailTemplates.otpEmail(name, otp));

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email with the OTP sent.',
            userId: user._id,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await User.findById(userId).select('+otp +otpExpiry');

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        if (user.otpExpiry < new Date()) return res.status(400).json({ success: false, message: 'OTP expired.' });

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        await sendEmail(user.email, 'Welcome to AMT!', emailTemplates.welcome(user.name));

        const token = generateToken(user._id);
        res.json({ success: true, message: 'Email verified successfully!', token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId).select('+otp +otpExpiry');
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendEmail(user.email, 'Your New OTP — AMT', emailTemplates.otpEmail(user.name, otp));
        res.json({ success: true, message: 'OTP resent successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password are required.' });

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        if (!user.isVerified)
            return res.status(401).json({ success: false, message: 'Please verify your email first.', userId: user._id, needsVerification: true });

        const token = generateToken(user._id);
        res.json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'No account with that email.' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await sendEmail(email, 'Reset Your AMT Password', emailTemplates.passwordReset(user.name, resetUrl));

        res.json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { $gt: new Date() },
        }).select('+resetPasswordToken +resetPasswordExpiry');

        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successful. Please log in.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist', 'name price images slug').populate('cart.product', 'name price images slug stock');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
    try {
        const allowed = ['name', 'addresses', 'avatar', 'profession', 'dob', 'gender', 'city', 'bio', 'website', 'instagram', 'linkedin', 'shareProfileWithAdmin'];
        const updates = {};
        allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPLOAD AVATAR (base64 → Cloudinary, no multer needed) ───────────────────
exports.uploadAvatar = async (req, res) => {
    try {
        const { image } = req.body; // base64 data URL  e.g. "data:image/jpeg;base64,..."
        if (!image) return res.status(400).json({ success: false, message: 'No image provided.' });

        const cloudinary = require('../config/cloudinary');
        const result = await cloudinary.uploader.upload(image, {
            folder: 'amt/avatars',
            transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' }],
            public_id: `avatar_${req.user._id}`,
            overwrite: true,
        });

        // Save URL to user profile
        const user = await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url }, { new: true });
        res.json({ success: true, url: result.secure_url, user });
    } catch (err) {
        console.error('Avatar upload error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── REQUEST PHONE CHANGE (sends OTP to new number via SMS) ──────────────────
exports.requestPhoneChange = async (req, res) => {
    try {
        const { newPhone } = req.body;
        if (!newPhone) return res.status(400).json({ success: false, message: 'New phone number is required.' });

        const cleaned = newPhone.replace(/[\s\-]/g, '').replace(/^\+91/, '').replace(/^91/, '');
        if (cleaned.length !== 10) return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number.' });

        // Check if already taken
        const existing = await User.findOne({
            $or: [{ phone: newPhone }, { phone: `+91${cleaned}` }, { phone: cleaned }],
            _id: { $ne: req.user._id },
        });
        if (existing) return res.status(400).json({ success: false, message: 'This phone number is already associated with another account.' });

        const otp = generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        const user = await User.findById(req.user._id);
        user.pendingPhone = `+91${cleaned}`;
        user.pendingPhoneOtp = otp;
        user.pendingPhoneOtpExpiry = expiry;
        await user.save();

        // Try SMS first, fallback to email
        const { sendSmsOTP } = require('../services/sms.service');
        const smsResult = await sendSmsOTP(`+91${cleaned}`, otp);

        if (!smsResult.sent) {
            const emailBody = `<div style="font-family:sans-serif;max-width:500px;margin:auto">
                <h2>Your Phone Change OTP</h2>
                <p>Use this OTP to confirm your new phone number for AMT:</p>
                <div style="font-size:2rem;font-weight:bold;letter-spacing:8px;color:#2d6a4f;padding:20px;background:#f0f7f4;text-align:center;border-radius:8px">${otp}</div>
                <p>This OTP expires in 10 minutes.</p>
            </div>`;
            await sendEmail(user.email, 'Confirm Phone Change — AMT', emailBody);
        }

        res.json({
            success: true,
            message: smsResult.sent
                ? `OTP sent via SMS to +91${cleaned}`
                : `OTP sent to your email ${user.email} (SMS unavailable)`,
            via: smsResult.via || 'email',
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── VERIFY PHONE CHANGE ──────────────────────────────────────────────────────
exports.verifyPhoneChange = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.user._id).select('+pendingPhone +pendingPhoneOtp +pendingPhoneOtpExpiry');

        if (!user.pendingPhone) return res.status(400).json({ success: false, message: 'No pending phone change request.' });
        if (!user.pendingPhoneOtp || user.pendingPhoneOtp !== otp)
            return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
        if (user.pendingPhoneOtpExpiry < new Date())
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

        user.phone = user.pendingPhone;
        user.pendingPhone = undefined;
        user.pendingPhoneOtp = undefined;
        user.pendingPhoneOtpExpiry = undefined;
        await user.save();

        const updatedUser = await User.findById(user._id);
        res.json({ success: true, message: 'Phone number updated successfully!', user: updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');
        if (!(await user.comparePassword(currentPassword)))
            return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

        user.password = newPassword;
        await user.save();
        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── SEND PHONE OTP ───────────────────────────────────────────────────────────
exports.sendPhoneOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required.' });

        // Normalize: strip spaces/dashes, ensure we can find the user
        const cleaned = phone.replace(/[\s\-]/g, '').replace(/^\+91/, '').replace(/^91/, '');

        const user = await User.findOne({
            $or: [
                { phone: phone },
                { phone: `+91${cleaned}` },
                { phone: cleaned },
                { phone: `91${cleaned}` },
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this phone number. Please register first.'
            });
        }

        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Account not verified. Please verify your email first.'
            });
        }

        const otp = generateOTP();
        user.phoneOtp = otp;
        user.phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        await user.save();

        // ── Try Twilio SMS, fall back to email ───────────────────────────────
        const smsResult = await sendSmsOTP(phone, otp).catch(() => ({ sent: false, via: 'email_fallback' }));

        if (!smsResult.sent) {
            // Fallback: send OTP via email
            const emailBody = `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color: #52B788;">Your AMT Login OTP</h2>
                    <p>Hi ${user.name}, your one-time password for phone login is:</p>
                    <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 2rem; font-weight: bold; letter-spacing: 8px; color: #1B4332;">${otp}</span>
                    </div>
                    <p style="color: #666;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
                    <p style="color: #999; font-size: 0.85rem;">AMT Advanced Medical Therapeutics | Amravati, Maharashtra</p>
                </div>
            `;
            await sendEmail(user.email, 'Phone Login OTP — AMT', emailBody);
        }

        const maskedEmail = user.email.replace(/(.{2}).+(@.+)/, '$1***$2');
        res.json({
            success: true,
            message: smsResult.sent
                ? `OTP sent via SMS to your registered phone number.`
                : `OTP sent to email (${maskedEmail}) linked to this phone number.`,
            maskedEmail,
            via: smsResult.via,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── VERIFY PHONE OTP ─────────────────────────────────────────────────────────
exports.verifyPhoneOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });

        const cleaned = phone.replace(/[\s\-]/g, '').replace(/^\+91/, '').replace(/^91/, '');

        const user = await User.findOne({
            $or: [
                { phone: phone },
                { phone: `+91${cleaned}` },
                { phone: cleaned },
                { phone: `91${cleaned}` },
            ]
        }).select('+phoneOtp +phoneOtpExpiry');

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        if (!user.phoneOtp) return res.status(400).json({ success: false, message: 'No OTP requested. Please request a new OTP.' });
        if (user.phoneOtp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
        if (user.phoneOtpExpiry < new Date()) return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

        // Clear the OTP
        user.phoneOtp = undefined;
        user.phoneOtpExpiry = undefined;
        await user.save();

        const token = generateToken(user._id);
        res.json({
            success: true,
            message: 'Phone login successful!',
            token,
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GOOGLE OAUTH LOGIN ────────────────────────────────────────────────────────
exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ success: false, message: 'Google credential is required.' });

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        if (!email) return res.status(400).json({ success: false, message: 'Could not retrieve email from Google account.' });

        // Find or create user
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            user = await User.create({
                name,
                email,
                googleId,
                avatar: picture,
                isVerified: true,
                password: crypto.randomBytes(32).toString('hex'), // random password for Google users
            });
        } else {
            // Update google info if logging in via google for first time
            if (!user.googleId) {
                user.googleId = googleId;
                user.isVerified = true;
                if (!user.avatar && picture) user.avatar = picture;
                await user.save();
            }
        }

        const token = generateToken(user._id);
        res.json({
            success: true,
            message: `Welcome, ${user.name}!`,
            token,
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar },
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ success: false, message: 'Google authentication failed. Please try again.' });
    }
};

// ─── GET ADDRESSES ────────────────────────────────────────────────────────────
exports.getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('addresses');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, addresses: user.addresses || [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ADD ADDRESS ──────────────────────────────────────────────────────────────
exports.addAddress = async (req, res) => {
    try {
        const { fullName, phone, street, city, state, pincode, isDefault } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (isDefault) {
            user.addresses.forEach(a => { a.isDefault = false; });
        }

        user.addresses.push({
            fullName,
            phone,
            street,
            city,
            state,
            pincode,
            isDefault: isDefault || user.addresses.length === 0,
        });

        await user.save();
        res.json({ success: true, addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── DELETE ADDRESS ───────────────────────────────────────────────────────────
exports.deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.addresses = user.addresses.filter(a => a._id.toString() !== addressId);

        // Ensure at least one default if addresses remain
        if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json({ success: true, addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── SET DEFAULT ADDRESS ──────────────────────────────────────────────────────
exports.setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.addresses.forEach(a => {
            a.isDefault = a._id.toString() === addressId;
        });

        await user.save();
        res.json({ success: true, addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
