import { loadStripe, Stripe } from '@stripe/stripe-js';
import { 
  PaymentIntent, 
  SetupIntent, 
  Subscription, 
  Price, 
  Product,
  PaymentMethod,
  Invoice
} from '@stripe/stripe-js';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...';
let stripePromise: Promise<Stripe | null>;

// Initialize Stripe
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  popular?: boolean;
  trialDays?: number;
}

export interface CustomerSubscription {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialEnd?: number;
  plan: SubscriptionPlan;
  paymentMethod?: PaymentMethod;
}

export interface PaymentFormData {
  paymentMethodId: string;
  email: string;
  name: string;
}

export interface CreateSubscriptionData {
  priceId: string;
  paymentMethodId: string;
  email: string;
  userId: string;
}

// API Service
class PaymentService {
  private baseUrl = '/api/v1/payments';

  // Get available subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/plans`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  // Create payment intent for one-time payment
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error, paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
      
      if (error) {
        throw error;
      }

      return paymentIntent!;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Create setup intent for saving payment method
  async createSetupIntent(): Promise<SetupIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/create-setup-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create setup intent');
      }

      const { clientSecret } = await response.json();
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error, setupIntent } = await stripe.retrieveSetupIntent(clientSecret);
      
      if (error) {
        throw error;
      }

      return setupIntent!;
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  }

  // Create subscription
  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    try {
      const response = await fetch(`${this.baseUrl}/create-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Get user's current subscription
  async getUserSubscription(): Promise<CustomerSubscription | null> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, immediate = false): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ immediate }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Update subscription (change plan)
  async updateSubscription(subscriptionId: string, priceId: string): Promise<Subscription> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription/${subscriptionId}/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const { paymentMethods } = await response.json();
      return paymentMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  // Delete payment method
  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  // Get invoices
  async getInvoices(): Promise<Invoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/invoices`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const { invoices } = await response.json();
      return invoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(paymentIntentId: string): Promise<{ status: string; subscription?: CustomerSubscription }> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-payment/${paymentIntentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Check subscription status
  async checkSubscriptionStatus(): Promise<{ hasSubscription: boolean; plan?: string; status?: string }> {
    try {
      const subscription = await this.getUserSubscription();
      
      if (!subscription) {
        return { hasSubscription: false };
      }

      return {
        hasSubscription: true,
        plan: subscription.plan.name,
        status: subscription.status,
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return { hasSubscription: false };
    }
  }

  // Helper method to get auth token
  private getToken(): string {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  // Process payment with Stripe Elements
  async processPayment(cardElement: any, billingDetails: any): Promise<PaymentIntent> {
    try {
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails,
      });

      if (error) {
        throw error;
      }

      // Create payment intent
      const paymentIntent = await this.createPaymentIntent(1000); // $10.00 example

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(paymentIntent.client_secret!, {
        payment_method: paymentMethod.id,
      });

      if (confirmError) {
        throw confirmError;
      }

      return paymentIntent;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();

// Default subscription plans
export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic features for pet owners',
    price: 0,
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 3 pet profiles',
      'Basic matching',
      'Limited messaging',
      'Community access',
    ],
    stripePriceId: '',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Advanced features for serious breeders',
    price: 29.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited pet profiles',
      'AI-powered matching',
      'Unlimited messaging',
      'Priority support',
      'Advanced analytics',
      'Health tracking tools',
      'Breeding recommendations',
    ],
    stripePriceId: 'price_1...',
    popular: true,
    trialDays: 14,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Complete solution for breeding businesses',
    price: 99.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Everything in Premium',
      'Multiple user accounts',
      'Custom branding',
      'API access',
      'Dedicated support',
      'Advanced reporting',
      'Bulk operations',
      'White-label options',
    ],
    stripePriceId: 'price_2...',
    trialDays: 30,
  },
];

// Utility functions
export const formatPrice = (amount: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

export const getSubscriptionStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'trialing':
      return 'text-blue-600 bg-blue-100';
    case 'past_due':
      return 'text-yellow-600 bg-yellow-100';
    case 'canceled':
    case 'incomplete_expired':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getSubscriptionStatusText = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Trial';
    case 'past_due':
      return 'Past Due';
    case 'canceled':
      return 'Canceled';
    case 'incomplete':
      return 'Incomplete';
    case 'incomplete_expired':
      return 'Expired';
    case 'unpaid':
      return 'Unpaid';
    default:
      return 'Unknown';
  }
};
