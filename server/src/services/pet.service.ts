/**
 * Pet Service
 * Business logic layer for pet operations
 */

import { PetCreateInput, PetUpdateInput, PetFilters, PetMatchCriteria, PetMatchResult } from '../types/pet.types';
import { IPetRepository } from '../repositories/pet.repository';
import { PetNotFoundError, PetValidationError } from '../types/pet.types';
import { logger } from '../utils/logger.util';

export interface IPetService {
  createPet(data: PetCreateInput, ownerId: string): Promise<any>;
  getPetById(petId: string): Promise<any>;
  getUserPets(ownerId: string, options?: any): Promise<any>;
  updatePet(petId: string, data: PetUpdateInput, userId: string): Promise<any>;
  deletePet(petId: string, userId: string): Promise<boolean>;
  searchPets(query: string, filters?: PetFilters): Promise<any>;
  findPetsForBreeding(filters: PetFilters): Promise<any>;
  addVaccination(petId: string, vaccination: any, userId: string): Promise<any>;
  addHealthCheck(petId: string, healthData: any, userId: string): Promise<any>;
  getPetStats(): Promise<any>;
  findMatchingPets(criteria: PetMatchCriteria): Promise<PetMatchResult[]>;
  updateBreedingStatus(petId: string, status: string, userId: string): Promise<any>;
}

export class PetService implements IPetService {
  constructor(private petRepository: IPetRepository) {}

  async createPet(data: PetCreateInput, ownerId: string): Promise<any> {
    logger.info('Creating new pet', { ownerId, petName: data.name });

    // Validate business rules
    await this.validatePetData(data, ownerId);

    // Calculate age from date of birth
    const age = this.calculateAge(data.dateOfBirth);

    // Create pet with additional business logic
    const petData = {
      ...data,
      ownerId,
      breedingStatus: 'AVAILABLE', // Default status
      age,
    };

    const pet = await this.petRepository.create(petData);

    logger.info('Pet created successfully', { petId: pet.id, ownerId });
    return pet;
  }

  async getPetById(petId: string): Promise<any> {
    logger.info('Fetching pet by ID', { petId });

    const pet = await this.petRepository.findByIdWithRelations(petId);
    
    if (!pet) {
      throw new PetNotFoundError(petId);
    }

    // Add calculated fields
    const petWithAge = {
      ...pet,
      age: this.calculateAge(pet.dateOfBirth),
    };

    return petWithAge;
  }

  async getUserPets(ownerId: string, options: any = {}): Promise<any> {
    logger.info('Fetching user pets', { ownerId });

    const pets = await this.petRepository.findByOwner(ownerId);
    
    // Add calculated fields and apply business logic
    const petsWithAge = pets.map(pet => ({
      ...pet,
      age: this.calculateAge(pet.dateOfBirth),
      isAvailableForBreeding: this.isAvailableForBreeding(pet),
    }));

    // Apply pagination if requested
    if (options.page && options.limit) {
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      return {
        data: petsWithAge.slice(startIndex, endIndex),
        total: petsWithAge.length,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(petsWithAge.length / options.limit),
      };
    }

    return petsWithAge;
  }

  async updatePet(petId: string, data: PetUpdateInput, userId: string): Promise<any> {
    logger.info('Updating pet', { petId, userId });

    // Check if pet exists and user owns it
    const existingPet = await this.petRepository.findById(petId);
    if (!existingPet) {
      throw new PetNotFoundError(petId);
    }

    if (existingPet.ownerId !== userId) {
      throw new PetValidationError('You can only update your own pets');
    }

    // Validate update data
    await this.validatePetUpdateData(data, existingPet);

    const updatedPet = await this.petRepository.update(petId, data);

    logger.info('Pet updated successfully', { petId, userId });
    return updatedPet;
  }

