const { z } = require('zod');
const { logger } = require('../utils/logger');

/**
 * Validation schemas for authentication
 */
const authValidationSchemas = {
  register: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
    phone: z.string().regex(/^[+]?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
  }),

  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  }),

  requestPasswordReset: z.object({
    email: z.string().email('Invalid email format'),
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  }),
};

/**
 * Validation schemas for pets
 */
const petValidationSchemas = {
  create: z.object({
    name: z.string().min(1, 'Pet name is required').max(100, 'Pet name must be less than 100 characters'),
    species: z.enum(['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER'], {
      errorMap: () => ({ message: 'Species must be one of: DOG, CAT, BIRD, RABBIT, OTHER' })
    }),
    breed: z.string().min(1, 'Breed is required').max(100, 'Breed must be less than 100 characters'),
    gender: z.enum(['MALE', 'FEMALE'], {
      errorMap: () => ({ message: 'Gender must be either MALE or FEMALE' })
    }),
    age: z.number().int().min(0, 'Age must be at least 0').max(50, 'Age must be less than 50'),
    weight: z.number().positive('Weight must be positive').max(200, 'Weight must be less than 200kg').optional(),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'PENDING', 'RETIRED'], {
      errorMap: () => ({ message: 'Status must be one of: AVAILABLE, UNAVAILABLE, PENDING, RETIRED' })
    }).default('AVAILABLE'),
    location: z.object({
      lat: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
      lng: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
      address: z.string().min(1, 'Address is required').max(500, 'Address must be less than 500 characters')
    }).optional(),
    vaccinated: z.boolean().default(false),
    healthCertified: z.boolean().default(false),
    price: z.number().positive('Price must be positive').max(1000000, 'Price must be less than 1,000,000').optional(),
    birthDate: z.string().datetime('Invalid birth date format').optional(),
    registrationNo: z.string().max(50, 'Registration number must be less than 50 characters').optional(),
    microchipNo: z.string().max(50, 'Microchip number must be less than 50 characters').optional(),
  }),

  update: z.object({
    name: z.string().min(1, 'Pet name must be at least 1 character').max(100, 'Pet name must be less than 100 characters').optional(),
    species: z.enum(['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER']).optional(),
    breed: z.string().min(1, 'Breed must be at least 1 character').max(100, 'Breed must be less than 100 characters').optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    age: z.number().int().min(0, 'Age must be at least 0').max(50, 'Age must be less than 50').optional(),
    weight: z.number().positive('Weight must be positive').max(200, 'Weight must be less than 200kg').optional(),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'PENDING', 'RETIRED']).optional(),
    location: z.object({
      lat: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
      lng: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
      address: z.string().min(1, 'Address is required').max(500, 'Address must be less than 500 characters')
    }).optional(),
    vaccinated: z.boolean().optional(),
    healthCertified: z.boolean().optional(),
    price: z.number().positive('Price must be positive').max(1000000, 'Price must be less than 1,000,000').optional(),
    birthDate: z.string().datetime('Invalid birth date format').optional(),
    registrationNo: z.string().max(50, 'Registration number must be less than 50 characters').optional(),
    microchipNo: z.string().max(50, 'Microchip number must be less than 50 characters').optional(),
  }),
};

/**
 * Validation schemas for breeding requests
 */
const breedingValidationSchemas = {
  create: z.object({
    targetUserId: z.string().uuid('Invalid user ID'),
    targetPetId: z.string().uuid('Invalid pet ID'),
    initiatorPetId: z.string().uuid('Invalid pet ID'),
    message: z.string().max(1000, 'Message must be less than 1000 characters').optional(),
    preferredDate: z.string().datetime('Invalid preferred date format').optional(),
  }),

  update: z.object({
    status: z.enum(['ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'], {
      errorMap: () => ({ message: 'Status must be one of: ACCEPTED, REJECTED, COMPLETED, CANCELLED' })
    }),
    message: z.string().max(1000, 'Message must be less than 1000 characters').optional(),
    preferredDate: z.string().datetime('Invalid preferred date format').optional(),
    rejectionReason: z.string().max(500, 'Rejection reason must be less than 500 characters').optional(),
  }),
};

/**
 * Validation schemas for payments
 */
const paymentValidationSchemas = {
  create: z.object({
    amount: z.number().positive('Amount must be positive').min(1, 'Amount must be at least 1').max(1000000, 'Amount must be less than 1,000,000'),
    paymentMethod: z.enum(['CREDIT_CARD', 'INSTAPAY', 'PAYPAL', 'CASH'], {
      errorMap: () => ({ message: 'Payment method must be one of: CREDIT_CARD, INSTAPAY, PAYPAL, CASH' })
    }),
    breedingRequestId: z.string().uuid('Invalid breeding request ID').optional(),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  }),

  update: z.object({
    status: z.enum(['CONFIRMED', 'REJECTED', 'REFUNDED'], {
      errorMap: () => ({ message: 'Status must be one of: CONFIRMED, REJECTED, REFUNDED' })
    }),
    rejectionReason: z.string().max(500, 'Rejection reason must be less than 500 characters').optional(),
  }),
};

/**
 * Validation schemas for messages
 */
const messageValidationSchemas = {
  create: z.object({
    receiverId: z.string().uuid('Invalid receiver ID'),
    breedingRequestId: z.string().uuid('Invalid breeding request ID').optional(),
    content: z.string().min(1, 'Message content is required').max(1000, 'Message must be less than 1000 characters'),
    messageType: z.enum(['TEXT', 'IMAGE', 'DOCUMENT', 'SYSTEM']).default('TEXT'),
    parentMessageId: z.string().uuid('Invalid parent message ID').optional(),
  }),

  update: z.object({
    content: z.string().min(1, 'Message content must be at least 1 character').max(1000, 'Message must be less than 1000 characters').optional(),
    isRead: z.boolean().optional(),
  }),
};

/**
 * Validation middleware factory
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body
      const validatedData = schema.parse(req.body);
      
      // Replace request body with validated data
      req.body = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => err.message);
        logger.warn('Validation error:', errorMessages);
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages,
          error: 'VALIDATION_ERROR'
        });
      }
      
      logger.error('Unexpected validation error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Validation error occurred',
        error: 'VALIDATION_ERROR'
      });
    }
  };
};

/**
 * Query parameter validation
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      // Validate query parameters
      const validatedData = schema.parse(req.query);
      
      // Replace query with validated data
      req.query = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => err.message);
        logger.warn('Query validation error:', errorMessages);
        
        return res.status(400).json({
          success: false,
          message: 'Query validation failed',
          errors: errorMessages,
          error: 'QUERY_VALIDATION_ERROR'
        });
      }
      
      logger.error('Unexpected query validation error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Query validation error occurred',
        error: 'QUERY_VALIDATION_ERROR'
      });
    }
  };
};

/**
 * Parameters validation
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      // Validate route parameters
      const validatedData = schema.parse(req.params);
      
      // Replace params with validated data
      req.params = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => err.message);
        logger.warn('Params validation error:', errorMessages);
        
        return res.status(400).json({
          success: false,
          message: 'Parameter validation failed',
          errors: errorMessages,
          error: 'PARAMS_VALIDATION_ERROR'
        });
      }
      
      logger.error('Unexpected params validation error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Parameter validation error occurred',
        error: 'PARAMS_VALIDATION_ERROR'
      });
    }
  };
};

module.exports = {
  validateRequest,
  validateQuery,
  validateParams,
  authValidationSchemas,
  petValidationSchemas,
  breedingValidationSchemas,
  paymentValidationSchemas,
  messageValidationSchemas
};
