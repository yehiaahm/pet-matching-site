/**
 * Parse pagination parameters from request
 */
export const parsePagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Parse sort parameters from request
 */
export const parseSort = (req, defaultSort = { createdAt: 'desc' }) => {
  const sortBy = req.query.sortBy;
  const order = req.query.order === 'asc' ? 'asc' : 'desc';

  if (!sortBy) {
    return defaultSort;
  }

  return { [sortBy]: order };
};

/**
 * Parse filter parameters from request
 */
export const parseFilters = (req, allowedFilters = []) => {
  const filters = {};

  allowedFilters.forEach((field) => {
    if (req.query[field] !== undefined && req.query[field] !== '') {
      filters[field] = req.query[field];
    }
  });

  return filters;
};

/**
 * Build where clause for Prisma
 */
export const buildWhereClause = (filters) => {
  const where = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === 'string' && value.includes(',')) {
      // Handle comma-separated values (IN operator)
      where[key] = { in: value.split(',') };
    } else if (typeof value === 'string' && value.startsWith('>')) {
      // Handle greater than
      where[key] = { gt: parseFloat(value.substring(1)) };
    } else if (typeof value === 'string' && value.startsWith('<')) {
      // Handle less than
      where[key] = { lt: parseFloat(value.substring(1)) };
    } else {
      where[key] = value;
    }
  });

  return where;
};
