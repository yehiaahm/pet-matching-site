/**
 * Stripe Payment Routes - Production Ready
 * Complete payment processing with Stripe
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');

const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getSubscriptionStatus,
  cancelSubscription,
  getPricingPlans,
  handleWebhook
} = require('../controllers/stripeController');

const { authenticate } = require('../middleware/authMiddleware');

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
 * @route   POST /api/payments/create-intent
 * @desc    Create payment intent
 * @access  Private
 */
router.post('/create-intent',
  authenticate,
  [
    body('amount')
      .isFloat({ min: 1 })
      .withMessage('Amount must be at least 1'),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be a 3-letter code'),
    body('planType')
      .optional()
      .isIn(['BASIC', 'PREMIUM', 'PRO'])
      .withMessage('Plan type must be BASIC, PREMIUM, or PRO')
  ],
  handleValidationErrors,
  createPaymentIntent
);

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirm payment
 * @access  Private
 */
router.post('/confirm',
  authenticate,
  [
    body('paymentIntentId')
      .notEmpty()
      .withMessage('Payment intent ID is required')
  ],
  handleValidationErrors,
  confirmPayment
);

/**
 * @route   GET /api/payments/history
 * @desc    Get payment history
 * @access  Private
 */
router.get('/history',
  authenticate,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
      .withMessage('Status must be PENDING, COMPLETED, FAILED, or REFUNDED')
  ],
  handleValidationErrors,
  getPaymentHistory
);

/**
 * @route   GET /api/payments/subscription
 * @desc    Get subscription status
 * @access  Private
 */
router.get('/subscription',
  authenticate,
  getSubscriptionStatus
);

/**
 * @route   POST /api/payments/cancel-subscription
 * @desc    Cancel subscription
 * @access  Private
 */
router.post('/cancel-subscription',
  authenticate,
  cancelSubscription
);

/**
 * @route   GET /api/payments/plans
 * @desc    Get pricing plans
 * @access  Public
 */
router.get('/plans',
  getPricingPlans
);

/**
 * @route   POST /api/payments/webhook
 * @desc    Stripe webhook handler
 * @access  Public
 */
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

module.exports = router;
