import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Shield, 
  Check, 
  ArrowLeft, 
  Zap, 
  Lock,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ModernPaymentSection } from './ModernPaymentSection';

interface PaymentPageProps {
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

export function PaymentPage({ isOpen, onClose, user }: PaymentPageProps) {
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Premium default
  const [step, setStep] = useState<'plans' | 'payment' | 'confirmation'>('plans');
  const [paymentData, setPaymentData] = useState<any>(null);

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const handleBack = () => {
    if (step === 'payment') setStep('plans');
    else if (step === 'confirmation') setStep('payment');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
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
                    ترقية حساب PetMat
                  </h1>
                  <p className="text-blue-100 mt-1">
                    {step === 'plans' && 'اختر الخطة المناسبة لك'}
                    {step === 'payment' && 'أكمل عملية الدفع'}
                    {step === 'confirmation' && 'تم استلام طلب الدفع وهو قيد المراجعة'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
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
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
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
                          ? 'ring-2 ring-blue-500 shadow-lg' 
                          : 'hover:shadow-md'
                      } ${plan.popular ? 'border-2 border-blue-500' : ''}`}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-500 text-white px-3 py-1">
                            الأكثر شيوعاً
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
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
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
                          اختر هذه الخطة
                          <ChevronRight className="w-4 h-4 mr-2" />
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
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                        <p className="text-gray-600">خطة الاشتراك المختارة</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{selectedPlan.currency}{selectedPlan.price}</p>
                        <p className="text-sm text-gray-600">{selectedPlan.period}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Modern Payment Section */}
                <ModernPaymentSection 
                  selectedPlan={selectedPlan}
                  user={{
                    name: user?.name || user?.email || 'مستخدم',
                    email: user?.email || 'user@example.com'
                  }}
                  onPaymentComplete={(data) => {
                    setPaymentData(data);
                    setStep('confirmation');
                  }}
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
                  className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white mx-auto"
                >
                  <Check className="w-12 h-12" />
                </motion.div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-gray-900">تم استلام طلب الدفع ✅</h2>
                  <p className="text-xl text-gray-600">
                    خلال 5 دقائق سيتم التحقق من عملية الدفع
                  </p>
                </div>

                {/* Plan Details */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">رقم الطلب:</span>
                        <span className="font-semibold">{paymentData?.order_id || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">الخطة:</span>
                        <span className="font-semibold">{selectedPlan.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">المبلغ:</span>
                        <span className="font-semibold">{selectedPlan.currency}{selectedPlan.price}/{selectedPlan.period}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">الحالة:</span>
                        <span className="font-semibold text-amber-600">قيد المراجعة</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">تاريخ الإرسال:</span>
                        <span className="font-semibold">{new Date().toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Card>
                  <CardContent className="p-6 text-right">
                    <h3 className="font-semibold mb-4">الخطوات التالية:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>سيظهر طلبك فورًا في صفحة مراجعة الدفع عند المشرف</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>سيتم قبول أو رفض الطلب بعد التحقق من الصورة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>ستصلك حالة الطلب بعد المراجعة</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div>
                  <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
                  >
                    ابدأ الاستخدام
                    <Zap className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
