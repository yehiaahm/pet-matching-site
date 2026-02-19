/**
 * Slim Auth Form Component - UI Only
 * Pure presentation component that uses custom hooks for business logic
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useLogin, useRegister } from '../../hooks';
import { GradientButton } from '../ui/ModernButton';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, 
  CheckCircle, PawPrint, RefreshCw
} from 'lucide-react';
import { fadeInUpVariants, scaleUpVariants } from '../../../lib/animations';

interface AuthFormProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const loginHook = useLogin();
  const registerHook = useRegister();

  // Choose the appropriate hook based on mode
  const hook = mode === 'login' ? loginHook : registerHook;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'login') {
      const success = await loginHook.handleLogin();
      if (success) {
        // Navigation will be handled by the parent component
      }
    } else {
      const success = await registerHook.handleRegister();
      if (success) {
        // Navigation will be handled by the parent component
      }
    }
  };

  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto"
    >
      <Card className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            variants={scaleUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4"
          >
            <PawPrint className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Sign in to your PetMate account' 
              : 'Join PetMate to find your perfect pet match'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          <AnimatePresence>
            {hook.errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{hook.errors.general}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={hook.formData.email}
                onChange={(e) => hook.updateFormData('email', e.target.value)}
                className="pl-10"
                disabled={hook.loading}
              />
            </div>
            {hook.errors.email && (
              <p className="text-sm text-red-600">{hook.errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type={hook.showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={hook.formData.password}
                onChange={(e) => hook.updateFormData('password', e.target.value)}
                className="pl-10 pr-10"
                disabled={hook.loading}
              />
              <button
                type="button"
                onClick={hook.togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {hook.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {hook.errors.password && (
              <p className="text-sm text-red-600">{hook.errors.password}</p>
            )}
            
            {/* Password Strength Indicator (Register only) */}
            {mode === 'register' && registerHook.passwordValidation && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Password Strength</span>
                  <Badge 
                    variant={registerHook.passwordValidation.strength >= 3 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {registerHook.passwordValidation.strength >= 3 ? 'Strong' : 'Weak'}
                  </Badge>
                </div>
                <Progress 
                  value={registerHook.passwordValidation.score} 
                  className="h-2"
                />
                {registerHook.passwordValidation.warnings.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {registerHook.passwordValidation.warnings.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Register Specific Fields */}
          {mode === 'register' && (
            <>
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter your first name"
                    value={registerHook.formData.firstName}
                    onChange={(e) => registerHook.updateFormData('firstName', e.target.value)}
                    className="pl-10"
                    disabled={hook.loading}
                  />
                </div>
                {registerHook.errors.firstName && (
                  <p className="text-sm text-red-600">{registerHook.errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name (Optional)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter your last name"
                    value={registerHook.formData.lastName}
                    onChange={(e) => registerHook.updateFormData('lastName', e.target.value)}
                    className="pl-10"
                    disabled={hook.loading}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={registerHook.formData.phone}
                    onChange={(e) => registerHook.updateFormData('phone', e.target.value)}
                    className="pl-10"
                    disabled={hook.loading}
                  />
                </div>
                {registerHook.errors.phone && (
                  <p className="text-sm text-red-600">{registerHook.errors.phone}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={registerHook.showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={registerHook.formData.confirmPassword || ''}
                    onChange={(e) => registerHook.updateFormData('confirmPassword', e.target.value)}
                    className="pl-10 pr-10"
                    disabled={hook.loading}
                  />
                  <button
                    type="button"
                    onClick={registerHook.toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {registerHook.showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {registerHook.errors.confirmPassword && (
                  <p className="text-sm text-red-600">{registerHook.errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          {/* Submit Button */}
          <GradientButton
            type="submit"
            disabled={hook.loading}
            className="w-full"
            size="lg"
          >
            {hook.loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </GradientButton>
        </form>

        {/* Mode Switch */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
