import express from 'express';
import {
  createReview,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getUserRatingStats
} from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';
import { validateReview } from '../middleware/validation.js';

const router = express.Router();

// Public routes
// Get reviews for a user
router.get('/user/:userId', getUserReviews);

// Get user rating statistics
router.get('/user/:userId/stats', getUserRatingStats);

// Get a single review
router.get('/:id', getReviewById);

// Protected routes (require authentication)
router.use(authenticate);

// Create a review
router.post('/', validateReview, createReview);

// Update a review
router.patch('/:id', updateReview);

// Delete a review
router.delete('/:id', deleteReview);

// Mark review as helpful
router.post('/:id/helpful', markReviewHelpful);

export default router;
