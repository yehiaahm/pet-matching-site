import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AppError } from '../utils/errors.js';

/**
 * Create a review
 * POST /api/reviews
 */
export const createReview = async (req, res, next) => {
  try {
    const reviewerId = req.user.id;
    const { revieweeId, breedingRequestId, rating, comment } = req.body;

    // Validate required fields
    if (!revieweeId || !breedingRequestId || !rating) {
      throw new AppError('Missing required fields', 400);
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Cannot review yourself
    if (revieweeId === reviewerId) {
      throw new AppError('Cannot review yourself', 400);
    }

    // Verify breeding request exists and is completed
    const breedingRequest = await prisma.breedingRequest.findUnique({
      where: { id: breedingRequestId }
    });

    if (!breedingRequest) {
      throw new AppError('Breeding request not found', 404);
    }

    if (breedingRequest.status !== 'COMPLETED') {
      throw new AppError('Can only review completed breeding requests', 400);
    }

    // Verify reviewer was part of the breeding request
    if (breedingRequest.initiatorId !== reviewerId && breedingRequest.targetUserId !== reviewerId) {
      throw new AppError('You can only review breeding requests you participated in', 403);
    }

    // Verify reviewee was the other party
    if (breedingRequest.initiatorId !== revieweeId && breedingRequest.targetUserId !== revieweeId) {
      throw new AppError('Invalid reviewee for this breeding request', 400);
    }

    // Check for existing review
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId,
        breedingRequestId
      }
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this breeding request', 409);
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        reviewerId,
        revieweeId,
        breedingRequestId,
        rating,
        comment
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Update reviewee's average rating and total reviews
    await updateUserRating(revieweeId);

    sendSuccess(res, review, 'Review created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews for a user
 * GET /api/reviews/user/:userId
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { rating, limit = 20, offset = 0 } = req.query;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const whereConditions = { revieweeId: userId };

    // Filter by rating if provided
    if (rating) {
      whereConditions.rating = parseInt(rating);
    }

    const reviews = await prisma.review.findMany({
      where: whereConditions,
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            rating: true
          }
        },
        breedingRequest: {
          select: {
            id: true,
            createdAt: true,
            completedDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get total count
    const total = await prisma.review.count({
      where: whereConditions
    });

    sendSuccess(res, {
      reviews,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    }, 'Reviews retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single review by ID
 * GET /api/reviews/:id
 */
export const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            rating: true,
            totalReviews: true
          }
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            rating: true,
            totalReviews: true
          }
        },
        breedingRequest: {
          select: {
            id: true,
            initiatorPet: {
              select: {
                id: true,
                name: true,
                species: true,
                breed: true,
                images: true
              }
            },
            targetPet: {
              select: {
                id: true,
                name: true,
                species: true,
                breed: true,
                images: true
              }
            }
          }
        }
      }
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    sendSuccess(res, review, 'Review retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review
 * PATCH /api/reviews/:id
 */
export const updateReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      throw new AppError('Review not found', 404);
    }

    // Only reviewer can update their review
    if (existingReview.reviewerId !== userId) {
      throw new AppError('You can only update your own reviews', 403);
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Update reviewee's average rating if rating changed
    if (rating !== undefined) {
      await updateUserRating(existingReview.revieweeId);
    }

    sendSuccess(res, updatedReview, 'Review updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/:id
 */
export const deleteReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      throw new AppError('Review not found', 404);
    }

    // Only reviewer can delete their review
    if (existingReview.reviewerId !== userId) {
      throw new AppError('You can only delete your own reviews', 403);
    }

    await prisma.review.delete({
      where: { id }
    });

    // Update reviewee's average rating
    await updateUserRating(existingReview.revieweeId);

    sendSuccess(res, null, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark review as helpful
 * POST /api/reviews/:id/helpful
 */
export const markReviewHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        helpfulCount: { increment: 1 }
      }
    });

    sendSuccess(res, updatedReview, 'Review marked as helpful');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's rating statistics
 * GET /api/reviews/user/:userId/stats
 */
export const getUserRatingStats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rating: true,
        totalReviews: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { revieweeId: userId },
      _count: { rating: true }
    });

    // Format distribution
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    ratingDistribution.forEach(item => {
      distribution[item.rating] = item._count.rating;
    });

    sendSuccess(res, {
      user,
      distribution,
      totalReviews: user.totalReviews,
      averageRating: user.rating
    }, 'Rating statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update user's average rating
 */
async function updateUserRating(userId) {
  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    select: { rating: true }
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;

  await prisma.user.update({
    where: { id: userId },
    data: {
      rating: parseFloat(averageRating.toFixed(2)),
      totalReviews
    }
  });
}
