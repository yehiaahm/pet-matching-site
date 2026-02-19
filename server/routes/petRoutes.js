import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';
import { checkSubscriptionLimit } from '../controllers/subscriptionController.js';
import {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  getUserPets,
} from '../controllers/petController.js';

const router = express.Router();

/**
 * Validation rules
 */
const petIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid pet ID'),
];

const createPetValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Pet name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Pet name must be between 2 and 50 characters'),
  body('breed')
    .trim()
    .notEmpty()
    .withMessage('Breed is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Breed must be between 2 and 50 characters'),
  body('species')
    .trim()
    .notEmpty()
    .withMessage('Species is required')
    .isLength({ min: 2, max: 30 })
    .withMessage('Species must be between 2 and 30 characters'),
  body('gender')
    .isIn(['MALE', 'FEMALE', 'UNKNOWN'])
    .withMessage('Gender must be MALE, FEMALE, or UNKNOWN'),
  body('age')
    .isInt({ min: 0, max: 300 })
    .withMessage('Age must be a positive number (in months)'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Color must not exceed 30 characters'),
  body('weight')
    .optional()
    .isFloat({ min: 0.1, max: 500 })
    .withMessage('Weight must be between 0.1 and 500 kg'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('isVaccinated')
    .optional()
    .isBoolean()
    .withMessage('isVaccinated must be a boolean'),
  body('isNeutered')
    .optional()
    .isBoolean()
    .withMessage('isNeutered must be a boolean'),
  body('healthConditions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Health conditions must not exceed 500 characters'),
  body('isAvailableForBreeding')
    .optional()
    .isBoolean()
    .withMessage('isAvailableForBreeding must be a boolean'),
  body('breedingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Breeding price must be a positive number'),
  body('hasPedigree')
    .optional()
    .isBoolean()
    .withMessage('hasPedigree must be a boolean'),
  body('pedigreeNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Pedigree number must not exceed 50 characters'),
];

const updatePetValidation = [
  ...petIdValidation,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Pet name must be between 2 and 50 characters'),
  body('breed')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Breed must be between 2 and 50 characters'),
  body('species')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Species must be between 2 and 30 characters'),
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'UNKNOWN'])
    .withMessage('Gender must be MALE, FEMALE, or UNKNOWN'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 300 })
    .withMessage('Age must be a positive number (in months)'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Color must not exceed 30 characters'),
  body('weight')
    .optional()
    .isFloat({ min: 0.1, max: 500 })
    .withMessage('Weight must be between 0.1 and 500 kg'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('isVaccinated')
    .optional()
    .isBoolean()
    .withMessage('isVaccinated must be a boolean'),
  body('isNeutered')
    .optional()
    .isBoolean()
    .withMessage('isNeutered must be a boolean'),
  body('healthConditions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Health conditions must not exceed 500 characters'),
  body('isAvailableForBreeding')
    .optional()
    .isBoolean()
    .withMessage('isAvailableForBreeding must be a boolean'),
  body('breedingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Breeding price must be a positive number'),
  body('hasPedigree')
    .optional()
    .isBoolean()
    .withMessage('hasPedigree must be a boolean'),
  body('pedigreeNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Pedigree number must not exceed 50 characters'),
];

/**
 * Routes
 */

// Public routes (no auth required)
router.get('/', getAllPets);
router.get('/:id', petIdValidation, validate, getPetById);
router.post('/', createPetValidation, validate, createPet);

// Protected routes (auth required for these operations)
router.use(protect);

router.get('/user/my-pets', getUserPets);
router.patch('/:id', updatePetValidation, validate, updatePet);
router.delete('/:id', petIdValidation, validate, deletePet);

export default router;