  async deletePet(petId: string, userId: string): Promise<boolean> {
    logger.info('Deleting pet', { petId, userId });

    // Check if pet exists and user owns it
    const existingPet = await this.petRepository.findById(petId);
    if (!existingPet) {
      throw new PetNotFoundError(petId);
    }

    if (existingPet.ownerId !== userId) {
      throw new PetValidationError('You can only delete your own pets');
    }

    // Check if pet has active breeding requests
    if (existingPet.breedingStatus === 'BREEDING') {
      throw new PetValidationError('Cannot delete a pet that is currently breeding');
    }

    const deleted = await this.petRepository.delete(petId);

    if (deleted) {
      logger.info('Pet deleted successfully', { petId, userId });
    }

    return deleted;
  }

  async searchPets(query: string, filters?: PetFilters): Promise<any> {
    logger.info('Searching pets', { query, filters });

    const pets = await this.petRepository.searchPets(query, filters);
    
    // Add calculated fields and apply business logic
    return pets.map(pet => ({
      ...pet,
      age: this.calculateAge(pet.dateOfBirth),
      matchScore: this.calculateSearchMatchScore(pet, query),
    }));
  }

  async findPetsForBreeding(filters: PetFilters): Promise<any> {
    logger.info('Finding pets for breeding', { filters });

    const pets = await this.petRepository.findAvailableForBreeding(filters);
    
    // Add calculated fields and breeding-specific logic
    return pets.map(pet => ({
      ...pet,
      age: this.calculateAge(pet.dateOfBirth),
      breedingCompatibility: this.calculateBreedingCompatibility(pet),
      healthScore: this.calculateHealthScore(pet),
    }));
  }

  async addVaccination(petId: string, vaccination: any, userId: string): Promise<any> {
    logger.info('Adding vaccination', { petId, userId });

    // Check if pet exists and user owns it
    const existingPet = await this.petRepository.findById(petId);
    if (!existingPet) {
      throw new PetNotFoundError(petId);
    }

    if (existingPet.ownerId !== userId) {
      throw new PetValidationError('You can only add vaccinations to your own pets');
    }

    // Validate vaccination data
    this.validateVaccinationData(vaccination);

    const updatedPet = await this.petRepository.addVaccination(petId, vaccination);

    logger.info('Vaccination added successfully', { petId, userId });
    return updatedPet;
  }

  async addHealthCheck(petId: string, healthData: any, userId: string): Promise<any> {
    logger.info('Adding health check', { petId, userId });

    // Check if pet exists and user owns it
    const existingPet = await this.petRepository.findById(petId);
    if (!existingPet) {
      throw new PetNotFoundError(petId);
    }

    if (existingPet.ownerId !== userId) {
      throw new PetValidationError('You can only add health checks to your own pets');
    }

    // Validate health check data
    this.validateHealthCheckData(healthData);

    const updatedPet = await this.petRepository.updateHealthRecord(petId, healthData);

    logger.info('Health check added successfully', { petId, userId });
    return updatedPet;
  }

  async getPetStats(): Promise<any> {
    logger.info('Fetching pet statistics');

    const stats = await this.petRepository.getPetStats();
    
    // Add calculated statistics
    return {
      ...stats,
      averageAge: this.calculateAverageAge(stats.recentlyAdded),
      healthScore: this.calculateOverallHealthScore(stats),
    };
  }

  async findMatchingPets(criteria: PetMatchCriteria): Promise<PetMatchResult[]> {
    logger.info('Finding matching pets', { criteria });

    // Find potential matches based on criteria
    const potentialMatches = await this.petRepository.findWithAdvancedFilters({
      species: criteria.species,
      breed: criteria.breed,
      gender: criteria.gender === 'MALE' ? 'FEMALE' : 'MALE', // Opposite gender for breeding
      breedingStatus: 'AVAILABLE',
      traits: criteria.traits,
    });

    // Calculate compatibility scores for each match
    const matches: PetMatchResult[] = potentialMatches.map(pet => {
      const score = this.calculateCompatibilityScore(pet, criteria);
      
      return {
        pet: {
          ...pet,
          age: this.calculateAge(pet.dateOfBirth),
        },
        compatibilityScore: score.total,
        matchingFactors: score.factors,
        distance: criteria.location ? this.calculateDistance(pet, criteria.location) : undefined,
      };
    });

    // Sort by compatibility score (highest first)
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Filter by maximum distance if specified
    if (criteria.maxDistance) {
      return matches.filter(match => !match.distance || match.distance <= criteria.maxDistance);
    }

    return matches;
  }

