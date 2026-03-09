import { Router } from 'express';
import { sendMatchRequest, acceptMatchRequest, rejectMatchRequest } from '../controllers/matchController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema, matchRequestBodySchema } from '../validation/schemas.js';

const router = Router();

router.post('/send', protect, validate({ body: matchRequestBodySchema }), asyncHandler(sendMatchRequest));
router.post('/accept/:id', protect, validate({ params: idParamSchema }), asyncHandler(acceptMatchRequest));
router.post('/reject/:id', protect, validate({ params: idParamSchema }), asyncHandler(rejectMatchRequest));

export default router;
