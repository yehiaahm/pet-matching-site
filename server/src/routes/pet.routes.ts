/**
 * Pet Routes
 * Defines API routes for pet operations
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';
import { createPetController } from '../controllers/pet.controller';
import { IPetService } from '../services/pet.service';

const router = Router();

// Factory function to create pet routes
export function createPetRoutes(petService: IPetService): Router {
  const petController = createPetController(petService);

  // Validation rules
  const petIdValidation = [
    param('id')
      .isUUID()
      .withMessage('Invalid pet ID format'),
  ];

  const createPetValidation = [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Pet name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Pet name must be between 2 and 50 characters'),
    
    body('species')
      .trim()
      .notEmpty()
      .withMessage('Species is required')
      .isIn(['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER'])
      .withMessage('Invalid species'),
    
    body('breed')
      .trim()
      .notEmpty()
      .withMessage('Breed is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Breed must be between 2 and 50 characters'),
    
    body('gender')
      .isIn(['MALE', 'FEMALE'])
      .withMessage('Gender must be MALE or FEMALE'),
    
    body('dateOfBirth')
      .isISO8601()
      .withMessage('Invalid date of birth format')
      .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        return date < now;
      })
      .withMessage('Date of birth cannot be in the future'),
    
    body('weight')
      .optional()
      .isFloat({ min: 0.1, max: 200 })
      .withMessage('Weight must be between 0.1 and 200 kg'),
    
    body('size')
      .optional()
      .isIn(['SMALL', 'MEDIUM', 'LARGE'])
      .withMessage('Size must be SMALL, MEDIUM, or LARGE'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('breedingPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Breeding price must be a positive number'),
    
    body('traits')
      .optional()
      .isArray()
      .withMessage('Traits must be an array'),
    
    body('traits.*')
      .optional()
      .isString()
      .withMessage('Each trait must be a string'),
  ];

  const updatePetValidation = [
    ...petIdValidation,
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Pet name must be between 2 and 50 characters'),
    
    body('species')
      .optional()
      .isIn(['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER'])
      .withMessage('Invalid species'),
    
    body('breed')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Breed must be between 2 and 50 characters'),
    
    body('gender')
      .optional()
      .isIn(['MALE', 'FEMALE'])
      .withMessage('Gender must be MALE or FEMALE'),
    
    body('weight')
      .optional()
      .isFloat({ min: 0.1, max: 200 })
      .withMessage('Weight must be between 0.1 and 200 kg'),
    
    body('size')
      .optional()
      .isIn(['SMALL', 'MEDIUM', 'LARGE'])
      .withMessage('Size must be SMALL, MEDIUM, or LARGE'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('breedingPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Breeding price must be a positive number'),
    
    body('traits')
      .optional()
      .isArray()
      .withMessage('Traits must be an array'),
    
    body('traits.*')
      .optional()
      .isString()
      .withMessage('Each trait must be a string'),
  ];

  const vaccinationValidation = [
    ...petIdValidation,
    
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Vaccination name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Vaccination name must be between 2 and 100 characters'),
    
    body('date')
      .isISO8601()
      .withMessage('Invalid vaccination date format')
      .custom((value) => {
        const date = new Date(value);
        return date <= new Date();
      })
      .withMessage('Vaccination date cannot be in the future'),
    
    body('nextDue')
      .optional()
      .isISO8601()
      .withMessage('Invalid next due date format'),
    
    body('veterinarian')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Veterinarian name must be between 2 and 100 characters'),
    
    body('batchNumber')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Batch number cannot exceed 50 characters'),
    
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
  ];

  const healthCheckValidation = [
    ...petIdValidation,
    
    body('date')
      .isISO8601()
      .withMessage('Invalid health check date format')
      .custom((value) => {
        const date = new Date(value);
        return date <= new Date();
      })
      .withMessage('Health check date cannot be in the future'),
    
    body('veterinarian')
      .trim()
      .notEmpty()
      .withMessage('Veterinarian name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Veterinarian name must be between 2 and 100 characters'),
    
    body('weight')
      .optional()
      .isFloat({ min: 0.1, max: 200 })
      .withMessage('Weight must be between 0.1 and 200 kg'),
    
    body('temperature')
      .optional()
      .isFloat({ min: 35, max: 42 })
      .withMessage('Temperature must be between 35 and 42°C'),
    
    body('heartRate')
      .optional()
      .isInt({ min: 40, max: 200 })
      .withMessage('Heart rate must be between 40 and 200 bpm'),
    
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
  ];

  const breedingStatusValidation = [
    ...petIdValidation,
    
    body('status')
      .isIn(['AVAILABLE', 'UNAVAILABLE', 'PENDING', 'BREEDING'])
      .withMessage('Invalid breeding status'),
  ];

  const searchValidation = [
    query('q')
      .trim()
      .notEmpty()
      .withMessage('Search query is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters'),
  ];

  const paginationValidation = [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ];

  const filterValidation = [
    query('species')
      .optional()
      .isIn(['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER'])
      .withMessage('Invalid species filter'),
    
    query('breed')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Breed filter must be between 2 and 50 characters'),
    
    query('gender')
      .optional()
      .isIn(['MALE', 'FEMALE'])
      .withMessage('Gender filter must be MALE or FEMALE'),
    
    query('size')
      .optional()
      .isIn(['SMALL', 'MEDIUM', 'LARGE'])
      .withMessage('Size filter must be SMALL, MEDIUM, or LARGE'),
    
    query('breedingStatus')
      .optional()
      .isIn(['AVAILABLE', 'UNAVAILABLE', 'PENDING', 'BREEDING'])
      .withMessage('Invalid breeding status filter'),
    
    query('minAge')
      .optional()
      .isInt({ min: 0, max: 30 })
      .withMessage('Minimum age must be between 0 and 30'),
    
    query('maxAge')
      .optional()
      .isInt({ min: 0, max: 30 })
      .withMessage('Maximum age must be between 0 and 30'),
    
    query('minWeight')
      .optional()
      .isFloat({ min: 0.1, max: 200 })
      .withMessage('Minimum weight must be between 0.1 and 200 kg'),
    
    query('maxWeight')
      .optional()
      .isFloat({ min: 0.1, max: 200 })
      .withMessage('Maximum weight must be between 0.1 and 200 kg'),
  ];

  /**
   * @route   POST /api/v1/pets
   * @desc    Create a new pet
   * @access  Private
   */
  router.post(
    '/',
    authenticate,
    rateLimit({ max: 5, windowMs: 60000 }), // 5 requests per minute
    createPetValidation,
    validate,
    petController.createPet.bind(petController)
  );

  /**
   * @route   GET /api/v1/pets/:id
   * @desc    Get pet by ID
   * @access  Private
   */
  router.get(
    '/:id',
    authenticate,
    petIdValidation,
    validate,
    petController.getPetById.bind(petController)
  );

  /**
   * @route   GET /api/v1/pets/my-pets
   * @desc    Get current user's pets
   * @access  Private
   */
  router.get(
    '/my-pets',
    authenticate,
    paginationValidation,
    validate,
    petController.getUserPets.bind(petController)
  );

  /**
   * @route   PUT /api/v1/pets/:id
   * @desc    Update pet
   * @access  Private
   */
  router.put(
    '/:id',
    authenticate,
    rateLimit({ max: 10, windowMs: 60000 }), // 10 requests per minute
    updatePetValidation,
    validate,
    petController.updatePet.bind(petController)
  );

  /**
   * @route   DELETE /api/v1/pets/:id
   * @desc    Delete pet
   * @access  Private
   */
  router.delete(
    '/:id',
    authenticate,
    rateLimit({ max: 5, windowMs: 60000 }), // 5 requests per minute
    petIdValidation,
    validate,
    petController.deletePet.bind(petController)
  );

  /**
   * @route   GET /api/v1/pets/search
   * @desc    Search pets
   * @access  Private
   */
  router.get(
    '/search',
    authenticate,
    searchValidation,
    filterValidation,
    paginationValidation,
    validate,
    petController.searchPets.bind(petController)
  );

  /**
   * @route   GET /api/v1/pets/available
   * @desc    Get available pets for breeding
   * @access  Private
   */
  router.get(
    '/available',
    authenticate,
    filterValidation,
    paginationValidation,
    validate,
    petController.getAvailablePets.bind(petController)
  );

  /**
   * @route   POST /api/v1/pets/:id/vaccinations
   * @desc    Add vaccination to pet
   * @access  Private
   */
  router.post(
    '/:id/vaccinations',
    authenticate,
    rateLimit({ max: 10, windowMs: 60000 }), // 10 requests per minute
    vaccinationValidation,
    validate,
    petController.addVaccination.bind(petController)
  );

  /**
   * @route   POST /api/v1/pets/:id/health-checks
   * @desc    Add health check to pet
   * @access  Private
   */
  router.post(
    '/:id/health-checks',
    authenticate,
    rateLimit({ max: 10, windowMs: 60000 }), // 10 requests per minute
    healthCheckValidation,
    validate,
    petController.addHealthCheck.bind(petController)
  );

  /**
   * @route   GET /api/v1/pets/stats
   * @desc    Get pet statistics
   * @access  Private (Admin only)
   */
  router.get(
    '/stats',
    authenticate,
    // Add admin middleware check here
    petController.getPetStats.bind(petController)
  );

  /**
   * @route   POST /api/v1/pets/match
   * @desc    Find matching pets for breeding
   * @access  Private
   */
  router.post(
    '/match',
    authenticate,
    rateLimit({ max: 3, windowMs: 60000 }), // 3 requests per minute
    petController.findMatchingPets.bind(petController)
  );

  /**
   * @route   PATCH /api/v1/pets/:id/breeding-status
   * @desc    Update breeding status
   * @access  Private
   */
  router.patch(
    '/:id/breeding-status',
    authenticate,
    breedingStatusValidation,
    validate,
    petController.updateBreedingStatus.bind(petController)
  );

  return router;
}

export default router;
