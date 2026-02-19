/**
 * Pet Controller - Production Ready with Prisma
 * Handles all pet operations with user authentication
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * @desc    Create a new pet
 * @route   POST /api/pets
 * @access  Private
 */
const createPet = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const {
      name,
      type,
      breed,
      age,
      gender,
      description,
      image,
      vaccinations,
      healthCheck
    } = req.body;

    // Validation
    if (!name || !type || !breed || !age || !gender) {
      return res.status(400).json({
        success: false,
        error: 'Name, type, breed, age, and gender are required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate pet type
    const validTypes = ['DOG', 'CAT', 'BIRD'];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pet type. Must be DOG, CAT, or BIRD',
        timestamp: new Date().toISOString()
      });
    }

    // Validate gender
    const validGenders = ['MALE', 'FEMALE'];
    if (!validGenders.includes(gender.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid gender. Must be MALE or FEMALE',
        timestamp: new Date().toISOString()
      });
    }

    // Create pet with owner relation
    const newPet = await prisma.pet.create({
      data: {
        name: name.trim(),
        type: type.toUpperCase(),
        breed: breed.trim(),
        age: parseInt(age),
        gender: gender.toUpperCase(),
        description: description ? description.trim() : null,
        image: image ? image.trim() : null,
        ownerId: userId,
        verified: false, // New pets need admin verification
        status: 'AVAILABLE',
        vaccinations: vaccinations ? {
          create: vaccinations.map(vacc => ({
            name: vacc.name.trim(),
            date: new Date(vacc.date),
            nextDue: vacc.nextDue ? new Date(vacc.nextDue) : null
          }))
        } : undefined,
        healthChecks: healthCheck ? {
          create: {
            date: new Date(healthCheck.date),
            veterinarian: healthCheck.veterinarian.trim(),
            notes: healthCheck.notes ? healthCheck.notes.trim() : null
          }
        } : undefined
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        vaccinations: true,
        healthChecks: true
      }
    });

    console.log(`✅ New pet created: ${newPet.name} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: { pet: newPet },
      message: 'Pet created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Create pet error:', error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Pet with this name already exists for this user',
        timestamp: new Date().toISOString()
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error while creating pet',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get all pets (public)
 * @route   GET /api/pets
 * @access  Public
 */
const getAllPets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      breed,
      gender,
      ageMin,
      ageMax,
      verified = true,
      status = 'AVAILABLE',
      search
    } = req.query;

    // Build filter object
    const where = {
      verified: verified === 'true',
      status: status.toUpperCase()
    };

    // Add filters
    if (type) {
      where.type = type.toUpperCase();
    }
    if (breed) {
      where.breed = {
        contains: breed,
        mode: 'insensitive'
      };
    }
    if (gender) {
      where.gender = gender.toUpperCase();
    }
    if (ageMin || ageMax) {
      where.age = {};
      if (ageMin) where.age.gte = parseInt(ageMin);
      if (ageMax) where.age.lte = parseInt(ageMax);
    }
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          breed: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Get pets with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [pets, totalCount] = await Promise.all([
      prisma.pet.findMany({
        where,
        skip,
        take,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          vaccinations: true,
          healthChecks: {
            orderBy: { date: 'desc' },
            take: 1 // Only latest health check
          },
          _count: {
            select: {
              breedingRequests: true,
              matches: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pet.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.status(200).json({
      success: true,
      data: {
        pets,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get pets error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching pets',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get user's pets
 * @route   GET /api/pets/my-pets
 * @access  Private
 */
const getMyPets = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, status } = req.query;

    const where = {
      ownerId: userId
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [pets, totalCount] = await Promise.all([
      prisma.pet.findMany({
        where,
        skip,
        take,
        include: {
          vaccinations: true,
          healthChecks: {
            orderBy: { date: 'desc' },
            take: 1
          },
          _count: {
            select: {
              breedingRequests: true,
              matches: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pet.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.status(200).json({
      success: true,
      data: {
        pets,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get my pets error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching your pets',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get pet by ID
 * @route   GET /api/pets/:id
 * @access  Public
 */
const getPetById = async (req, res) => {
  try {
    const { id } = req.params;

    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        vaccinations: true,
        healthChecks: {
          orderBy: { date: 'desc' }
        },
        _count: {
          select: {
            breedingRequests: true,
            matches: true
          }
        }
      }
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'Pet not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      data: { pet },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get pet by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching pet',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Update pet
 * @route   PUT /api/pets/:id
 * @access  Private (owner only)
 */
const updatePet = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      name,
      type,
      breed,
      age,
      gender,
      description,
      image,
      status
    } = req.body;

    // Check if pet exists and belongs to user
    const existingPet = await prisma.pet.findUnique({
      where: { id },
      select: { ownerId: true }
    });

    if (!existingPet) {
      return res.status(404).json({
        success: false,
        error: 'Pet not found',
        timestamp: new Date().toISOString()
      });
    }

    if (existingPet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own pets',
        timestamp: new Date().toISOString()
      });
    }

    // Build update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (type) updateData.type = type.toUpperCase();
    if (breed) updateData.breed = breed.trim();
    if (age) updateData.age = parseInt(age);
    if (gender) updateData.gender = gender.toUpperCase();
    if (description !== undefined) updateData.description = description.trim() || null;
    if (image !== undefined) updateData.image = image.trim() || null;
    if (status) updateData.status = status.toUpperCase();

    const updatedPet = await prisma.pet.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        vaccinations: true,
        healthChecks: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });

    console.log(`✅ Pet updated: ${updatedPet.name} by user ${userId}`);

    res.status(200).json({
      success: true,
      data: { pet: updatedPet },
      message: 'Pet updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Update pet error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating pet',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Delete pet
 * @route   DELETE /api/pets/:id
 * @access  Private (owner only)
 */
const deletePet = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if pet exists and belongs to user
    const existingPet = await prisma.pet.findUnique({
      where: { id },
      select: { ownerId: true, name: true }
    });

    if (!existingPet) {
      return res.status(404).json({
        success: false,
        error: 'Pet not found',
        timestamp: new Date().toISOString()
      });
    }

    if (existingPet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own pets',
        timestamp: new Date().toISOString()
      });
    }

    await prisma.pet.delete({
      where: { id }
    });

    console.log(`🗑️ Pet deleted: ${existingPet.name} by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Pet deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Delete pet error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting pet',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  createPet,
  getAllPets,
  getMyPets,
  getPetById,
  updatePet,
  deletePet
};
