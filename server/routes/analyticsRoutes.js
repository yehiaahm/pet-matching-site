/**
 * Analytics Routes
 * All routes require ADMIN role
 * Mounted at /api/v1/analytics
 */

import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import { verifyAdmin } from '../middleware/admin.js';
import {
  getOverview,
  getUserStats,
  getPetStats,
  getBreedStats,
  getMatchStats,
  getDailyActivity,
  getMatchRequestsByDay,
  getRevenueStats,
} from '../controllers/analyticsController.js';

/**
 * Middleware: Require authentication and admin role for all routes
 */
router.use(protect);
router.use(verifyAdmin);

/**
 * GET /api/v1/analytics/overview
 * High-level platform statistics
 */
router.get('/overview', getOverview);

/**
 * GET /api/v1/analytics/users
 * User statistics and demographics
 */
router.get('/users', getUserStats);

/**
 * GET /api/v1/analytics/pets
 * Pet statistics and distribution
 */
router.get('/pets', getPetStats);

/**
 * GET /api/v1/analytics/breeds
 * Breed popularity and request statistics
 */
router.get('/breeds', getBreedStats);

/**
 * GET /api/v1/analytics/matches
 * Breeding request and match statistics
 */
router.get('/matches', getMatchStats);

/**
 * GET /api/v1/analytics/daily-activity
 * Daily activity metrics (configurable days)
 * Query: ?days=30 (default: 30)
 */
router.get('/daily-activity', getDailyActivity);

/**
 * GET /api/v1/analytics/match-requests-by-day
 * Match requests per day for specified period
 * Query: ?days=30 (default: 30)
 */
router.get('/match-requests-by-day', getMatchRequestsByDay);

/**
 * GET /api/v1/analytics/revenue
 * Revenue and payment statistics
 */
router.get('/revenue', getRevenueStats);

export default router;
