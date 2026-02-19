/**
 * Onboarding Flow Component
 * Guides new users through setup with progressive disclosure
 */

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, X, Check, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';

export function OnboardingFlow() {
  const { onboardingState, goToStep, completeOnboarding, skipOnboarding, updatePreferences } = useOnboarding();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    breedingInterest: 'maybe' as const,
    petTypes: [] as string[],
    desiredBreeds: [],
    receiveNotifications: true,
  });

  if (!onboardingState || onboardingState.completed || !user) {
    return null;
  }

  const steps = [
    {
      id: 'welcome' as const,
      title: 'Welcome to PetMate! 🎉',
      description: 'Let\'s get you started on your pet breeding journey',
    },
    {
      id: 'profile' as const,
      title: 'Complete Your Profile',
      description: 'Help other breeders get to know you better',
    },
    {
      id: 'first-pet' as const,
      title: 'Register Your First Pet',
      description: 'Add your pet\'s basic information to get started',
    },
    {
      id: 'breeding-interest' as const,
      title: 'Are you interested in breeding?',
      description: 'Tell us about your breeding goals and preferences',
    },
    {
      id: 'preferences' as const,
      title: 'Set Your Preferences',
      description: 'Customize your experience and match recommendations',
    },
    {
      id: 'complete' as const,
      title: 'You\'re All Set! ✨',
      description: 'Start exploring matches and connecting with breeders',
    },
  ];

  const currentStep = steps.find(s => s.id === onboardingState.currentStep)!;
  const currentIndex = steps.findIndex(s => s.id === onboardingState.currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1].id);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1].id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header with progress */}
        <div className="relative h-2 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Close button */}
          <button
            onClick={skipOnboarding}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Welcome Step */}
          {onboardingState.currentStep === 'welcome' && (
            <div className="text-center">
              <div className="mb-6">
                <Zap className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentStep.title}
                </h2>
                <p className="text-gray-600">{currentStep.description}</p>
              </div>
              <div className="space-y-3 text-left text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Find perfect breeding matches for your pets
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Manage health records and certifications
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  AI-powered recommendations
                </p>
              </div>
            </div>
          )}

          {/* Breeding Interest Step */}
          {onboardingState.currentStep === 'breeding-interest' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentStep.title}
              </h2>
              <p className="text-gray-600 mb-6">{currentStep.description}</p>
              <div className="space-y-3">
                {['yes', 'maybe', 'no'].map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      setFormData({ ...formData, breedingInterest: option as any });
                      updatePreferences({ breedingInterest: option as any });
                    }}
                    className={`w-full p-3 rounded-lg border-2 text-left transition ${
                      formData.breedingInterest === option
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 capitalize">
                      {option === 'yes' && '🐕 Yes, I\'m interested'}
                      {option === 'maybe' && '🤔 Maybe, I\'m exploring'}
                      {option === 'no' && '👀 Just browsing'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preferences Step */}
          {onboardingState.currentStep === 'preferences' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentStep.title}
              </h2>
              <p className="text-gray-600 mb-6">{currentStep.description}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notifications
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.receiveNotifications}
                      onChange={(e) => {
                        setFormData({ ...formData, receiveNotifications: e.target.checked });
                        updatePreferences({ receiveNotifications: e.target.checked });
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">
                      Get notified about matching pets and new features
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {onboardingState.currentStep === 'complete' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentStep.title}
                </h2>
                <p className="text-gray-600">{currentStep.description}</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-indigo-900 mb-6">
                💡 Tip: Start by adding your first pet to get better match recommendations
              </div>
            </div>
          )}

          {/* Default step content */}
          {!['welcome', 'breeding-interest', 'preferences', 'complete'].includes(onboardingState.currentStep) && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentStep.title}
              </h2>
              <p className="text-gray-600">{currentStep.description}</p>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                Continue to complete your setup
              </div>
            </div>
          )}
        </div>

        {/* Footer with navigation */}
        <div className="bg-gray-50 px-8 py-4 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Step {currentIndex + 1} of {steps.length}
          </div>
          <div className="flex gap-3">
            {currentIndex > 0 && (
              <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {currentIndex === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
