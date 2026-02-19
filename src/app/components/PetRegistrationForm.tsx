/**
 * Pet Registration Form with File Upload Integration
 * Enhanced pet registration form with image and document upload capabilities
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PetImageUpload } from './PetImageUpload';
import { HealthDocumentUpload } from './HealthDocumentUpload';
import { GradientButton } from './ui/ModernButton';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { AlertCircle } from 'lucide-react';
import { fadeInUpVariants } from '../../lib/animations';

interface PetRegistrationFormProps {
  onSubmit?: (petData: any) => void;
  initialData?: any;
  className?: string;
}

export function PetRegistrationForm({
  onSubmit,
  initialData,
  className = ''
}: PetRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || '',
    breed: initialData?.breed || '',
    age: initialData?.age || '',
    gender: initialData?.gender || '',
    description: initialData?.description || '',
    images: initialData?.images || [],
    healthDocuments: initialData?.healthDocuments || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleDocumentsChange = (documents: any[]) => {
    setFormData(prev => ({ ...prev, healthDocuments: documents }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Pet name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Pet type is required';
    }

    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    }

    if (!formData.age || formData.age <= 0) {
      newErrors.age = 'Valid age is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'At least one pet image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare pet data for submission
      const petData = {
        ...formData,
        age: parseInt(formData.age),
        registeredAt: new Date().toISOString()
      };

      await onSubmit?.(petData);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <motion.div
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
      >
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Pet Information</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pet Name */}
            <div className="space-y-2">
              <Label htmlFor="petName">Pet Name *</Label>
              <Input
                id="petName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter pet's name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Pet Type */}
            <div className="space-y-2">
              <Label htmlFor="petType">Pet Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select pet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="bird">Bird</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            {/* Breed */}
            <div className="space-y-2">
              <Label htmlFor="breed">Breed *</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                placeholder="Enter breed"
                className={errors.breed ? 'border-red-500' : ''}
              />
              {errors.breed && (
                <p className="text-sm text-red-600">{errors.breed}</p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">Age (years) *</Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="30"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter age"
                className={errors.age ? 'border-red-500' : ''}
              />
              {errors.age && (
                <p className="text-sm text-red-600">{errors.age}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Tell us about your pet's personality, habits, and special characteristics..."
              rows={4}
            />
          </div>
        </Card>
      </motion.div>

      {/* Pet Images Upload */}
      <motion.div
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">Pet Images</h3>
            <p className="text-sm text-gray-600 mt-1">
              Upload clear photos of your pet. High-quality images help with better matching.
            </p>
          </div>

          <PetImageUpload
            currentImages={formData.images}
            onImagesChange={handleImagesChange}
            onError={(error) => setErrors(prev => ({ ...prev, images: error }))}
            maxImages={10}
          />

          {errors.images && (
            <Alert className="mt-4">
              <AlertDescription>{errors.images}</AlertDescription>
            </Alert>
          )}
        </Card>
      </motion.div>

      {/* Health Documents Upload */}
      <motion.div
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">Health Documents</h3>
            <p className="text-sm text-gray-600 mt-1">
              Upload vaccination records, health certificates, and other important documents.
            </p>
          </div>

          <HealthDocumentUpload
            currentDocuments={formData.healthDocuments}
            onDocumentsChange={handleDocumentsChange}
            onError={(error) => console.error('Document upload error:', error)}
          />

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Why health documents matter:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Ensures healthy breeding practices</li>
                  <li>Increases trust with potential matches</li>
                  <li>Required for premium matching features</li>
                  <li>Helps track vaccination schedules</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Summary */}
      <motion.div
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Registration Summary</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Pet Name:</span>
                <span className="text-sm">{formData.name || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Type:</span>
                <span className="text-sm">{formData.type || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Breed:</span>
                <span className="text-sm">{formData.breed || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Age:</span>
                <span className="text-sm">{formData.age ? `${formData.age} years` : 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Gender:</span>
                <span className="text-sm capitalize">{formData.gender || 'Not selected'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Images:</span>
                <Badge variant={formData.images.length > 0 ? 'default' : 'secondary'}>
                  {formData.images.length} uploaded
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Health Documents:</span>
                <Badge variant={formData.healthDocuments.length > 0 ? 'default' : 'secondary'}>
                  {formData.healthDocuments.length} uploaded
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Registration Status:</span>
                <Badge className="bg-green-100 text-green-700">
                  Ready to submit
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
        className="flex justify-center"
      >
        <GradientButton
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 text-lg"
        >
          {isSubmitting ? 'Registering Pet...' : 'Register Pet'}
        </GradientButton>
      </motion.div>
    </form>
  );
}
