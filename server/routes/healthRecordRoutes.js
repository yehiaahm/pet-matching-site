import express from 'express';
import {
  createHealthRecord,
  getHealthRecordsByPet,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
  getMyPetsHealthRecords
} from '../controllers/healthRecordController.js';
import { authenticate } from '../middleware/auth.js';
import { validateHealthRecord } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all health records for current user's pets
router.get('/my-pets', getMyPetsHealthRecords);

// Create a health record
router.post('/', validateHealthRecord, createHealthRecord);

// Get all health records for a specific pet
router.get('/pet/:petId', getHealthRecordsByPet);

// Get a single health record by ID
router.get('/:id', getHealthRecordById);

// Update a health record
router.patch('/:id', updateHealthRecord);

// Delete a health record
router.delete('/:id', deleteHealthRecord);

export default router;
