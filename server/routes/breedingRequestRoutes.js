import express from 'express';
import {
  createBreedingRequest,
  getBreedingRequests,
  getBreedingRequestById,
  acceptBreedingRequest,
  rejectBreedingRequest,
  cancelBreedingRequest,
  completeBreedingRequest,
  deleteBreedingRequest
} from '../controllers/breedingRequestController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBreedingRequest } from '../middleware/validation.js';
import { checkSubscriptionLimit } from '../controllers/subscriptionController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new breeding request
router.post('/', validateBreedingRequest, checkSubscriptionLimit('SEND_REQUEST'), createBreedingRequest);

// Get all breeding requests (sent and received)
router.get('/', getBreedingRequests);

// Get a single breeding request by ID
router.get('/:id', getBreedingRequestById);

// Accept a breeding request
router.patch('/:id/accept', acceptBreedingRequest);

// Reject a breeding request
router.patch('/:id/reject', rejectBreedingRequest);

// Cancel a breeding request
router.patch('/:id/cancel', cancelBreedingRequest);

// Mark breeding request as completed
router.patch('/:id/complete', completeBreedingRequest);

// Delete a breeding request
router.delete('/:id', deleteBreedingRequest);

export default router;
