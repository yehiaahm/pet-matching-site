import { randomUUID } from 'node:crypto';
import prisma from '../prisma/client.js';
import { AppError } from '../utils/appError.js';

const ADMIN_ROLES = new Set(['admin', 'super_admin']);

const normalizeRole = (role) => String(role || '').trim().toLowerCase().replace(/[\s-]+/g, '_');

const requireSupportAdmin = (req) => {
  const role = normalizeRole(req.user?.role);
  if (!req.user || !ADMIN_ROLES.has(role)) {
    throw new AppError('Admin only', 403);
  }
};

export const createSupportTicket = async (req, res) => {
  const { name, email, subject, category, message, priority } = req.body;

  const ticket = await prisma.support_tickets.create({
    data: {
      id: randomUUID(),
      userId: req.user?.id || null,
      name,
      email,
      subject,
      category,
      message,
      priority,
      status: 'OPEN',
      replies: [],
      updatedAt: new Date(),
    },
  });

  res.status(201).json({
    success: true,
    message: 'Support ticket created successfully',
    ticket,
  });
};

export const getAdminSupportTickets = async (req, res) => {
  requireSupportAdmin(req);

  const tickets = await prisma.support_tickets.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    tickets,
  });
};

export const replyToSupportTicket = async (req, res) => {
  requireSupportAdmin(req);

  const { id } = req.params;
  const { message } = req.body;

  const ticket = await prisma.support_tickets.findUnique({
    where: { id },
  });

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  const existingReplies = Array.isArray(ticket.replies) ? ticket.replies : [];
  const nextReplies = [
    ...existingReplies,
    {
      message,
      from: req.user?.email || req.user?.id || 'admin',
      createdAt: new Date().toISOString(),
    },
  ];

  const updatedTicket = await prisma.support_tickets.update({
    where: { id },
    data: {
      replies: nextReplies,
      status: 'REPLIED',
      updatedAt: new Date(),
    },
  });

  res.json({
    success: true,
    message: 'Reply sent successfully',
    ticket: updatedTicket,
  });
};

export const updateSupportTicketStatus = async (req, res) => {
  requireSupportAdmin(req);

  const { id } = req.params;
  const { status } = req.body;

  const existingTicket = await prisma.support_tickets.findUnique({ where: { id } });
  if (!existingTicket) {
    throw new AppError('Ticket not found', 404);
  }

  const updatedTicket = await prisma.support_tickets.update({
    where: { id },
    data: {
      status,
      updatedAt: new Date(),
    },
  });

  res.json({
    success: true,
    message: 'Ticket status updated',
    ticket: updatedTicket,
  });
};
