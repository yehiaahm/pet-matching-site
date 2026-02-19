import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';
import { generateTimeSlots, isSlotAvailable } from '../utils/slotManager.js';

/**
 * Get available time slots for a specific date and service
 */
export const getAvailableSlots = async (req, res, next) => {
  try {
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      throw new AppError('Date and serviceId are required', 400);
    }

    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      throw new AppError('Cannot book appointments in the past', 400);
    }

    // Get service details
    const service = await prisma.clinicService.findUnique({
      where: { id: serviceId },
      include: { clinic: true },
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    if (!service.isActive) {
      throw new AppError('Service is not available', 400);
    }

    // Get clinic operating hours
    const operatingHours = service.clinic.operatingHours;
    const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = operatingHours[dayOfWeek];

    if (!daySchedule || !daySchedule.open) {
      return successResponse(res, [], 'Clinic is closed on this day');
    }

    // Generate all possible time slots
    const allSlots = generateTimeSlots(daySchedule.start, daySchedule.end, service.durationMinutes);

    // Get existing bookings for this date
    const existingBookings = await prisma.clinicBooking.findMany({
      where: {
        clinicId: service.clinicId,
        bookingDate: {
          gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
          lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
      select: {
        timeSlot: true,
      },
    });

    const bookedSlots = existingBookings.map((b) => b.timeSlot);

    // Filter available slots
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    return successResponse(res, 'Available slots retrieved', {
      date: bookingDate.toISOString().split('T')[0],
      service: {
        id: service.id,
        name: service.name,
        duration: service.durationMinutes,
        price: service.price,
      },
      availableSlots,
      bookedSlots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { petId, serviceId, bookingDate, timeSlot, userNotes } = req.body;

    // Validate required fields
    if (!petId || !serviceId || !bookingDate || !timeSlot) {
      throw new AppError('petId, serviceId, bookingDate, and timeSlot are required', 400);
    }

    // Verify pet ownership
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new AppError('Pet not found', 404);
    }

    if (pet.ownerId !== userId) {
      throw new AppError('You do not own this pet', 403);
    }

    // Verify service exists
    const service = await prisma.clinicService.findUnique({
      where: { id: serviceId },
      include: { clinic: true },
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    if (!service.isActive) {
      throw new AppError('Service is not available', 400);
    }

    // Validate booking date
    const date = new Date(bookingDate);
    if (isNaN(date.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      throw new AppError('Cannot book appointments in the past', 400);
    }

    // Check if slot is available
    const existingBooking = await prisma.clinicBooking.findFirst({
      where: {
        clinicId: service.clinicId,
        bookingDate: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        timeSlot,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
    });

    if (existingBooking) {
      throw new AppError('This time slot is already booked', 409);
    }

    // Create booking
    const booking = await prisma.clinicBooking.create({
      data: {
        clinicId: service.clinicId,
        userId,
        petId,
        serviceId,
        bookingDate: date,
        timeSlot,
        status: 'PENDING',
        price: service.price,
        userNotes: userNotes || null,
      },
      include: {
        service: true,
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return successResponse(res, 'Booking created successfully', booking, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's bookings
 */
export const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const whereClause = {
      userId,
    };

    if (status) {
      whereClause.status = status;
    }

    const bookings = await prisma.clinicBooking.findMany({
      where: whereClause,
      include: {
        service: true,
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            images: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
      },
      orderBy: {
        bookingDate: 'desc',
      },
    });

    return successResponse(res, 'Bookings retrieved', bookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await prisma.clinicBooking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            images: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Users can only see their own bookings (unless admin)
    if (booking.userId !== userId && req.user.role !== 'ADMIN') {
      throw new AppError('Access denied', 403);
    }

    return successResponse(res, 'Booking retrieved', booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking (user)
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await prisma.clinicBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.userId !== userId) {
      throw new AppError('You do not own this booking', 403);
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new AppError('Cannot cancel booking with current status', 400);
    }

    // Check if cancellation is within allowed time (24 hours before appointment)
    const bookingDateTime = new Date(booking.bookingDate);
    const [hours, minutes] = booking.timeSlot.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes));

    const now = new Date();
    const hoursUntilAppointment = (bookingDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      throw new AppError('Cancellations must be made at least 24 hours in advance', 400);
    }

    const updatedBooking = await prisma.clinicBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED_USER',
        cancelledAt: new Date(),
      },
      include: {
        service: true,
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(res, 'Booking cancelled successfully', updatedBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * Reschedule booking
 */
export const rescheduleBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;
    const { bookingDate, timeSlot } = req.body;

    if (!bookingDate || !timeSlot) {
      throw new AppError('bookingDate and timeSlot are required', 400);
    }

    const booking = await prisma.clinicBooking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.userId !== userId) {
      throw new AppError('You do not own this booking', 403);
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new AppError('Cannot reschedule booking with current status', 400);
    }

    // Validate new date
    const newDate = new Date(bookingDate);
    if (isNaN(newDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) {
      throw new AppError('Cannot book appointments in the past', 400);
    }

    // Check if new slot is available
    const existingBooking = await prisma.clinicBooking.findFirst({
      where: {
        clinicId: booking.clinicId,
        bookingDate: {
          gte: new Date(newDate.setHours(0, 0, 0, 0)),
          lt: new Date(newDate.setHours(23, 59, 59, 999)),
        },
        timeSlot,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
        },
        id: {
          not: bookingId, // Exclude current booking
        },
      },
    });

    if (existingBooking) {
      throw new AppError('This time slot is already booked', 409);
    }

    const updatedBooking = await prisma.clinicBooking.update({
      where: { id: bookingId },
      data: {
        bookingDate: newDate,
        timeSlot,
        status: 'PENDING', // Reset to pending after reschedule
      },
      include: {
        service: true,
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(res, 'Booking rescheduled successfully', updatedBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm booking (admin only)
 */
export const confirmBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { adminNotes } = req.body;

    const booking = await prisma.clinicBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status !== 'PENDING') {
      throw new AppError('Only pending bookings can be confirmed', 400);
    }

    const updatedBooking = await prisma.clinicBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        adminNotes: adminNotes || null,
      },
      include: {
        service: true,
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // TODO: Send confirmation email to user

    return successResponse(res, 'Booking confirmed', updatedBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * Start booking (admin only) - mark as in progress
 */
export const startBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.clinicBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status !== 'CONFIRMED') {
      throw new AppError('Only confirmed bookings can be started', 400);
    }

    const updatedBooking = await prisma.clinicBooking.update({
      where: { id: bookingId },
      data: {
        status: 'IN_PROGRESS',
      },
    });

    return successResponse(res, 'Booking started', updatedBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * Complete booking (admin only) - mark as completed with results
 */
export const completeBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { resultNotes, certificate } = req.body;

    const booking = await prisma.clinicBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status !== 'IN_PROGRESS') {
      throw new AppError('Only in-progress bookings can be completed', 400);
    }

    const updatedBooking = await prisma.clinicBooking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        resultNotes: resultNotes || null,
        certificate: certificate || null,
        completedAt: new Date(),
      },
      include: {
        service: true,
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // TODO: Send completion email to user with certificate

    return successResponse(res, 'Booking completed', updatedBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin cancel booking
 */
export const adminCancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { adminNotes } = req.body;

    const booking = await prisma.clinicBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new AppError('Cannot cancel booking with current status', 400);
    }

    const updatedBooking = await prisma.clinicBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED_ADMIN',
        adminNotes: adminNotes || null,
        cancelledAt: new Date(),
      },
    });

    // TODO: Send cancellation email to user

    return successResponse(res, 'Booking cancelled by admin', updatedBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings (admin only)
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;

    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (date) {
      const queryDate = new Date(date);
      whereClause.bookingDate = {
        gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        lt: new Date(queryDate.setHours(23, 59, 59, 999)),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      prisma.clinicBooking.findMany({
        where: whereClause,
        include: {
          service: true,
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy: {
          bookingDate: 'asc',
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.clinicBooking.count({ where: whereClause }),
    ]);

    return successResponse(res, 'Bookings retrieved', {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};
