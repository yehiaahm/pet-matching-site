import React from 'react';
import { SubscriptionProvider, useSubscription } from '../context/SubscriptionContext';
import { SubscriptionPlans } from '../components/SubscriptionPlans';
import { SubscriptionManagement } from '../components/SubscriptionManagement';
import { PaymentForm } from '../components/PaymentForm';
import { PaymentStatus } from '../components/PaymentStatus';
import { SubscriptionStatusBadge } from '../components/PaymentStatus';

// Main subscription page component
export const SubscriptionPage: React.FC = () => {
  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full">
                🎯 Choose Your Perfect Plan
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Upgrade Your Pet Breeding
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Experience
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get access to premium features, unlimited matches, and priority support
              to grow your pet breeding business
            </p>
          </div>
          
          <SubscriptionPlans />
          
          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">SSL encrypted transactions for your safety</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Cancel Anytime</h3>
              <p className="text-gray-600 text-sm">No long-term contracts, cancel with one click</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Premium support whenever you need help</p>
            </div>
          </div>
        </div>
      </div>
    </SubscriptionProvider>
  );
};

// Account management page with subscription
export const AccountSubscriptionPage: React.FC = () => {
  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <SubscriptionManagement />
        </div>
      </div>
    </SubscriptionProvider>
  );
};

// Payment page for checkout
export const PaymentPage: React.FC<{
  planId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}> = ({ planId, onSuccess, onCancel }) => {
  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <PaymentForm
            planId={planId}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </div>
      </div>
    </SubscriptionProvider>
  );
};

// Payment verification page (redirect from Stripe)
export const PaymentVerificationPage: React.FC<{
  onPaymentComplete?: () => void;
  onPaymentFailed?: (error: string) => void;
}> = ({ onPaymentComplete, onPaymentFailed }) => {
  return (
    <SubscriptionProvider>
      <PaymentStatus
        onPaymentComplete={onPaymentComplete}
        onPaymentFailed={onPaymentFailed}
      />
    </SubscriptionProvider>
  );
};

// Higher-order component for subscription-gated routes
export const withSubscriptionRequired = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPlan?: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    return (
      <SubscriptionProvider>
        <SubscriptionGuard Component={Component} requiredPlan={requiredPlan} props={props} ref={ref} />
      </SubscriptionProvider>
    );
  });
};

// Internal guard component
const SubscriptionGuard: React.FC<{
  Component: React.ComponentType<any>;
  requiredPlan?: string;
  props: any;
  ref: any;
}> = ({ Component, requiredPlan, props, ref }) => {
  const { hasActiveSubscription, currentPlan, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requiredPlan && currentPlan?.id !== requiredPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Premium Feature
            </h3>
            <p className="text-gray-600 mb-6">
              This feature requires a {requiredPlan} subscription.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/subscription'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade to {requiredPlan}
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Subscription Required
            </h3>
            <p className="text-gray-600 mb-6">
              This feature requires an active subscription.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/subscription'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Subscribe Now
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Component {...props} ref={ref} />;
};

// Export all components for easy importing
export {
  SubscriptionProvider,
  SubscriptionPlans,
  SubscriptionManagement,
  PaymentForm,
  PaymentStatus,
  SubscriptionStatusBadge,
};

// Export types for external use
export type {
  SubscriptionPlan,
  CustomerSubscription,
} from '../services/paymentService';
