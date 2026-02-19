/**
 * Authentication Middleware - Production Ready
 * Verifies JWT tokens and sets req.userId
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * @desc    Authentication middleware
 * @param    {Object} req - Express request object
 * @param    {Object} res - Express response object
 * @param    {Function} next - Express next function
 * @returns  {void}
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
        timestamp: new Date().toISOString()
      });
    }

    // Check token format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format. Expected: "Bearer <token>"',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Token is missing.',
        timestamp: new Date().toISOString()
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user data to request object
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    console.log(`🔐 Authenticated user: ${decoded.email} (${decoded.userId})`);
    
    next();

  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    
    let errorMessage = 'Invalid token';
    
    if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token signature';
    } else if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired';
    } else if (error.name === 'NotBeforeError') {
      errorMessage = 'Token not active';
    }

    return res.status(401).json({
      success: false,
      error: `Authentication failed: ${errorMessage}`,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Optional authentication middleware
 *          Doesn't fail if no token, but sets user data if token exists
 * @param    {Object} req - Express request object
 * @param    {Object} res - Express response object
 * @param    {Function} next - Express next function
 * @returns  {void}
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without auth
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // No token, continue without auth
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user data to request object
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    
    next();

  } catch (error) {
    // Don't fail the request, just continue without auth
    console.log('⚠️ Optional auth failed:', error.message);
    next();
  }
};

/**
 * @desc    Admin role middleware
 *          Must be used after authenticate middleware
 * @param    {Object} req - Express request object
 * @param    {Object} res - Express response object
 * @param    {Function} next - Express next function
 * @returns  {void}
 */
const requireAdmin = (req, res, next) => {
  if (!req.userRole) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      timestamp: new Date().toISOString()
    });
  }

  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin role required.',
      timestamp: new Date().toISOString()
    });
  }

  console.log(`👑 Admin access granted: ${req.userEmail} (${req.userId})`);
  next();
};

/**
 * @desc    Role-based access control middleware
 * @param    {string[]} allowedRoles - Array of allowed roles
 * @returns  {Function} Express middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔐 Role access granted: ${req.userEmail} (${req.userId}) - Role: ${req.userRole}`);
    next();
  };
};

/**
 * @desc    Resource owner middleware
 *          Checks if user owns the resource
 * @param    {string} resourceUserIdField - Field name containing user ID in the resource
 * @returns  {Function} Express middleware function
 */
const requireOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    // Admins can access any resource
    if (req.userRole === 'ADMIN') {
      return next();
    }

    // Get resource user ID from request (should be set by previous middleware)
    const resourceUserId = req[resourceUserIdField] || req.params?.userId || req.body?.userId;

    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        error: 'Resource ownership cannot be verified',
        timestamp: new Date().toISOString()
      });
    }

    if (req.userId !== resourceUserId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own resources.',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔒 Ownership verified: ${req.userEmail} (${req.userId})`);
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin,
  requireRole,
  requireOwnership
};
