import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { loginBodySchema, registerBodySchema } from '../validation/schemas.js';

const router = Router();

router.post('/register', validate({ body: registerBodySchema }), asyncHandler(register));
router.post('/login', validate({ body: loginBodySchema }), asyncHandler(login));

export default router;
