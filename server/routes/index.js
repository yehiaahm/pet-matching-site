import express from 'express';
import authRoutes from './authRoutes.js';
import petRoutes from './petRoutes.js';
import healthRoutes from './healthRoutes.js';
import matchRoutes from './matchRoutes.js';
import aiMatchingRoutes from './aiMatchingRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import breedingRequestRoutes from './breedingRequestRoutes.js';
import healthRecordRoutes from './healthRecordRoutes.js';
import messageRoutes from './messageRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import paymobSubscriptionRoutes from './paymobSubscriptionRoutes.js';
import clinicRoutes from './clinicRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import verificationRoutes from './verificationRoutes.js';
import supportRoutes from './supportRoutes.js';
import adminRoutes from './adminRoutes.js';
import legalRoutes from './legalRoutes.js';
import config from '../config/index.js';

const router = express.Router();

// API version prefix
const apiPrefix = `${config.api.prefix}/${config.api.version}`;

/**
 * Mount routes
 */
router.use(`${apiPrefix}/health`, healthRoutes);
router.use(`${apiPrefix}/auth`, authRoutes);
router.use(`${apiPrefix}/pets`, petRoutes);
router.use(`${apiPrefix}/matches`, matchRoutes);
router.use(`${apiPrefix}/ai-matches`, aiMatchingRoutes);
router.use(`${apiPrefix}/analytics`, analyticsRoutes);
router.use(`${apiPrefix}/breeding-requests`, breedingRequestRoutes);
router.use(`${apiPrefix}/health-records`, healthRecordRoutes);
router.use(`${apiPrefix}/messages`, messageRoutes);
router.use(`${apiPrefix}/reviews`, reviewRoutes);
router.use(`${apiPrefix}/subscription`, paymobSubscriptionRoutes);
router.use(`${apiPrefix}/clinic`, clinicRoutes);
router.use(`${apiPrefix}/bookings`, bookingRoutes);
router.use(`${apiPrefix}/verification`, verificationRoutes);
router.use(`${apiPrefix}/support`, supportRoutes);
router.use(`${apiPrefix}/admin`, adminRoutes);
router.use(`${apiPrefix}/legal`, legalRoutes);

/**
 * Root endpoint
 */
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'PetMat API is running',
    version: config.api.version,
    documentation: `${apiPrefix}/docs`,
    endpoints: {
      health: `${apiPrefix}/health`,
      auth: `${apiPrefix}/auth`,
      pets: `${apiPrefix}/pets`,
      matches: `${apiPrefix}/matches`,
      analytics: `${apiPrefix}/analytics (admin only)`,
      breedingRequests: `${apiPrefix}/breeding-requests`,
      healthRecords: `${apiPrefix}/health-records`,
      messages: `${apiPrefix}/messages`,
      reviews: `${apiPrefix}/reviews`,
      subscription: `${apiPrefix}/subscription`,
      clinic: `${apiPrefix}/clinic`,
      bookings: `${apiPrefix}/bookings`,
      verification: `${apiPrefix}/verification`,
    },
  });
});

export default router;
