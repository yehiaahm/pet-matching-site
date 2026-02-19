/**
 * Health Records Routes - Production Ready
 * Complete CRUD routes for pet health records
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');

const {
  createHealthRecord,
  getPetHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
  getUpcomingReminders
} = require('../controllers/healthRecordController-prisma');

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
 * @route   POST /api/health-records
 * @desc    Create health record for pet
 * @access  Private (pet owner only)
 */
router.post('/',
  authenticate,
  [
    body('petId')
      .isUUID()
      .withMessage('Pet ID must be a valid UUID'),
    body('type')
      .isIn(['CHECKUP', 'VACCINATION', 'SURGERY', 'MEDICATION', 'EMERGENCY', 'OTHER'])
      .withMessage('Type must be CHECKUP, VACCINATION, SURGERY, MEDICATION, EMERGENCY, or OTHER'),
    body('title')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Title must be between 2 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('veterinarian')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Veterinarian name must be between 2 and 100 characters'),
    body('clinic')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Clinic name must be less than 100 characters'),
    body('date')
      .isISO8601()
      .withMessage('Date must be a valid date'),
    body('nextDue')
      .optional()
      .isISO8601()
      .withMessage('Next due date must be a valid date'),
    body('attachments')
      .optional()
      .isArray()
      .withMessage('Attachments must be an array'),
    body('medications')
      .optional()
      .isArray()
      .withMessage('Medications must be an array'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes must be less than 1000 characters')
  ],
  handleValidationErrors,
  createHealthRecord
);

/**
 * @route   GET /api/health-records/pet/:petId
 * @desc    Get all health records for a pet
 * @access  Private (pet owner only)
 */
router.get('/pet/:petId',
  authenticate,
  [
    param('petId')
      .isUUID()
      .withMessage('Pet ID must be a valid UUID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('type')
      .optional()
      .isIn(['CHECKUP', 'VACCINATION', 'SURGERY', 'MEDICATION', 'EMERGENCY', 'OTHER'])
      .withMessage('Type must be CHECKUP, VACCINATION, SURGERY, MEDICATION, EMERGENCY, or OTHER')
  ],
  handleValidationErrors,
  getPetHealthRecords
);

/**
 * @route   GET /api/health-records/:id
 * @desc    Get health record by ID
 * @access  Private (pet owner only)
 */
router.get('/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Health record ID must be a valid UUID')
  ],
  handleValidationErrors,
  getHealthRecordById
);

/**
 * @route   PUT /api/health-records/:id
 * @desc    Update health record
 * @access  Private (pet owner only)
 */
router.put('/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Health record ID must be a valid UUID'),
    body('type')
      .optional()
      .isIn(['CHECKUP', 'VACCINATION', 'SURGERY', 'MEDICATION', 'EMERGENCY', 'OTHER'])
      .withMessage('Type must be CHECKUP, VACCINATION, SURGERY, MEDICATION, EMERGENCY, or OTHER'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Title must be between 2 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('veterinarian')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Veterinarian name must be between 2 and 100 characters'),
    body('clinic')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Clinic name must be less than 100 characters'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid date'),
    body('nextDue')
      .optional()
      .isISO8601()
      .withMessage('Next due date must be a valid date'),
    body('attachments')
      .optional()
      .isArray()
      .withMessage('Attachments must be an array'),
    body('medications')
      .optional()
      .isArray()
      .withMessage('Medications must be an array'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes must be less than 1000 characters')
  ],
  handleValidationErrors,
  updateHealthRecord
);

/**
 * @route   DELETE /api/health-records/:id
 * @desc    Delete health record
 * @access  Private (pet owner only)
 */
router.delete('/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Health record ID must be a valid UUID')
  ],
  handleValidationErrors,
  deleteHealthRecord
);

/**
 * @route   GET /api/health-records/reminders
 * @desc    Get upcoming health reminders
 * @access  Private
 */
router.get('/reminders',
  authenticate,
  [
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Days must be between 1 and 365')
  ],
  handleValidationErrors,
  getUpcomingReminders
);

module.exports = router;
