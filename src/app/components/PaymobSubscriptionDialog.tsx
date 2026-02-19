import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Crown, Zap, Shield, Loader, X } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionStatus {
  tier: string;
  status: string;
  limits: {
    maxPets: number | string;
    maxRequestsPerMonth: number | string;
  };
  usage: {
    currentPets: number;
    requestsThisMonth: number;
  };
  canAddPet: boolean;
  canSendRequest: boolean;
  subscription: {
    paymobOrderId?: string;
    currentPeriodEnd?: string;
  } | null;
}

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SubscriptionDialog({ open, onClose }: SubscriptionDialogProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaymentFrame, setShowPaymentFrame] = useState(false);
  const [paymentKey, setPaymentKey] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchSubscriptionStatus();
    }
  }, [open]);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);

      // Mock subscription status
      const mockStatus: SubscriptionStatus = {
        tier: 'FREE',
        status: 'ACTIVE',
        limits: {
          maxPets: 1,
          maxRequestsPerMonth: 1,
        },
        usage: {
          currentPets: 0,
          requestsThisMonth: 0,
        },
        canAddPet: true,
        canSendRequest: true,
        subscription: null,
      };

      setSubscriptionStatus(mockStatus);
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      toast.error('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToPremium = async (tier: 'professional' | 'elite') => {
    try {
      setProcessingPayment(true);

      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('❌ Please log in first to subscribe');
        return;
      }

      toast.loading('⏳ Creating payment order...', { duration: 2000 });

      // Create payment order via Paymob
      const response = await fetch('/api/v1/subscription/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const data = await response.json();

      if (data.data?.iframeUrl && data.data?.paymentKey) {
        setPaymentKey(data.data.paymentKey);
        setIframeUrl(data.data.iframeUrl);
        setShowPaymentFrame(true);
        toast.success(`💳 Opening payment page for ${tier === 'professional' ? 'Professional' : 'Elite'} plan...`);
      } else {
        throw new Error('No payment details received');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process subscription';
      toast.error(`❌ ${message}`);
      console.error('Subscription error:', err);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/v1/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast.success('✅ Subscription cancelled successfully');
      fetchSubscriptionStatus();
    } catch (err) {
      toast.error('❌ Failed to cancel subscription');
    }
  };

  if (showPaymentFrame && iframeUrl) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">💳 Complete Your Payment</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowPaymentFrame(false);
                  setPaymentKey(null);
                  setIframeUrl(null);
                }}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <DialogDescription>
              Please complete your payment using the secure Paymob payment gateway
            </DialogDescription>
          </DialogHeader>

          <div className="w-full h-[600px] border-2 border-gray-300 rounded-lg overflow-hidden">
            <iframe
              src={iframeUrl}
              width="100%"
              height="600"
              frameBorder="0"
              allow="payment"
              title="Paymob Payment"
            ></iframe>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            ℹ️ After successful payment, you'll be redirected back to the app. Don't close this window during payment.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Subscription & Pricing Plans</DialogTitle>
          <DialogDescription className="text-lg">
            Manage your subscription and unlock premium features
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        ) : subscriptionStatus ? (
          <div className="space-y-6">
            {/* Current Plan Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {subscriptionStatus.tier === 'PROFESSIONAL' || subscriptionStatus.tier === 'ELITE' ? (
                      <span className="flex items-center gap-2">
                        <Crown className="w-6 h-6 text-amber-500" />
                        {subscriptionStatus.tier} Plan
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="w-6 h-6 text-gray-600" />
                        Free Plan
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Status: <Badge variant={subscriptionStatus.status === 'ACTIVE' ? 'default' : 'secondary'}>{subscriptionStatus.status}</Badge>
                  </p>
                </div>
                {subscriptionStatus.subscription?.currentPeriodEnd && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Renews on</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(subscriptionStatus.subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-600 mb-2">Pets Listed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptionStatus.usage.currentPets}/
                  {typeof subscriptionStatus.limits.maxPets === 'string'
                    ? subscriptionStatus.limits.maxPets
                    : subscriptionStatus.limits.maxPets}
                </p>
                {typeof subscriptionStatus.limits.maxPets !== 'string' && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(subscriptionStatus.usage.currentPets / (subscriptionStatus.limits.maxPets as number)) * 100}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-600 mb-2">Requests This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptionStatus.usage.requestsThisMonth}/
                  {typeof subscriptionStatus.limits.maxRequestsPerMonth === 'string'
                    ? subscriptionStatus.limits.maxRequestsPerMonth
                    : subscriptionStatus.limits.maxRequestsPerMonth}
                </p>
              </div>
            </div>

            {/* Pricing Plans Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <div className={`rounded-2xl border-2 p-8 transition-all hover:shadow-lg ${subscriptionStatus.tier === 'FREE' ? 'bg-blue-50 border-blue-400 shadow-lg' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-2xl font-bold text-gray-900">Starter</h4>
                  {subscriptionStatus.tier === 'FREE' && <Badge className="bg-blue-600 px-4 py-1.5 text-base">Current</Badge>}
                </div>
                <div className="mb-8">
                  <p className="text-5xl font-bold text-gray-900 mb-3">Free</p>
                  <p className="text-lg text-gray-600">Perfect for trying out</p>
                </div>
                <ul className="space-y-5 mb-8 min-h-[320px]">
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">1 pet listing</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">1 request/month</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">Basic messaging</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">Health records</span>
                  </li>
                </ul>
              </div>

              {/* Professional Plan */}
              <div className={`rounded-2xl border-2 p-8 transition-all hover:shadow-lg ${subscriptionStatus.tier === 'PROFESSIONAL' ? 'bg-amber-50 border-amber-400 shadow-lg' : 'bg-white border-gray-300'} relative`}>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 text-base font-bold shadow-lg">Most Popular ⭐</Badge>
                </div>
                <div className="flex items-center justify-between mb-6 mt-4">
                  <h4 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                    <Zap className="w-7 h-7 text-amber-500" />
                    Professional
                  </h4>
                  {subscriptionStatus.tier === 'PROFESSIONAL' && <Badge className="bg-amber-600 px-4 py-1.5 text-base">Current</Badge>}
                </div>
                <div className="mb-8">
                  <p className="text-5xl font-bold text-gray-900 mb-3">$9.99<span className="text-2xl text-gray-600 font-normal">/month</span></p>
                  <p className="text-lg text-gray-600">Best for active breeders</p>
                </div>
                <ul className="space-y-5 mb-8 min-h-[320px]">
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">5 pet listings</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">50 requests/month</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">AI matching algorithm</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">GPS location search</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">Priority messaging</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">Verified badge</span>
                  </li>
                </ul>
                {subscriptionStatus.tier === 'FREE' ? (
                  <Button
                    onClick={() => handleUpgradeToPremium('professional')}
                    disabled={processingPayment}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg py-7 shadow-lg hover:shadow-xl transition-all"
                  >
                    {processingPayment ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin inline mr-2" />
                        Processing...
                      </>
                    ) : (
                      '💳 Upgrade Now - $9.99/month'
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full text-lg py-7"
                    onClick={handleCancelSubscription}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>

              {/* Elite Breeder Plan */}
              <div className={`rounded-2xl border-2 p-8 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 transition-all hover:shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                    <Crown className="w-7 h-7 text-amber-500" />
                    Elite Breeder
                  </h4>
                </div>
                <div className="mb-8">
                  <p className="text-5xl font-bold text-gray-900 mb-3">$29.99<span className="text-2xl text-gray-600 font-normal">/month</span></p>
                  <p className="text-lg text-gray-600">For professional breeding</p>
                </div>
                <ul className="space-y-5 mb-8 min-h-[320px]">
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">Unlimited pet listings</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">Unlimited requests</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">Vet clinic integration</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">24/7 support</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">Featured profile</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-lg text-gray-700 leading-relaxed">Custom branding</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handleUpgradeToPremium('elite')}
                  disabled={processingPayment || subscriptionStatus.tier !== 'FREE'}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg py-7 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {processingPayment ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin inline mr-2" />
                      Processing...
                    </>
                  ) : subscriptionStatus.tier === 'FREE' ? (
                    '👑 Upgrade to Elite - $29.99/month'
                  ) : (
                    'Already Subscribed'
                  )}
                </Button>
              </div>
            </div>

            {/* Benefits Highlight */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 text-white">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Why Upgrade Your Plan?
              </h4>
              <ul className="grid grid-cols-2 gap-3 text-sm">
                <li>✓ List multiple pets</li>
                <li>✓ More breeding requests</li>
                <li>✓ AI-powered matching</li>
                <li>✓ GPS location search</li>
                <li>✓ Health record integration</li>
                <li>✓ Priority support</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Featured profile</li>
              </ul>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionDialog;
