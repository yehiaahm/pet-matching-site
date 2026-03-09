import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { InstapayPaymentSystem } from './InstapayPaymentSystem';

interface ProductionPaymentPageProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    email: string;
  };
}

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    period: 'شهرياً',
    currency: '$',
    features: [
      '10 طلبات تزاوج شهرياً',
      'دعم فني أساسي',
      'ملف تعريفي أساسي',
      'صور واحدة للحيوان',
      'بحث محدود'
    ],
    color: 'from-gray-500 to-gray-600',
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    period: 'شهرياً',
    currency: '$',
    features: [
      'طلبات تزاوج غير محدودة',
      'دعم فني متميز 24/7',
      'ملف تعريفي متقدم',
      '10 صور للحيوان',
      'بحث متقدم',
      'AI Matching',
      'توصيات ذكية',
      'شهادة موثوقية'
    ],
    color: 'from-blue-500 to-purple-600',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    period: 'شهرياً',
    currency: '$',
    features: [
      'كل مميزات Premium',
      'طلبات تزاوج فورية',
      'دعم فني مخصص',
      'ملف تعريفي VIP',
      'صور غير محدودة',
      'بحث متقدم مع فلتر',
      'AI Matching متقدم',
      'توصيات ذكية مخصصة',
      'شهادة موثوقية ذهبية',
      'إحصائيات وتقارير',
      'أولوية في العرض',
      'دعم عبر الفيديو'
    ],
    color: 'from-amber-500 to-orange-600',
    popular: false
  }
];

export function ProductionPaymentPage({ isOpen, onClose, user }: ProductionPaymentPageProps) {
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Premium default
  const [step, setStep] = useState<'plans' | 'payment' | 'confirmation'>('plans');
  const [paymentData, setPaymentData] = useState<any>(null);

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const handlePaymentComplete = (data: any) => {
    setPaymentData(data);
    setStep('confirmation');
  };

  const handleBack = () => {
    if (step === 'payment') setStep('plans');
    else if (step === 'confirmation') setStep('payment');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {step !== 'plans' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Crown className="w-6 h-6" />
                  Production Checkout
                </h1>
                <p className="text-emerald-100 mt-1">
                  {step === 'plans' && 'Choose your subscription plan'}
                  {step === 'payment' && 'Complete your payment'}
                  {step === 'confirmation' && 'Order confirmation'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ×
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {step === 'plans' && (
            <div className="space-y-6">
              {/* User Info */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold">{user?.name || 'User'}</p>
                      <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className={`relative cursor-pointer transition-all duration-200 ${
                      selectedPlan.id === plan.id 
                        ? 'ring-2 ring-emerald-500 shadow-lg' 
                        : 'hover:shadow-md'
                    } ${plan.popular ? 'border-2 border-emerald-500' : ''}`}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-emerald-500 text-white px-3 py-1">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-4">
                        <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-4`}>
                          <Crown className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription className="text-3xl font-bold text-gray-900">
                          {plan.currency}{plan.price}
                          <span className="text-sm text-gray-600 font-normal">/{plan.period}</span>
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            </div>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                        
                        <Button 
                          className={`w-full mt-4 bg-gradient-to-r ${plan.color} hover:opacity-90`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlanSelect(plan);
                          }}
                        >
                          Choose Plan
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              {/* Selected Plan Summary */}
              <Card className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                      <p className="text-gray-600">Selected subscription plan</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{selectedPlan.currency}{selectedPlan.price}</p>
                      <p className="text-sm text-gray-600">{selectedPlan.period}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instapay Payment System */}
              <InstapayPaymentSystem 
                selectedPlan={selectedPlan}
                onPaymentComplete={handlePaymentComplete}
              />
            </div>
          )}

          {step === 'confirmation' && (
            <div className="space-y-6 text-center max-w-2xl mx-auto">
              {/* Success Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white mx-auto"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full" />
                </div>
              </motion.div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Order Submitted! 🎉</h2>
                <p className="text-xl text-gray-600">
                  Your payment has been uploaded successfully for review.
                </p>
              </div>

              {/* Order Details */}
              <Card className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-semibold">{paymentData?.order_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-semibold">{selectedPlan.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">{selectedPlan.currency}{selectedPlan.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-semibold">Instapay</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-emerald-600">Under Review</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-semibold">{new Date().toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardContent className="p-6 text-right">
                  <h3 className="font-semibold mb-4">What happens next?</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      </div>
                      <span className="text-gray-700">Admin will review your payment screenshot</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      </div>
                      <span className="text-gray-700">You'll receive confirmation within 24 hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      </div>
                      <span className="text-gray-700">Your subscription will be activated upon approval</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div>
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
