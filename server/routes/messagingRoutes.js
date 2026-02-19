/**
 * Messaging Routes - Production Ready
 * Real-time messaging with Socket.io integration
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');

const {
  sendMessage,
  getConversations,
  getMessages,
  markMessageAsRead,
  deleteMessage,
  getUnreadCount
} = require('../controllers/messagingController');

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
 * @route   POST /api/messages
 * @desc    Send message
 * @access  Private
 */
router.post('/',
  authenticate,
  [
    body('recipientId')
      .isUUID()
      .withMessage('Recipient ID must be a valid UUID'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message content must be between 1 and 1000 characters'),
    body('type')
      .optional()
      .isIn(['TEXT', 'IMAGE', 'FILE', 'LOCATION'])
      .withMessage('Message type must be TEXT, IMAGE, FILE, or LOCATION'),
    body('attachments')
      .optional()
      .isArray()
      .withMessage('Attachments must be an array')
  ],
  handleValidationErrors,
  sendMessage
);

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations
 * @access  Private
 */
router.get('/conversations',
  authenticate,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  getConversations
);

/**
 * @route   GET /api/messages/:userId
 * @desc    Get messages with specific user
 * @access  Private
 */
router.get('/:userId',
  authenticate,
  [
    param('userId')
      .isUUID()
      .withMessage('User ID must be a valid UUID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  getMessages
);

/**
 * @route   PUT /api/messages/:id/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/:id/read',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Message ID must be a valid UUID')
  ],
  handleValidationErrors,
  markMessageAsRead
);

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete message
 * @access  Private (sender only)
 */
router.delete('/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Message ID must be a valid UUID')
  ],
  handleValidationErrors,
  deleteMessage
);

/**
 * @route   GET /api/messages/unread/count
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread/count',
  authenticate,
  getUnreadCount
);

module.exports = router;
