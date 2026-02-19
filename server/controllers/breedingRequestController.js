import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AppError } from '../utils/errors.js';

/**
 * Create a new breeding request
 * POST /api/breeding-requests
 */
export const createBreedingRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { initiatorPetId, targetPetId, message, preferredDate } = req.body;

    // Validate required fields
    if (!initiatorPetId || !targetPetId) {
      throw new AppError('Missing required fields', 400);
    }

    // Get initiator pet and verify ownership
    const initiatorPet = await prisma.pet.findUnique({
      where: { id: initiatorPetId },
      include: { owner: true }
    });

    if (!initiatorPet) {
      throw new AppError('Initiator pet not found', 404);
    }

    if (initiatorPet.ownerId !== userId) {
      throw new AppError('You can only create requests for your own pets', 403);
    }

    // Get target pet
    const targetPet = await prisma.pet.findUnique({
      where: { id: targetPetId },
      include: { owner: true }
    });

    if (!targetPet) {
      throw new AppError('Target pet not found', 404);
    }

    if (targetPet.ownerId === userId) {
      throw new AppError('Cannot create breeding request with your own pet', 400);
    }

    // Check if pet is available for breeding
    if (targetPet.breedingStatus !== 'AVAILABLE') {
      throw new AppError('Target pet is not available for breeding', 400);
    }

    // Check for existing request
    const existingRequest = await prisma.breedingRequest.findFirst({
      where: {
        initiatorId: userId,
        initiatorPetId,
        targetUserId: targetPet.ownerId,
        targetPetId,
        status: {
          in: ['PENDING', 'ACCEPTED']
        }
      }
    });

    if (existingRequest) {
      throw new AppError('A breeding request already exists for these pets', 409);
    }

    // Create breeding request
    const breedingRequest = await prisma.breedingRequest.create({
      data: {
        initiatorId: userId,
        initiatorPetId,
        targetUserId: targetPet.ownerId,
        targetPetId,
        message,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        status: 'PENDING'
      },
      include: {
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        initiatorPet: true,
        targetUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        targetPet: true
      }
    });

    sendSuccess(res, breedingRequest, 'Breeding request created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all breeding requests (sent and received)
 * GET /api/breeding-requests
 */
export const getBreedingRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type = 'all', status } = req.query;

    const whereConditions = {};

    // Filter by type (sent/received/all)
    if (type === 'sent') {
      whereConditions.initiatorId = userId;
    } else if (type === 'received') {
      whereConditions.targetUserId = userId;
    } else {
      whereConditions.OR = [
        { initiatorId: userId },
        { targetUserId: userId }
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      whereConditions.status = status.toUpperCase();
    }

    const requests = await prisma.breedingRequest.findMany({
      where: whereConditions,
      include: {
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            rating: true
          }
        },
        initiatorPet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            gender: true,
            images: true
          }
        },
        targetUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            rating: true
          }
        },
        targetPet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            gender: true,
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    sendSuccess(res, requests, 'Breeding requests retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single breeding request by ID
 * GET /api/breeding-requests/:id
 */
export const getBreedingRequestById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const request = await prisma.breedingRequest.findUnique({
      where: { id },
      include: {
        initiator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            bio: true,
            rating: true,
            totalMatches: true
          }
        },
        initiatorPet: true,
        targetUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            bio: true,
            rating: true,
            totalMatches: true
          }
        },
        targetPet: true,
        match: true,
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!request) {
      throw new AppError('Breeding request not found', 404);
    }

    // Verify user is part of this request
    if (request.initiatorId !== userId && request.targetUserId !== userId) {
      throw new AppError('You do not have access to this breeding request', 403);
    }

    sendSuccess(res, request, 'Breeding request retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Accept a breeding request
 * PATCH /api/breeding-requests/:id/accept
 */
export const acceptBreedingRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { scheduledDate, notes } = req.body;

    const request = await prisma.breedingRequest.findUnique({
      where: { id },
      include: { targetPet: true, initiatorPet: true }
    });

    if (!request) {
      throw new AppError('Breeding request not found', 404);
    }

    // Only target user can accept
    if (request.targetUserId !== userId) {
      throw new AppError('Only the request recipient can accept', 403);
    }

    if (request.status !== 'PENDING') {
      throw new AppError('Only pending requests can be accepted', 400);
    }

    // Update request and create match
    const [updatedRequest, match] = await prisma.$transaction([
      prisma.breedingRequest.update({
        where: { id },
        data: { status: 'ACCEPTED' }
      }),
      prisma.match.create({
        data: {
          breedingRequestId: id,
          initiatorPetId: request.initiatorPetId,
          targetPetId: request.targetPetId,
          status: 'CONFIRMED',
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          notes
        }
      })
    ]);

    const fullRequest = await prisma.breedingRequest.findUnique({
      where: { id },
      include: {
        initiator: true,
        initiatorPet: true,
        targetUser: true,
        targetPet: true,
        match: true
      }
    });

    sendSuccess(res, fullRequest, 'Breeding request accepted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a breeding request
 * PATCH /api/breeding-requests/:id/reject
 */
export const rejectBreedingRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const request = await prisma.breedingRequest.findUnique({
      where: { id }
    });

    if (!request) {
      throw new AppError('Breeding request not found', 404);
    }

    // Only target user can reject
    if (request.targetUserId !== userId) {
      throw new AppError('Only the request recipient can reject', 403);
    }

    if (request.status !== 'PENDING') {
      throw new AppError('Only pending requests can be rejected', 400);
    }

    const updatedRequest = await prisma.breedingRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        initiator: true,
        initiatorPet: true,
        targetUser: true,
        targetPet: true
      }
    });

    sendSuccess(res, updatedRequest, 'Breeding request rejected');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a breeding request
 * PATCH /api/breeding-requests/:id/cancel
 */
