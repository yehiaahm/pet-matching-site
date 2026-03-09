import { Router } from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import { adminUsers, adminPets, adminPayments, adminOrders, verifyUser, banUser, confirmPayment } from '../controllers/adminController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { banUserBodySchema, confirmPaymentBodySchema, verifyUserBodySchema } from '../validation/schemas.js';

const router = Router();

router.use(protect, requireAdmin);

router.get('/users', asyncHandler(adminUsers));
router.get('/pets', asyncHandler(adminPets));
router.get('/payments', asyncHandler(adminPayments));
router.get('/orders', asyncHandler(adminOrders));
router.post('/verify-user', validate({ body: verifyUserBodySchema }), asyncHandler(verifyUser));
router.post('/ban', validate({ body: banUserBodySchema }), asyncHandler(banUser));
router.post('/payment/confirm', validate({ body: confirmPaymentBodySchema }), asyncHandler(confirmPayment));

export default router;
