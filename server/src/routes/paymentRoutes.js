import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadPayment, activateSubscription } from '../controllers/paymentController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { activateSubscriptionBodySchema, uploadPaymentBodySchema } from '../validation/schemas.js';

const router = Router();

router.post('/upload', protect, upload.single('screenshot'), validate({ body: uploadPaymentBodySchema }), asyncHandler(uploadPayment));
router.post('/activate', protect, validate({ body: activateSubscriptionBodySchema }), asyncHandler(activateSubscription));

export default router;
