/**
 * Shared TypeScript Interfaces and Types
 * Central type definitions for User, Pet, Match, and related entities
 */

// =============================================================================
// USER TYPES
// =============================================================================

/**
 * User interface representing a registered user in the system
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  location?: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  preferences?: {
    language: 'en' | 'ar';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private';
      showOnlineStatus: boolean;
    };
  };
  verification: {
    isVerified: boolean;
    badge?: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Unverified';
    documents?: string[];
    verifiedAt?: string;
  };
  subscription?: {
    plan: 'free' | 'basic' | 'premium' | 'pro';
    status: 'active' | 'inactive' | 'cancelled' | 'expired';
    expiresAt?: string;
    features: string[];
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  role?: 'user' | 'admin' | 'moderator' | 'super_admin';
}

/**
 * User profile data for updates
 */
export interface UserProfileData {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  location?: {
    address: string;
    city: string;
    country: string;
  };
}

/**
 * User statistics for analytics
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  userGrowthRate: number;
  usersByRole: Record<string, number>;
  usersByPlan: Record<string, number>;
}

/**
 * User preferences for onboarding
 */
export interface UserPreferences {
  breedingInterest: 'yes' | 'no' | 'maybe';
  petTypes: string[];
  desiredBreeds: string[];
  locationPreferences: {
    maxDistance: number;
    preferredRegions: string[];
  };
  notifications: {
    matches: boolean;
    messages: boolean;
    breedingRequests: boolean;
    systemUpdates: boolean;
  };
}

/**
 * Chat user interface for messaging
 */
export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  typingStatus?: 'idle' | 'typing' | 'paused';
}

// =============================================================================
// PET TYPES
// =============================================================================

/**
 * Pet type representing a registered pet
 */
export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  type: PetType;
  breed: string;
  age: number;
  ageUnit: 'months' | 'years';
  gender: 'male' | 'female';
  description: string;
  images: PetImage[];
  healthDocuments: HealthDocument[];
  location?: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  characteristics: {
    size: 'small' | 'medium' | 'large';
    weight?: number;
    weightUnit?: 'kg' | 'lbs';
    color: string[];
    temperament: string[];
    trainingLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  health: {
    isVaccinated: boolean;
    vaccinations: Vaccination[];
    healthChecks: HealthCheck[];
    geneticTests?: GeneticTest[];
    isNeutered: boolean;
    lastVetVisit?: string;
  };
  breeding: {
    isAvailable: boolean;
  experience: 'none' | 'beginner' | 'intermediate' | 'experienced';
  pedigree?: {
    isRegistered: boolean;
    registrationNumber?: string;
    parents?: {
      sire: string;
      dam: string;
    };
  };
  requirements: {
    studFee?: number;
    requirements: string[];
    preferences: string[];
  };
  status: 'active' | 'inactive' | 'sold' | 'unavailable';
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
}

/**
 * Pet type enumeration
 */
export type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';

/**
 * Pet image interface
 */
export interface PetImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  uploadedAt: string;
  metadata?: {
    size: number;
    format: string;
    width?: number;
    height?: number;
  };
}

/**
 * Health document interface
 */
export interface HealthDocument {
  id: string;
  type: HealthDocumentType;
  title: string;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadDate: string;
  expiryDate?: string;
  issuingVet?: string;
  metadata?: {
    size: number;
    format: string;
    pages?: number;
  };
}

/**
 * Health document types
 */
export type HealthDocumentType = 
  | 'vaccination'
  | 'health_check'
  | 'genetic_test'
  | 'certificate'
  | 'medical_record'
  | 'insurance';

/**
 * Vaccination record
 */
export interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDueDate?: string;
  veterinarian: string;
  batchNumber?: string;
  documentUrl?: string;
}

/**
 * Health check record
 */
