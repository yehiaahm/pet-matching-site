import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AppError } from '../utils/errors.js';

/**
 * Send a message
 * POST /api/messages
 */
export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { recipientId, content, breedingRequestId } = req.body;

    // Validate required fields
    if (!recipientId || !content) {
      throw new AppError('Recipient and content are required', 400);
    }

    // Cannot send message to self
    if (recipientId === senderId) {
      throw new AppError('Cannot send message to yourself', 400);
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId }
    });

    if (!recipient) {
      throw new AppError('Recipient not found', 404);
    }

    // If breedingRequestId provided, verify access
    if (breedingRequestId) {
      const request = await prisma.breedingRequest.findUnique({
        where: { id: breedingRequestId }
      });

      if (!request) {
        throw new AppError('Breeding request not found', 404);
      }

      // Verify sender and recipient are part of the breeding request
      const isParticipant = 
        (request.initiatorId === senderId || request.targetUserId === senderId) &&
        (request.initiatorId === recipientId || request.targetUserId === recipientId);

      if (!isParticipant) {
        throw new AppError('You are not authorized to send messages for this breeding request', 403);
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        content,
        breedingRequestId,
        status: 'SENT'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    sendSuccess(res, message, 'Message sent successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get conversations list for current user
 * GET /api/messages/conversations
 */
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all messages where user is sender or recipient
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group messages by conversation (unique user pairs)
    const conversationsMap = new Map();

    messages.forEach(message => {
      const otherUserId = message.senderId === userId ? message.recipientId : message.senderId;
      
      if (!conversationsMap.has(otherUserId)) {
        const otherUser = message.senderId === userId ? message.recipient : message.sender;
        const unreadCount = messages.filter(
          m => m.senderId === otherUserId && m.recipientId === userId && !m.isRead
        ).length;

        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          user: otherUser,
          lastMessage: message,
          unreadCount
        });
      }
    });

    const conversations = Array.from(conversationsMap.values());

    sendSuccess(res, conversations, 'Conversations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages with a specific user
 * GET /api/messages/user/:userId
 */
export const getMessagesWith = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;
    const { limit = 50, before } = req.query;

    if (userId === currentUserId) {
      throw new AppError('Cannot get messages with yourself', 400);
    }

    // Verify other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!otherUser) {
      throw new AppError('User not found', 404);
    }

    const whereConditions = {
      OR: [
        { senderId: currentUserId, recipientId: userId },
        { senderId: userId, recipientId: currentUserId }
      ]
    };

    // Add cursor-based pagination if 'before' is provided
    if (before) {
      whereConditions.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.message.findMany({
      where: whereConditions,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        recipientId: currentUserId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date(),
        status: 'READ'
      }
    });

    sendSuccess(res, messages.reverse(), 'Messages retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages for a breeding request
 * GET /api/messages/breeding-request/:requestId
 */
export const getBreedingRequestMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    // Verify breeding request exists and user has access
    const request = await prisma.breedingRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new AppError('Breeding request not found', 404);
    }

    if (request.initiatorId !== userId && request.targetUserId !== userId) {
      throw new AppError('You do not have access to this breeding request', 403);
    }

    const messages = await prisma.message.findMany({
      where: { breedingRequestId: requestId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        breedingRequestId: requestId,
        recipientId: userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date(),
        status: 'READ'
      }
    });

    sendSuccess(res, messages, 'Messages retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark message as read
 * PATCH /api/messages/:id/read
 */
export const markMessageAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Only recipient can mark as read
    if (message.recipientId !== userId) {
      throw new AppError('You can only mark messages sent to you as read', 403);
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
        status: 'READ'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    sendSuccess(res, updatedMessage, 'Message marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a message
 * DELETE /api/messages/:id
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Only sender can delete
    if (message.senderId !== userId) {
      throw new AppError('You can only delete messages you sent', 403);
    }

    await prisma.message.delete({
      where: { id }
    });

    sendSuccess(res, null, 'Message deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread message count
 * GET /api/messages/unread/count
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await prisma.message.count({
      where: {
        recipientId: userId,
        isRead: false
      }
    });

    sendSuccess(res, { count }, 'Unread count retrieved successfully');
  } catch (error) {
    next(error);
  }
};
