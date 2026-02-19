import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
	handleStripeWebhook,
	getSubscriptionStatus,
	createCheckoutSession,
	upgradeSubscription,
	cancelSubscription,
} from '../controllers/subscriptionController.js';
const router = express.Router();

// Public webhook endpoint (no auth - verified by Stripe signature)
router.post('/webhook', handleStripeWebhook);

// Protected routes
router.get('/status', authenticate, getSubscriptionStatus);
router.post('/checkout', authenticate, createCheckoutSession);
router.post('/upgrade', authenticate, upgradeSubscription);
router.post('/cancel', authenticate, cancelSubscription);

export default router;
