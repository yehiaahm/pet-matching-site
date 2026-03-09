import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { addHealthRecord, getHealthByPet, deleteHealth } from '../controllers/healthController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { healthRecordBodySchema, idParamSchema, petIdParamSchema } from '../validation/schemas.js';

const router = Router();

router.post('/add', protect, validate({ body: healthRecordBodySchema }), asyncHandler(addHealthRecord));
router.get('/:petId', protect, validate({ params: petIdParamSchema }), asyncHandler(getHealthByPet));
router.delete('/:id', protect, validate({ params: idParamSchema }), asyncHandler(deleteHealth));

export default router;
