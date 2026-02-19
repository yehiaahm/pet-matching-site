/**
 * Pet Types
 * TypeScript interfaces and types for pet-related operations
 */

import { Pet, Prisma } from '@prisma/client';

// Base Pet Types
export interface PetCreateInput {
  name: string;
  species: string;
  breed: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: Date;
  weight?: number;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  color?: string;
  description?: string;
  images?: PetImageInput[];
  vaccinations?: VaccinationInput[];
  healthChecks?: HealthCheckInput[];
  breedingPrice?: number;
  breedingStatus?: 'AVAILABLE' | 'UNAVAILABLE' | 'PENDING' | 'BREEDING';
  traits?: string[];
  ownerId: string;
}

export interface PetUpdateInput {
  name?: string;
  species?: string;
  breed?: string;
  gender?: 'MALE' | 'FEMALE';
  dateOfBirth?: Date;
  weight?: number;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  color?: string;
  description?: string;
  breedingPrice?: number;
  breedingStatus?: 'AVAILABLE' | 'UNAVAILABLE' | 'PENDING' | 'BREEDING';
  traits?: string[];
}

export interface PetImageInput {
  url: string;
  isPrimary?: boolean;
  caption?: string;
}

export interface VaccinationInput {
  name: string;
  date: Date;
  nextDue?: Date;
  veterinarian?: string;
  batchNumber?: string;
  notes?: string;
}

export interface HealthCheckInput {
  date: Date;
  veterinarian: string;
  weight?: number;
  temperature?: number;
  heartRate?: number;
  notes?: string;
}

// Filter Types
export interface PetFilters {
  species?: string;
  breed?: string;
  gender?: 'MALE' | 'FEMALE';
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  breedingStatus?: 'AVAILABLE' | 'UNAVAILABLE' | 'PENDING' | 'BREEDING';
  minAge?: number;
  maxAge?: number;
  minWeight?: number;
  maxWeight?: number;
  ownerId?: string;
  location?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  traits?: string[];
}

// Query Options
export interface PetQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  include?: string[];
  filters?: PetFilters;
}

// API Response Types
export interface PetResponse {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: Date;
  age: number; // Calculated
  weight?: number;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  color?: string;
  description?: string;
  breedingPrice?: number;
  breedingStatus: 'AVAILABLE' | 'UNAVAILABLE' | 'PENDING' | 'BREEDING';
  traits?: string[];
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    rating: number;
    verified: boolean;
  };
  images: PetImage[];
  vaccinations: Vaccination[];
  healthChecks: HealthCheck[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PetImage {
  id: string;
  url: string;
  isPrimary: boolean;
  caption?: string;
  petId: string;
  createdAt: Date;
}

export interface Vaccination {
  id: string;
  name: string;
  date: Date;
  nextDue?: Date;
  veterinarian?: string;
  batchNumber?: string;
  notes?: string;
  petId: string;
  createdAt: Date;
}

export interface HealthCheck {
  id: string;
  date: Date;
  veterinarian: string;
  weight?: number;
  temperature?: number;
  heartRate?: number;
  notes?: string;
  petId: string;
  createdAt: Date;
}

// Search and Matching Types
export interface PetSearchResult {
  pets: PetResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: PetFilters;
}

export interface PetMatchCriteria {
  species?: string;
  breed?: string;
  gender?: 'MALE' | 'FEMALE';
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  maxDistance?: number; // in kilometers
  traits?: string[];
  excludeOwner?: string;
}

export interface PetMatchResult {
  pet: PetResponse;
  compatibilityScore: number;
  matchingFactors: {
    breed: number;
    location: number;
    traits: number;
    age: number;
    size: number;
  };
  distance?: number;
}

// Statistics Types
export interface PetStats {
  total: number;
  species: Array<{
    species: string;
    count: number;
  }>;
  topBreeds: Array<{
    breed: string;
    count: number;
  }>;
  gender: Array<{
    gender: string;
    count: number;
  }>;
  recentlyAdded: PetResponse[];
}

// Validation Types
export interface PetValidationRules {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  species: {
    required: boolean;
    allowedValues: string[];
  };
  breed: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  age: {
    min: number;
    max: number;
  };
  weight: {
    min: number;
    max: number;
  };
}

// Error Types
export class PetNotFoundError extends Error {
  constructor(petId: string) {
    super(`Pet with ID ${petId} not found`);
    this.name = 'PetNotFoundError';
  }
}

export class PetAlreadyExistsError extends Error {
  constructor(name: string, ownerId: string) {
    super(`Pet '${name}' already exists for owner ${ownerId}`);
    this.name = 'PetAlreadyExistsError';
  }
}

export class PetValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'PetValidationError';
  }
}

// Repository Interface
export interface IPetRepository {
  create(data: PetCreateInput): Promise<Pet>;
  findById(id: string): Promise<Pet | null>;
  findByIdWithRelations(id: string): Promise<Pet | null>;
  findAll(options?: PetQueryOptions): Promise<PetSearchResult>;
  update(id: string, data: PetUpdateInput): Promise<Pet>;
  delete(id: string): Promise<boolean>;
  findByOwner(ownerId: string): Promise<Pet[]>;
  findByBreed(breed: string): Promise<Pet[]>;
  findBySpecies(species: string): Promise<Pet[]>;
  findAvailableForBreeding(filters: PetFilters): Promise<Pet[]>;
  updateHealthRecord(petId: string, healthData: HealthCheckInput): Promise<Pet>;
  addVaccination(petId: string, vaccination: VaccinationInput): Promise<Pet>;
  searchPets(query: string, filters?: PetFilters): Promise<Pet[]>;
  getPetStats(): Promise<PetStats>;
  findWithAdvancedFilters(filters: PetFilters): Promise<Pet[]>;
}

// Utility Types
export type PetWhereInput = Prisma.PetWhereInput;
export type PetOrderByInput = Prisma.PetOrderByWithRelationInput;
export type PetIncludeInput = Prisma.PetInclude;
