import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  paymentService, 
  SubscriptionPlan, 
  CustomerSubscription, 
  PaymentMethod,
  Invoice,
  DEFAULT_PLANS 
} from '../services/paymentService';

// Types
interface SubscriptionState {
  plans: SubscriptionPlan[];
  currentSubscription: CustomerSubscription | null;
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
}

type SubscriptionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PLANS'; payload: SubscriptionPlan[] }
  | { type: 'SET_CURRENT_SUBSCRIPTION'; payload: CustomerSubscription | null }
  | { type: 'SET_PAYMENT_METHODS'; payload: PaymentMethod[] }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'ADD_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'REMOVE_PAYMENT_METHOD'; payload: string }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: CustomerSubscription };

// Initial state
const initialState: SubscriptionState = {
  plans: DEFAULT_PLANS,
  currentSubscription: null,
  paymentMethods: [],
  invoices: [],
  isLoading: false,
  error: null,
  isProcessing: false,
};

// Reducer
const subscriptionReducer = (state: SubscriptionState, action: SubscriptionAction): SubscriptionState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PLANS':
      return { ...state, plans: action.payload };
    case 'SET_CURRENT_SUBSCRIPTION':
      return { ...state, currentSubscription: action.payload };
    case 'SET_PAYMENT_METHODS':
      return { ...state, paymentMethods: action.payload };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'ADD_PAYMENT_METHOD':
      return { ...state, paymentMethods: [...state.paymentMethods, action.payload] };
    case 'REMOVE_PAYMENT_METHOD':
      return { 
        ...state, 
        paymentMethods: state.paymentMethods.filter(pm => pm.id !== action.payload) 
      };
    case 'UPDATE_SUBSCRIPTION':
      return { ...state, currentSubscription: action.payload };
    default:
      return state;
  }
};

// Context
interface SubscriptionContextType extends SubscriptionState {
  // Actions
  loadPlans: () => Promise<void>;
  loadSubscription: () => Promise<void>;
  loadPaymentMethods: () => Promise<void>;
  loadInvoices: () => Promise<void>;
  createSubscription: (planId: string, paymentMethodId: string) => Promise<void>;
  cancelSubscription: (immediate?: boolean) => Promise<void>;
  updateSubscription: (planId: string) => Promise<void>;
  addPaymentMethod: (paymentMethodId: string) => Promise<void>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  verifyPayment: (paymentIntentId: string) => Promise<{ status: string; subscription?: CustomerSubscription }>;
  clearError: () => void;
  refreshData: () => Promise<void>;
  
