import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';
import axios from 'axios';

// Paymob API Configuration
const PAYMOB_API_URL = process.env.PAYMOB_API_URL || 'https://accept.paymobsolutions.com/api';
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_MERCHANT_ID = process.env.PAYMOB_MERCHANT_ID;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;

// Subscription limits
const SUBSCRIPTION_LIMITS = {
  FREE: {
    maxPets: 1,
    maxRequestsPerMonth: 1,
  },
  PROFESSIONAL: {
    maxPets: 5,
    maxRequestsPerMonth: 50,
  },
  ELITE: {
    maxPets: Infinity,
    maxRequestsPerMonth: Infinity,
  },
};

/**
 * Get user's subscription status and usage
 */
export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = (req.user?.role || req.userRole || '').toUpperCase();
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        subscription: true,
        _count: {
          select: {
            pets: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const limits = isAdmin
      ? { maxPets: Infinity, maxRequestsPerMonth: Infinity }
      : SUBSCRIPTION_LIMITS[user.subscriptionTier];
    const currentPets = user._count.pets;

    // Get current month's request count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const requestsThisMonth = await prisma.breedingRequest.count({
      where: {
        initiatorId: userId,
        createdAt: { gte: startOfMonth },
      },
    });

    const response = {
      tier: user.subscriptionTier,
      status: user.subscription?.status || 'ACTIVE',
      limits: {
        maxPets: limits.maxPets === Infinity ? 'Unlimited' : limits.maxPets,
        maxRequestsPerMonth: limits.maxRequestsPerMonth === Infinity ? 'Unlimited' : limits.maxRequestsPerMonth,
      },
      usage: {
        currentPets: currentPets,
        requestsThisMonth: requestsThisMonth,
      },
      canAddPet: isAdmin || currentPets < limits.maxPets,
      canSendRequest: isAdmin || user.subscriptionTier !== 'FREE' || requestsThisMonth < limits.maxRequestsPerMonth,
      subscription: user.subscription || null,
    };

    return successResponse(res, 'Subscription status retrieved', response);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Paymob payment order for subscription upgrade
 */
export const createPaymentOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tier } = req.body; // 'professional' or 'elite'

    if (!tier || !['professional', 'elite'].includes(tier)) {
      throw new AppError('Invalid subscription tier', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptionTier: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.subscriptionTier !== 'FREE') {
      throw new AppError('You already have an active subscription', 400);
    }

    // Price in EGP (Egyptian Pounds)
    const prices = {
      professional: 999, // 9.99 USD ≈ 300 EGP, using 999 fils for demo
      elite: 2999, // 29.99 USD ≈ 900 EGP
    };

    const amount = prices[tier];
    const description = tier === 'professional' 
      ? 'PetMate Professional Plan - $9.99/month'
      : 'PetMate Elite Breeder Plan - $29.99/month';

    // Step 1: Authenticate with Paymob
    let authToken;
    try {
      const authResponse = await axios.post(`${PAYMOB_API_URL}/auth/tokens`, {
        api_key: PAYMOB_API_KEY,
      });
      authToken = authResponse.data.token;
    } catch (error) {
      console.error('Paymob authentication failed:', error.message);
      throw new AppError('Payment service authentication failed', 500);
    }

    // Step 2: Create order
    let orderId;
    try {
      const orderResponse = await axios.post(
        `${PAYMOB_API_URL}/ecommerce/orders`,
        {
          auth_token: authToken,
          merchant_id: PAYMOB_MERCHANT_ID,
          amount_cents: amount, // Amount in fils (cents)
          currency: 'EGP',
          items: [
            {
              name: tier === 'professional' ? 'Professional Plan' : 'Elite Breeder Plan',
              amount_cents: amount,
              quantity: '1',
              description: description,
            },
          ],
          delivery_needed: false,
          customer: {
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            phone_number: '+201000000000', // Default number
          },
          merchant_order_id: `${userId}-${Date.now()}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      orderId = orderResponse.data.id;
    } catch (error) {
      console.error('Paymob order creation failed:', error.message);
      throw new AppError('Failed to create payment order', 500);
    }

    // Step 3: Create payment key
    let paymentKey;
    try {
      const paymentResponse = await axios.post(
        `${PAYMOB_API_URL}/acceptance/payment_keys`,
        {
          auth_token: authToken,
          order_id: orderId,
          amount_cents: amount,
          expiration: 3600, // 1 hour
          success_url: `${process.env.CLIENT_URL}/subscription/success?order_id=${orderId}`,
          failure_url: `${process.env.CLIENT_URL}/subscription/cancel`,
          customer: {
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            phone_number: '+201000000000',
          },
          items: [
            {
              name: tier === 'professional' ? 'Professional Plan' : 'Elite Breeder Plan',
              amount_cents: amount,
              quantity: '1',
              description: description,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      paymentKey = paymentResponse.data.token;
    } catch (error) {
      console.error('Paymob payment key creation failed:', error.message);
      throw new AppError('Failed to create payment key', 500);
    }

    // Save pending transaction
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        tier: tier.toUpperCase(),
        status: 'PENDING',
        paymobOrderId: orderId.toString(),
        paymobMerchantOrderId: `${userId}-${Date.now()}`,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        petsListedCount: 0,
        requestsSentCount: 0,
        requestsSentMonth: new Date().getMonth() + 1,
      },
      update: {
        tier: tier.toUpperCase(),
        status: 'PENDING',
        paymobOrderId: orderId.toString(),
        paymobMerchantOrderId: `${userId}-${Date.now()}`,
      },
    });

    return successResponse(res, 'Payment order created', {
      paymentKey,
      orderId,
      amount,
      tier,
      paymobIntegrationId: PAYMOB_INTEGRATION_ID,
      iframeUrl: `https://accept.paymobsolutions.com/api/acceptance/iframes/${PAYMOB_INTEGRATION_ID}?payment_token=${paymentKey}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Paymob payment and activate subscription
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }

    // Authenticate with Paymob
    const authResponse = await axios.post(`${PAYMOB_API_URL}/auth/tokens`, {
      api_key: PAYMOB_API_KEY,
    });
    const authToken = authResponse.data.token;

    // Get order details
    const orderResponse = await axios.get(
      `${PAYMOB_API_URL}/ecommerce/orders/${orderId}`,
      {
        params: { auth_token: authToken },
      }
    );

    const order = orderResponse.data;
    const merchantOrderId = order.merchant_order_id;
    const userId = merchantOrderId.split('-')[0];

    // Check if payment is successful
    if (!order.paid_amount_cents || order.paid_amount_cents === 0) {
      throw new AppError('Payment not completed', 400);
    }

    // Extract tier from merchant order ID
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    // Update subscription to ACTIVE
    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'ACTIVE',
        paymobOrderId: orderId.toString(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Update user tier
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: subscription.tier,
      },
    });

    return successResponse(res, 'Payment verified successfully', {
      tier: subscription.tier,
      status: 'ACTIVE',
      message: `You have been upgraded to ${subscription.tier} plan!`,
    });
  } catch (error) {
    console.error('Payment verification error:', error.message);
    next(error);
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new AppError('No active subscription found', 404);
    }

    if (subscription.tier === 'FREE') {
      throw new AppError('You are already on the FREE plan', 400);
    }

    // Update subscription status
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    // Downgrade user to FREE at end of period
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'FREE',
      },
    });

    return successResponse(res, 'Subscription cancelled successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  getSubscriptionStatus,
  createPaymentOrder,
  verifyPayment,
  cancelSubscription,
};
