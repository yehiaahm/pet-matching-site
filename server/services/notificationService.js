import logger from '../config/logger.js';
import { PrismaClient } from '@prisma/client';
import emailService from '../utils/emailService.js';

const prisma = new PrismaClient();
let ioRef = null;

export const notificationService = {
  init(io) {
    ioRef = io;
  },

  async notify(userId, title, message, data = {}) {
    try {
      // Persist notification
      const notif = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type: 'SYSTEM',
          data,
        }
      });
      // Emit realtime event
      if (ioRef) {
        ioRef.to(userId).emit('instantAlert', { id: notif.id, title, message, data, createdAt: notif.createdAt });
      }
      // Fallback email (best-effort)
      try {
        await emailService.sendEmail({
          toUserId: userId,
          subject: title,
          html: `<p>${message}</p><pre>${JSON.stringify(data)}</pre>`
        });
      } catch (e) {
        logger.warn('Email fallback failed', e);
      }
      return notif;
    } catch (err) {
      logger.error('Notification error', err);
      throw err;
    }
  }
};
