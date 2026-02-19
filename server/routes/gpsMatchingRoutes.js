/**
 * GPS Matching Routes - Production Ready
 * Location-based pet matching routes
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');

const {
  updateLocation,
  findNearbyPets,
  getUserLocation,
  updatePetLocation,
  getLocationStats
} = require('../controllers/gpsMatchingController');

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
 * @route   POST /api/gps/location
 * @desc    Update user location
 * @access  Private
 */
router.post('/location',
  authenticate,
  [
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('accuracy')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Accuracy must be a positive number'),
    body('address')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Address must be less than 500 characters')
  ],
  handleValidationErrors,
  updateLocation
);

/**
 * @route   POST /api/gps/find-nearby-pets
 * @desc    Find nearby pets
 * @access  Private
 */
router.post('/find-nearby-pets',
  authenticate,
  [
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('maxDistance')
      .optional()
      .isFloat({ min: 1, max: 1000 })
      .withMessage('Max distance must be between 1 and 1000 km'),
    body('petType')
      .optional()
      .isIn(['DOG', 'CAT', 'BIRD', 'dog', 'cat', 'bird'])
      .withMessage('Pet type must be DOG, CAT, or BIRD'),
    body('gender')
      .optional()
      .isIn(['MALE', 'FEMALE', 'male', 'female'])
      .withMessage('Gender must be MALE or FEMALE'),
    body('breed')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Breed must be between 2 and 100 characters'),
    body('ageMin')
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage('Minimum age must be between 0 and 50'),
    body('ageMax')
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage('Maximum age must be between 0 and 50'),
    body('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  findNearbyPets
);

/**
 * @route   GET /api/gps/location
 * @desc    Get user location
 * @access  Private
 */
router.get('/location',
  authenticate,
  getUserLocation
);

/**
 * @route   PUT /api/gps/pet/:petId/location
 * @desc    Update pet location
 * @access  Private (pet owner only)
 */
router.put('/pet/:petId/location',
  authenticate,
  [
    param('petId')
      .isUUID()
      .withMessage('Pet ID must be a valid UUID'),
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('accuracy')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Accuracy must be a positive number'),
    body('address')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Address must be less than 500 characters')
  ],
  handleValidationErrors,
  updatePetLocation
);

/**
 * @route   GET /api/gps/stats
 * @desc    Get location statistics
 * @access  Private
 */
router.get('/stats',
  authenticate,
  getLocationStats
);

module.exports = router;
