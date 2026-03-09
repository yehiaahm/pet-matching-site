import prisma from '../prisma/client.js';
import { io } from '../sockets/io.js';
import { AppError } from '../utils/appError.js';

export const startConversation = async (req, res) => {
  const { user2Id } = req.body;
  const user1Id = req.user.id;

  if (user1Id === user2Id) {
    throw new AppError('Cannot start conversation with yourself', 400);
  }

  const [firstUserId, secondUserId] = [user1Id, user2Id].sort();

  const existing = await prisma.conversation.findFirst({
    where: {
      user1Id: firstUserId,
      user2Id: secondUserId,
    },
  });

  if (existing) return res.json(existing);

  const conversation = await prisma.conversation.create({
    data: { user1Id: firstUserId, user2Id: secondUserId },
  });

  res.status(201).json(conversation);
};

export const sendMessage = async (req, res) => {
  const { conversationId, text, image } = req.body;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { user1Id: true, user2Id: true },
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (conversation.user1Id !== req.user.id && conversation.user2Id !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: req.user.id,
      text,
      image,
    },
  });

  io.to(conversationId).emit('chat:new_message', message);
  res.status(201).json(message);
};

export const listConversations = async (req, res) => {
  const userId = req.user.id;
  const list = await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  res.json(list);
};

export const conversationMessages = async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { user1Id: true, user2Id: true },
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (conversation.user1Id !== req.user.id && conversation.user2Id !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(messages);
};
