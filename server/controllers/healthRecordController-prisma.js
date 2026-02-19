/**
 * Health Records Controller - Production Ready
 * Complete CRUD operations for pet health records
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * @desc    Create health record for pet
 * @route   POST /api/health-records
 * @access  Private (pet owner only)
 */
const createHealthRecord = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      petId,
      type,
      title,
      description,
      veterinarian,
      clinic,
      date,
      nextDue,
      attachments,
      medications,
      notes
    } = req.body;

    // Validation
    if (!petId || !type || !title || !veterinarian || !date) {
      return res.status(400).json({
        success: false,
        error: 'Pet ID, type, title, veterinarian, and date are required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if pet belongs to user
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { ownerId: true }
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'Pet not found',
        timestamp: new Date().toISOString()
      });
    }

    if (pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only add health records to your own pets',
        timestamp: new Date().toISOString()
      });
    }

    // Validate health record type
    const validTypes = ['CHECKUP', 'VACCINATION', 'SURGERY', 'MEDICATION', 'EMERGENCY', 'OTHER'];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be CHECKUP, VACCINATION, SURGERY, MEDICATION, EMERGENCY, or OTHER',
        timestamp: new Date().toISOString()
      });
    }

    // Create health record
    const healthRecord = await prisma.healthRecord.create({
      data: {
        petId,
        type: type.toUpperCase(),
        title: title.trim(),
        description: description ? description.trim() : null,
        veterinarian: veterinarian.trim(),
        clinic: clinic ? clinic.trim() : null,
        date: new Date(date),
        nextDue: nextDue ? new Date(nextDue) : null,
        notes: notes ? notes.trim() : null,
        attachments: attachments || [],
        medications: medications || []
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            type: true,
            breed: true
          }
        }
      }
    });

    console.log(`✅ Health record created: ${healthRecord.title} for pet ${petId} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: { healthRecord },
      message: 'Health record created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Create health record error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while creating health record',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get all health records for a pet
 * @route   GET /api/health-records/pet/:petId
 * @access  Private (pet owner only)
 */
const getPetHealthRecords = async (req, res) => {
  try {
    const userId = req.userId;
    const { petId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    // Check if pet belongs to user
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { ownerId: true }
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'Pet not found',
        timestamp: new Date().toISOString()
      });
    }

    if (pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only view health records for your own pets',
        timestamp: new Date().toISOString()
      });
    }

    // Build filter
    const where = { petId };
    if (type) {
      where.type = type.toUpperCase();
    }

    // Get health records with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [healthRecords, totalCount] = await Promise.all([
      prisma.healthRecord.findMany({
        where,
        skip,
        take,
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true
            }
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.healthRecord.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.status(200).json({
      success: true,
      data: {
        healthRecords,
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
    console.error('❌ Get pet health records error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching health records',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get health record by ID
 * @route   GET /api/health-records/:id
 * @access  Private (pet owner only)
 */
const getHealthRecordById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const healthRecord = await prisma.healthRecord.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            type: true,
            breed: true,
            ownerId: true
          }
        }
      }
    });

    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        error: 'Health record not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check ownership
    if (healthRecord.pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own pet health records',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      data: { healthRecord },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get health record by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching health record',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Update health record
 * @route   PUT /api/health-records/:id
 * @access  Private (pet owner only)
 */
const updateHealthRecord = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      type,
      title,
      description,
      veterinarian,
      clinic,
      date,
      nextDue,
      attachments,
      medications,
      notes
    } = req.body;

    // Check if health record exists and belongs to user's pet
    const existingRecord = await prisma.healthRecord.findUnique({
      where: { id },
      include: {
        pet: {
          select: { ownerId: true }
        }
      }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        error: 'Health record not found',
        timestamp: new Date().toISOString()
      });
    }

    if (existingRecord.pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own pet health records',
        timestamp: new Date().toISOString()
      });
    }

    // Build update data
    const updateData = {};
    if (type) updateData.type = type.toUpperCase();
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim() || null;
    if (veterinarian) updateData.veterinarian = veterinarian.trim();
    if (clinic !== undefined) updateData.clinic = clinic.trim() || null;
    if (date) updateData.date = new Date(date);
    if (nextDue !== undefined) updateData.nextDue = nextDue ? new Date(nextDue) : null;
    if (attachments !== undefined) updateData.attachments = attachments;
    if (medications !== undefined) updateData.medications = medications;
    if (notes !== undefined) updateData.notes = notes.trim() || null;

    const updatedRecord = await prisma.healthRecord.update({
      where: { id },
      data: updateData,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            type: true,
            breed: true
          }
        }
      }
    });

    console.log(`✅ Health record updated: ${updatedRecord.title} by user ${userId}`);

    res.status(200).json({
      success: true,
      data: { healthRecord: updatedRecord },
      message: 'Health record updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Update health record error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating health record',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Delete health record
 * @route   DELETE /api/health-records/:id
 * @access  Private (pet owner only)
 */
const deleteHealthRecord = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if health record exists and belongs to user's pet
    const existingRecord = await prisma.healthRecord.findUnique({
      where: { id },
      include: {
        pet: {
          select: { ownerId: true }
        }
      }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        error: 'Health record not found',
        timestamp: new Date().toISOString()
      });
    }

    if (existingRecord.pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own pet health records',
        timestamp: new Date().toISOString()
      });
    }

    await prisma.healthRecord.delete({
      where: { id }
    });

    console.log(`🗑️ Health record deleted: ${existingRecord.title} by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Health record deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Delete health record error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting health record',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get upcoming health reminders
 * @route   GET /api/health-records/reminders
 * @access  Private
 */
const getUpcomingReminders = async (req, res) => {
  try {
    const userId = req.userId;
    const { days = 30 } = req.query;

    // Get user's pets
    const userPets = await prisma.pet.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true }
    });

    if (userPets.length === 0) {
      return res.status(200).json({
        success: true,
        data: { reminders: [] },
        timestamp: new Date().toISOString()
      });
    }

    const petIds = userPets.map(pet => pet.id);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    // Get upcoming health records
    const reminders = await prisma.healthRecord.findMany({
      where: {
        petId: { in: petIds },
        nextDue: {
          not: null,
          lte: futureDate
        }
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            type: true,
            breed: true
          }
        }
      },
      orderBy: { nextDue: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: { reminders },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get reminders error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching reminders',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  createHealthRecord,
  getPetHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
  getUpcomingReminders
};
