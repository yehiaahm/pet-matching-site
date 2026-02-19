import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AppError } from '../utils/errors.js';

/**
 * Create a health record for a pet
 * POST /api/health-records
 */
export const createHealthRecord = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      petId,
      recordType,
      recordDate,
      veterinarianName,
      clinicName,
      details,
      certificateUrl
    } = req.body;

    // Validate required fields
    if (!petId || !recordType || !recordDate || !veterinarianName) {
      throw new AppError('Missing required fields', 400);
    }

    // Verify pet ownership
    const pet = await prisma.pet.findUnique({
      where: { id: petId }
    });

    if (!pet) {
      throw new AppError('Pet not found', 404);
    }

    if (pet.ownerId !== userId) {
      throw new AppError('You can only create health records for your own pets', 403);
    }

    // Create health record
    const healthRecord = await prisma.healthRecord.create({
      data: {
        petId,
        recordType: recordType.toUpperCase(),
        recordDate: new Date(recordDate),
        veterinarianName,
        clinicName,
        details,
        certificateUrl
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true
          }
        }
      }
    });

    sendSuccess(res, healthRecord, 'Health record created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all health records for a pet
 * GET /api/health-records/pet/:petId
 */
export const getHealthRecordsByPet = async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { recordType } = req.query;

    // Verify pet exists
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { id: true, ownerId: true }
    });

    if (!pet) {
      throw new AppError('Pet not found', 404);
    }

    const whereConditions = { petId };

    // Filter by record type if provided
    if (recordType && recordType !== 'all') {
      whereConditions.recordType = recordType.toUpperCase();
    }

    const healthRecords = await prisma.healthRecord.findMany({
      where: whereConditions,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true
          }
        }
      },
      orderBy: { recordDate: 'desc' }
    });

    sendSuccess(res, healthRecords, 'Health records retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single health record by ID
 * GET /api/health-records/:id
 */
export const getHealthRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const healthRecord = await prisma.healthRecord.findUnique({
      where: { id },
      include: {
        pet: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!healthRecord) {
      throw new AppError('Health record not found', 404);
    }

    sendSuccess(res, healthRecord, 'Health record retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update a health record
 * PATCH /api/health-records/:id
 */
export const updateHealthRecord = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      recordType,
      recordDate,
      veterinarianName,
      clinicName,
      details,
      certificateUrl
    } = req.body;

    // Get health record with pet owner info
    const existingRecord = await prisma.healthRecord.findUnique({
      where: { id },
      include: { pet: true }
    });

    if (!existingRecord) {
      throw new AppError('Health record not found', 404);
    }

    // Verify ownership
    if (existingRecord.pet.ownerId !== userId) {
      throw new AppError('You can only update health records for your own pets', 403);
    }

    // Prepare update data
    const updateData = {};
    if (recordType) updateData.recordType = recordType.toUpperCase();
    if (recordDate) updateData.recordDate = new Date(recordDate);
    if (veterinarianName) updateData.veterinarianName = veterinarianName;
    if (clinicName !== undefined) updateData.clinicName = clinicName;
    if (details !== undefined) updateData.details = details;
    if (certificateUrl !== undefined) updateData.certificateUrl = certificateUrl;

    const updatedRecord = await prisma.healthRecord.update({
      where: { id },
      data: updateData,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true
          }
        }
      }
    });

    sendSuccess(res, updatedRecord, 'Health record updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a health record
 * DELETE /api/health-records/:id
 */
export const deleteHealthRecord = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get health record with pet owner info
    const existingRecord = await prisma.healthRecord.findUnique({
      where: { id },
      include: { pet: true }
    });

    if (!existingRecord) {
      throw new AppError('Health record not found', 404);
    }

    // Verify ownership
    if (existingRecord.pet.ownerId !== userId) {
      throw new AppError('You can only delete health records for your own pets', 403);
    }

    await prisma.healthRecord.delete({
      where: { id }
    });

    sendSuccess(res, null, 'Health record deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all health records for current user's pets
 * GET /api/health-records/my-pets
 */
export const getMyPetsHealthRecords = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { recordType } = req.query;

    // Get all user's pets
    const userPets = await prisma.pet.findMany({
      where: { ownerId: userId },
      select: { id: true }
    });

    const petIds = userPets.map(pet => pet.id);

    const whereConditions = {
      petId: { in: petIds }
    };

    // Filter by record type if provided
    if (recordType && recordType !== 'all') {
      whereConditions.recordType = recordType.toUpperCase();
    }

    const healthRecords = await prisma.healthRecord.findMany({
      where: whereConditions,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            images: true
          }
        }
      },
      orderBy: { recordDate: 'desc' }
    });

    sendSuccess(res, healthRecords, 'Health records retrieved successfully');
  } catch (error) {
    next(error);
  }
};
