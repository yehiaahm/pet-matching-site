import { randomUUID } from 'node:crypto';
import prisma from '../prisma/client.js';
import { AppError } from '../utils/appError.js';
import { createNotificationForUser } from './notificationController.js';

const vetClinicsStore = [
  {
    id: 'clinic-cairo-maadi',
    name: 'Al Rahma Veterinary Clinic',
    description: 'General checkups, vaccinations, and breeding consultations.',
    phone: '0100-1234567',
    email: 'booking@alrahma-vet.com',
    address: 'Street 9, Maadi',
    city: 'Cairo',
    country: 'Egypt',
    isActive: true,
    operatingHours: {
      sunday: '10:00-20:00',
      monday: '10:00-20:00',
      tuesday: '10:00-20:00',
      wednesday: '10:00-20:00',
      thursday: '10:00-20:00',
      friday: '12:00-18:00',
      saturday: '10:00-20:00',
    },
    services: [
      { id: 'srv-cairo-checkup', type: 'HEALTH_CHECKUP', name: 'General Health Checkup', duration: 30, price: 350 },
      { id: 'srv-cairo-vaccine', type: 'VACCINATION', name: 'Core Vaccination', duration: 20, price: 300 },
      { id: 'srv-cairo-emergency', type: 'EMERGENCY', name: 'Emergency Visit', duration: 45, price: 600 },
    ],
  },
  {
    id: 'clinic-giza-dokki',
    name: 'Modern Pet Hospital',
    description: 'Advanced diagnostics and complete preventive care.',
    phone: '0111-5551234',
    email: 'appointments@modernpet.eg',
    address: 'Dokki Main Road',
    city: 'Giza',
    country: 'Egypt',
    isActive: true,
    operatingHours: {
      sunday: '09:00-22:00',
      monday: '09:00-22:00',
      tuesday: '09:00-22:00',
      wednesday: '09:00-22:00',
      thursday: '09:00-22:00',
      friday: '13:00-21:00',
      saturday: '09:00-22:00',
    },
    services: [
      { id: 'srv-dokki-checkup', type: 'HEALTH_CHECKUP', name: 'Comprehensive Checkup', duration: 40, price: 450 },
      { id: 'srv-dokki-vaccine', type: 'VACCINATION', name: 'Vaccination Booster', duration: 25, price: 350 },
      { id: 'srv-dokki-genetic', type: 'GENETIC_TEST', name: 'Genetic Test', duration: 50, price: 900 },
    ],
  },
];

const vetBookingsStore = [];

const isAdminLike = (roleValue) => {
  const normalizedRole = String(roleValue || '').toLowerCase().replace(/[-\s]+/g, '_');
  return ['admin', 'super_admin', 'superadmin', 'moderator'].includes(normalizedRole);
};

const getClinicById = (clinicId) => vetClinicsStore.find((clinic) => clinic.id === clinicId && clinic.isActive);

const getServiceById = (clinic, serviceId) => clinic?.services?.find((service) => service.id === serviceId) || null;

const hoursUntil = (dateValue) => {
  const bookingTime = new Date(dateValue).getTime();
  if (!Number.isFinite(bookingTime)) return null;
  return (bookingTime - Date.now()) / (1000 * 60 * 60);
};

export const listVetClinics = async (req, res) => {
  const city = String(req.query.city || '').trim().toLowerCase();
  const serviceType = String(req.query.serviceType || '').trim().toUpperCase();

  let clinics = vetClinicsStore.filter((clinic) => clinic.isActive);
  if (city) clinics = clinics.filter((clinic) => clinic.city.toLowerCase().includes(city));
  if (serviceType) clinics = clinics.filter((clinic) => clinic.services.some((service) => service.type === serviceType));

  res.json({ success: true, data: clinics });
};

export const getVetClinicById = async (req, res) => {
  const clinic = getClinicById(req.params.id);
  if (!clinic) throw new AppError('Clinic not found', 404);
  res.json({ success: true, data: clinic });
};

export const getClinicSlots = async (req, res) => {
  const clinic = getClinicById(req.params.id);
  if (!clinic) throw new AppError('Clinic not found', 404);

  const date = req.query.date ? new Date(String(req.query.date)) : new Date();
  if (Number.isNaN(date.getTime())) throw new AppError('Invalid date', 400);

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const standardSlots = ['10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00'];
  const bookedSlots = vetBookingsStore
    .filter((booking) => booking.clinicId === clinic.id)
    .filter((booking) => new Date(booking.bookingDate) >= dayStart && new Date(booking.bookingDate) <= dayEnd)
    .filter((booking) => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status))
    .map((booking) => booking.timeSlot);

  const availableSlots = standardSlots.filter((slot) => !bookedSlots.includes(slot));
  res.json({ success: true, data: { clinicId: clinic.id, date: dayStart.toISOString(), availableSlots } });
};

