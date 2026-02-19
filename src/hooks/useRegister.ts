import { useState, useCallback } from 'react';
import { authService, type RegisterCredentials } from '../app/services/authService';
import { passwordSecurity, type PasswordValidationResult } from '../app/utils/passwordSecurity';
import { toast } from 'sonner';

interface UseRegisterState {
  formData: RegisterCredentials;
  loading: boolean;
  errors: Record<string, string>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  passwordValidation: PasswordValidationResult | null;
  currentStep: number;
  completed: boolean;
}

interface UseRegisterActions {
  updateFormData: (field: keyof RegisterCredentials, value: string) => void;
  togglePasswordVisibility: () => void;
  toggleConfirmPasswordVisibility: () => void;
  validatePassword: (password: string) => PasswordValidationResult;
  validateForm: () => boolean;
  handleRegister: () => Promise<boolean>;
  resetForm: () => void;
  clearErrors: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
}

export function useRegister(): UseRegisterState & UseRegisterActions {
  const [formData, setFormData] = useState<RegisterCredentials>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);

  const updateFormData = useCallback((field: keyof RegisterCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const validatePassword = useCallback((password: string): PasswordValidationResult => {
    const validation = passwordSecurity.validatePassword(password);
    setPasswordValidation(validation);
    return validation;
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors.join(', ');
      }
    }

    // Confirm password validation
    if (!showConfirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Phone validation (optional but if provided, validate format)
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, showConfirmPassword, validatePassword]);

  const handleRegister = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setLoading(true);
    try {
      const result = await authService.register(formData);
      
      if (result.success) {
        toast.success('Registration successful!');
        setCompleted(true);
        return true;
      } else {
        setErrors({ 
          general: result.error || 'Registration failed. Please try again.' 
        });
        toast.error(result.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm]);

  const resetForm = useCallback(() => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordValidation(null);
    setCurrentStep(1);
    setCompleted(false);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 3) {
      setCurrentStep(step);
    }
  }, []);

  return {
    // State
    formData,
    loading,
    errors,
    showPassword,
    showConfirmPassword,
    passwordValidation,
    currentStep,
    completed,
    
    // Actions
    updateFormData,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    validatePassword,
    validateForm,
    handleRegister,
    resetForm,
    clearErrors,
    nextStep,
    prevStep,
    goToStep,
  };
}
