import express from 'express';
import {
  sendMessage,
  getConversations,
  getMessagesWith,
  getBreedingRequestMessages,
  markMessageAsRead,
  deleteMessage,
  getUnreadCount
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
import { validateMessage } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all available users for community support (paginated)
router.get('/users/list', async (req, res) => {
  try {
    const prisma = (await import('../config/prisma.js')).default;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user?.id || req.userId;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          NOT: { id: currentUserId },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          rating: true,
          isVerified: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: [
          { rating: 'desc' },
          { firstName: 'asc' },
        ],
      }),
      prisma.user.count({
        where: {
          NOT: { id: currentUserId },
        },
      }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching users list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
});

// Get available users for community support
router.get('/users/search', async (req, res) => {
  try {
    const prisma = (await import('../config/prisma.js')).default;
    const { query, limit = 20 } = req.query;
    const currentUserId = req.user?.id || req.userId;

    console.log('🔍 User search request:', { query, currentUserId, hasUser: !!req.user });

    const where = {};
    
    // Only exclude current user if we have one
    if (currentUserId) {
      where.NOT = { id: currentUserId };
    }

    // Add search filter if provided
    if (query && query.trim()) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    console.log('🔍 Search where clause:', JSON.stringify(where, null, 2));

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        rating: true,
        isVerified: true,
      },
      take: parseInt(limit),
      orderBy: [
        { rating: 'desc' },
        { firstName: 'asc' },
      ],
    });

    console.log('✅ Found users:', users.length);

    // If no results and query provided, return all users
    if (users.length === 0 && query && query.trim()) {
      console.log('⚠️ No matches, trying broader search...');
      const broadSearch = await prisma.user.findMany({
        where: currentUserId ? { NOT: { id: currentUserId } } : {},
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          rating: true,
          isVerified: true,
        },
        take: parseInt(limit),
        orderBy: [
          { rating: 'desc' },
          { firstName: 'asc' },
        ],
      });
      console.log('✅ Broad search found:', broadSearch.length);
      return res.json({
        success: true,
        data: broadSearch,
      });
    }

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
});

// Get unread message count
router.get('/unread/count', getUnreadCount);

// Get conversations list
router.get('/conversations', getConversations);

// Get messages with a specific user
router.get('/user/:userId', getMessagesWith);

// Get messages for a breeding request
router.get('/breeding-request/:requestId', getBreedingRequestMessages);

// Send a message
router.post('/', validateMessage, sendMessage);

// Mark message as read
router.patch('/:id/read', markMessageAsRead);

// Delete a message
router.delete('/:id', deleteMessage);

export default router;
