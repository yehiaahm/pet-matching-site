import React, { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { formatPrice, getSubscriptionStatusColor, getSubscriptionStatusText } from '../services/paymentService';
import { ModernButton } from './ui/ModernButton';
import { PaymentForm } from './PaymentForm';
import { SubscriptionPlans } from './SubscriptionPlans';

export const SubscriptionManagement: React.FC = () => {
  const {
    currentSubscription,
    currentPlan,
    paymentMethods,
    invoices,
    isLoading,
    isProcessing,
    cancelSubscription,
    updateSubscription,
    refreshData,
    isTrialing,
    isPastDue,
    isCanceled,
    nextBillingDate,
    daysUntilTrialEnd,
  } = useSubscription();

  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'payment' | 'invoices'>('overview');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPlanChange, setShowPlanChange] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanChange = async (newPlanId: string) => {
    if (!currentSubscription) return;

    try {
      await updateSubscription(newPlanId);
      setShowPlanChange(false);
      setSelectedPlan(null);
      refreshData();
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handleCancelSubscription = async (immediate = false) => {
    if (!currentSubscription) return;

    try {
      await cancelSubscription(immediate);
      refreshData();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const handleAddPaymentMethod = () => {
    setShowPaymentForm(false);
    refreshData();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
          <p className="text-gray-600 mt-1">Manage your subscription and billing</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'billing', label: 'Billing' },
              { id: 'payment', label: 'Payment Methods' },
              { id: 'invoices', label: 'Invoices' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {currentSubscription && currentPlan ? (
                <>
                  {/* Current Plan Status */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Current Plan</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionStatusColor(
                          currentSubscription.status
                        )}`}
                      >
                        {getSubscriptionStatusText(currentSubscription.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-600">Plan Name</p>
                        <p className="font-semibold text-lg">{currentPlan.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-semibold text-lg">
                          {formatPrice(currentPlan.price, currentPlan.currency)}/{currentPlan.interval}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Next Billing Date</p>
                        <p className="font-semibold">
                          {nextBillingDate ? nextBillingDate.toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Auto-renew</p>
                        <p className="font-semibold">
                          {isCanceled ? 'Disabled' : 'Enabled'}
                        </p>
                      </div>
                    </div>

                    {isTrialing && daysUntilTrialEnd && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-blue-600 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-blue-800">
                            Your trial ends in {daysUntilTrialEnd} days
                          </span>
                        </div>
                      </div>
                    )}

                    {isPastDue && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-yellow-600 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-yellow-800">
                            Your payment is past due. Please update your payment method.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <ModernButton
                        variant="outline"
                        onClick={() => setShowPlanChange(true)}
                        disabled={isCanceled}
                      >
                        Change Plan
                      </ModernButton>
                      <ModernButton
                        variant="outline"
                        onClick={() => setShowPaymentForm(true)}
                      >
                        Update Payment
                      </ModernButton>
                      <ModernButton
                        variant="outline"
                        onClick={() => handleCancelSubscription()}
                        disabled={isCanceled}
                      >
                        {isCanceled ? 'Canceled' : 'Cancel Subscription'}
                      </ModernButton>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Your Features</h3>
                    <ul className="space-y-2">
                      {currentPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg
                            className="w-5 h-5 text-green-500 mr-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                  <p className="text-gray-600 mb-4">
                    You don't have an active subscription. Choose a plan to get started.
                  </p>
                  <ModernButton
                    variant="primary"
                    onClick={() => setShowPlanChange(true)}
                  >
                    Choose a Plan
                  </ModernButton>
                </div>
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              {currentSubscription && currentPlan ? (
                <>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Plan</span>
                        <span className="font-semibold">{currentPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-semibold">
                          {formatPrice(currentPlan.price, currentPlan.currency)}/{currentPlan.interval}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Billing Date</span>
                        <span className="font-semibold">
                          {nextBillingDate ? nextBillingDate.toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionStatusColor(
                            currentSubscription.status
                          )}`}
                        >
                          {getSubscriptionStatusText(currentSubscription.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Billing History</h3>
                    <p className="text-gray-600">
                      Your billing history will appear here once you have invoices.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">No Billing Information</h3>
                  <p className="text-gray-600">
                    Subscribe to a plan to see your billing information.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Payment Methods</h3>
                <ModernButton
                  variant="outline"
                  onClick={() => setShowPaymentForm(true)}
                >
                  Add Payment Method
                </ModernButton>
              </div>

              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center mr-4">
                            <span className="text-blue-600 font-semibold text-sm">
                              {method.card?.brand?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {method.card?.brand} •••• {method.card?.last4}
                            </p>
                            <p className="text-sm text-gray-600">
                              Expires {method.card?.exp_month}/{method.card?.exp_year}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.id === currentSubscription?.paymentMethod?.id && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
                  <p className="text-gray-600 mb-4">
                    Add a payment method to manage your subscription.
                  </p>
                  <ModernButton
                    variant="primary"
                    onClick={() => setShowPaymentForm(true)}
                  >
                    Add Payment Method
                  </ModernButton>
                </div>
              )}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Invoices</h3>
              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Invoice #{invoice.number}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(invoice.created * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold">
                            {formatPrice(invoice.amount_paid, invoice.currency)}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {invoice.status}
                          </span>
                          <ModernButton variant="outline" size="sm">
                            Download
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">No Invoices</h3>
                  <p className="text-gray-600">
                    Your invoices will appear here once you have an active subscription.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Add Payment Method</h3>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <PaymentForm
                onSuccess={handleAddPaymentMethod}
                onCancel={() => setShowPaymentForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showPlanChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Change Plan</h3>
                <button
                  onClick={() => setShowPlanChange(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SubscriptionPlans
                onPlanSelect={(planId) => {
                  if (currentSubscription && planId !== currentPlan?.id) {
                    setSelectedPlan(planId);
                  }
                }}
                compact={true}
              />
              {selectedPlan && selectedPlan !== currentPlan?.id && (
                <div className="mt-6 flex justify-end space-x-3">
                  <ModernButton
                    variant="outline"
                    onClick={() => setShowPlanChange(false)}
                  >
                    Cancel
                  </ModernButton>
                  <ModernButton
                    variant="primary"
                    onClick={() => handlePlanChange(selectedPlan)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Change Plan'}
                  </ModernButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