export interface HealthCheck {
  id: string;
  date: string;
  veterinarian: string;
  findings: string;
  recommendations: string;
  documentUrl?: string;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Genetic test record
 */
export interface GeneticTest {
  id: string;
  testName: string;
  date: string;
  laboratory: string;
  results: string;
  status: 'clear' | 'carrier' | 'affected';
  documentUrl?: string;
}

/**
 * Pet statistics for analytics
 */
export interface PetStats {
  totalPets: number;
  newPetsThisMonth: number;
  petsBySpecies: Record<string, number>;
  petsByAge: Record<string, number>;
  petsByGender: Record<string, number>;
  petsByStatus: Record<string, number>;
  averageAge: number;
  mostPopularBreeds: Array<{ breed: string; count: number }>;
}

/**
 * Pet form data for registration/updates
 */
export interface PetFormData {
  name: string;
  type: PetType;
  breed: string;
  age: string;
  gender: 'male' | 'female';
  description: string;
  images: PetImage[];
  healthDocuments: HealthDocument[];
  location?: {
    address: string;
    city: string;
    country: string;
  };
}

// =============================================================================
// MATCH TYPES
// =============================================================================

/**
 * Match request between two pets
 */
export interface MatchRequest {
  id: string;
  requesterPetId: string;
  requestedPetId: string;
  requesterUserId: string;
  requestedUserId: string;
  status: MatchStatus;
  message?: string;
  requirements?: string[];
  studFee?: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  responseDate?: string;
}

/**
 * Match status enumeration
 */
export type MatchStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'cancelled';

/**
 * Match result with scoring
 */
export interface MatchResult {
  id: string;
  petA: Pet;
  petB: Pet;
  score: MatchScore;
  status: MatchStatus;
  createdAt: string;
  expiresAt?: string;
}

/**
 * Match score calculation result
 */
export interface MatchScore {
  totalScore: number; // 0-100
  breedCompatibility: number; // 0-100
  ageCompatibility: number; // 0-100
  healthCompatibility: number; // 0-100
  geneticCompatibility: number; // 0-100
  locationCompatibility: number; // 0-100
  overallCompatibility: number; // 0-100
  factors: MatchFactor[];
  recommendations: string[];
  warnings: string[];
}

/**
 * Individual match factor
 */
export interface MatchFactor {
  category: string;
  score: number;
  weight: number;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

/**
 * Enhanced match result with AI insights
 */
export interface EnhancedMatchResult {
  id: string;
  matchedPetId: string;
  matchedPetName: string;
  matchedPetBreed: string;
  matchedPetAge: number;
  matchedPetGender: string;
  matchedPetImages: PetImage[];
  score: number;
  probability: number; // 0-1
  compatibility: {
    breed: number;
    age: number;
    health: number;
    genetics: number;
    location: number;
    overall: number;
  };
  factors: {
    category: string;
    score: number;
    description: string;
    importance: 'high' | 'medium' | 'low';
  }[];
  recommendations: string[];
  warnings: string[];
  aiInsights?: {
    geneticRisk: 'low' | 'medium' | 'high';
    healthScore: number;
    breedingAdvice: string[];
  };
  createdAt: string;
}

/**
 * Match recommendation from AI service
 */
export interface MatchRecommendation {
  id: string;
  matchedPetId: string;
  matchedPetName: string;
  matchedPetBreed: string;
  score: number;
  probability: number;
  factors: {
    category: string;
    contribution: number;
    description: string;
  }[];
  recommendations: string[];
  warnings: string[];
  aiConfidence: number; // 0-1
  createdAt: string;
}

/**
 * Match statistics for analytics
 */
export interface MatchStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  expiredRequests: number;
  averageScore: number;
  successRate: number;
  requestsByDay: MatchRequestsByDay;
  requestsByBreed: Record<string, number>;
  requestsByAge: Record<string, number>;
}

/**
 * Match requests by day for analytics
 */
export interface MatchRequestsByDay {
  date: string;
  requests: number;
  completed: number;
  accepted: number;
  rejected: number;
}

/**
 * GPS-based match result
 */
export interface GPSMatchResult {
  pet: Pet & {
    owner: {
      name: string;
      phone?: string;
      email?: string;
    };
    distance: number;
    travelTime: string;
  };
  score: number;
  compatibility: number;
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * Notification type enumeration
 */
export type NotificationType = 
  | 'match'
  | 'message'
  | 'system'
  | 'general'
  | 'breeding_request'
  | 'subscription'
  | 'verification'
  | 'health_reminder';

// =============================================================================
// SUBSCRIPTION TYPES
// =============================================================================

/**
 * Subscription plan interface
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxPets: number;
    maxRequests: number;
    maxImages: number;
    maxMessages: number;
    aiMatching: boolean;
    prioritySupport: boolean;
  };
  trialDays?: number;
  isPopular?: boolean;
  tier: 'free' | 'basic' | 'premium' | 'pro';
  isActive: boolean;
}

/**
 * User subscription status
 */
export interface SubscriptionStatus {
  plan: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'trialing';
  expiresAt?: string;
  trialDaysRemaining?: number;
  usage: {
    currentPets: number;
    maxPets: number;
    requestsThisMonth: number;
    maxRequests: number;
    imagesUsed: number;
    maxImages: number;
    messagesSent: number;
    maxMessages: number;
  };
  nextBillingDate?: string;
  cancelledAt?: string;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * Overview statistics for dashboard
 */
export interface OverviewStats {
  totalUsers: number;
  totalPets: number;
  totalMatches: number;
  activeUsers: number;
  revenue: number;
  growth: {
    users: number;
    pets: number;
    matches: number;
    revenue: number;
  };
}

/**
 * Daily activity data for analytics
 */
export interface DailyActivityData {
  date: string;
  users: number;
  pets: number;
  matches: number;
  messages: number;
  revenue: number;
}

/**
 * Breed statistics for analytics
 */
export interface BreedStats {
  breed: string;
  count: number;
  averageAge: number;
  genderDistribution: Record<string, number>;
  popularityScore: number;
}

/**
 * Revenue statistics for analytics
 */
export interface RevenueStats {
  total: number;
  monthly: number;
  byPlan: Record<string, number>;
  growth: {
    monthly: number;
    yearly: number;
  };
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  id: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  format: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// FORM TYPES
// =============================================================================

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration credentials
 */
export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Address information
 */
export interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  coordinates?: Coordinates;
}

/**
 * Date range filter
 */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search filters
 */
export interface SearchFilters {
  query?: string;
  type?: string;
  breed?: string;
  age?: {
    min?: number;
    max?: number;
  };
  location?: string;
  radius?: number;
  price?: {
    min?: number;
    max?: number;
  };
  features?: string[];
  status?: string[];
}

/**
 * Sort options
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // User types
  User,
  UserProfileData,
  UserStats,
  UserPreferences,
  ChatUser,
  
  // Pet types
  Pet,
  PetType,
  PetImage,
  HealthDocument,
  HealthDocumentType,
  Vaccination,
  HealthCheck,
  GeneticTest,
  PetStats,
  PetFormData,
  
  // Match types
  MatchRequest,
  MatchStatus,
  MatchResult,
  MatchScore,
  MatchFactor,
  EnhancedMatchResult,
  MatchRecommendation,
  GPSMatchResult,
  MatchStats,
  MatchRequestsByDay,
  
  // Notification types
  Notification,
  NotificationType,
  
  // Subscription types
  SubscriptionPlan,
  SubscriptionStatus,
  
  // Analytics types
  OverviewStats,
  DailyActivityData,
  BreedStats,
  RevenueStats,
  
  // API types
  ApiResponse,
  PaginatedResponse,
  FileUploadResponse,
  
  // Form types
  LoginCredentials,
  RegisterCredentials,
  PasswordValidationResult,
  
  // Utility types
  Coordinates,
  Address,
  DateRange,
  PaginationParams,
  SearchFilters,
  SortOptions,
};