export const cancelBreedingRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const request = await prisma.breedingRequest.findUnique({
      where: { id }
    });

    if (!request) {
      throw new AppError('Breeding request not found', 404);
    }

    // Only initiator can cancel
    if (request.initiatorId !== userId) {
      throw new AppError('Only the request sender can cancel', 403);
    }

    if (request.status !== 'PENDING') {
      throw new AppError('Only pending requests can be cancelled', 400);
    }

    const updatedRequest = await prisma.breedingRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        initiator: true,
        initiatorPet: true,
        targetUser: true,
        targetPet: true
      }
    });

    sendSuccess(res, updatedRequest, 'Breeding request cancelled');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark breeding request as completed
 * PATCH /api/breeding-requests/:id/complete
 */
export const completeBreedingRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { resultingOffspring, notes } = req.body;

    const request = await prisma.breedingRequest.findUnique({
      where: { id },
      include: { match: true }
    });

    if (!request) {
      throw new AppError('Breeding request not found', 404);
    }

    // Both users can mark as completed
    if (request.initiatorId !== userId && request.targetUserId !== userId) {
      throw new AppError('You do not have access to this request', 403);
    }

    if (request.status !== 'ACCEPTED') {
      throw new AppError('Only accepted requests can be completed', 400);
    }

    if (!request.match) {
      throw new AppError('No match found for this request', 404);
    }

    // Update request and match
    await prisma.$transaction([
      prisma.breedingRequest.update({
        where: { id },
        data: { status: 'COMPLETED' }
      }),
      prisma.match.update({
        where: { id: request.match.id },
        data: {
          status: 'COMPLETED',
          completedDate: new Date(),
          resultingOffspring: resultingOffspring ? parseInt(resultingOffspring) : null,
          notes: notes || request.match.notes
        }
      })
    ]);

    // Update user match counts
    await prisma.$transaction([
      prisma.user.update({
        where: { id: request.initiatorId },
        data: { totalMatches: { increment: 1 } }
      }),
      prisma.user.update({
        where: { id: request.targetUserId },
        data: { totalMatches: { increment: 1 } }
      })
    ]);

    const fullRequest = await prisma.breedingRequest.findUnique({
      where: { id },
      include: {
        initiator: true,
        initiatorPet: true,
        targetUser: true,
        targetPet: true,
        match: true
      }
    });

    sendSuccess(res, fullRequest, 'Breeding request marked as completed');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a breeding request (soft delete)
 * DELETE /api/breeding-requests/:id
 */
export const deleteBreedingRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const request = await prisma.breedingRequest.findUnique({
      where: { id }
    });

    if (!request) {
      throw new AppError('Breeding request not found', 404);
    }

    // Only initiator can delete
    if (request.initiatorId !== userId) {
      throw new AppError('Only the request sender can delete this request', 403);
    }

    await prisma.breedingRequest.delete({
      where: { id }
    });

    sendSuccess(res, null, 'Breeding request deleted successfully');
  } catch (error) {
    next(error);
  }
};
