/**
 * Matchmaking Routes
 * All routes require authentication
 */

import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import {
  findPetMatches,
  getMatchStatistics,
  calculatePetMatch,
} from '../controllers/matchController.js';

/**
 * GET /api/matches/stats/:petId
 * Get detailed matching statistics
 */
router.get('/:petId/stats', protect, getMatchStatistics);

/**
 * GET /api/matches/:petId
 * Find compatible matches for a specific pet
 * Query params: minAge, maxAge, minScore, maxDistance, minDistance, limit
 */
router.get('/:petId', protect, findPetMatches);

/**
 * POST /api/matches/calculate
 * Manually calculate match score between two pets
 */
router.post('/calculate', protect, calculatePetMatch);

export default router;