  async updateBreedingStatus(petId: string, status: string, userId: string): Promise<any> {
    logger.info('Updating breeding status', { petId, status, userId });

    // Check if pet exists and user owns it
    const existingPet = await this.petRepository.findById(petId);
    if (!existingPet) {
      throw new PetNotFoundError(petId);
    }

    if (existingPet.ownerId !== userId) {
      throw new PetValidationError('You can only update breeding status for your own pets');
    }

    // Validate status transition
    this.validateBreedingStatusTransition(existingPet.breedingStatus, status);

    const updatedPet = await this.petRepository.update(petId, { breedingStatus: status });

    logger.info('Breeding status updated successfully', { petId, status, userId });
    return updatedPet;
  }

  // Private helper methods
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private isAvailableForBreeding(pet: any): boolean {
    return pet.breedingStatus === 'AVAILABLE' && 
           this.calculateAge(pet.dateOfBirth) >= 1 && // Minimum age for breeding
           this.calculateHealthScore(pet) >= 0.7; // Good health score
  }

  private calculateSearchMatchScore(pet: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    // Name match (highest weight)
    if (pet.name.toLowerCase().includes(lowerQuery)) {
      score += 0.4;
    }
    
    // Breed match
    if (pet.breed.toLowerCase().includes(lowerQuery)) {
      score += 0.3;
    }
    
    // Description match
    if (pet.description && pet.description.toLowerCase().includes(lowerQuery)) {
      score += 0.2;
    }
    
    // Owner name match
    if (pet.owner && pet.owner.name.toLowerCase().includes(lowerQuery)) {
      score += 0.1;
    }
    
    return score;
  }

  private calculateBreedingCompatibility(pet: any): number {
    let score = 0.5; // Base score
    
    // Health score contribution
    score += this.calculateHealthScore(pet) * 0.3;
    
    // Age factor (optimal breeding age)
    const age = this.calculateAge(pet.dateOfBirth);
    if (age >= 2 && age <= 7) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  private calculateHealthScore(pet: any): number {
    let score = 0.5; // Base score
    
    // Vaccinations up to date
    if (pet.vaccinations && pet.vaccinations.length > 0) {
      const latestVaccination = pet.vaccinations[0];
      const daysSinceLastVaccination = (Date.now() - latestVaccination.date.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastVaccination <= 365) {
        score += 0.3;
      }
    }
    
    // Recent health checks
    if (pet.healthChecks && pet.healthChecks.length > 0) {
      const latestHealthCheck = pet.healthChecks[0];
      const daysSinceLastCheck = (Date.now() - latestHealthCheck.date.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastCheck <= 90) {
        score += 0.2;
      }
    }
    
    return Math.min(score, 1.0);
  }

  private calculateCompatibilityScore(pet: any, criteria: PetMatchCriteria): {
    total: number;
    factors: {
      breed: number;
      location: number;
      traits: number;
      age: number;
      size: number;
    };
  } {
    const factors = {
      breed: 0,
      location: 0,
      traits: 0,
      age: 0,
      size: 0,
    };
    
    // Breed compatibility
    if (criteria.breed && pet.breed === criteria.breed) {
      factors.breed = 0.3;
    } else if (criteria.breed && this.isCompatibleBreed(pet.breed, criteria.breed)) {
      factors.breed = 0.15;
    }
    
    // Location compatibility
    if (criteria.location) {
      const distance = this.calculateDistance(pet, criteria.location);
      factors.location = Math.max(0, 0.25 - (distance / 100)); // Decrease with distance
    }
    
    // Traits compatibility
    if (criteria.traits && criteria.traits.length > 0) {
      const matchingTraits = pet.traits?.filter((trait: string) => criteria.traits.includes(trait)).length || 0;
      factors.traits = (matchingTraits / criteria.traits.length) * 0.2;
    }
    
    // Age compatibility
    const age = this.calculateAge(pet.dateOfBirth);
    if (age >= 2 && age <= 7) {
      factors.age = 0.15;
    } else if (age >= 1 && age <= 10) {
      factors.age = 0.1;
    }
    
    // Size compatibility (if specified)
    // This would depend on your specific breeding requirements
    
    const total = Object.values(factors).reduce((sum, factor) => sum + factor, 0);
    
    return { total, factors };
  }

  private calculateDistance(pet: any, targetLocation: { latitude: number; longitude: number }): number {
    // This would use the pet's owner's location
    // For now, return a placeholder
    return 0;
  }

  private isCompatibleBreed(breed1: string, breed2: string): boolean {
    // Implement breed compatibility logic
    // For example, different breeds of the same species might be compatible
    return true;
  }

  private calculateAverageAge(pets: any[]): number {
    if (pets.length === 0) return 0;
    
    const totalAge = pets.reduce((sum, pet) => sum + this.calculateAge(pet.dateOfBirth), 0);
    return totalAge / pets.length;
  }

  private calculateOverallHealthScore(stats: any): number {
    // This would calculate health score based on vaccination and health check statistics
    return 0.8; // Placeholder
  }

  private async validatePetData(data: PetCreateInput, ownerId: string): Promise<void> {
    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      throw new PetValidationError('Pet name must be at least 2 characters long', 'name');
    }
    
    if (data.name.length > 50) {
      throw new PetValidationError('Pet name cannot exceed 50 characters', 'name');
    }
    
    // Species validation
    if (!data.species || data.species.trim().length === 0) {
      throw new PetValidationError('Species is required', 'species');
    }
    
    // Breed validation
    if (!data.breed || data.breed.trim().length < 2) {
      throw new PetValidationError('Breed must be at least 2 characters long', 'breed');
    }
    
    // Date of birth validation
    if (!data.dateOfBirth) {
      throw new PetValidationError('Date of birth is required', 'dateOfBirth');
    }
    
    const age = this.calculateAge(data.dateOfBirth);
    if (age < 0 || age > 30) {
      throw new PetValidationError('Invalid date of birth - pet age must be between 0 and 30 years', 'dateOfBirth');
    }
    
    // Weight validation
    if (data.weight && (data.weight < 0.1 || data.weight > 200)) {
      throw new PetValidationError('Weight must be between 0.1 and 200 kg', 'weight');
    }
  }

