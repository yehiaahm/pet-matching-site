import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
  createSupportTicket,
  getAdminSupportTickets,
  replyToSupportTicket,
  updateSupportTicketStatus,
} from '../controllers/supportController.js';
import {
  idParamSchema,
  supportTicketCreateBodySchema,
  supportTicketReplyBodySchema,
  supportTicketStatusBodySchema,
} from '../validation/schemas.js';

const router = Router();

router.post('/tickets', validate({ body: supportTicketCreateBodySchema }), asyncHandler(createSupportTicket));
router.get('/admin/tickets', protect, asyncHandler(getAdminSupportTickets));
router.post('/tickets/:id/reply', protect, validate({ params: idParamSchema, body: supportTicketReplyBodySchema }), asyncHandler(replyToSupportTicket));
router.patch('/admin/tickets/:id/status', protect, validate({ params: idParamSchema, body: supportTicketStatusBodySchema }), asyncHandler(updateSupportTicketStatus));

export default router;
