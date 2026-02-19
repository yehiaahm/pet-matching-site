/**
 * Vet Services Routes - Production Ready
 * Complete CRUD routes for veterinary services
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');

const {
  createVetService,
  getAllVetServices,
  getVetServiceById,
  updateVetService,
  deleteVetService,
  addReview
} = require('../controllers/vetServicesController');

const { authenticate, requireRole } = require('../middleware/authMiddleware');

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
 * @route   POST /api/vet-services
 * @desc    Create vet service
 * @access  Private (admin only)
 */
router.post('/',
  authenticate,
  requireRole(['ADMIN']),
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Service name must be between 2 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('category')
      .isIn(['GENERAL', 'SURGERY', 'DENTAL', 'EMERGENCY', 'GROOMING', 'VACCINATION', 'CHECKUP'])
      .withMessage('Category must be GENERAL, SURGERY, DENTAL, EMERGENCY, GROOMING, VACCINATION, or CHECKUP'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('duration')
      .optional()
      .isInt({ min: 15, max: 480 })
      .withMessage('Duration must be between 15 and 480 minutes'),
    body('location')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Location must be between 5 and 200 characters'),
    body('contactPhone')
      .trim()
      .isMobilePhone('any')
      .withMessage('Please provide a valid phone number'),
    body('contactEmail')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('website')
      .optional()
      .isURL()
      .withMessage('Website must be a valid URL'),
    body('services')
      .optional()
      .isArray()
      .withMessage('Services must be an array'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array'),
    body('rating')
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage('Rating must be between 0 and 5')
  ],
  handleValidationErrors,
  createVetService
);

/**
 * @route   GET /api/vet-services
 * @desc    Get all vet services
 * @access  Public
 */
router.get('/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('category')
      .optional()
      .isIn(['GENERAL', 'SURGERY', 'DENTAL', 'EMERGENCY', 'GROOMING', 'VACCINATION', 'CHECKUP'])
      .withMessage('Category must be GENERAL, SURGERY, DENTAL, EMERGENCY, GROOMING, VACCINATION, or CHECKUP'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number'),
    query('location')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Location search must be between 2 and 100 characters'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search term must be between 2 and 100 characters'),
    query('verified')
      .optional()
      .isBoolean()
      .withMessage('Verified must be true or false'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'price', 'rating', 'name'])
      .withMessage('Sort by must be createdAt, price, rating, or name'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ],
  handleValidationErrors,
  getAllVetServices
);

/**
 * @route   GET /api/vet-services/:id
 * @desc    Get vet service by ID
 * @access  Public
 */
router.get('/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Vet service ID must be a valid UUID')
  ],
  handleValidationErrors,
  getVetServiceById
);

/**
 * @route   PUT /api/vet-services/:id
 * @desc    Update vet service
 * @access  Private (admin or creator only)
 */
router.put('/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Vet service ID must be a valid UUID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Service name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('category')
      .optional()
      .isIn(['GENERAL', 'SURGERY', 'DENTAL', 'EMERGENCY', 'GROOMING', 'VACCINATION', 'CHECKUP'])
      .withMessage('Category must be GENERAL, SURGERY, DENTAL, EMERGENCY, GROOMING, VACCINATION, or CHECKUP'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('duration')
      .optional()
      .isInt({ min: 15, max: 480 })
      .withMessage('Duration must be between 15 and 480 minutes'),
    body('location')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Location must be between 5 and 200 characters'),
    body('contactPhone')
      .optional()
      .trim()
      .isMobilePhone('any')
      .withMessage('Please provide a valid phone number'),
    body('contactEmail')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('website')
      .optional()
      .isURL()
      .withMessage('Website must be a valid URL'),
    body('services')
      .optional()
      .isArray()
      .withMessage('Services must be an array'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array'),
    body('verified')
      .optional()
      .isBoolean()
      .withMessage('Verified must be true or false')
  ],
  handleValidationErrors,
  updateVetService
);

/**
 * @route   DELETE /api/vet-services/:id
 * @desc    Delete vet service
 * @access  Private (admin or creator only)
 */
router.delete('/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Vet service ID must be a valid UUID')
  ],
  handleValidationErrors,
  deleteVetService
);

/**
 * @route   POST /api/vet-services/:id/reviews
 * @desc    Add review to vet service
 * @access  Private
 */
router.post('/:id/reviews',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Vet service ID must be a valid UUID'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Comment must be less than 500 characters')
  ],
  handleValidationErrors,
  addReview
);

module.exports = router;
