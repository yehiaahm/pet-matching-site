import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { safePost } from '../utils/safeFetch';
import { Input } from './ui/input';
import { GradientButton, OutlineButton } from './ui/ModernButton';
import { Alert, AlertDescription } from './ui/alert';
import {
  Mail,
  Lock,
  User,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { fadeInUpVariants } from '../../lib/animations';

interface RegistrationStep {
  step: number;
  title: string;
  description: string;
  fields: string[];
}

interface SimplifiedRegistrationProps {
  onBack?: () => void;
}

export function SimplifiedRegistration({ onBack }: SimplifiedRegistrationProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  // Form data - only essential fields
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    password: '',
  });

  // Additional data (optional fields)
  const [additionalData, setAdditionalData] = useState({
    lastName: '',
    phone: '',
  });

  const steps: RegistrationStep[] = [
    {
      step: 1,
      title: 'البريد الإلكتروني',
      description: 'أدخل بريدك الإلكتروني للبدء',
      fields: ['email'],
    },
    {
      step: 2,
      title: 'الاسم والرقم',
      description: 'أخبرنا باسمك (اختياري: رقم الهاتف)',
      fields: ['firstName', 'lastName', 'phone'],
    },
    {
      step: 3,
      title: 'كلمة المرور',
      description: 'اختر كلمة مرور قوية',
      fields: ['password'],
    },
  ];

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password (synchronized with backend)
  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Handle step 1: Email
  const handleStep1 = () => {
    setErrors({});
    if (!formData.email.trim()) {
      setErrors({ email: 'البريد الإلكتروني مطلوب' });
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrors({ email: 'البريد الإلكتروني غير صحيح' });
      return;
    }
    setCurrentStep(2);
  };

  // Handle step 2: Name and Phone
  const handleStep2 = () => {
    setErrors({});
    if (!formData.firstName.trim()) {
      setErrors({ firstName: 'الاسم الأول مطلوب' });
      return;
    }
    if (formData.firstName.trim().length < 2) {
      setErrors({ firstName: 'الاسم يجب أن يكون حرفين على الأقل' });
      return;
    }
    setCurrentStep(3);
  };

  // Handle step 3: Password and Submit
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.password.trim()) {
      setErrors({ password: 'كلمة المرور مطلوبة' });
      return;
    }

    if (!validatePassword(formData.password)) {
      setErrors({
        password: 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل',
      });
      return;
    }

    setLoading(true);
    try {
      const registerPayload = {
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        lastName: (additionalData.lastName || formData.firstName).trim(), // Ensure lastName satisfies backend min(2)
        password: formData.password,
        phone: additionalData.phone?.trim() || undefined, // Use undefined instead of empty string
      };

      console.log('📝 Submitting registration:', {
        email: registerPayload.email,
        firstName: registerPayload.firstName,
      });

      const response = await safePost(
        `${API_BASE_URL}/auth/register`,
        registerPayload
      );

      if (!response.success) {
        let errorMsg = response.error || 'فشل التسجيل';
        if (response.status === 409) {
          errorMsg = 'البريد الإلكتروني مستخدم بالفعل';
        } else if (response.status === 400) {
          errorMsg = 'الرجاء ملء البيانات المطلوبة';
        }
        setErrors({ root: errorMsg });
        toast.error(errorMsg);
        return;
      }

      const userData = response.data?.data?.user;
      const accessToken = response.data?.data?.accessToken;

      if (!userData || !accessToken) {
        setErrors({
          root: 'خطأ في الخادم: الرجاء المحاولة لاحقاً',
        });
        return;
      }

      console.log('✅ Registration successful');
      login(userData, accessToken);
      setCompleted(true);
      toast.success('تم إنشاء الحساب بنجاح!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        root: 'خطأ في الاتصال. الرجاء المحاولة لاحقاً',
      });
      toast.error('فشل التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/50 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
              PetMate
            </h1>
            <p className="text-muted-foreground">
              تسجيل في 3 خطوات فقط 🚀
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            className="flex gap-2 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {steps.map((s) => (
              <motion.div
                key={s.step}
                className={`h-1 flex-1 rounded-full transition-all ${currentStep >= s.step
                  ? 'bg-gradient-to-r from-primary to-pink-500'
                  : 'bg-muted'
                  }`}
                layoutId="progress"
              />
            ))}
          </motion.div>

          {/* Error Alert */}
          <AnimatePresence mode="wait">
            {errors.root && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.root}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {!completed ? (
            <form onSubmit={handleStep3} className="space-y-6">
              {/* Step 1: Email */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    variants={fadeInUpVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-xl font-semibold mb-2">
                        {steps[0].title}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        {steps[0].description}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        البريد الإلكتروني
                      </label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="example@petmat.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                          className="pr-10 text-right"
                          autoFocus
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          className="text-destructive text-sm mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <GradientButton
                        type="button"
                        onClick={handleStep1}
                        className="flex-1"
                        size="lg"
                      >
                        التالي <ChevronRight className="w-4 h-4 mr-2" />
                      </GradientButton>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Name and Phone */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    variants={fadeInUpVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-xl font-semibold mb-2">
                        {steps[1].title}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        {steps[1].description}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        الاسم الأول *
                      </label>
                      <div className="relative">
                        <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="أحمد"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="pr-10 text-right"
                          autoFocus
                        />
                      </div>
                      {errors.firstName && (
                        <motion.p
                          className="text-destructive text-sm mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {errors.firstName}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        الاسم الأخير (اختياري)
                      </label>
                      <Input
                        type="text"
                        placeholder="محمد"
                        value={additionalData.lastName}
                        onChange={(e) =>
                          setAdditionalData({
                            ...additionalData,
                            lastName: e.target.value,
                          })
                        }
                        className="text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        رقم الهاتف (اختياري)
                      </label>
                      <Input
                        type="tel"
                        placeholder="+201234567890"
                        value={additionalData.phone}
                        onChange={(e) =>
                          setAdditionalData({
                            ...additionalData,
                            phone: e.target.value,
                          })
                        }
                        className="text-right"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <OutlineButton
                        type="button"
                        onClick={handleBack}
                        className="flex-1"
                        size="lg"
                      >
                        رجوع
                      </OutlineButton>
                      <GradientButton
                        type="button"
                        onClick={handleStep2}
                        className="flex-1"
                        size="lg"
                      >
                        التالي <ChevronRight className="w-4 h-4 mr-2" />
                      </GradientButton>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Password */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    variants={fadeInUpVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-xl font-semibold mb-2">
                        {steps[2].title}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        {steps[2].description}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        كلمة المرور
                      </label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="pr-10 pl-10 text-right"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <motion.p
                          className="text-destructive text-sm mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </div>

                    {/* Password hints */}
                    <motion.div
                      className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
                        💡 نصيحة: استخدم كلمة مرور قوية
                      </p>
                      <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                        <li>✓ 6 أحرف على الأقل</li>
                      </ul>
                    </motion.div>

                    <div className="flex gap-3 pt-4">
                      <OutlineButton
                        type="button"
                        onClick={handleBack}
                        className="flex-1"
                        size="lg"
                      >
                        رجوع
                      </OutlineButton>
                      <GradientButton
                        type="submit"
                        className="flex-1"
                        size="lg"
                        disabled={loading}
                        isLoading={loading}
                      >
                        {loading
                          ? 'جاري الإنشاء...'
                          : 'إنشاء الحساب'}
                      </GradientButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          ) : (
            /* Success Message */
            <motion.div
              className="space-y-6 py-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </motion.div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">مبروك! 🎉</h2>
                <p className="text-muted-foreground">
                  تم إنشاء حسابك بنجاح
                </p>
              </div>
            </motion.div>
          )}

          {/* Step Info */}
          {!completed && (
            <motion.div
              className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p>
                الخطوة {currentStep} من {steps.length}
              </p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
