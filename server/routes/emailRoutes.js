/**
 * Email Routes - Production Ready
 * Email verification and password reset routes
 */

const express = require('express');
const { body, validationResult } = require('express-validator');

const {
  sendEmailVerification,
  verifyEmail,
  sendPasswordReset,
  resetPassword
} = require('../controllers/emailController');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

/**
 * @route   POST /api/email/send-verification
 * @desc    Send email verification
 * @access  Public
 */
router.post('/send-verification',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
  ],
  handleValidationErrors,
  sendEmailVerification
);

/**
 * @route   POST /api/email/verify
 * @desc    Verify email
 * @access  Public
 */
router.post('/verify',
  [
    body('token')
      .isLength({ min: 64, max: 64 })
      .withMessage('Invalid verification token')
  ],
  handleValidationErrors,
  verifyEmail
);

/**
 * @route   POST /api/email/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
  ],
  handleValidationErrors,
  sendPasswordReset
);

/**
 * @route   POST /api/email/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password',
  [
    body('token')
      .isLength({ min: 64, max: 64 })
      .withMessage('Invalid reset token'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  handleValidationErrors,
  resetPassword
);

module.exports = router;
