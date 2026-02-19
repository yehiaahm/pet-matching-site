/**
 * Stripe Payment Controller - Production Ready
 * Complete payment processing with Stripe
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * @desc    Create payment intent
 * @route   POST /api/payments/create-intent
 * @access  Private
 */
const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, currency = 'USD', planType, metadata = {} } = req.body;

    // Validation
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 1',
        timestamp: new Date().toISOString()
      });
    }

    // Validate plan type
    const validPlans = ['BASIC', 'PREMIUM', 'PRO'];
    if (planType && !validPlans.includes(planType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan type. Must be BASIC, PREMIUM, or PRO',
        timestamp: new Date().toISOString()
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        userId,
        planType: planType ? planType.toUpperCase() : 'ONE_TIME',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    // Save payment record to database
    const paymentRecord = await prisma.payment.create({
      data: {
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        status: 'PENDING',
        planType: planType ? planType.toUpperCase() : 'ONE_TIME',
        metadata
      }
    });

    console.log(`💳 Payment intent created: ${paymentIntent.id} for user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentRecordId: paymentRecord.id,
        amount: parseFloat(amount),
        currency: currency.toUpperCase()
      },
      message: 'Payment intent created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while creating payment intent',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Confirm payment
 * @route   POST /api/payments/confirm
 * @access  Private
 */
const confirmPayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required',
        timestamp: new Date().toISOString()
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment not successful',
        timestamp: new Date().toISOString()
      });
    }

    // Update payment record in database
    const paymentRecord = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
        userId
      }
    });

    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        error: 'Payment record not found',
        timestamp: new Date().toISOString()
      });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        status: 'COMPLETED',
        stripePaymentMethodId: paymentIntent.payment_method,
        completedAt: new Date()
      }
    });

    // Update user subscription if applicable
    if (paymentRecord.planType !== 'ONE_TIME') {
      const subscriptionDuration = {
        'BASIC': 30,    // 30 days
        'PREMIUM': 90,  // 90 days
        'PRO': 365       // 365 days
      };

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + subscriptionDuration[paymentRecord.planType]);

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionType: paymentRecord.planType,
          subscriptionExpiresAt: expiresAt
        }
      });
    }

    console.log(`✅ Payment confirmed: ${paymentIntentId} for user ${userId}`);

    res.status(200).json({
      success: true,
      data: {
        payment: updatedPayment,
        paymentIntent
      },
      message: 'Payment confirmed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while confirming payment',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get payment history
 * @route   GET /api/payments/history
 * @access  Private
 */
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, status } = req.query;

    // Build filter
    const where = { userId };
    if (status) {
      const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
      if (validStatuses.includes(status.toUpperCase())) {
        where.status = status.toUpperCase();
      }
    }

    // Get payments with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching payment history',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get subscription status
 * @route   GET /api/payments/subscription
 * @access  Private
 */
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionType: true,
        subscriptionExpiresAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const isSubscriptionActive = user.subscriptionExpiresAt 
      ? new Date() < user.subscriptionExpiresAt 
      : false;

    const daysRemaining = user.subscriptionExpiresAt 
      ? Math.ceil((user.subscriptionExpiresAt - new Date()) / (1000 * 60 * 60 * 24))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        subscriptionType: user.subscriptionType,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        isSubscriptionActive,
        daysRemaining
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get subscription status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching subscription status',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Cancel subscription
 * @route   POST /api/payments/cancel-subscription
 * @access  Private
 */
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionType: true,
        subscriptionExpiresAt: true
      }
    });

    if (!user || !user.subscriptionType) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found',
        timestamp: new Date().toISOString()
      });
    }

    // Cancel subscription by setting expiry to now
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionExpiresAt: new Date()
      }
    });

    console.log(`❌ Subscription cancelled for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while cancelling subscription',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get pricing plans
 * @route   GET /api/payments/plans
 * @access  Public
 */
const getPricingPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'BASIC',
        name: 'Basic',
        price: 9.99,
        currency: 'USD',
        duration: 30,
        features: [
          'Up to 5 pets',
          'Basic search filters',
          'Email support',
          'Standard matching'
        ]
      },
      {
        id: 'PREMIUM',
        name: 'Premium',
        price: 19.99,
        currency: 'USD',
        duration: 90,
        features: [
          'Up to 20 pets',
          'Advanced search filters',
          'Priority support',
          'AI-powered matching',
          'GPS location matching',
          'Health records tracking'
        ]
      },
      {
        id: 'PRO',
        name: 'Professional',
        price: 49.99,
        currency: 'USD',
        duration: 365,
        features: [
          'Unlimited pets',
          'All premium features',
          '24/7 phone support',
          'Advanced analytics',
          'API access',
          'White-label options',
          'Custom breeding reports'
        ]
      }
    ];

    res.status(200).json({
      success: true,
      data: { plans },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get pricing plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching pricing plans',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Stripe webhook handler
 * @route   POST /api/payments/webhook
 * @access  Public
 */
const handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return res.status(400).json({
        success: false,
        error: 'Webhook signature missing',
        timestamp: new Date().toISOString()
      });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return res.status(400).json({
        success: false,
        error: 'Webhook signature verification failed',
        timestamp: new Date().toISOString()
      });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSucceeded(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailed(failedPayment);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await handleInvoiceSucceeded(invoice);
        break;

      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while processing webhook',
      timestamp: new Date().toISOString()
    });
  }
};

// Helper functions for webhook events
async function handlePaymentSucceeded(paymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId;
    
    await prisma.payment.updateMany({
      where: {
        stripePaymentIntentId: paymentIntent.id,
        userId
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    console.log(`✅ Payment succeeded via webhook: ${paymentIntent.id}`);
  } catch (error) {
    console.error('❌ Handle payment succeeded error:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId;
    
    await prisma.payment.updateMany({
      where: {
        stripePaymentIntentId: paymentIntent.id,
        userId
      },
      data: {
        status: 'FAILED'
      }
    });

    console.log(`❌ Payment failed via webhook: ${paymentIntent.id}`);
  } catch (error) {
    console.error('❌ Handle payment failed error:', error);
  }
}

async function handleInvoiceSucceeded(invoice) {
  try {
    console.log(`💰 Invoice succeeded: ${invoice.id}`);
    // Handle subscription renewals if needed
  } catch (error) {
    console.error('❌ Handle invoice succeeded error:', error);
  }
}

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getSubscriptionStatus,
  cancelSubscription,
  getPricingPlans,
  handleWebhook
};
