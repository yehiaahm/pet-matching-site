import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { startConversation, sendMessage, listConversations, conversationMessages } from '../controllers/chatController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { conversationIdParamSchema, sendMessageBodySchema, startConversationBodySchema } from '../validation/schemas.js';

const router = Router();

router.post('/start', protect, validate({ body: startConversationBodySchema }), asyncHandler(startConversation));
router.post('/send', protect, validate({ body: sendMessageBodySchema }), asyncHandler(sendMessage));
router.get('/list', protect, asyncHandler(listConversations));
router.get('/:conversationId', protect, validate({ params: conversationIdParamSchema }), asyncHandler(conversationMessages));

export default router;
