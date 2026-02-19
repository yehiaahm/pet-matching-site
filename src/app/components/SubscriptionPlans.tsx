import React, { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { formatPrice } from '../services/paymentService';
import { ModernButton } from './ui/ModernButton';

interface SubscriptionPlansProps {
  onPlanSelect?: (planId: string) => void;
  showCurrentPlan?: boolean;
  compact?: boolean;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onPlanSelect,
  showCurrentPlan = true,
  compact = false,
}) => {
  const { 
    plans, 
    currentSubscription, 
    currentPlan,
    isLoading, 
    isProcessing,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelect = async (planId: string) => {
    if (selectedPlan === planId) {
      setSelectedPlan(null);
      return;
    }

    setSelectedPlan(planId);
    
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      // This would typically open a payment modal or redirect to checkout
      // For now, we'll just call createSubscription (which needs payment method)
      console.log('Subscribe to plan:', planId);
      // In a real implementation, you'd handle payment method collection first
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedPlan === plan.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 bg-white'
            } ${plan.popular ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-4">
                <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow">
                  Popular
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">{plan.name}</h3>
            </div>
            
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(plan.price, plan.currency)}
              </div>
              <div className="text-sm text-gray-500 font-normal">
                per {plan.interval}
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-4 line-clamp-2">
              {plan.description}
            </div>
            
            <ModernButton
              size="sm"
              variant={selectedPlan === plan.id ? 'primary' : 'outline'}
              className="w-full"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleSubscribe(plan.id);
              }}
              disabled={isProcessing}
            >
              {currentPlan?.id === plan.id ? '✓ Current' : 'Select'}
            </ModernButton>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600">
          Select the perfect plan for your pet breeding needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id;
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 transition-all hover:shadow-2xl ${
                plan.popular
                  ? 'border-blue-500 shadow-xl md:scale-105 z-10'
                  : 'border-gray-200 hover:border-blue-300'
              } ${isSelected ? 'ring-4 ring-blue-200' : ''} ${
                isCurrentPlan ? 'bg-gradient-to-br from-green-50 to-blue-50' : 'bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ Most Popular
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-5 right-4 z-20">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    ✓ Active
                  </span>
                </div>
              )}

              {/* Plan Icon */}
              <div className="flex justify-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  plan.popular ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <svg 
                    className={`w-10 h-10 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {plan.name === 'Basic' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    )}
                    {plan.name === 'Professional' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    )}
                    {plan.name === 'Premium' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    )}
                    {!['Basic', 'Professional', 'Premium'].includes(plan.name) && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    )}
                  </svg>
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6 min-h-[3rem] text-sm leading-relaxed px-2">
                  {plan.description}
                </p>
                
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900 tracking-tight">
                    {formatPrice(plan.price, plan.currency)}
                  </span>
                  <span className="text-gray-500 ml-2 text-base font-normal">
                    / {plan.interval}
                  </span>
                </div>

                {plan.trialDays && (
                  <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    🎁 {plan.trialDays} days free trial
                  </div>
                )}
              </div>

              <div className="mb-8 space-y-1">
                <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                  What's Included:
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-left">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm leading-relaxed break-words">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <ModernButton
                variant={plan.popular ? 'primary' : 'outline'}
                size="lg"
                className={`w-full transition-all ${
                  plan.popular ? 'shadow-lg hover:shadow-xl transform hover:-translate-y-1' : ''
                }`}
                onClick={() => handlePlanSelect(plan.id)}
                disabled={isCurrentPlan || isProcessing}
              >
                {isCurrentPlan ? (
                  <span className="flex items-center justify-center gap-2">
                    ✓ Current Plan
                  </span>
                ) : isSelected ? (
                  <span className="flex items-center justify-center gap-2">
                    Selected ✓
                  </span>
                ) : (
                  'Select Plan'
                )}
              </ModernButton>

              {plan.trialDays && !isCurrentPlan && (
                <p className="text-center text-xs text-gray-500 mt-3 italic">
                  💳 No credit card required for trial
                </p>
              )}
            </div>
          );
        })}
      </div>

      {selectedPlan && !currentPlan && (
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Ready to get started?
            </h3>
            <p className="text-blue-700 mb-4">
              You've selected the {plans.find(p => p.id === selectedPlan)?.name} plan.
              Complete your payment to activate your subscription.
            </p>
            <ModernButton
              variant="primary"
              onClick={() => handleSubscribe(selectedPlan)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Complete Payment'}
            </ModernButton>
          </div>
        </div>
      )}

      {showCurrentPlan && currentSubscription && (
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Current Subscription
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="font-semibold">{currentPlan?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold capitalize">{currentSubscription.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Billing</p>
              <p className="font-semibold">
                {new Date(currentSubscription.currentPeriodEnd * 1000).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="font-semibold">
                {formatPrice(currentPlan?.price || 0, currentPlan?.currency || 'usd')}/
                {currentPlan?.interval}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            30-Day Money Back Guarantee
          </h3>
          <p className="text-blue-700">
            Not satisfied? Cancel within 30 days for a full refund. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};
