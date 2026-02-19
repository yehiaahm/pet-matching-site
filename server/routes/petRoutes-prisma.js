/**
 * Pet Routes - Production Ready with Prisma
 * Handles all pet endpoints with authentication
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');

const {
  createPet,
  getAllPets,
  getMyPets,
  getPetById,
  updatePet,
  deletePet
} = require('../controllers/petController-prisma');

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
 * @route   POST /api/pets
 * @desc    Create a new pet
 * @access  Private
 */
router.post('/',
  authenticate,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Pet name must be between 2 and 100 characters'),
    body('type')
      .isIn(['DOG', 'CAT', 'BIRD', 'dog', 'cat', 'bird'])
      .withMessage('Pet type must be DOG, CAT, or BIRD'),
    body('breed')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Breed must be between 2 and 100 characters'),
    body('age')
      .isInt({ min: 0, max: 50 })
      .withMessage('Age must be a number between 0 and 50'),
    body('gender')
      .isIn(['MALE', 'FEMALE', 'male', 'female'])
      .withMessage('Gender must be MALE or FEMALE'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('image')
      .optional()
      .isURL()
      .withMessage('Image must be a valid URL'),
    body('vaccinations')
      .optional()
      .isArray()
      .withMessage('Vaccinations must be an array'),
    body('vaccinations.*.name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Vaccination name must be between 2 and 100 characters'),
    body('vaccinations.*.date')
      .optional()
      .isISO8601()
      .withMessage('Vaccination date must be a valid date'),
    body('vaccinations.*.nextDue')
      .optional()
      .isISO8601()
      .withMessage('Next due date must be a valid date'),
    body('healthCheck.date')
      .optional()
      .isISO8601()
      .withMessage('Health check date must be a valid date'),
    body('healthCheck.veterinarian')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Veterinarian name must be between 2 and 100 characters'),
    body('healthCheck.notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Health check notes must be less than 500 characters')
  ],
  handleValidationErrors,
  createPet
);

/**
 * @route   GET /api/pets
 * @desc    Get all pets (public)
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
    query('type')
      .optional()
      .isIn(['DOG', 'CAT', 'BIRD', 'dog', 'cat', 'bird'])
      .withMessage('Type must be DOG, CAT, or BIRD'),
    query('gender')
      .optional()
      .isIn(['MALE', 'FEMALE', 'male', 'female'])
      .withMessage('Gender must be MALE or FEMALE'),
    query('ageMin')
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage('Minimum age must be between 0 and 50'),
    query('ageMax')
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage('Maximum age must be between 0 and 50'),
    query('verified')
      .optional()
      .isBoolean()
      .withMessage('Verified must be true or false'),
    query('status')
      .optional()
      .isIn(['AVAILABLE', 'PENDING', 'ADOPTED', 'UNAVAILABLE'])
      .withMessage('Status must be AVAILABLE, PENDING, ADOPTED, or UNAVAILABLE'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search term must be between 2 and 100 characters')
  ],
  handleValidationErrors,
  getAllPets
);

/**
 * @route   GET /api/pets/my-pets
 * @desc    Get current user's pets
 * @access  Private
 */
router.get('/my-pets',
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
      .isIn(['AVAILABLE', 'PENDING', 'ADOPTED', 'UNAVAILABLE'])
      .withMessage('Status must be AVAILABLE, PENDING, ADOPTED, or UNAVAILABLE')
  ],
  handleValidationErrors,
  getMyPets
);

/**
 * @route   GET /api/pets/:id
 * @desc    Get pet by ID
 * @access  Public
 */
router.get('/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Pet ID must be a valid UUID')
  ],
  handleValidationErrors,
  getPetById
);

/**
 * @route   PUT /api/pets/:id
 * @desc    Update pet
 * @access  Private (owner only)
 */
router.put('/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Pet ID must be a valid UUID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Pet name must be between 2 and 100 characters'),
    body('type')
      .optional()
      .isIn(['DOG', 'CAT', 'BIRD', 'dog', 'cat', 'bird'])
      .withMessage('Pet type must be DOG, CAT, or BIRD'),
    body('breed')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Breed must be between 2 and 100 characters'),
    body('age')
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage('Age must be a number between 0 and 50'),
    body('gender')
      .optional()
      .isIn(['MALE', 'FEMALE', 'male', 'female'])
      .withMessage('Gender must be MALE or FEMALE'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('image')
      .optional()
      .isURL()
      .withMessage('Image must be a valid URL'),
    body('status')
      .optional()
      .isIn(['AVAILABLE', 'PENDING', 'ADOPTED', 'UNAVAILABLE'])
      .withMessage('Status must be AVAILABLE, PENDING, ADOPTED, or UNAVAILABLE')
  ],
  handleValidationErrors,
  updatePet
);

/**
 * @route   DELETE /api/pets/:id
 * @desc    Delete pet
 * @access  Private (owner only)
 */
router.delete('/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('Pet ID must be a valid UUID')
  ],
  handleValidationErrors,
  deletePet
);

module.exports = router;
