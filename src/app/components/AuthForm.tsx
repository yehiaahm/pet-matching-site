/**
 * Enhanced Auth Form Component with Validation
 * Provides secure login and registration forms with real-time validation
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService, type LoginCredentials, type RegisterCredentials } from '../services/authService';
import { passwordSecurity, type PasswordValidationResult } from '../utils/passwordSecurity';
import { GradientButton } from './ui/ModernButton';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, 
  CheckCircle, PawPrint, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { fadeInUpVariants, scaleUpVariants } from '../../lib/animations';

interface AuthFormProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Login form state
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState<RegisterCredentials>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Real-time password validation
  useEffect(() => {
    if (mode === 'register' && registerForm.password) {
      const validation = passwordSecurity.validatePassword(registerForm.password);
      setPasswordValidation(validation);
      setPasswordStrength((validation.score / 10) * 100);
    } else {
      setPasswordValidation(null);
      setPasswordStrength(0);
    }
  }, [registerForm.password, mode]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation
  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  // Form validation
  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!loginForm.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(loginForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!loginForm.password) {
      newErrors.password = 'Password is required';
    } else if (loginForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    console.log('🔍 Validating registration form:', {
      firstName: registerForm.firstName,
      lastName: registerForm.lastName,
      email: registerForm.email,
      phone: registerForm.phone,
      passwordLength: registerForm.password?.length,
      passwordValidation: passwordValidation,
      confirmPassword: confirmPassword ? 'provided' : 'missing'
    });

    // First name validation
    if (!registerForm.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      console.log('❌ First name validation failed: empty');
    } else if (registerForm.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
      console.log('❌ First name validation failed: too short');
    }

    // Last name validation
    if (!registerForm.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      console.log('❌ Last name validation failed: empty');
    } else if (registerForm.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
      console.log('❌ Last name validation failed: too short');
    }

    // Email validation
    if (!registerForm.email) {
      newErrors.email = 'Email is required';
      console.log('❌ Email validation failed: empty');
    } else if (!validateEmail(registerForm.email)) {
      newErrors.email = 'Please enter a valid email address';
      console.log('❌ Email validation failed: invalid format');
    }

    // Phone validation (optional)
    if (registerForm.phone && !validatePhone(registerForm.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      console.log('❌ Phone validation failed: invalid format');
    }

    // Password validation
    if (!registerForm.password) {
      newErrors.password = 'Password is required';
      console.log('❌ Password validation failed: empty');
    } else if (!passwordValidation?.isValid) {
      newErrors.password = 'Password does not meet security requirements';
      console.log('❌ Password validation failed:', passwordValidation?.errors || 'No validation data');
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      console.log('❌ Confirm password validation failed: empty');
    } else if (!passwordSecurity.passwordsMatch(registerForm.password, confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
      console.log('❌ Confirm password validation failed: passwords do not match');
    }

    console.log('📋 Validation errors found:', Object.keys(newErrors).length, newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('🔐 AuthForm: Attempting login');
      const result = await authService.login(loginForm);

      if (result.success && result.data) {
        console.log('✅ AuthForm: Login successful');
        
        // Update auth context
        login(result.data.user, result.data.accessToken);
        
        toast.success('Login successful! Welcome back.');
        
        // Navigate after successful login
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        console.error('❌ AuthForm: Login failed:', result.error);
        setErrors({ root: result.error || 'Login failed' });
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ AuthForm: Login error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Network error';
      setErrors({ root: errorMsg });
      toast.error('Login failed: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Starting registration process...');
    
    if (!validateRegisterForm()) {
      console.log('❌ Registration failed: client-side validation');
      setErrors({ root: 'Please fix the validation errors below' });
      return;
    }

    console.log('✅ Client-side validation passed');
    setLoading(true);
    setErrors({});

    try {
      console.log('📝 AuthForm: Attempting registration');

      const registrationData: RegisterCredentials = {
        ...registerForm,
        email: registerForm.email.trim().toLowerCase(),
        password: registerForm.password,
      };

      const result = await authService.register(registrationData);

      if (result.success && result.data) {
        console.log('✅ AuthForm: Registration successful');
        
        // Update auth context
        login(result.data.user, result.data.accessToken);
        
        toast.success('Registration successful! Welcome to PetMat.');
        
        // Navigate after successful registration
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        console.error('❌ AuthForm: Registration failed:', result.error);
        setErrors({ root: result.error || 'Registration failed' });
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ AuthForm: Registration error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Network error';
      setErrors({ root: errorMsg });
      toast.error('Registration failed: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Generate secure password
  const generatePassword = () => {
    const securePassword = passwordSecurity.generateSecurePassword(12);
    setRegisterForm({ ...registerForm, password: securePassword });
    setConfirmPassword(securePassword);
    toast.success('Secure password generated!');
  };

  return (
    <motion.div
      className="w-full max-w-md"
      variants={scaleUpVariants}
      initial="initial"
      animate="animate"
    >
      <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/50 shadow-2xl rounded-2xl">
        <div className="p-8">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-glow"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <PawPrint className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
              PetMat
            </h1>
            <p className="text-muted-foreground">
              {mode === 'login' ? 'Welcome back!' : 'Create your account'}
            </p>
          </motion.div>

          {/* Error Alert */}
          <AnimatePresence mode="wait">
            {errors.root && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.root}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Buttons */}
          <div className="flex gap-4 mb-6 p-1 bg-muted/50 rounded-xl">
            <motion.button
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-gray-800 shadow-md text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => {
                onModeChange('login');
                setErrors({});
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              تسجيل الدخول
            </motion.button>
            <motion.button
              type="button"
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-gray-800 shadow-md text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => {
                onModeChange('register');
                setErrors({});
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              إنشاء حساب
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {/* Login Form */}
            {mode === 'login' && (
              <motion.form
                key="login"
                onSubmit={handleLogin}
                className="space-y-4"
                variants={fadeInUpVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="example@petmat.com"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 text-right"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      className="text-destructive text-sm mt-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 pl-10 text-right"
                      disabled={loading}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </motion.button>
                  </div>
                  {errors.password && (
                    <motion.p
                      className="text-destructive text-sm mt-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                <GradientButton
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  size="lg"
                  isLoading={loading}
                >
                  {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </GradientButton>
              </motion.form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <motion.form
                key="register"
                onSubmit={handleRegister}
                className="space-y-4"
                variants={fadeInUpVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      الاسم الأول
                    </label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="أحمد"
                        value={registerForm.firstName}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 text-right"
                        disabled={loading}
                      />
                    </div>
                    {errors.firstName && (
                      <motion.p
                        className="text-destructive text-sm mt-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        {errors.firstName}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      الاسم الأخير
                    </label>
                    <Input
                      type="text"
                      placeholder="محمد"
                      value={registerForm.lastName}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right"
                      disabled={loading}
                    />
                    {errors.lastName && (
                      <motion.p
                        className="text-destructive text-sm mt-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        {errors.lastName}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="example@petmat.com"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 text-right"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      className="text-destructive text-sm mt-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    رقم الهاتف (اختياري)
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+201234567890"
                      value={registerForm.phone}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 text-right"
                      disabled={loading}
                    />
                  </div>
                  {errors.phone && (
                    <motion.p
                      className="text-destructive text-sm mt-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {errors.phone}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="8 أحرف على الأقل"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 pl-10 text-right"
                      disabled={loading}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </motion.button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {registerForm.password && (
                    <motion.div
                      className="mt-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Password Strength</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            passwordValidation?.strength === 'strong' ? 'border-green-500 text-green-700' :
                            passwordValidation?.strength === 'medium' ? 'border-amber-500 text-amber-700' :
                            'border-red-500 text-red-700'
                          }`}
                        >
                          {passwordValidation ? passwordSecurity.getPasswordStrengthText(passwordValidation.strength) : 'Weak'}
                        </Badge>
                      </div>
                      <Progress 
                        value={passwordStrength} 
                        className="h-2"
                      />
                    </motion.div>
                  )}
                  
                  {errors.password && (
                    <motion.p
                      className="text-destructive text-sm mt-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="أعد إدخال كلمة المرور"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 pl-10 text-right"
                      disabled={loading}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </motion.button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      className="text-destructive text-sm mt-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                {/* Password Requirements */}
                <motion.div
                  className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/50 shadow-xl p-4 rounded-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-sm text-foreground">Password Requirements (Simplified):</strong>
                    <motion.button
                      type="button"
                      onClick={generatePassword}
                      className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Generate
                    </motion.button>
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground text-right">
                    <li className="flex items-center gap-2">
                      <CheckCircle className={`h-3 w-3 ${
                        registerForm.password?.length >= 6 ? 'text-green-500' : 'text-destructive'
                      }`} />
                      6 أحرف على الأقل
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className={`h-3 w-3 ${
                        /[a-z]/.test(registerForm.password || '') ? 'text-green-500' : 'text-destructive'
                      }`} />
                      حرف صغير واحد على الأقل (a-z)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className={`h-3 w-3 ${
                        !passwordValidation?.errors.some(error => error.toLowerCase().includes('forbidden')) ? 'text-green-500' : 'text-destructive'
                      }`} />
                      لا تستخدم كلمات شائعة (password, 123456)
                    </li>
                  </ul>
                </motion.div>

                <GradientButton
                  type="submit"
                  className="w-full"
                  disabled={loading || !passwordValidation?.isValid}
                  size="lg"
                  isLoading={loading}
                >
                  {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                </GradientButton>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            className="mt-6 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p>
              {mode === 'login'
                ? 'ليس لديك حساب؟ انتقل إلى إنشاء حساب أعلاه'
                : 'لديك حساب بالفعل؟ انتقل إلى تسجيل الدخول أعلاه'}
            </p>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}

export default AuthForm;
