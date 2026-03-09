import { Router } from 'express';
import { addPet, myPets, allPets, petById, deletePet, updatePet } from '../controllers/petController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema, petCreateBodySchema, petUpdateBodySchema } from '../validation/schemas.js';

const router = Router();

// GET all pets
router.get("/", asyncHandler(allPets));

// ADD PET (المهم)
router.post("/", protect, validate({ body: petCreateBodySchema }), asyncHandler(addPet));

router.get('/my', protect, asyncHandler(myPets));
router.get('/all', asyncHandler(allPets));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(petById));
router.put('/:id', protect, validate({ params: idParamSchema, body: petUpdateBodySchema }), asyncHandler(updatePet));
router.delete('/:id', protect, validate({ params: idParamSchema }), asyncHandler(deletePet));

export default router;