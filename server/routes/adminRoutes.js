import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin or moderator
const requireAdmin = (req, res, next) => {
  if (!req.user || !['ADMIN', 'MODERATOR', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};

// Middleware to check if user is super admin
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin privileges required.',
    });
  }
  next();
};

// ============== USER MANAGEMENT ==============

// Get all users (Admin only)
router.get('/users', protect, requireAdmin, adminController.getAllUsers);

// Ban user (Admin only)
router.post('/users/ban', protect, requireAdmin, adminController.banUser);

// Unban user (Super Admin only)
router.post('/users/unban', protect, requireSuperAdmin, adminController.unbanUser);

// Add warning (Admin only)
router.post('/users/warning', protect, requireAdmin, adminController.addWarning);

// Change user role (Super Admin only)
router.post(
  '/users/change-role',
  protect,
  requireSuperAdmin,
  adminController.changeUserRole
);

// Delete user account (Super Admin only)
router.delete(
  '/users/:userId',
  protect,
  requireSuperAdmin,
  adminController.deleteUserAccount
);

// ============== CONTENT MODERATION ==============

// Get all reports (Admin only)
router.get('/reports', protect, requireAdmin, adminController.getReports);

// Resolve report (Admin only)
router.post('/reports/:reportId/resolve', protect, requireAdmin, adminController.resolveReport);

// ============== DASHBOARD ==============

// Get dashboard stats (Admin only)
router.get('/dashboard/stats', protect, requireAdmin, adminController.getDashboardStats);

// Get activity data (Admin only)
router.get(
  '/dashboard/activity',
  protect,
  requireAdmin,
  adminController.getActivityData
);

// ============== SYSTEM SETTINGS ==============

// Get system settings (Super Admin only)
router.get(
  '/settings',
  protect,
  requireSuperAdmin,
  adminController.getSystemSettings
);

// Update system settings (Super Admin only)
router.put(
  '/settings',
  protect,
  requireSuperAdmin,
  adminController.updateSystemSettings
);

// Get audit logs (Super Admin only)
router.get('/logs', protect, requireSuperAdmin, adminController.getAuditLogs);

// ============== DANGEROUS ACTIONS ==============

// Clear all cache (Super Admin only)
router.post('/cache/clear', protect, requireSuperAdmin, adminController.clearCache);

// Delete old reports (Super Admin only)
router.post('/reports/cleanup', protect, requireSuperAdmin, adminController.deleteOldReports);

export default router;