export const createVetBooking = async (req, res) => {
  const { clinicId, serviceId, petId, bookingDate, timeSlot, userNotes } = req.body || {};

  if (!clinicId || !serviceId || !petId || !bookingDate || !timeSlot) {
    throw new AppError('clinicId, serviceId, petId, bookingDate and timeSlot are required', 400);
  }

  const clinic = getClinicById(clinicId);
  if (!clinic) throw new AppError('Clinic not found', 404);

  const service = getServiceById(clinic, serviceId);
  if (!service) throw new AppError('Service not found', 404);

  const pet = await prisma.pet.findUnique({ where: { id: petId }, select: { id: true, ownerId: true, name: true } });
  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.ownerId !== req.user.id && !isAdminLike(req.user.role)) throw new AppError('Forbidden', 403);

  const bookingAt = new Date(bookingDate);
  if (Number.isNaN(bookingAt.getTime())) throw new AppError('Invalid booking date', 400);

  const conflict = vetBookingsStore.find(
    (booking) =>
      booking.clinicId === clinicId
      && booking.timeSlot === timeSlot
      && new Date(booking.bookingDate).toDateString() === bookingAt.toDateString()
      && ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status)
  );

  if (conflict) throw new AppError('Selected slot is already booked', 409);

  const booking = {
    id: randomUUID(),
    clinicId,
    clinicName: clinic.name,
    serviceId,
    serviceName: service.name,
    serviceType: service.type,
    petId,
    petName: pet.name,
    userId: req.user.id,
    bookingDate: bookingAt.toISOString(),
    timeSlot,
    status: 'PENDING',
    userNotes: String(userNotes || ''),
    adminNotes: null,
    resultNotes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    cancelledAt: null,
  };

  vetBookingsStore.unshift(booking);

  createNotificationForUser({
    userId: req.user.id,
    title: `Vet booking created - ${pet.name}`,
    message: `Your booking at ${clinic.name} for ${service.name} on ${new Date(booking.bookingDate).toLocaleDateString()} (${timeSlot}) is pending confirmation.`,
    type: 'INFO',
    priority: 'MEDIUM',
  });

  const upcomingHours = hoursUntil(booking.bookingDate);
  if (upcomingHours != null && upcomingHours <= 24 && upcomingHours >= 0) {
    createNotificationForUser({
      userId: req.user.id,
      title: `Upcoming vet visit in less than 24h`,
      message: `Reminder: ${pet.name} has a vet booking at ${clinic.name} within 24 hours.`,
      type: 'WARNING',
      priority: 'HIGH',
    });
  }

  res.status(201).json({ success: true, data: booking });
};

export const myVetBookings = async (req, res) => {
  const bookings = vetBookingsStore
    .filter((booking) => booking.userId === req.user.id)
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

  res.json({ success: true, data: bookings });
};

export const adminVetBookings = async (req, res) => {
  if (!isAdminLike(req.user.role)) throw new AppError('Admin only', 403);

  const status = String(req.query.status || '').toUpperCase();
  const clinicId = String(req.query.clinicId || '');

  let bookings = [...vetBookingsStore];
  if (status) bookings = bookings.filter((booking) => booking.status === status);
  if (clinicId) bookings = bookings.filter((booking) => booking.clinicId === clinicId);

  bookings.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  res.json({ success: true, data: bookings });
};

export const updateVetBookingStatus = async (req, res) => {
  if (!isAdminLike(req.user.role)) throw new AppError('Admin only', 403);

  const booking = vetBookingsStore.find((item) => item.id === req.params.id);
  if (!booking) throw new AppError('Booking not found', 404);

  const status = String(req.body?.status || '').toUpperCase();
  const allowedStatus = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_ADMIN', 'NO_SHOW'];
  if (!allowedStatus.includes(status)) throw new AppError('Invalid status', 400);

  booking.status = status;
  booking.adminNotes = String(req.body?.adminNotes || booking.adminNotes || '');
  booking.resultNotes = String(req.body?.resultNotes || booking.resultNotes || '');
  booking.updatedAt = new Date().toISOString();
  if (status === 'COMPLETED') booking.completedAt = new Date().toISOString();
  if (status.startsWith('CANCELLED')) booking.cancelledAt = new Date().toISOString();

  createNotificationForUser({
    userId: booking.userId,
    title: `Vet booking update - ${booking.petName}`,
    message: `Your booking at ${booking.clinicName} is now ${status.replace('_', ' ')}.`,
    type: status === 'COMPLETED' ? 'INFO' : 'WARNING',
    priority: status === 'COMPLETED' ? 'MEDIUM' : 'HIGH',
  });

  if (status === 'COMPLETED') {
    const vaccineValue = booking.serviceType === 'VACCINATION' ? booking.serviceName : null;
    await prisma.healthRecord.create({
      data: {
        petId: booking.petId,
        vaccine: vaccineValue,
        notes: booking.resultNotes || `Completed at ${booking.clinicName} (${booking.serviceName})`,
        vetName: booking.clinicName,
        date: new Date(),
      },
    });

    createNotificationForUser({
      userId: booking.userId,
      title: `Health record updated - ${booking.petName}`,
      message: `The clinic visit result was added to ${booking.petName}'s health record.`,
      type: 'INFO',
      priority: 'MEDIUM',
    });
  }

  res.json({ success: true, data: booking });
};
