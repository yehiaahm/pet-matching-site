import prisma from '../config/prisma.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { parsePagination, parseSort, parseFilters, buildWhereClause } from '../utils/queryHelpers.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * Get all pets with pagination and filters
 */
export const getAllPets = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req);
  const sort = parseSort(req, { createdAt: 'desc' });
  const filters = parseFilters(req, [
    'species',
    'breed',
    'gender',
    'size',
    'breedingStatus',
  ]);

  // Build where clause
  const where = buildWhereClause(filters);

  // Advanced filters
  if (req.query.breedingStatus) {
    where.breedingStatus = req.query.breedingStatus.toUpperCase();
  }

  if (req.query.minWeight) {
    where.weight = { ...where.weight, gte: parseFloat(req.query.minWeight) };
  }

  if (req.query.maxWeight) {
    where.weight = { ...where.weight, lte: parseFloat(req.query.maxWeight) };
  }

  if (req.query.minAge) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - parseInt(req.query.minAge));
    where.dateOfBirth = { ...where.dateOfBirth, lte: date };
  }

  if (req.query.maxAge) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - parseInt(req.query.maxAge));
    where.dateOfBirth = { ...where.dateOfBirth, gte: date };
  }

  if (req.query.city) {
    where.owner = {
      city: { contains: req.query.city, mode: 'insensitive' }
    };
  }

  if (req.query.hasPedigree !== undefined) {
    where.hasPedigree = req.query.hasPedigree === 'true';
  }

  if (req.query.isVaccinated !== undefined) {
    where.isVaccinated = req.query.isVaccinated === 'true';
  }

  // Ensure only published and active pets are shown (if fields exist)
  // For compatibility with existing data that may not have these fields set
  if (process.env.STRICT_PUBLISHED_ONLY === 'true') {
    where.isPublished = true;
    where.isActive = true;
  }

  // Search by name or breed
  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search, mode: 'insensitive' } },
      { breed: { contains: req.query.search, mode: 'insensitive' } },
      { species: { contains: req.query.search, mode: 'insensitive' } },
    ];
  }

  // Get pets
  const [pets, total] = await Promise.all([
    prisma.pets.findMany({
      where,
      skip,
      take: limit,
      orderBy: sort,
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            city: true,
            country: true,
            avatar: true,
            rating: true,
          },
        },
      },
    }),
    prisma.pets.count({ where }),
  ]);

  sendPaginated(res, 200, 'Pets retrieved successfully', pets, {
    page,
    limit,
    total,
  });
});

/**
 * Get single pet by ID
 */
export const getPetById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const pet = await prisma.pets.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          city: true,
          country: true,
        },
      },
      reviews: {
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!pet) {
    return next(new NotFoundError('Pet not found'));
  }

  sendSuccess(res, 200, 'Pet retrieved successfully', { pet });
});

/**
 * Create new pet
 */
