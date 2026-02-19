/**
 * Pet Controller
 * Handles HTTP requests and responses for pet operations
 */

import { Request, Response, NextFunction } from 'express';
import { IPetService } from '../services/pet.service';
import { PetCreateInput, PetUpdateInput, PetFilters } from '../types/pet.types';
import { validatePetCreation, validatePetUpdate } from '../validators/pet.validator';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.util';
import { logger } from '../utils/logger.util';

export interface IPetController {
  createPet(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPetById(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserPets(req: Request, res: Response, next: NextFunction): Promise<void>;
  updatePet(req: Request, res: Response, next: NextFunction): Promise<void>;
  deletePet(req: Request, res: Response, next: NextFunction): Promise<void>;
  searchPets(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAvailablePets(req: Request, res: Response, next: NextFunction): Promise<void>;
  addVaccination(req: Request, res: Response, next: NextFunction): Promise<void>;
  addHealthCheck(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPetStats(req: Request, res: Response, next: NextFunction): Promise<void>;
  findMatchingPets(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateBreedingStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export class PetController implements IPetController {
  constructor(private petService: IPetService) {}

  /**
   * Create a new pet
   * POST /api/v1/pets
   */
  async createPet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Creating pet request', { userId: req.user?.id });

      // Validate request body
      const validatedData = await validatePetCreation(req.body);

      // Create pet
      const pet = await this.petService.createPet(validatedData, req.user!.id);

      sendSuccess(res, 201, {
        message: 'Pet created successfully',
        data: pet,
      });
    } catch (error) {
      logger.error('Error creating pet', { error: error.message, userId: req.user?.id });
      next(error);
    }
  }

  /**
   * Get pet by ID
   * GET /api/v1/pets/:id
   */
  async getPetById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Fetching pet by ID', { petId: id, userId: req.user?.id });

      const pet = await this.petService.getPetById(id);

      sendSuccess(res, 200, {
        message: 'Pet retrieved successfully',
        data: pet,
      });
    } catch (error) {
      logger.error('Error fetching pet', { error: error.message, petId: req.params.id });
      next(error);
    }
  }

  /**
   * Get user's pets
   * GET /api/v1/pets/my-pets
   */
  async getUserPets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      logger.info('Fetching user pets', { userId: req.user?.id, page, limit });

      const options = {
        page: Number(page),
        limit: Number(limit),
      };

      const result = await this.petService.getUserPets(req.user!.id, options);

      if (options.page && options.limit) {
        sendPaginated(res, result);
      } else {
        sendSuccess(res, 200, {
          message: 'User pets retrieved successfully',
          data: result,
        });
      }
    } catch (error) {
      logger.error('Error fetching user pets', { error: error.message, userId: req.user?.id });
      next(error);
    }
  }

  /**
   * Update pet
   * PUT /api/v1/pets/:id
   */
  async updatePet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Updating pet', { petId: id, userId: req.user?.id });

      // Validate request body
      const validatedData = await validatePetUpdate(req.body);

      const updatedPet = await this.petService.updatePet(id, validatedData, req.user!.id);

      sendSuccess(res, 200, {
        message: 'Pet updated successfully',
        data: updatedPet,
      });
    } catch (error) {
      logger.error('Error updating pet', { error: error.message, petId: req.params.id, userId: req.user?.id });
      next(error);
    }
  }

  /**
   * Delete pet
   * DELETE /api/v1/pets/:id
   */
  async deletePet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Deleting pet', { petId: id, userId: req.user?.id });

      await this.petService.deletePet(id, req.user!.id);

      sendSuccess(res, 200, {
        message: 'Pet deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting pet', { error: error.message, petId: req.params.id, userId: req.user?.id });
      next(error);
    }
  }

  /**
   * Search pets
   * GET /api/v1/pets/search
   */
  async searchPets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: query, ...filters } = req.query;
      
      if (!query) {
        return sendError(res, 400, 'Search query is required');
      }

      logger.info('Searching pets', { query, filters, userId: req.user?.id });

      const pets = await this.petService.searchPets(query as string, filters as PetFilters);

      sendSuccess(res, 200, {
        message: 'Pets found successfully',
        data: pets,
        count: pets.length,
      });
    } catch (error) {
      logger.error('Error searching pets', { error: error.message, query: req.query.q });
      next(error);
    }
  }

  /**
   * Get available pets for breeding
   * GET /api/v1/pets/available
   */
  async getAvailablePets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query as PetFilters;
      
      logger.info('Fetching available pets', { filters, userId: req.user?.id });

      const pets = await this.petService.findPetsForBreeding(filters);

      sendSuccess(res, 200, {
        message: 'Available pets retrieved successfully',
        data: pets,
        count: pets.length,
      });
    } catch (error) {
      logger.error('Error fetching available pets', { error: error.message });
      next(error);
    }
  }

  /**
   * Add vaccination to pet
   * POST /api/v1/pets/:id/vaccinations
   */
  async addVaccination(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const vaccinationData = req.body;
      
      logger.info('Adding vaccination', { petId: id, userId: req.user?.id });

      const updatedPet = await this.petService.addVaccination(id, vaccinationData, req.user!.id);

      sendSuccess(res, 201, {
        message: 'Vaccination added successfully',
        data: updatedPet,
      });
    } catch (error) {
      logger.error('Error adding vaccination', { error: error.message, petId: req.params.id, userId: req.user?.id });
      next(error);
    }
  }

  /**
   * Add health check to pet
   * POST /api/v1/pets/:id/health-checks
   */
  async addHealthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const healthData = req.body;
      
      logger.info('Adding health check', { petId: id, userId: req.user?.id });

      const updatedPet = await this.petService.addHealthCheck(id, healthData, req.user!.id);

      sendSuccess(res, 201, {
        message: 'Health check added successfully',
        data: updatedPet,
      });
    } catch (error) {
      logger.error('Error adding health check', { error: error.message, petId: req.params.id, userId: req.user?.id });
      next(error);
    }
  }

  /**
   * Get pet statistics
   * GET /api/v1/pets/stats
   */
  async getPetStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching pet statistics');

      const stats = await this.petService.getPetStats();

      sendSuccess(res, 200, {
        message: 'Pet statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      logger.error('Error fetching pet stats', { error: error.message });
      next(error);
    }
  }

  /**
   * Find matching pets for breeding
   * POST /api/v1/pets/match
   */
  async findMatchingPets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const criteria = req.body;
      
      logger.info('Finding matching pets', { criteria, userId: req.user?.id });

      const matches = await this.petService.findMatchingPets(criteria);

      sendSuccess(res, 200, {
        message: 'Matching pets found successfully',
        data: matches,
        count: matches.length,
      });
    } catch (error) {
      logger.error('Error finding matching pets', { error: error.message });
      next(error);
    }
  }

  /**
   * Update breeding status
   * PATCH /api/v1/pets/:id/breeding-status
   */
  async updateBreedingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return sendError(res, 400, 'Breeding status is required');
      }

      logger.info('Updating breeding status', { petId: id, status, userId: req.user?.id });

      const updatedPet = await this.petService.updateBreedingStatus(id, status, req.user!.id);

      sendSuccess(res, 200, {
        message: 'Breeding status updated successfully',
        data: updatedPet,
      });
    } catch (error) {
      logger.error('Error updating breeding status', { error: error.message, petId: req.params.id, userId: req.user?.id });
      next(error);
    }
  }
}

// Factory function for creating pet controller
export function createPetController(petService: IPetService): IPetController {
  return new PetController(petService);
}
