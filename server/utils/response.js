/**
 * Send success response
 */
export const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    status: 'success',
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    status: 'error',
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

/**
 * Wrapper for common response patterns
 */
export const successResponse = (res, message, data = null, statusCode = 200) => {
  return sendSuccess(res, statusCode, message, data);
};

export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return sendError(res, statusCode, message, errors);
};

/**
 * Send paginated response
 */
export const sendPaginated = (res, statusCode, message, data, pagination) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    },
  });
};
