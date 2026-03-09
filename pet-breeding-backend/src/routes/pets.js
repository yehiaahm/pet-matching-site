const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const petController = require('../controllers/petController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { petValidationSchemas } = require('../utils/validators');

const router = express.Router();

// Configure multer for pet photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/pets';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
  }
});

/**
 * @route   POST /api/pets
 * @desc    Create a new pet
 * @access  Private
 */
router.post('/',
  authenticate,
  validateRequest(petValidationSchemas.create),
  petController.createPet
);

/**
 * @route   GET /api/pets
 * @desc    Get all pets with filtering and pagination
 * @access  Public
 */
router.get('/',
  petController.getAllPets
);

/**
 * @route   GET /api/pets/my
 * @desc    Get current user's pets
 * @access  Private
 */
router.get('/my',
  authenticate,
  petController.getUserPets
);

/**
 * @route   GET /api/pets/:id
 * @desc    Get pet by ID
 * @access  Public
 */
router.get('/:id',
  petController.getPetById
);

/**
 * @route   PUT /api/pets/:id
 * @desc    Update pet
 * @access  Private
 */
router.put('/:id',
  authenticate,
  validateRequest(petValidationSchemas.update),
  petController.updatePet
);

/**
 * @route   DELETE /api/pets/:id
 * @desc    Delete pet
 * @access  Private
 */
router.delete('/:id',
  authenticate,
  petController.deletePet
);

/**
 * @route   POST /api/pets/:id/photos
 * @desc    Upload pet photo
 * @access  Private
 */
router.post('/:id/photos',
  authenticate,
  upload.single('photo'),
  petController.uploadPetPhoto
);

/**
 * @route   DELETE /api/pets/:id/photos/:photoId
 * @desc    Delete pet photo
 * @access  Private
 */
router.delete('/:id/photos/:photoId',
  authenticate,
  petController.deletePetPhoto
);

module.exports = router;