  private async validatePetUpdateData(data: PetUpdateInput, existingPet: any): Promise<void> {
    // Validate that breeding status can be changed
    if (data.breedingStatus && existingPet.breedingStatus === 'BREEDING') {
      throw new PetValidationError('Cannot change breeding status while pet is breeding');
    }
    
    // Validate weight if provided
    if (data.weight && (data.weight < 0.1 || data.weight > 200)) {
      throw new PetValidationError('Weight must be between 0.1 and 200 kg', 'weight');
    }
  }

  private validateVaccinationData(vaccination: any): void {
    if (!vaccination.name || vaccination.name.trim().length === 0) {
      throw new PetValidationError('Vaccination name is required');
    }
    
    if (!vaccination.date) {
      throw new PetValidationError('Vaccination date is required');
    }
    
    const date = new Date(vaccination.date);
    if (date > new Date()) {
      throw new PetValidationError('Vaccination date cannot be in the future');
    }
  }

  private validateHealthCheckData(healthData: any): void {
    if (!healthData.date) {
      throw new PetValidationError('Health check date is required');
    }
    
    if (!healthData.veterinarian || healthData.veterinarian.trim().length === 0) {
      throw new PetValidationError('Veterinarian name is required');
    }
    
    const date = new Date(healthData.date);
    if (date > new Date()) {
      throw new PetValidationError('Health check date cannot be in the future');
    }
    
    if (healthData.weight && (healthData.weight < 0.1 || healthData.weight > 200)) {
      throw new PetValidationError('Weight must be between 0.1 and 200 kg');
    }
  }

  private validateBreedingStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      'AVAILABLE': ['UNAVAILABLE', 'BREEDING', 'PENDING'],
      'UNAVAILABLE': ['AVAILABLE'],
      'BREEDING': ['AVAILABLE'],
      'PENDING': ['AVAILABLE', 'UNAVAILABLE'],
    };
    
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new PetValidationError(`Invalid breeding status transition from ${currentStatus} to ${newStatus}`);
    }
  }
}
