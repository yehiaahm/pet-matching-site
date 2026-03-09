import { Router } from 'express';
import { aiAssistantChat, aiHealthCheckByPet, aiMatchByPet } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { aiAssistantChatBodySchema, petIdParamSchema } from '../validation/schemas.js';

const router = Router();

router.get('/match/:petId', protect, validate({ params: petIdParamSchema }), asyncHandler(aiMatchByPet));
router.get('/health-check/:petId', protect, validate({ params: petIdParamSchema }), asyncHandler(aiHealthCheckByPet));
router.post('/assistant/chat', validate({ body: aiAssistantChatBodySchema }), asyncHandler(aiAssistantChat));

export default router;
