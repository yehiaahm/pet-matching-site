/**
 * AI Matching Routes
 * Smart pet matching and recommendations
 */

import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import {
  getMatchRecommendations,
  calculateMatchScore,
  searchMatches,
} from '../controllers/aiMatchingController.js';

/**
 * Middleware: Require authentication for all routes
 */
router.use(protect);

/**
 * GET /api/v1/ai-matches/recommendations/:petId
 * Get AI-powered match recommendations for a specific pet
 * 
 * Response includes:
 * - Top matching candidates
 * - Detailed compatibility scores
 * - Explainable factors (WHY they match)
 * - Next update time
 */
router.get('/recommendations/:petId', getMatchRecommendations);

/**
 * POST /api/v1/ai-matches/calculate-score
 * Calculate detailed match score between two specific pets
 * 
 * Body:
 * {
 *   petAId: string;
 *   petBId: string;
 * }
 * 
 * Response includes:
 * - Weighted compatibility scores by category
 * - Detailed breakdown of each factor
 * - Recommendation and confidence level
 */
router.post('/calculate-score', calculateMatchScore);

/**
 * GET /api/v1/ai-matches/search
 * Search for compatible pets with filters and pagination
 * 
 * Query params:
 * - breed (required): filter by breed
 * - gender: opposite of querying pet
 * - ageMin/ageMax: age range in years
 * - location: search location
 * - radius: search radius in km (default: 100)
 * - minScore: minimum compatibility score (default: 50)
 * - page: pagination page (default: 1)
 * - limit: results per page (default: 10, max: 50)
 * - sortBy: totalScore | distance | rating
 */
router.get('/search', searchMatches);

export default router;
