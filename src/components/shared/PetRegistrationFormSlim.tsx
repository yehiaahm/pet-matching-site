/**
 * Slim Pet Registration Form - UI Only
 * Pure presentation component that uses custom hooks for business logic
 */

import { motion } from 'framer-motion';
import { usePetRegistration } from '../../hooks';
import { PetImageUpload } from '../PetImageUpload';
import { HealthDocumentUpload } from '../HealthDocumentUpload';
import { SharedButton } from './SharedComponents';
import { SharedCard } from './SharedComponents';
import { TextInput, TextareaInput, SelectInput } from './FormFields';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

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
  const hook = usePetRegistration(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await hook.handleSubmit(onSubmit);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <SharedCard>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pet Registration</h2>
          <p className="text-gray-600 mt-1">Register your pet for breeding matchmaking</p>
        </div>

        {/* General Error */}
        {hook.errors.general && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{hook.errors.general}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Pet Name"
                value={hook.formData.name}
                onChange={(value) => hook.updateFormData('name', value)}
                error={hook.errors.name}
                required
                placeholder="Enter pet name"
              />

              <SelectInput
                label="Pet Type"
                value={hook.formData.type}
                onChange={(value) => hook.updateFormData('type', value)}
                error={hook.errors.type}
                options={[
                  { value: 'dog', label: 'Dog' },
                  { value: 'cat', label: 'Cat' },
                  { value: 'bird', label: 'Bird' },
                  { value: 'rabbit', label: 'Rabbit' },
                  { value: 'other', label: 'Other' }
                ]}
                required
              />

              <TextInput
                label="Breed"
                value={hook.formData.breed}
                onChange={(value) => hook.updateFormData('breed', value)}
                error={hook.errors.breed}
                required
                placeholder="Enter breed"
              />

              <TextInput
                label="Age"
                value={hook.formData.age}
                onChange={(value) => hook.updateFormData('age', value)}
                error={hook.errors.age}
                required
                placeholder="Enter age"
                type="number"
              />

              <SelectInput
                label="Gender"
                value={hook.formData.gender}
                onChange={(value) => hook.updateFormData('gender', value)}
                error={hook.errors.gender}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' }
                ]}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            
            <TextareaInput
              label="Pet Description"
              value={hook.formData.description}
              onChange={(value) => hook.updateFormData('description', value)}
              error={hook.errors.description}
              required
              placeholder="Describe your pet's personality, temperament, and breeding preferences"
              rows={4}
            />
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Pet Images</h3>
            
            <PetImageUpload
              petId="new-pet"
              currentImages={hook.formData.images}
              onImagesChange={hook.updateImages}
              maxImages={5}
            />
            
            {hook.errors.images && (
              <p className="text-sm text-red-600">{hook.errors.images}</p>
            )}
          </div>

          {/* Health Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Health Documents</h3>
            
            <HealthDocumentUpload
              petId="new-pet"
              currentDocuments={hook.formData.healthDocuments}
              onDocumentsChange={hook.updateHealthDocuments}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <SharedButton
              type="button"
              variant="outline"
              onClick={hook.resetForm}
              disabled={hook.isSubmitting}
            >
              Reset
            </SharedButton>
            
            <SharedButton
              type="submit"
              loading={hook.isSubmitting}
              disabled={hook.isSubmitting}
            >
              {hook.isSubmitting ? 'Registering...' : 'Register Pet'}
            </SharedButton>
          </div>
        </form>
      </SharedCard>
    </motion.div>
  );
}
