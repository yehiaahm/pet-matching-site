import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response.js';
import { notificationService } from '../services/notificationService.js';

const prisma = new PrismaClient();

const BADGE_RULES = [
  { level: 'Platinum', minSuccessRate: 0.85, minRating: 4.8, maxComplaintsRate: 0.02 },
  { level: 'Gold', minSuccessRate: 0.75, minRating: 4.5, maxComplaintsRate: 0.05 },
  { level: 'Silver', minSuccessRate: 0.6, minRating: 4.2, maxComplaintsRate: 0.1 },
  { level: 'Bronze', minSuccessRate: 0.45, minRating: 4.0, maxComplaintsRate: 0.15 },
];

async function computeMetrics(userId) {
  const pets = await prisma.pet.findMany({ where: { ownerId: userId }, select: { id: true } });
  const petIds = pets.map(p => p.id);
  const totalRequests = await prisma.breedingRequest.count({ where: { OR: [{ requesterPetId: { in: petIds } }, { targetPetId: { in: petIds } }] } });
  const completed = await prisma.match.count({ where: { OR: [{ pet1Id: { in: petIds } }, { pet2Id: { in: petIds } }] } });
  const rejected = await prisma.breedingRequest.count({ where: { OR: [{ requesterPetId: { in: petIds } }, { targetPetId: { in: petIds } }], status: 'REJECTED' } });
  const reviewsAgg = await prisma.petReview.aggregate({ where: { petId: { in: petIds } }, _avg: { rating: true }, _count: { _all: true } });
  const rating = reviewsAgg._avg.rating || 0;
  const successRate = totalRequests > 0 ? completed / totalRequests : 0;
  const complaintsRate = totalRequests > 0 ? rejected / totalRequests : 0;
  return { successRate, rating, complaintsRate, totals: { totalRequests, completed, rejected, reviews: reviewsAgg._count._all } };
}

function determineBadge({ successRate, rating, complaintsRate }) {
  for (const rule of BADGE_RULES) {
    if (successRate >= rule.minSuccessRate && rating >= rule.minRating && complaintsRate <= rule.maxComplaintsRate) {
      return rule.level;
    }
  }
  return 'Unverified';
}

export const getVerificationBadge = async (req, res) => {
  try {
    const { userId } = req.params;
    const metrics = await computeMetrics(userId);
    const badge = determineBadge(metrics);
    return successResponse(res, 'Verification badge computed', { badge, metrics });
  } catch (err) {
    return errorResponse(res, 'Failed to compute verification badge', 500);
  }
};

export const revokeBadge = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    // Admin-only action assumed handled by route middleware
    await notificationService.notify(userId, 'Verification Badge Revoked', reason || 'Policy violation', { action: 'revoke' });
    return successResponse(res, 'Badge revoked and user notified', { userId });
  } catch (err) {
    return errorResponse(res, 'Failed to revoke badge', 500);
  }
};
