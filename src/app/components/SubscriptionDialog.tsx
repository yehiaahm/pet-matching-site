import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Crown, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';

// Stripe Configuration
const STRIPE_CONFIG = {
  publishableKey: 'pk_test_51234567890abcdef', // Test key - replace with live key
  priceIds: {
    professional: 'price_1QucbhA5I4dGOAUc9rYTmFBj', // Test price ID
    elite: 'price_1QucbmA5I4dGOAUc0vG8nK2L'     // Test price ID
  }
};

interface SubscriptionStatus {
  tier: string;
  status: string;
  limits: {
    maxPets: number;
    maxRequestsPerMonth: string | number;
  };
  usage: {
    currentPets: number;
    currentRequests: number;
    requestsThisMonth: number; // Added missing property
  };
  canAddPet: boolean;
  canSendRequest: boolean;
  subscription: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: string;
  } | null;
}

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SubscriptionDialog({ open, onClose }: SubscriptionDialogProps) {
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSubscriptionStatus();
    }
  }, [open]);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      
      // Mock subscription status (replace with real API when backend is ready)
      const mockStatus: SubscriptionStatus = {
        tier: 'FREE',
        status: 'ACTIVE',
        limits: {
          maxPets: 3,
          maxRequestsPerMonth: 10,
        },
        usage: {
          currentPets: 1,
          currentRequests: 2,
          requestsThisMonth: 2, // Added missing property
        },
        canAddPet: true,
        canSendRequest: true,
        subscription: null,
      };
      
      setSubscriptionStatus(mockStatus);
      setLoading(false);
      
      // Uncomment when backend is ready:
      /*
      const response = await fetch('/api/v1/subscription/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const data = await response.json();
      setSubscriptionStatus(data.data);
      */
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch subscription status';
      toast.error(message);
      setLoading(false);
    }
  };

  const handleUpgradeToPremium = async (tier: 'professional' | 'elite') => {
    try {
      setProcessingPayment(true);
      
      const plans = {
        professional: {
          name: 'Professional Plan',
          price: '$9.99/month',
          priceId: STRIPE_CONFIG.priceIds.professional
        },
        elite: {
          name: 'Elite Breeder Plan',
          price: '$29.99/month',
          priceId: STRIPE_CONFIG.priceIds.elite
        }
      };
      
      const selectedPlan = plans[tier];
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('❌ الرجاء تسجيل الدخول أولاً');
        return;
      }
      
      onClose();
      navigate(`/payment?plan=${tier}`);
      toast.success(`💳 جاري التحويل إلى صفحة الدفع لخطة ${selectedPlan.name}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process subscription';
      toast.error(`❌ ${message}`);
      console.error('Subscription error:', err);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('هل أنت متأكد؟ سيتم إلغاء اشتراكك في نهاية فترة الفوترة.')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');

      const response = await fetch('/api/v1/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast.success('سيتم إلغاء الاشتراك في نهاية فترة الفوترة');
      fetchSubscriptionStatus();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] !max-w-[95vw] max-h-[95vh] overflow-y-auto p-8">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-4xl font-bold mb-3">Subscription & Pricing Plans</DialogTitle>
          <DialogDescription className="text-lg text-gray-600">
            Manage your subscription and unlock premium features for your breeding business
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        ) : subscriptionStatus ? (
          <div className="space-y-6">
            {/* Current Plan Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-300 shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {subscriptionStatus.tier === 'PREMIUM' ? (
                      <span className="flex items-center gap-3">
                        <Crown className="w-8 h-8 text-amber-500" />
                        Premium Plan
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <Zap className="w-8 h-8 text-gray-600" />
                        Free Plan
                      </span>
                    )}
                  </h3>
                  <p className="text-base text-gray-600 mt-2">
                    Status: <Badge className="ml-2" variant={subscriptionStatus.status === 'ACTIVE' ? 'default' : 'secondary'}>{subscriptionStatus.status}</Badge>
                  </p>
                </div>
                {subscriptionStatus.subscription?.currentPeriodEnd && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Renews on</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(subscriptionStatus.subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border-2 border-blue-100 p-6 shadow-sm">
                <p className="text-base text-gray-600 mb-3 font-semibold">Pets Listed</p>
                <p className="text-4xl font-bold text-gray-900 mb-4">
                  {subscriptionStatus.usage.currentPets}/{subscriptionStatus.limits.maxPets}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${(subscriptionStatus.usage.currentPets / subscriptionStatus.limits.maxPets) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-green-100 p-6 shadow-sm">
                <p className="text-base text-gray-600 mb-3 font-semibold">Requests This Month</p>
                <p className="text-4xl font-bold text-gray-900 mb-4">
                  {subscriptionStatus.usage.requestsThisMonth}
                  {typeof subscriptionStatus.limits.maxRequestsPerMonth === 'number' && 
                    `/${subscriptionStatus.limits.maxRequestsPerMonth}`}
                </p>
                {typeof subscriptionStatus.limits.maxRequestsPerMonth !== 'string' && (
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min((subscriptionStatus.usage.requestsThisMonth / subscriptionStatus.limits.maxRequestsPerMonth) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Plans Comparison */}
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-gray-900">Choose Your Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <div className={`rounded-2xl border-2 p-8 transition-all hover:shadow-xl ${subscriptionStatus.tier === 'FREE' ? 'bg-blue-50 border-blue-400 shadow-lg' : 'bg-white border-gray-200'}`}>
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
                    <span className="text-lg text-gray-700 leading-relaxed">3 requests/month</span>
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
                {subscriptionStatus.tier !== 'FREE' && (
                  <Button variant="outline" className="w-full text-lg py-7" disabled>
                    Current Plan
                  </Button>
                )}
              </div>

              {/* Professional Plan */}
              <div className={`rounded-2xl border-3 p-8 transition-all hover:shadow-2xl md:scale-105 z-10 ${subscriptionStatus.tier === 'PREMIUM' ? 'bg-amber-50 border-amber-400 shadow-lg' : 'bg-white border-amber-300'} relative`}>
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 text-base font-bold shadow-xl">⭐ Most Popular</Badge>
                </div>
                <div className="flex items-center justify-between mb-6 mt-6">
                  <h4 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                    <Zap className="w-7 h-7 text-amber-500" />
                    Professional
                  </h4>
                  {subscriptionStatus.tier === 'PREMIUM' && <Badge className="bg-amber-600 px-4 py-1.5 text-base">Current</Badge>}
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
                    <span className="text-lg text-gray-700 leading-relaxed">Verified badge</span>
                  </li>
                </ul>
                {subscriptionStatus.tier === 'FREE' || subscriptionStatus.tier === 'STARTER' ? (
                  <button
                    onClick={() => handleUpgradeToPremium('professional')}
                    disabled={processingPayment}
                    className="w-full bg-gradient-to-r from-teal-600 via-teal-500 to-teal-400 text-white font-bold text-lg py-7 px-8 rounded-xl shadow-lg hover:shadow-xl hover:from-teal-700 hover:via-teal-600 hover:to-teal-500 transform hover:scale-105 transition-all duration-300 border border-teal-400/20 btn-enhanced"
                  >
                    {processingPayment ? 'جاري المعالجة...' : '💳 ترقية الآن - $9.99/شهر'}
                  </button>
                ) : (
                  <button 
                    className="w-full text-lg py-7 px-8 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50"
                    onClick={handleCancelSubscription}
                  >
                    إلغاء الاشتراك
                  </button>
                )}
              </div>

              {/* Elite Breeder Plan */}
              <div className={`rounded-2xl border-2 p-8 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 transition-all hover:shadow-xl`}>
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
                <button
                  onClick={() => handleUpgradeToPremium('elite')}
                  disabled={processingPayment}
                  className="w-full bg-gradient-to-r from-teal-600 via-teal-500 to-teal-400 text-white font-bold text-lg py-7 px-8 rounded-xl shadow-lg hover:shadow-xl hover:from-teal-700 hover:via-teal-600 hover:to-teal-500 transform hover:scale-105 transition-all duration-300 border border-teal-400/20 btn-enhanced"
                >
                  {processingPayment ? 'جاري المعالجة...' : '👑 ترقية إلى النخبة - $29.99/شهر'}
                </button>
              </div>
            </div>

            {/* Benefits Highlight */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 text-white shadow-lg">
              <h4 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Shield className="w-7 h-7" />
                Why Upgrade Your Plan?
              </h4>
              <ul className="grid grid-cols-2 gap-4 text-base">
                <li className="flex items-center gap-2">✓ <span>List multiple pets</span></li>
                <li className="flex items-center gap-2">✓ <span>More breeding requests</span></li>
                <li className="flex items-center gap-2">✓ <span>AI-powered matching</span></li>
                <li className="flex items-center gap-2">✓ <span>GPS location search</span></li>
                <li className="flex items-center gap-2">✓ <span>Health record integration</span></li>
                <li className="flex items-center gap-2">✓ <span>Priority support</span></li>
                <li className="flex items-center gap-2">✓ <span>Advanced analytics</span></li>
                <li className="flex items-center gap-2">✓ <span>Featured profile</span></li>
              </ul>
            </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <Button variant="outline" onClick={onClose} className="text-base px-6 py-2">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-lg text-gray-700">لم يتم تحميل حالة الاشتراك. يرجى تسجيل الدخول أولاً.</p>
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <Button variant="outline" onClick={onClose} className="text-base px-6 py-2">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionDialog;
