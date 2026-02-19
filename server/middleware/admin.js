/**
 * Admin Middleware
 * Ensures user has ADMIN role
 */

/**
 * Verify admin role
 * Must be called after protect middleware (which sets req.user)
 */
export const verifyAdmin = (req, res, next) => {
  try {
    // User is attached by protect middleware
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: Authentication required'
      });
    }

    // Check if user has ADMIN role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Admin access required'
      });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Admin verification failed'
    });
  }
};
