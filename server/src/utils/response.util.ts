/**
 * Response Utility Functions
 * Standardized API response formatting
 */

import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T = ApiResponse<T> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  options: {
    message?: string;
    data?: T;
    meta?: any;
  } = {}
): void {
  const response: ApiResponse<T> = {
    success: true,
    message: options.message || 'Success',
    data: options.data,
    timestamp: new Date().toISOString(),
  };

  if (options.meta) {
    Object.assign(response, options.meta);
  }

  res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  error?: any
): void {
  const response: ApiResponse<null> = {
    success: false,
    message,
    error: error?.message || message,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}

/**
 * Send paginated response
 */
export function sendPaginated<T>(
  res: Response,
  result: {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  },
  options: {
    message?: string;
    meta?: any;
  } = {}
): void {
  const hasNext = result.page < result.totalPages;
  const hasPrev = result.page > 1;

  const response: PaginatedResponse<T> = {
    success: true,
    message: options.message || 'Data retrieved successfully',
    data: result.data,
    timestamp: new Date().toISOString(),
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNext,
      hasPrev,
    },
  };

  if (options.meta) {
    Object.assign(response, options.meta);
  }

  res.status(200).json(response);
}

/**
 * Send validation error response
 */
export function sendValidationError(
  res: Response,
  errors: any,
  message: string = 'Validation failed'
): void {
  const response: ApiResponse<null> = {
    success: false,
    message,
    error: 'Validation Error',
    timestamp: new Date().toISOString(),
  };

  res.status(400).json({
    ...response,
    errors,
  });
}

/**
 * Send created response
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): void {
  sendSuccess(res, 201, { message, data });
}

/**
 * Send no content response
 */
export function sendNoContent(res: Response, message: string = 'Operation completed successfully'): void {
  sendSuccess(res, 204, { message });
}

/**
 * Send unauthorized response
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized access'
): void {
  sendError(res, 401, message);
}

/**
 * Send forbidden response
 */
export function sendForbidden(
  res: Response,
  message: string = 'Access forbidden'
): void {
  sendError(res, 403, message);
}

/**
 * Send not found response
 */
export function sendNotFound(
  res: Response,
  message: string = 'Resource not found'
): void {
  sendError(res, 404, message);
}

/**
 * Send conflict response
 */
export function sendConflict(
  res: Response,
  message: string = 'Resource conflict'
): void {
  sendError(res, 409, message);
}

/**
 * Send too many requests response
 */
export function sendTooManyRequests(
  res: Response,
  message: string = 'Too many requests'
): void {
  sendError(res, 429, message);
}

/**
 * Send internal server error response
 */
export function sendInternalServerError(
  res: Response,
  message: string = 'Internal server error'
): void {
  sendError(res, 500, message);
}

/**
 * Send service unavailable response
 */
export function sendServiceUnavailable(
  res: Response,
  message: string = 'Service temporarily unavailable'
): void {
  sendError(res, 503, message);
}
