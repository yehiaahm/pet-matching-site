/**
 * Onboarding Types
 * Defines types for the onboarding and guided flows
 */

export type OnboardingStep = 
  | 'welcome'
  | 'profile'
  | 'first-pet'
  | 'breeding-interest'
  | 'preferences'
  | 'complete';

export type BreedingRequestStep =
  | 'pet-selection'
  | 'partner-search'
  | 'partner-confirmation'
  | 'schedule'
  | 'review'
  | 'submit';

export interface OnboardingState {
  currentStep: OnboardingStep;
  completed: boolean;
  completedAt?: Date;
  skippedSteps: OnboardingStep[];
}

export interface UserPreferences {
  breedingInterest: 'yes' | 'no' | 'maybe';
  petTypes: string[];
  desiredBreeds: string[];
  locationRadius: number; // in km
  maxDistance: number;
  receiveNotifications: boolean;
  receiveRecommendations: boolean;
}

export interface GuidedRequestState {
  currentStep: BreedingRequestStep;
  selectedPetId?: string;
  searchCriteria?: {
    breed?: string;
    ageRange?: [number, number];
    gender?: 'male' | 'female';
    location?: string;
  };
  selectedPartnerId?: string;
  proposedDate?: Date;
  notes?: string;
  matchScore?: number; // AI recommendation score
}

/**
 * Tooltip content for contextual help
 */
export const TOOLTIPS = {
  petRegistration: 'Register your pet to start connecting with other breeders',
  healthRecords: 'Keep complete health records to build trust with other breeders',
  breedingRequest: 'Send a request to a pet owner to arrange a breeding match',
  matchScore: 'AI calculates compatibility based on breed, health, genetics, and previous matches',
  aiRecommendation: 'We found compatible matches for your pet based on our smart matching algorithm',
  breedingAvailability: 'Set when your pet is available for breeding to attract interested partners',
} as const;

/**
 * Progress indicators for long flows
 */
export interface FlowProgress {
  totalSteps: number;
  currentStepIndex: number;
  stepTitle: string;
  stepDescription: string;
  percentComplete: number;
  canGoBack: boolean;
  canSkip: boolean;
}