  // Getters
  hasActiveSubscription: boolean;
  isTrialing: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
  canUpgrade: boolean;
  canDowngrade: boolean;
  currentPlan: SubscriptionPlan | null;
  nextBillingDate: Date | null;
  daysUntilTrialEnd: number | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Provider
export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);

  // Actions
  const loadPlans = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const plans = await paymentService.getSubscriptionPlans();
      dispatch({ type: 'SET_PLANS', payload: plans });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load subscription plans' });
      console.error('Error loading plans:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadSubscription = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const subscription = await paymentService.getUserSubscription();
      dispatch({ type: 'SET_CURRENT_SUBSCRIPTION', payload: subscription });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load subscription' });
      console.error('Error loading subscription:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const paymentMethods = await paymentService.getPaymentMethods();
      dispatch({ type: 'SET_PAYMENT_METHODS', payload: paymentMethods });
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      const invoices = await paymentService.getInvoices();
      dispatch({ type: 'SET_INVOICES', payload: invoices });
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const createSubscription = async (planId: string, paymentMethodId: string) => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const plan = state.plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const subscription = await paymentService.createSubscription({
        priceId: plan.stripePriceId,
        paymentMethodId,
        email: '', // Will be filled from auth context
        userId: '', // Will be filled from auth context
      });

      dispatch({ type: 'SET_CURRENT_SUBSCRIPTION', payload: subscription });
      await loadPaymentMethods(); // Refresh payment methods
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create subscription' });
      console.error('Error creating subscription:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  const cancelSubscription = async (immediate = false) => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      if (!state.currentSubscription) {
        throw new Error('No active subscription');
      }

      await paymentService.cancelSubscription(state.currentSubscription.id, immediate);
      await loadSubscription(); // Refresh subscription data
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to cancel subscription' });
      console.error('Error canceling subscription:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  const updateSubscription = async (planId: string) => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      if (!state.currentSubscription) {
        throw new Error('No active subscription');
      }

      const plan = state.plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const updatedSubscription = await paymentService.updateSubscription(
        state.currentSubscription.id,
        plan.stripePriceId
      );

      dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: updatedSubscription });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update subscription' });
      console.error('Error updating subscription:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  const addPaymentMethod = async (paymentMethodId: string) => {
    try {
      // This would typically involve creating a setup intent and confirming the payment method
      // For now, we'll just refresh the payment methods list
      await loadPaymentMethods();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add payment method' });
      console.error('Error adding payment method:', error);
      throw error;
    }
  };

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      await paymentService.deletePaymentMethod(paymentMethodId);
      dispatch({ type: 'REMOVE_PAYMENT_METHOD', payload: paymentMethodId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove payment method' });
      console.error('Error removing payment method:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentIntentId: string) => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      const result = await paymentService.verifyPayment(paymentIntentId);
      
      if (result.subscription) {
        dispatch({ type: 'SET_CURRENT_SUBSCRIPTION', payload: result.subscription });
      }
      
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to verify payment' });
      console.error('Error verifying payment:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const refreshData = async () => {
    await Promise.all([
      loadSubscription(),
      loadPaymentMethods(),
      loadInvoices(),
    ]);
  };

  // Computed values
  const hasActiveSubscription = Boolean(
    state.currentSubscription && 
    (state.currentSubscription.status === 'active' || state.currentSubscription.status === 'trialing')
  );

  const isTrialing = state.currentSubscription?.status === 'trialing';
  const isPastDue = state.currentSubscription?.status === 'past_due';
  const isCanceled = state.currentSubscription?.cancelAtPeriodEnd || state.currentSubscription?.status === 'canceled';

  const canUpgrade = hasActiveSubscription && !isCanceled;
  const canDowngrade = hasActiveSubscription && !isCanceled;

  const currentPlan = state.currentSubscription?.plan || null;
  
  const nextBillingDate = state.currentSubscription?.currentPeriodEnd 
    ? new Date(state.currentSubscription.currentPeriodEnd * 1000) 
    : null;

  const daysUntilTrialEnd = state.currentSubscription?.trialEnd
    ? Math.ceil((state.currentSubscription.trialEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Initialize data
  useEffect(() => {
    loadPlans();
    loadSubscription();
    loadPaymentMethods();
    loadInvoices();
  }, []);

  // Value
  const value: SubscriptionContextType = {
    ...state,
    loadPlans,
    loadSubscription,
    loadPaymentMethods,
    loadInvoices,
    createSubscription,
    cancelSubscription,
    updateSubscription,
    addPaymentMethod,
    removePaymentMethod,
    verifyPayment,
    clearError,
    refreshData,
    hasActiveSubscription,
    isTrialing,
    isPastDue,
    isCanceled,
    canUpgrade,
    canDowngrade,
    currentPlan,
    nextBillingDate,
    daysUntilTrialEnd,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Hook
export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Higher-order component for subscription-gated features
export const withSubscription = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPlan?: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const { hasActiveSubscription, currentPlan, isLoading } = useSubscription();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (requiredPlan && currentPlan?.id !== requiredPlan) {
      return (
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
          <p className="text-gray-600 mb-4">
            This feature requires a {requiredPlan} subscription.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Upgrade Now
          </button>
        </div>
      );
    }

    if (!hasActiveSubscription) {
      return (
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold mb-2">Subscription Required</h3>
          <p className="text-gray-600 mb-4">
            This feature requires an active subscription.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Subscribe Now
          </button>
        </div>
      );
    }

    return <Component {...props} ref={ref} />;
  });
};
