import { validationResult } from 'express-validator';
import { AppError } from '../utils/errors.js';

/**
 * Validation middleware
 * Checks for validation errors from express-validator
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return next(
      new AppError('Validation failed', 400, extractedErrors)
    );
  }

  next();
};

/**
 * Validate breeding request data
 */
export const validateBreedingRequest = (req, res, next) => {
  const { initiatorPetId, targetPetId } = req.body;

  if (!initiatorPetId || !targetPetId) {
    return next(new AppError('Initiator pet ID and target pet ID are required', 400));
  }

  if (initiatorPetId === targetPetId) {
    return next(new AppError('Cannot create breeding request with the same pet', 400));
  }

  next();
};

/**
 * Validate health record data
 */
export const validateHealthRecord = (req, res, next) => {
  const { petId, recordType, recordDate, veterinarianName } = req.body;

  if (!petId) {
    return next(new AppError('Pet ID is required', 400));
  }

  if (!recordType) {
    return next(new AppError('Record type is required', 400));
  }

  if (!recordDate) {
    return next(new AppError('Record date is required', 400));
  }

  if (!veterinarianName) {
    return next(new AppError('Veterinarian name is required', 400));
  }

  next();
};

/**
 * Validate message data
 */
export const validateMessage = (req, res, next) => {
  const { recipientId, content } = req.body;

  if (!recipientId) {
    return next(new AppError('Recipient ID is required', 400));
  }

  if (!content || content.trim().length === 0) {
    return next(new AppError('Message content is required', 400));
  }

  if (content.length > 5000) {
    return next(new AppError('Message content must be less than 5000 characters', 400));
  }

  next();
};

/**
 * Validate review data
 */
export const validateReview = (req, res, next) => {
  const { revieweeId, breedingRequestId, rating } = req.body;

  if (!revieweeId) {
    return next(new AppError('Reviewee ID is required', 400));
  }

  if (!breedingRequestId) {
    return next(new AppError('Breeding request ID is required', 400));
  }

  if (!rating) {
    return next(new AppError('Rating is required', 400));
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be a number between 1 and 5', 400));
  }

  next();
};
