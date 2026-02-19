import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create new support ticket
router.post('/tickets', async (req, res) => {
  try {
    const { name, email, subject, category, message, priority } = req.body;

    // Get user ID if authenticated (from token if present)
    const userId = req.user?.id || null;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        name,
        email,
        subject,
        category,
        message,
        priority: priority || 'NORMAL',
        status: 'OPEN'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticketId: ticket.id
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket'
    });
  }
});

// Get all tickets for a user (authenticated)
router.get('/tickets', protect, async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
});

// Get single ticket by ID
router.get('/tickets/:id', protect, async (req, res) => {
  try {
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket'
    });
  }
});

// Add reply to ticket (for admins - placeholder)
router.post('/tickets/:id/reply', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: req.params.id }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Add reply to JSON field
    const currentReplies = ticket.replies || [];
    const updatedReplies = [
      ...currentReplies,
      {
        message,
        from: 'support',
        createdAt: new Date().toISOString()
      }
    ];

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: {
        replies: updatedReplies,
        status: 'REPLIED',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Reply added successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply'
    });
  }
});

// Update ticket status
router.patch('/tickets/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Verify ticket belongs to user
    const existingTicket = await prisma.supportTicket.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: {
        status: status.toUpperCase(),
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Ticket status updated',
      ticket
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status'
    });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all tickets (Admin only)
router.get('/admin/tickets', protect, async (req, res) => {
  try {
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin access required'
      });
    }

    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
});

// Update ticket status (Admin only)
router.patch('/admin/tickets/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin access required'
      });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: {
        status: status.toUpperCase(),
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Ticket status updated',
      ticket
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status'
    });
  }
});

// Get ticket statistics (Admin only)
router.get('/admin/stats', protect, async (req, res) => {
  try {
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin access required'
      });
    }

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      repliedTickets,
      closedTickets,
      urgentTickets
    ] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.supportTicket.count({ where: { status: 'REPLIED' } }),
      prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
      prisma.supportTicket.count({ where: { priority: 'URGENT' } })
    ]);

    res.json({
      success: true,
      stats: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        replied: repliedTickets,
        closed: closedTickets,
        urgent: urgentTickets
      }
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

export default router;
