import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

// Subscription limits
const SUBSCRIPTION_LIMITS = {
  FREE: {
    maxPets: 1,
    maxRequestsPerMonth: 1,
  },
  PREMIUM: {
    maxPets: 5,
    maxRequestsPerMonth: Infinity, // Unlimited
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
        maxPets: limits.maxPets,
        maxRequestsPerMonth: limits.maxRequestsPerMonth === Infinity ? 'Unlimited' : limits.maxRequestsPerMonth,
      },
      usage: {
        currentPets: currentPets,
        requestsThisMonth: requestsThisMonth,
      },
      canAddPet: isAdmin || currentPets < limits.maxPets,
      canSendRequest: isAdmin || user.subscriptionTier === 'PREMIUM' || requestsThisMonth < limits.maxRequestsPerMonth,
      subscription: user.subscription || null,
    };

    return successResponse(res, 'Subscription status retrieved', response);
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can perform an action (middleware helper)
 */
export const checkSubscriptionLimit = (action) => {
  return async (req, res, next) => {
    try {
      const userRole = (req.user?.role || req.userRole || '').toUpperCase();
      if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        return next();
      }

      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionTier: true,
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

      const limits = SUBSCRIPTION_LIMITS[user.subscriptionTier];

      if (action === 'ADD_PET') {
        if (user._count.pets >= limits.maxPets) {
          throw new AppError(
            `Your ${user.subscriptionTier} plan allows only ${limits.maxPets} pet(s). Upgrade to PREMIUM for up to 5 pets.`,
            403
          );
        }
      }

      if (action === 'SEND_REQUEST') {
        if (user.subscriptionTier === 'FREE') {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const requestsThisMonth = await prisma.breedingRequest.count({
            where: {
              initiatorId: userId,
              createdAt: { gte: startOfMonth },
            },
          });

          if (requestsThisMonth >= limits.maxRequestsPerMonth) {
            throw new AppError(
              `Your FREE plan allows only ${limits.maxRequestsPerMonth} breeding request per month. Upgrade to PREMIUM for unlimited requests.`,
              403
            );
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Create Stripe checkout session for subscription upgrade
 */
export const createCheckoutSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { priceId } = req.body; // Stripe price ID for PREMIUM plan

    if (!priceId) {
      throw new AppError('Price ID is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptionTier: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.subscriptionTier === 'PREMIUM') {
      throw new AppError('You already have a PREMIUM subscription', 400);
    }

    // Create or retrieve Stripe customer
    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
      metadata: {
        userId: user.id,
      },
    });

    return successResponse(res, 'Checkout session created', { sessionId: session.id, url: session.url });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle successful subscription upgrade (called from webhook or success page)
 */
export const upgradeSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { stripeCustomerId, stripeSubscriptionId, stripePriceId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update user to PREMIUM
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'PREMIUM',
      },
    });

    // Create or update subscription record
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        tier: 'PREMIUM',
        status: 'ACTIVE',
        stripeCustomerId,
        stripeSubscriptionId,
        stripePriceId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        petsListedCount: 0,
        requestsSentCount: 0,
        requestsSentMonth: new Date().getMonth() + 1,
      },
      update: {
        tier: 'PREMIUM',
        status: 'ACTIVE',
        stripeCustomerId,
        stripeSubscriptionId,
        stripePriceId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return successResponse(res, 'Subscription upgraded successfully', { tier: 'PREMIUM' });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel subscription (downgrade to FREE at end of billing period)
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

    // Cancel Stripe subscription
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Update subscription status
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return successResponse(res, 'Subscription will be cancelled at the end of the billing period');
  } catch (error) {
    next(error);
  }
};

/**
 * Stripe webhook handler for subscription events
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        if (userId) {
          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              tier: 'PREMIUM',
              status: 'ACTIVE',
              stripeCustomerId: subscription.customer,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              petsListedCount: 0,
              requestsSentCount: 0,
              requestsSentMonth: new Date().getMonth() + 1,
            },
            update: {
              status: 'ACTIVE',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: { subscriptionTier: 'PREMIUM' },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              status: 'EXPIRED',
              tier: 'FREE',
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: { subscriptionTier: 'FREE' },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const subscription = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'PAYMENT_FAILED' },
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};
