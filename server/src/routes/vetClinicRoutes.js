import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  adminVetBookings,
  createVetBooking,
  getClinicSlots,
  getVetClinicById,
  listVetClinics,
  myVetBookings,
  updateVetBookingStatus,
} from '../controllers/vetClinicController.js';

const router = Router();

router.get('/', asyncHandler(listVetClinics));
router.get('/:id', asyncHandler(getVetClinicById));
router.get('/:id/slots', asyncHandler(getClinicSlots));

router.post('/bookings', protect, asyncHandler(createVetBooking));
router.get('/bookings/my', protect, asyncHandler(myVetBookings));
router.get('/bookings/admin', protect, asyncHandler(adminVetBookings));
router.patch('/bookings/:id/status', protect, asyncHandler(updateVetBookingStatus));

export default router;
