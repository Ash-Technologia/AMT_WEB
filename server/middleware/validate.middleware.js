const { body, validationResult } = require('express-validator');

// ─── Middleware: Run validation and send errors if any ────────────────────────
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: errors.array()[0].msg, // Return first error for clean UX
            errors: errors.array(),
        });
    }
    next();
};

// ─── Register Validation ──────────────────────────────────────────────────────
const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required.')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters.'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please enter a valid email address.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
        .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
    validate,
];

// ─── Login Validation ─────────────────────────────────────────────────────────
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please enter a valid email address.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required.'),
    validate,
];

// ─── Order Creation Validation ────────────────────────────────────────────────
const validateOrder = [
    body('items')
        .isArray({ min: 1 }).withMessage('Order must contain at least one item.'),
    body('items.*.product')
        .notEmpty().withMessage('Each item must have a product ID.')
        .isMongoId().withMessage('Invalid product ID.'),
    body('items.*.quantity')
        .isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100.'),
    body('shippingAddress.fullName')
        .trim()
        .notEmpty().withMessage('Full name is required for shipping.')
        .isLength({ max: 100 }).withMessage('Name too long.'),
    body('shippingAddress.phone')
        .trim()
        .notEmpty().withMessage('Phone number is required.')
        .matches(/^\d{10}$/).withMessage('Phone must be a valid 10-digit number.'),
    validate,
];

// ─── Review Validation ────────────────────────────────────────────────────────
const validateReview = [
    body('rating')
        .notEmpty().withMessage('Rating is required.')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
    body('comment')
        .trim()
        .notEmpty().withMessage('Comment is required.')
        .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters.'),
    validate,
];

// ─── Contact/Query Validation ─────────────────────────────────────────────────
const validateContact = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required.')
        .isLength({ max: 100 }).withMessage('Name too long.'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please enter a valid email address.')
        .normalizeEmail(),
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required.')
        .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters.'),
    validate,
];

// ─── Password Reset Validation ────────────────────────────────────────────────
const validateForgotPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please enter a valid email address.')
        .normalizeEmail(),
    validate,
];

const validateResetPassword = [
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
        .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
    validate,
];

module.exports = {
    validateRegister,
    validateLogin,
    validateOrder,
    validateReview,
    validateContact,
    validateForgotPassword,
    validateResetPassword,
};
