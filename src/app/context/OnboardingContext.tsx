/**
 * Onboarding Context
 * Manages onboarding state and user guidance throughout the app
 */

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { OnboardingStep, OnboardingState, UserPreferences } from '../types/onboarding';

interface OnboardingContextType {
  // Onboarding state
  onboardingState: OnboardingState | null;
  showOnboarding: boolean;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  goToStep: (step: OnboardingStep) => void;
  skipStep: (step: OnboardingStep) => void;
  skipOnboarding: () => void;
  
  // User preferences
  preferences: UserPreferences | null;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Contextual help
  showTooltip: (key: string) => void;
  hideTooltip: () => void;
  activeTooltip: string | null;
  
  // Feature discovery
  hasSeenFeature: (featureName: string) => boolean;
  markFeatureSeen: (featureName: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  // Onboarding state from localStorage
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(() => {
    const stored = localStorage.getItem('petmate_onboarding');
    if (!stored) return null;
    try {
      // WHY: Guard against malformed JSON in localStorage which would throw and
      // break initial render with a white screen.
      return JSON.parse(stored) as OnboardingState;
    } catch (error) {
      console.error('Failed to parse petmate_onboarding from localStorage:', error);
      localStorage.removeItem('petmate_onboarding');
      return null;
    }
  });
  
  // User preferences from localStorage
  const [preferences, setPreferences] = useState<UserPreferences | null>(() => {
    const stored = localStorage.getItem('petmate_preferences');
    if (!stored) return null;
    try {
      // WHY: Defensive JSON.parse so corrupted preference data doesn't crash the app.
      return JSON.parse(stored) as UserPreferences;
    } catch (error) {
      console.error('Failed to parse petmate_preferences from localStorage:', error);
      localStorage.removeItem('petmate_preferences');
      return null;
    }
  });
  
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [seenFeatures, setSeenFeatures] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('petmate_seen_features');
    if (!stored) return new Set();
    try {
      // WHY: Protect against invalid JSON so feature tracking can't crash onboarding.
      const parsed = JSON.parse(stored) as string[];
      return new Set(parsed);
    } catch (error) {
      console.error('Failed to parse petmate_seen_features from localStorage:', error);
      localStorage.removeItem('petmate_seen_features');
      return new Set();
    }
  });

  // WHY: Wrap all functions in useCallback to stabilize references across renders.
  // This prevents "Rendered more hooks than during the previous render" error that
  // occurs when dependent components include these functions in their dependency arrays.
  
  const startOnboarding = useCallback(() => {
    const newState: OnboardingState = {
      currentStep: 'welcome',
      completed: false,
      skippedSteps: [],
    };
    setOnboardingState(newState);
    localStorage.setItem('petmate_onboarding', JSON.stringify(newState));
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingState((prevState) => {
      if (!prevState) return prevState;
      const completed: OnboardingState = {
        ...prevState,
        completed: true,
        completedAt: new Date(),
      };
      localStorage.setItem('petmate_onboarding', JSON.stringify(completed));
      return completed;
    });
  }, []);

  const goToStep = useCallback((step: OnboardingStep) => {
    setOnboardingState((prevState) => {
      if (!prevState) return prevState;
      const updated = {
        ...prevState,
        currentStep: step,
      };
      localStorage.setItem('petmate_onboarding', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const skipStep = useCallback((step: OnboardingStep) => {
    setOnboardingState((prevState) => {
      if (!prevState) return prevState;
      const updated = {
        ...prevState,
        skippedSteps: [...prevState.skippedSteps, step],
      };
      localStorage.setItem('petmate_onboarding', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const skipOnboarding = useCallback(() => {
    setOnboardingState((prevState) => {
      if (!prevState) return prevState;
      const completed: OnboardingState = {
        ...prevState,
        completed: true,
        completedAt: new Date(),
      };
      localStorage.setItem('petmate_onboarding', JSON.stringify(completed));
      return completed;
    });
  }, []);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setPreferences((prevPrefs) => {
      const updated = {
        ...(prevPrefs || {
          breedingInterest: 'maybe',
          petTypes: [],
          desiredBreeds: [],
          locationRadius: 50,
          maxDistance: 100,
          receiveNotifications: true,
          receiveRecommendations: true,
        }),
        ...prefs,
      };
      localStorage.setItem('petmate_preferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const showTooltip = useCallback((key: string) => {
    setActiveTooltip(key);
  }, []);

  const hideTooltip = useCallback(() => {
    setActiveTooltip(null);
  }, []);

  const hasSeenFeature = useCallback((featureName: string) => {
    return seenFeatures.has(featureName);
  }, [seenFeatures]);

  const markFeatureSeen = useCallback((featureName: string) => {
    setSeenFeatures((prevFeatures) => {
      const updated = new Set(prevFeatures);
      updated.add(featureName);
      localStorage.setItem('petmate_seen_features', JSON.stringify(Array.from(updated)));
      return updated;
    });
  }, []);

  const value: OnboardingContextType = {
    onboardingState,
    showOnboarding: onboardingState !== null && !onboardingState.completed,
    startOnboarding,
    completeOnboarding,
    goToStep,
    skipStep,
    skipOnboarding,
    preferences,
    updatePreferences,
    showTooltip,
    hideTooltip,
    activeTooltip,
    hasSeenFeature,
    markFeatureSeen,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
