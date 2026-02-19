import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSubscription } from '../context/SubscriptionContext';
import { ModernButton } from './ui/ModernButton';
import { getStripe } from '../services/paymentService';

// Initialize Stripe
const stripePromise = getStripe();

interface PaymentFormProps {
  planId?: string;
  onSuccess?: (paymentMethodId: string) => void;
  onCancel?: () => void;
  amount?: number;
  isSubscription?: boolean;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  planId,
  onSuccess,
  onCancel,
  isSubscription = true,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { isProcessing, createSubscription } = useSubscription();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.address.line1) {
      newErrors.line1 = 'Address is required';
    }

    if (!formData.address.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.postal_code) {
      newErrors.postal_code = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: formData.email,
          name: formData.name,
          address: formData.address,
        },
      });

      if (paymentMethodError) {
        throw paymentMethodError;
      }

      if (isSubscription && planId) {
        // Create subscription
        await createSubscription(planId, paymentMethod.id);
      }

      if (onSuccess) {
        onSuccess(paymentMethod.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Payment failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>

        {/* Card Element */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Billing Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Billing Address
          </label>
          
          <div className="space-y-3">
            <input
              type="text"
              value={formData.address.line1}
              onChange={(e) => handleAddressChange('line1', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.line1 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Street Address"
            />
            {errors.line1 && (
              <p className="text-sm text-red-600">{errors.line1}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="City"
              />
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city}</p>
              )}

              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="State"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.address.postal_code}
                onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.postal_code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ZIP Code"
              />
              {errors.postal_code && (
                <p className="text-sm text-red-600">{errors.postal_code}</p>
              )}

              <select
                value={formData.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <ModernButton
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isProcessing}
            >
              Cancel
            </ModernButton>
          )}
          <ModernButton
            variant="primary"
            type="submit"
            disabled={!stripe || isSubmitting || isProcessing}
            className="flex-1"
          >
            {isSubmitting || isProcessing ? 'Processing...' : 'Complete Payment'}
          </ModernButton>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Secure Payment
            </h4>
            <p className="text-sm text-blue-700">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

// Quick Payment Component for one-time payments
export const QuickPayment: React.FC<{
  amount: number;
  currency?: string;
  description: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}> = ({ amount, currency = 'usd', description, onSuccess, onCancel }) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">{description}</span>
          <span className="text-2xl font-bold">
            {(amount / 100).toLocaleString('en-US', {
              style: 'currency',
              currency: currency.toUpperCase(),
            })}
          </span>
        </div>
      </div>
      
      <PaymentForm
        amount={amount}
        isSubscription={false}
        onSuccess={() => onSuccess?.()}
        onCancel={onCancel}
      />
    </div>
  );
};
