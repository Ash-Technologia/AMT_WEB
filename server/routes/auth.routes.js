const express = require('express');
const router = express.Router();
const {
    register, verifyOTP, resendOTP, login, googleLogin,
    forgotPassword, resetPassword, getMe, updateProfile, uploadAvatar,
    changePassword, sendPhoneOTP, verifyPhoneOTP,
    requestPhoneChange, verifyPhoneChange,
    getAddresses, addAddress, deleteAddress, setDefaultAddress
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
} = require('../middleware/validate.middleware');

router.post('/register', validateRegister, register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', validateLogin, login);
router.post('/google', googleLogin);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, uploadAvatar);
router.put('/change-password', protect, changePassword);
router.post('/send-phone-otp', sendPhoneOTP);
router.post('/verify-phone-otp', verifyPhoneOTP);
router.post('/request-phone-change', protect, requestPhoneChange);
router.post('/verify-phone-change', protect, verifyPhoneChange);

// ─── Addresses ──────────────────────────────────────────────────────────────
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.put('/addresses/:addressId/default', protect, setDefaultAddress);

module.exports = router;
