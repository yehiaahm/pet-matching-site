import { useState, useCallback } from 'react';
import { authService, type LoginCredentials } from '../app/services/authService';
import { toast } from 'sonner';

interface UseLoginState {
  formData: LoginCredentials;
  loading: boolean;
  errors: Record<string, string>;
  showPassword: boolean;
}

interface UseLoginActions {
  updateFormData: (field: keyof LoginCredentials, value: string) => void;
  togglePasswordVisibility: () => void;
  validateForm: () => boolean;
  handleLogin: () => Promise<boolean>;
  resetForm: () => void;
  clearErrors: () => void;
}

export function useLogin(): UseLoginState & UseLoginActions {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const updateFormData = useCallback((field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleLogin = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setLoading(true);
    try {
      const result = await authService.login(formData);
      
      if (result.success) {
        toast.success('Login successful!');
        return true;
      } else {
        setErrors({ 
          general: result.error || 'Login failed. Please try again.' 
        });
        toast.error(result.error || 'Login failed');
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
    });
    setErrors({});
    setShowPassword(false);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    // State
    formData,
    loading,
    errors,
    showPassword,
    
    // Actions
    updateFormData,
    togglePasswordVisibility,
    validateForm,
    handleLogin,
    resetForm,
    clearErrors,
  };
}
