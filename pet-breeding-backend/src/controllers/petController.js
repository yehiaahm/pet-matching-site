const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');
const { z } = require('zod');

const prisma = new PrismaClient();

class PetController {
  /**
   * Validation schemas
   */
  createPetSchema = z.object({
    name: z.string().min(1, 'Pet name is required'),
    species: z.enum(['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER']),
    breed: z.string().min(1, 'Breed is required'),
    gender: z.enum(['MALE', 'FEMALE']),
    age: z.number().min(0).max(50, 'Age must be between 0 and 50'),
    weight: z.number().positive().optional(),
    description: z.string().optional(),
    status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'PENDING', 'RETIRED']).default('AVAILABLE'),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
      address: z.string()
    }).optional(),
    vaccinated: z.boolean().default(false),
    healthCertified: z.boolean().default(false),
    price: z.number().positive().optional(),
    birthDate: z.string().datetime().optional(),
    registrationNo: z.string().optional(),
    microchipNo: z.string().optional()
  });

  updatePetSchema = z.object({
    name: z.string().min(1).optional(),
    species: z.enum(['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER']).optional(),
    breed: z.string().min(1).optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    age: z.number().min(0).max(50).optional(),
    weight: z.number().positive().optional(),
    description: z.string().optional(),
    status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'PENDING', 'RETIRED']).optional(),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
      address: z.string()
    }).optional(),
    vaccinated: z.boolean().optional(),
    healthCertified: z.boolean().optional(),
    price: z.number().positive().optional(),
    birthDate: z.string().datetime().optional(),
    registrationNo: z.string().optional(),
    microchipNo: z.string().optional()
  });

  /**
   * Create a new pet
   */
  async createPet(req, res) {
    try {
      const validatedData = this.createPetSchema.parse(req.body);
      
      const pet = await prisma.pet.create({
        data: {
          ...validatedData,
          ownerId: req.user.id,
          birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true
            }
          },
          photos: true,
          healthRecords: true
        }
      });

      logger.info(`Pet created: ${pet.name} by user: ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Pet created successfully',
        data: { pet }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
          error: 'VALIDATION_ERROR'
        });
      }

      logger.error('Create pet error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create pet',
        error: 'CREATE_PET_FAILED'
      });
    }
  }

  /**
   * Get all pets with filtering and pagination
   */
  async getAllPets(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        species,
        breed,
        gender,
        status,
        minAge,
        maxAge,
        minPrice,
        maxPrice,
        vaccinated,
        healthCertified,
        location,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Build where clause
      const where = {};

      if (species) where.species = species;
      if (breed) where.breed = { contains: breed, mode: 'insensitive' };
      if (gender) where.gender = gender;
      if (status) where.status = status;
      if (vaccinated !== undefined) where.vaccinated = vaccinated === 'true';
      if (healthCertified !== undefined) where.healthCertified = healthCertified === 'true';

      if (minAge || maxAge) {
        where.age = {};
        if (minAge) where.age.gte = parseInt(minAge);
        if (maxAge) where.age.lte = parseInt(maxAge);
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { breed: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Build order clause
      const orderBy = {};
      orderBy[sortBy] = sortOrder;

      const [pets, total] = await Promise.all([
        prisma.pet.findMany({
          where,
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
                phone: true
              }
            },
            photos: {
              where: { isMain: true },
              take: 1
            },
            _count: {
              select: {
                breedingRequests: true,
                reviews: true
              }
            }
          },
          orderBy,
          skip,
          take
        }),
        prisma.pet.count({ where })
      ]);

      res.status(200).json({
        success: true,
        data: {
          pets,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Get all pets error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get pets',
        error: 'GET_PETS_FAILED'
      });
    }
  }

  /**
   * Get pet by ID
   */
  async getPetById(req, res) {
    try {
      const { id } = req.params;

      const pet = await prisma.pet.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              phone: true
            }
          },
          photos: {
            orderBy: { isMain: 'desc' }
          },
          healthRecords: {
            orderBy: { examinationDate: 'desc' }
          },
          breedingRequests: {
            include: {
              initiator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true
                }
              },
              initiatorPet: {
                select: {
                  id: true,
                  name: true,
                  species: true,
                  breed: true,
                  photos: {
                    where: { isMain: true },
                    take: 1
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          reviews: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found',
          error: 'PET_NOT_FOUND'
        });
      }

      res.status(200).json({
        success: true,
        data: { pet }
      });
    } catch (error) {
      logger.error('Get pet by ID error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get pet',
        error: 'GET_PET_FAILED'
      });
    }
  }

  /**
   * Update pet
   */
  async updatePet(req, res) {
    try {
      const { id } = req.params;
      const validatedData = this.updatePetSchema.parse(req.body);

      // Check if pet exists and belongs to user
      const existingPet = await prisma.pet.findUnique({
        where: { id }
      });

      if (!existingPet) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found',
          error: 'PET_NOT_FOUND'
        });
      }

      if (existingPet.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this pet',
          error: 'NOT_AUTHORIZED'
        });
      }

      const updatedPet = await prisma.pet.update({
        where: { id },
        data: {
          ...validatedData,
          birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true
            }
          },
          photos: true,
          healthRecords: true
        }
      });

      logger.info(`Pet updated: ${updatedPet.name} by user: ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Pet updated successfully',
        data: { pet: updatedPet }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
          error: 'VALIDATION_ERROR'
        });
      }

      logger.error('Update pet error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update pet',
        error: 'UPDATE_PET_FAILED'
      });
    }
  }

  /**
   * Delete pet
   */
  async deletePet(req, res) {
    try {
      const { id } = req.params;

      // Check if pet exists and belongs to user
      const existingPet = await prisma.pet.findUnique({
        where: { id }
      });

      if (!existingPet) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found',
          error: 'PET_NOT_FOUND'
        });
      }

      if (existingPet.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this pet',
          error: 'NOT_AUTHORIZED'
        });
      }

      await prisma.pet.delete({
        where: { id }
      });

      logger.info(`Pet deleted: ${existingPet.name} by user: ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Pet deleted successfully'
      });
    } catch (error) {
      logger.error('Delete pet error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete pet',
        error: 'DELETE_PET_FAILED'
      });
    }
  }

  /**
   * Get user's pets
   */
  async getUserPets(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where = { ownerId: req.user.id };
      if (status) where.status = status;

      const [pets, total] = await Promise.all([
        prisma.pet.findMany({
          where,
          include: {
            photos: {
              where: { isMain: true },
              take: 1
            },
            healthRecords: true,
            _count: {
              select: {
                breedingRequests: true,
                reviews: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.pet.count({ where })
      ]);

      res.status(200).json({
        success: true,
        data: {
          pets,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Get user pets error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user pets',
        error: 'GET_USER_PETS_FAILED'
      });
    }
  }

  /**
   * Upload pet photo
   */
  async uploadPetPhoto(req, res) {
    try {
      const { id } = req.params;
      const { isMain = false } = req.body;

      // Check if pet exists and belongs to user
      const pet = await prisma.pet.findUnique({
        where: { id }
      });

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found',
          error: 'PET_NOT_FOUND'
        });
      }

      if (pet.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to upload photos for this pet',
          error: 'NOT_AUTHORIZED'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          error: 'NO_FILE'
        });
      }

      // If setting as main photo, unset other main photos
      if (isMain === 'true') {
        await prisma.petPhoto.updateMany({
          where: { petId: id },
          data: { isMain: false }
        });
      }

      // Create photo record
      const photo = await prisma.petPhoto.create({
        data: {
          petId: id,
          url: `/uploads/pets/${req.file.filename}`,
          isMain: isMain === 'true'
        }
      });

      logger.info(`Pet photo uploaded: ${photo.url} for pet: ${pet.name}`);

      res.status(201).json({
        success: true,
        message: 'Photo uploaded successfully',
        data: { photo }
      });
    } catch (error) {
      logger.error('Upload pet photo error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload photo',
        error: 'UPLOAD_PHOTO_FAILED'
      });
    }
  }

  /**
   * Delete pet photo
   */
  async deletePetPhoto(req, res) {
    try {
      const { id, photoId } = req.params;

      // Check if pet exists and belongs to user
      const pet = await prisma.pet.findUnique({
        where: { id }
      });

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found',
          error: 'PET_NOT_FOUND'
        });
      }

      if (pet.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete photos for this pet',
          error: 'NOT_AUTHORIZED'
        });
      }

      const photo = await prisma.petPhoto.findUnique({
        where: { id: photoId }
      });

      if (!photo || photo.petId !== id) {
        return res.status(404).json({
          success: false,
          message: 'Photo not found',
          error: 'PHOTO_NOT_FOUND'
        });
      }

      await prisma.petPhoto.delete({
        where: { id: photoId }
      });

      logger.info(`Pet photo deleted: ${photo.url} for pet: ${pet.name}`);

      res.status(200).json({
        success: true,
        message: 'Photo deleted successfully'
      });
    } catch (error) {
      logger.error('Delete pet photo error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete photo',
        error: 'DELETE_PHOTO_FAILED'
      });
    }
  }
}

module.exports = new PetController();
