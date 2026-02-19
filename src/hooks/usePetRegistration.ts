import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { PetFormData, PetImage, HealthDocument } from '../types';

interface UsePetRegistrationState {
  formData: PetFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

interface UsePetRegistrationActions {
  updateFormData: (field: keyof PetFormData, value: any) => void;
  updateImages: (images: PetImage[]) => void;
  updateHealthDocuments: (documents: HealthDocument[]) => void;
  validateForm: () => boolean;
  handleSubmit: (onSubmit?: (data: PetFormData) => void) => Promise<void>;
  resetForm: () => void;
  clearErrors: () => void;
}

export function usePetRegistration(initialData?: Partial<PetFormData>): UsePetRegistrationState & UsePetRegistrationActions {
  const [formData, setFormData] = useState<PetFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'dog',
    breed: initialData?.breed || '',
    age: initialData?.age || '',
    gender: initialData?.gender || 'male',
    description: initialData?.description || '',
    images: initialData?.images || [],
    healthDocuments: initialData?.healthDocuments || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = useCallback((field: keyof PetFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const updateImages = useCallback((images: PetImage[]) => {
    setFormData(prev => ({ ...prev, images }));
  }, []);

  const updateHealthDocuments = useCallback((documents: HealthDocument[]) => {
    setFormData(prev => ({ ...prev, healthDocuments: documents }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Pet name is required';
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = 'Pet type is required';
    }

    // Breed validation
    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    }

    // Age validation
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 0) {
      newErrors.age = 'Please enter a valid age';
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Images validation
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (onSubmit?: (data: PetFormData) => void) => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
      toast.success('Pet registered successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register pet';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      type: 'dog',
      breed: '',
      age: '',
      gender: 'male',
      description: '',
      images: [],
      healthDocuments: []
    });
    setErrors({});
    setIsSubmitting(false);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    // State
    formData,
    errors,
    isSubmitting,
    
    // Actions
    updateFormData,
    updateImages,
    updateHealthDocuments,
    validateForm,
    handleSubmit,
    resetForm,
    clearErrors,
  };
}
