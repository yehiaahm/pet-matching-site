/**
 * Pet Repository
 * Handles all pet-related database operations
 */

import { PrismaClient, Pet, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { PetCreateInput, PetUpdateInput, PetFilters } from '../types/pet.types';

export interface IPetRepository extends BaseRepository<Pet, string> {
  findByOwner(ownerId: string): Promise<Pet[]>;
  findByBreed(breed: string): Promise<Pet[]>;
  findBySpecies(species: string): Promise<Pet[]>;
  findAvailableForBreeding(filters: PetFilters): Promise<Pet[]>;
  updateHealthRecord(petId: string, healthData: any): Promise<Pet>;
  addVaccination(petId: string, vaccination: any): Promise<Pet>;
  searchPets(query: string, filters?: PetFilters): Promise<Pet[]>;
  getPetStats(): Promise<any>;
}

export class PetRepository extends BaseRepository<Pet, string> implements IPetRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, prisma.pet);
  }

  async findByOwner(ownerId: string): Promise<Pet[]> {
    return await this.model.findMany({
      where: { ownerId },
      include: {
        vaccinations: true,
        healthChecks: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByBreed(breed: string): Promise<Pet[]> {
    return await this.model.findMany({
      where: { breed: { contains: breed, mode: 'insensitive' } },
      include: {
        owner: true,
        images: true,
      },
    });
  }

  async findBySpecies(species: string): Promise<Pet[]> {
    return await this.model.findMany({
      where: { species: { equals: species, mode: 'insensitive' } },
      include: {
        owner: true,
        images: true,
      },
    });
  }

  async findAvailableForBreeding(filters: PetFilters): Promise<Pet[]> {
    const where: Prisma.PetWhereInput = {
      breedingStatus: 'AVAILABLE',
      ...filters,
    };

    // Add age filter if specified
    if (filters.minAge || filters.maxAge) {
      where.dateOfBirth = {};
      if (filters.minAge) {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - filters.maxAge);
        where.dateOfBirth.lte = minDate;
      }
      if (filters.maxAge) {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - filters.minAge);
        where.dateOfBirth.gte = maxDate;
      }
    }

    return await this.model.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
            rating: true,
            verified: true,
          },
        },
        vaccinations: true,
        healthChecks: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateHealthRecord(petId: string, healthData: any): Promise<Pet> {
    return await this.model.update({
      where: { id: petId },
      data: {
        healthChecks: {
          create: {
            date: healthData.date,
            veterinarian: healthData.veterinarian,
            weight: healthData.weight,
            temperature: healthData.temperature,
            heartRate: healthData.heartRate,
            notes: healthData.notes,
          },
        },
      },
      include: {
        healthChecks: true,
        vaccinations: true,
      },
    });
  }

  async addVaccination(petId: string, vaccination: any): Promise<Pet> {
    return await this.model.update({
      where: { id: petId },
      data: {
        vaccinations: {
          create: {
            name: vaccination.name,
            date: vaccination.date,
            nextDue: vaccination.nextDue,
            veterinarian: vaccination.veterinarian,
            batchNumber: vaccination.batchNumber,
            notes: vaccination.notes,
          },
        },
      },
      include: {
        vaccinations: true,
        healthChecks: true,
      },
    });
  }

  async searchPets(query: string, filters?: PetFilters): Promise<Pet[]> {
    const where: Prisma.PetWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { breed: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { owner: { name: { contains: query, mode: 'insensitive' } } },
      ],
      ...filters,
    };

    return await this.model.findMany({
      where,
      include: {
        owner: true,
        images: true,
        vaccinations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPetStats(): Promise<any> {
    const [
      totalPets,
      speciesStats,
      breedStats,
      genderStats,
      recentlyAdded,
    ] = await Promise.all([
      this.model.count(),
      this.model.groupBy({
        by: ['species'],
        _count: true,
      }),
      this.model.groupBy({
        by: ['breed'],
        _count: true,
        orderBy: { _count: { breed: 'desc' } },
        take: 10,
      }),
      this.model.groupBy({
        by: ['gender'],
        _count: true,
      }),
      this.model.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { owner: true },
      }),
    ]);

    return {
      total: totalPets,
      species: speciesStats,
      topBreeds: breedStats,
      gender: genderStats,
      recentlyAdded,
    };
  }

  // Enhanced find with relationships
  async findByIdWithRelations(id: string): Promise<Pet | null> {
    return await this.model.findUnique({
      where: { id },
      include: {
        owner: true,
        vaccinations: {
          orderBy: { date: 'desc' },
        },
        healthChecks: {
          orderBy: { date: 'desc' },
        },
        images: {
          orderBy: { isPrimary: 'desc' },
        },
        breedingRequests: {
          where: { status: 'PENDING' },
          include: { requester: true },
        },
      },
    });
  }

  // Advanced filtering
  async findWithAdvancedFilters(filters: PetFilters & {
    location?: {
      latitude: number;
      longitude: number;
      radius: number; // in kilometers
    };
    priceRange?: {
      min?: number;
      max?: number;
    };
    traits?: string[];
  }): Promise<Pet[]> {
    const where: Prisma.PetWhereInput = {};

    // Basic filters
    if (filters.species) where.species = filters.species;
    if (filters.breed) where.breed = { contains: filters.breed, mode: 'insensitive' };
    if (filters.gender) where.gender = filters.gender;
    if (filters.size) where.size = filters.size;
    if (filters.breedingStatus) where.breedingStatus = filters.breedingStatus;

    // Location filter (would require raw SQL for distance calculation)
    if (filters.location) {
      // This would typically use raw SQL or a database-specific function
      // For now, we'll filter by city/region
      where.OR = [
        { owner: { location: { city: filters.location } } },
        { owner: { location: { region: filters.location } } },
      ];
    }

    // Price range filter
    if (filters.priceRange) {
      where.breedingPrice = {};
      if (filters.priceRange.min) {
        where.breedingPrice.gte = filters.priceRange.min;
      }
      if (filters.priceRange.max) {
        where.breedingPrice.lte = filters.priceRange.max;
      }
    }

    // Traits filter
    if (filters.traits && filters.traits.length > 0) {
      where.traits = {
        hasSome: filters.traits,
      };
    }

    return await this.model.findMany({
      where,
      include: {
        owner: true,
        images: true,
        vaccinations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
