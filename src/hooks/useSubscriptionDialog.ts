import { useState, useCallback, useEffect } from 'react';
import { useSubscription } from '../app/context/SubscriptionContext';
import { toast } from 'sonner';

interface SubscriptionStatus {
  plan: string;
  status: string;
  expiresAt: string | null;
  usage: {
    currentPets: number;
    maxPets: number;
    requestsThisMonth: number;
    maxRequests: number;
  };
}

interface UseSubscriptionDialogState {
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  processingPayment: boolean;
  selectedPlan: string | null;
}

interface UseSubscriptionDialogActions {
  handlePlanSelect: (planId: string) => void;
  handlePayment: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  resetSelection: () => void;
}

export function useSubscriptionDialog(): UseSubscriptionDialogState & UseSubscriptionDialogActions {
  const { currentSubscription, isProcessing, createSubscription } = useSubscription();
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call to get subscription status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (currentSubscription) {
        setSubscriptionStatus({
          plan: currentSubscription.plan || 'free',
          status: currentSubscription.status || 'active',
          expiresAt: currentSubscription.expiresAt || null,
          usage: {
            currentPets: 2,
            maxPets: currentSubscription.plan === 'free' ? 3 : 50,
            requestsThisMonth: 5,
            maxRequests: currentSubscription.plan === 'free' ? 10 : 100,
          }
        });
      } else {
        setSubscriptionStatus({
          plan: 'free',
          status: 'active',
          expiresAt: null,
          usage: {
            currentPets: 2,
            maxPets: 3,
            requestsThisMonth: 5,
            maxRequests: 10,
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      toast.error('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  }, [currentSubscription]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handlePlanSelect = useCallback((planId: string) => {
    if (selectedPlan === planId) {
      setSelectedPlan(null);
    } else {
      setSelectedPlan(planId);
    }
  }, [selectedPlan]);

  const handlePayment = useCallback(async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    setProcessingPayment(true);
    try {
      const result = await createSubscription(selectedPlan);
      
      if (result.success) {
        toast.success('Subscription created successfully!');
        await refreshStatus();
        setSelectedPlan(null);
      } else {
        toast.error(result.error || 'Failed to create subscription');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast.error(errorMessage);
    } finally {
      setProcessingPayment(false);
    }
  }, [selectedPlan, createSubscription, refreshStatus]);

  const resetSelection = useCallback(() => {
    setSelectedPlan(null);
  }, []);

  return {
    // State
    subscriptionStatus,
    loading,
    processingPayment,
    selectedPlan,
    
    // Actions
    handlePlanSelect,
    handlePayment,
    refreshStatus,
    resetSelection,
  };
}
