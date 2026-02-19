import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { verifyAdmin } from '../middleware/admin.js';
import {
	getAvailableSlots,
	createBooking,
	getUserBookings,
	getBookingById,
	cancelBooking,
	rescheduleBooking,
	getAllBookings,
	confirmBooking,
	startBooking,
	completeBooking,
	adminCancelBooking,
} from '../controllers/bookingController.js';
const router = express.Router();

// User routes
router.get('/slots', authenticate, getAvailableSlots);
router.post('/', authenticate, createBooking);
router.get('/my-bookings', authenticate, getUserBookings);
router.get('/:bookingId', authenticate, getBookingById);
router.patch('/:bookingId/cancel', authenticate, cancelBooking);
router.patch('/:bookingId/reschedule', authenticate, rescheduleBooking);

// Admin routes
router.get('/', authenticate, verifyAdmin, getAllBookings);
router.patch('/:bookingId/confirm', authenticate, verifyAdmin, confirmBooking);
router.patch('/:bookingId/start', authenticate, verifyAdmin, startBooking);
router.patch('/:bookingId/complete', authenticate, verifyAdmin, completeBooking);
router.patch('/:bookingId/admin-cancel', authenticate, verifyAdmin, adminCancelBooking);

export default router;