export const createPet = catchAsync(async (req, res, next) => {
  const {
    name,
    breed,
    species,
    gender,
    age,
    color,
    weight,
    description,
    images,
    videos,
    isVaccinated,
    isNeutered,
    healthConditions,
    breedingStatus,
    breedingPrice,
    hasPedigree,
    pedigreeNumber,
  } = req.body;

  const parsedAge = age !== undefined ? Number(age) : null;
  const parsedWeight = weight !== undefined && weight !== null ? Number(weight) : null;
  const parsedBreedingPrice = breedingPrice !== undefined && breedingPrice !== null ? Number(breedingPrice) : null;

  if (Number.isNaN(parsedAge)) return next(new AppError('Invalid age value', 400));
  if (Number.isNaN(parsedWeight)) return next(new AppError('Invalid weight value', 400));
  if (Number.isNaN(parsedBreedingPrice)) return next(new AppError('Invalid breeding price value', 400));

  // Calculate dateOfBirth from age (in months)
  let dateOfBirth = null;
  if (parsedAge !== null) {
    dateOfBirth = new Date();
    dateOfBirth.setMonth(dateOfBirth.getMonth() - parsedAge);
  }

  // Support for guest users (no authentication)
  // If no user is logged in, create a default guest user or use a system user
  let userId = req.user?.id;
  
  if (!userId) {
    // Find or create a guest user
    let guestUser = await prisma.users.findFirst({
      where: { email: 'guest@petmat.com' }
    });
    
    if (!guestUser) {
      guestUser = await prisma.users.create({
        data: {
          email: 'guest@petmat.com',
          firstName: 'Guest',
          lastName: 'User',
          password: 'N/A', // Guest user has no password
          role: 'USER',
          isActive: true,
        }
      });
      logger.info('Created guest user for pet creation');
    }
    
    userId = guestUser.id;
  }

  const pet = await prisma.pets.create({
    data: {
      name,
      breed,
      species,
      gender,
      dateOfBirth: dateOfBirth,
      color,
      weight: parsedWeight,
      description,
      images: images || [],
      videos: videos || [],
      isVaccinated: isVaccinated === true || isVaccinated === 'true',
      isNeutered: isNeutered === true || isNeutered === 'true',
      healthConditions,
      breedingStatus: breedingStatus || undefined,
      breedingPrice: parsedBreedingPrice,
      hasPedigree: hasPedigree === true || hasPedigree === 'true',
      pedigreeNumber,
      ownerId: userId,
      isPublished: true,
      isActive: true,
    },
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  logger.info(`New pet created: ${pet.name} by user ${req.user?.email || 'guest'}`);

  sendSuccess(res, 201, 'Pet created successfully', { pet });
});

/**
 * Update pet
 */
export const updatePet = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    breed,
    species,
    gender,
    age,
    size,
    color,
    weight,
    description,
    images,
    isVaccinated,
    isNeutered,
    healthConditions,
    isAvailableForBreeding,
    breedingPrice,
    hasPedigree,
    pedigreeNumber,
  } = req.body;

  // Check if pet exists and user owns it
  const existingPet = await prisma.pet.findUnique({
    where: { id },
  });

  if (!existingPet) {
    return next(new NotFoundError('Pet not found'));
  }

  if (existingPet.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new AppError('You do not have permission to update this pet', 403));
  }

  // Update pet
  const pet = await prisma.pet.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(breed && { breed }),
      ...(species && { species }),
      ...(gender && { gender }),
      ...(age && { age: parseInt(age, 10) }),
      ...(size && { size }),
      ...(color && { color }),
      ...(weight && { weight: parseFloat(weight) }),
      ...(description && { description }),
      ...(images && { images }),
      ...(isVaccinated !== undefined && { isVaccinated: isVaccinated === true || isVaccinated === 'true' }),
      ...(isNeutered !== undefined && { isNeutered: isNeutered === true || isNeutered === 'true' }),
      ...(healthConditions && { healthConditions }),
      ...(isAvailableForBreeding !== undefined && { isAvailableForBreeding: isAvailableForBreeding === true || isAvailableForBreeding === 'true' }),
      ...(breedingPrice && { breedingPrice: parseFloat(breedingPrice) }),
      ...(hasPedigree !== undefined && { hasPedigree: hasPedigree === true || hasPedigree === 'true' }),
      ...(pedigreeNumber && { pedigreeNumber }),
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  logger.info(`Pet updated: ${pet.name} by user ${req.user.email}`);

  sendSuccess(res, 200, 'Pet updated successfully', { pet });
});

/**
 * Delete pet
 */
export const deletePet = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Check if pet exists and user owns it
  const pet = await prisma.pet.findUnique({
    where: { id },
  });

  if (!pet) {
    return next(new NotFoundError('Pet not found'));
  }

  if (pet.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new AppError('You do not have permission to delete this pet', 403));
  }

  // Delete pet
  await prisma.pet.delete({
    where: { id },
  });

  logger.info(`Pet deleted: ${pet.name} by user ${req.user.email}`);

  sendSuccess(res, 200, 'Pet deleted successfully', null);
});

/**
 * Get user's pets
 */
export const getUserPets = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req);

  const [pets, total] = await Promise.all([
    prisma.pet.findMany({
      where: { userId: req.user.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pet.count({ where: { userId: req.user.id } }),
  ]);

  sendPaginated(res, 200, 'User pets retrieved successfully', pets, {
    page,
    limit,
    total,
  });
});
