import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getSubscriptionStatus,
  createPaymentOrder,
  verifyPayment,
  cancelSubscription,
} from '../controllers/paymobSubscriptionController.js';

const router = express.Router();

// Protected routes
router.get('/status', authenticate, getSubscriptionStatus);
router.post('/create-order', authenticate, createPaymentOrder);
router.post('/verify-payment', authenticate, verifyPayment);
router.post('/cancel', authenticate, cancelSubscription);

export default router;
