import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';

/**
 * Get clinic information
 */
export const getClinicInfo = async (req, res, next) => {
  try {
    const clinic = await prisma.clinic.findFirst({
      include: {
        services: {
          where: { isActive: true },
          orderBy: { type: 'asc' },
        },
      },
    });

    if (!clinic) {
      throw new AppError('Clinic not found', 404);
    }

    return successResponse(res, 'Clinic information retrieved', clinic);
  } catch (error) {
    next(error);
  }
};

/**
 * Get available services
 */
export const getServices = async (req, res, next) => {
  try {
    const services = await prisma.clinicService.findMany({
      where: { isActive: true },
      orderBy: { type: 'asc' },
    });

    return successResponse(res, 'Services retrieved', services);
  } catch (error) {
    next(error);
  }
};

/**
 * Get service by ID
 */
export const getServiceById = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    const service = await prisma.clinicService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    return successResponse(res, 'Service retrieved', service);
  } catch (error) {
    next(error);
  }
};
