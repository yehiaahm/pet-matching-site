/**
 * Messaging Controller - Production Ready
 * Real-time messaging with Socket.io integration
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Store connected users for real-time messaging
const connectedUsers = new Map();

/**
 * @desc    Send message
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { recipientId, content, type = 'TEXT', attachments = [] } = req.body;

    // Validation
    if (!recipientId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Recipient ID and content are required',
        timestamp: new Date().toISOString()
      });
    }

    if (recipientId === userId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot send a message to yourself',
        timestamp: new Date().toISOString()
      });
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found',
        timestamp: new Date().toISOString()
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        recipientId,
        content: content.trim(),
        type: type.toUpperCase(),
        attachments,
        read: false
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

    // Update conversation
    await prisma.conversation.upsert({
      where: {
        participant1Id_participant2Id: {
          participant1Id: Math.min(userId, recipientId),
          participant2Id: Math.max(userId, recipientId)
        }
      },
      update: {
        lastMessageId: message.id,
        lastMessageAt: new Date()
      },
      create: {
        participant1Id: Math.min(userId, recipientId),
        participant2Id: Math.max(userId, recipientId),
        lastMessageId: message.id,
        lastMessageAt: new Date()
      }
    });

    // Send real-time notification if recipient is online
    const recipientSocket = connectedUsers.get(recipientId);
    if (recipientSocket) {
      req.io.to(recipientSocket).emit('newMessage', {
        message,
        sender: message.sender
      });
    }

    console.log(`✅ Message sent: ${userId} -> ${recipientId}`);

    res.status(201).json({
      success: true,
      data: { message },
      message: 'Message sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while sending message',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get conversations
 * @route   GET /api/messages/conversations
 * @access  Private
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    // Get conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      },
      include: {
        lastMessage: {
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
        },
        participant1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        participant2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    // Get unread message counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUserId = conversation.participant1Id === userId 
          ? conversation.participant2Id 
          : conversation.participant1Id;

        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUserId,
            recipientId: userId,
            read: false
          }
        });

        const otherUser = conversation.participant1Id === userId 
          ? conversation.participant2 
          : conversation.participant1;

        return {
          id: conversation.id,
          otherUser,
          lastMessage: conversation.lastMessage,
          unreadCount,
          lastMessageAt: conversation.lastMessageAt
        };
      })
    );

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const paginatedConversations = conversationsWithUnread.slice(skip, skip + take);
    const totalCount = conversationsWithUnread.length;

    res.status(200).json({
      success: true,
      data: {
        conversations: paginatedConversations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / take),
          totalCount,
          hasNext: skip + take < totalCount,
          hasPrev: parseInt(page) > 1
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching conversations',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get messages with specific user
 * @route   GET /api/messages/:userId
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { userId: otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true
      }
    });

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Get messages between the two users
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId, recipientId: otherUserId },
            { senderId: otherUserId, recipientId: currentUserId }
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
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: currentUserId, recipientId: otherUserId },
            { senderId: otherUserId, recipientId: currentUserId }
          ]
        }
      })
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        recipientId: currentUserId,
        read: false
      },
      data: { read: true }
    });

    const totalPages = Math.ceil(totalCount / take);

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Show oldest first
        otherUser,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: skip + take < totalCount,
          hasPrev: parseInt(page) > 1
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching messages',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Mark message as read
 * @route   PUT /api/messages/:id/read
 * @access  Private
 */
const markMessageAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if message exists and user is recipient
    const message = await prisma.message.findUnique({
      where: { id },
      select: { recipientId: true, read: true }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
        timestamp: new Date().toISOString()
      });
    }

    if (message.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only mark your own messages as read',
        timestamp: new Date().toISOString()
      });
    }

    if (message.read) {
      return res.status(200).json({
        success: true,
        message: 'Message already marked as read',
        timestamp: new Date().toISOString()
      });
    }

    // Mark as read
    await prisma.message.update({
      where: { id },
      data: { read: true }
    });

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Mark message as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while marking message as read',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Delete message
 * @route   DELETE /api/messages/:id
 * @access  Private (sender only)
 */
const deleteMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if message exists and user is sender
    const message = await prisma.message.findUnique({
      where: { id },
      select: { senderId: true }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
        timestamp: new Date().toISOString()
      });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own messages',
        timestamp: new Date().toISOString()
      });
    }

    await prisma.message.delete({
      where: { id }
    });

    console.log(`🗑️ Message deleted: ${id} by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Delete message error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting message',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get unread message count
 * @route   GET /api/messages/unread/count
 * @access  Private
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const unreadCount = await prisma.message.count({
      where: {
        recipientId: userId,
        read: false
      }
    });

    res.status(200).json({
      success: true,
      data: { unreadCount },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching unread count',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Socket.io connection handler
 */
const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', async (token) => {
      try {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        // Store user socket
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;

        console.log(`🔐 User authenticated: ${userId} (${socket.id})`);

        // Join user to their personal room
        socket.join(`user_${userId}`);

        // Send unread count
        const unreadCount = await prisma.message.count({
          where: {
            recipientId: userId,
            read: false
          }
        });

        socket.emit('unreadCount', { count: unreadCount });

      } catch (error) {
        console.error('❌ Socket authentication error:', error);
        socket.emit('authenticationError', { error: 'Invalid token' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      if (socket.userId && data.recipientId) {
        const recipientSocket = connectedUsers.get(data.recipientId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('userTyping', {
            userId: socket.userId,
            isTyping: data.isTyping
          });
        }
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`🔌 User disconnected: ${socket.userId} (${socket.id})`);
      }
    });
  });
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  markMessageAsRead,
  deleteMessage,
  getUnreadCount,
  handleSocketConnection
};
