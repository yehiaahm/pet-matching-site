import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { ModernButton } from './ui/ModernButton';

interface PaymentStatusProps {
  onPaymentComplete?: () => void;
  onPaymentFailed?: (error: string) => void;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  onPaymentComplete,
  onPaymentFailed,
}) => {
  const [searchParams] = useSearchParams();
  const { verifyPayment, refreshData, isProcessing } = useSubscription();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'processing'>('loading');
  const [message, setMessage] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');

    if (paymentIntent) {
      setPaymentIntentId(paymentIntent);
      handlePaymentVerification(paymentIntent);
    } else {
      setStatus('error');
      setMessage('No payment information found');
    }
  }, [searchParams]);

  const handlePaymentVerification = async (paymentIntent: string) => {
    try {
      setStatus('processing');
      setMessage('Verifying your payment...');

      const result = await verifyPayment(paymentIntent);

      if (result.status === 'succeeded' || result.subscription) {
        setStatus('success');
        setMessage('Payment successful! Your subscription is now active.');
        await refreshData();
        onPaymentComplete?.();
      } else {
        setStatus('error');
        setMessage('Payment verification failed. Please contact support.');
        onPaymentFailed?.('Payment verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error 
          ? error.message 
          : 'An error occurred while verifying your payment'
      );
      onPaymentFailed?.(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleRetry = () => {
    if (paymentIntentId) {
      handlePaymentVerification(paymentIntentId);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <ModernButton variant="primary" onClick={onPaymentComplete}>
              Continue
            </ModernButton>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <ModernButton variant="primary" onClick={handleRetry} disabled={isProcessing}>
                {isProcessing ? 'Retrying...' : 'Retry Verification'}
              </ModernButton>
              <ModernButton variant="outline" onClick={() => window.history.back()}>
                Go Back
              </ModernButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Payment Verification Component
export const PaymentVerification: React.FC<{
  paymentIntentId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}> = ({ paymentIntentId, onSuccess, onError }) => {
  const { verifyPayment, isProcessing } = useSubscription();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        setStatus('loading');
        setMessage('Verifying payment...');

        const result = await verifyPayment(paymentIntentId);

        if (result.status === 'succeeded' || result.subscription) {
          setStatus('success');
          setMessage('Payment verified successfully!');
          onSuccess?.();
        } else {
          setStatus('error');
          setMessage('Payment verification failed');
          onError?.('Payment verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error 
            ? error.message 
            : 'Payment verification failed'
        );
        onError?.(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    verify();
  }, [paymentIntentId, verifyPayment, onSuccess, onError]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">{message}</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-green-600 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-green-800">{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-red-600 mr-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-red-800">{message}</span>
      </div>
    </div>
  );
};

// Subscription Status Badge
export const SubscriptionStatusBadge: React.FC<{
  status?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ status, showText = true, size = 'md' }) => {
  const { currentSubscription } = useSubscription();
  const subscriptionStatus = status || currentSubscription?.status;

  if (!subscriptionStatus) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
      case 'incomplete_expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
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

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getStatusColor(subscriptionStatus)} ${sizeClasses[size]}`}>
      {showText && getStatusText(subscriptionStatus)}
    </span>
  );
};

// Payment Success Page
export const PaymentSuccessPage: React.FC<{
  subscriptionPlan?: string;
  onContinue?: () => void;
}> = ({ subscriptionPlan, onContinue }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Thank you for your subscription. Your {subscriptionPlan || 'Premium'} plan is now active.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">What's next?</h3>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Access all premium features</li>
                <li>• Create unlimited pet profiles</li>
                <li>• Use AI-powered matching</li>
                <li>• Get priority support</li>
              </ul>
            </div>

            <ModernButton variant="primary" onClick={onContinue} className="w-full">
              Start Using Premium Features
            </ModernButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Failed Page
export const PaymentFailedPage: React.FC<{
  error?: string;
  onRetry?: () => void;
  onBack?: () => void;
}> = ({ error, onRetry, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            
            <p className="text-gray-600 mb-6">
              {error || 'We couldn\'t process your payment. Please try again or contact support.'}
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting</h3>
              <ul className="text-sm text-yellow-700 space-y-1 text-left">
                <li>• Check your card details</li>
                <li>• Ensure sufficient funds</li>
                <li>• Try a different payment method</li>
                <li>• Contact your bank if needed</li>
              </ul>
            </div>

            <div className="space-y-3">
              {onRetry && (
                <ModernButton variant="primary" onClick={onRetry} className="w-full">
                  Try Again
                </ModernButton>
              )}
              {onBack && (
                <ModernButton variant="outline" onClick={onBack} className="w-full">
                  Go Back
                </ModernButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
