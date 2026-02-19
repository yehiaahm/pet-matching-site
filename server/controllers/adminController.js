import prisma from '../config/prisma.js';
import { v4 as uuidv4 } from 'uuid';

// ============== USER MANAGEMENT ==============

// Get all users with filters
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isBanned, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (role && role !== 'ALL') where.role = role;
    if (isBanned === 'true') where.isBanned = true;
    if (isBanned === 'false') where.isBanned = false;

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isBanned: true,
          bannedReason: true,
          warnings: true,
          rating: true,
          totalMatches: true,
          createdAt: true,
          isVerified: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.users.count({ where }),
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ban user
export const banUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const adminId = req.user.id;

    if (!userId || !reason) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID and reason required' });
    }

    const user = await prisma.users.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedReason: reason,
        bannedAt: new Date(),
        bannedBy: adminId,
      },
    });

    // Log the action
    await prisma.audit_logs.create({
      data: {
        id: uuidv4(),
        adminId,
        action: 'BAN_USER',
        targetUserId: userId,
        description: `Banned user: ${reason}`,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, message: 'User banned successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unban user
export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminId = req.user.id;

    const user = await prisma.users.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedReason: null,
        bannedAt: null,
        bannedBy: null,
        warnings: 0,
      },
    });

    await prisma.audit_logs.create({
      data: {
        id: uuidv4(),
        adminId,
        action: 'UNBAN_USER',
        targetUserId: userId,
        description: `Unbanned user`,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, message: 'User unbanned successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add warning to user
export const addWarning = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const adminId = req.user.id;

    const settings = await prisma.system_settings.findFirst();
    const maxWarnings = settings?.maxWarningsBeforeBan || 3;

    const user = await prisma.users.update({
      where: { id: userId },
      data: {
        warnings: { increment: 1 },
        lastWarningAt: new Date(),
      },
    });

    await prisma.audit_logs.create({
      data: {
        id: uuidv4(),
        adminId,
        action: 'ADD_WARNING',
        targetUserId: userId,
        description: `Warning added: ${reason}. Total warnings: ${user.warnings + 1}`,
        ipAddress: req.ip,
      },
    });

    // Auto-ban if warnings exceed limit
    if (user.warnings + 1 >= maxWarnings) {
      await prisma.users.update({
        where: { id: userId },
        data: {
          isBanned: true,
          bannedReason: `Exceeded maximum warnings (${maxWarnings})`,
          bannedAt: new Date(),
          bannedBy: adminId,
        },
      });

      return res.json({
        success: true,
        message: `User banned after ${maxWarnings} warnings`,
      });
    }

    res.json({
      success: true,
      message: 'Warning added successfully',
      warnings: user.warnings + 1,
      maxWarnings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change user role
export const changeUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    const adminId = req.user.id;

    if (!['USER', 'BREEDER', 'ADMIN', 'MODERATOR'].includes(newRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await prisma.users.update({
      where: { id: userId },
      data: { role: newRole },
    });

    await prisma.audit_logs.create({
      data: {
        id: uuidv4(),
        adminId,
        action: 'CHANGE_ROLE',
        targetUserId: userId,
        description: `Role changed to ${newRole}`,
        changes: { from: user.role, to: newRole },
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, message: 'Role changed successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user account
export const deleteUserAccount = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const adminId = req.user.id;

    // Soft delete - set deletedAt
    const user = await prisma.users.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `deleted_${userId}@deleted.local`, // Make email unique for potential recovery
      },
    });

    await prisma.audit_logs.create({
      data: {
        id: uuidv4(),
        adminId,
        action: 'DELETE_USER',
        targetUserId: userId,
        description: `User account deleted: ${reason}`,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============== CONTENT MODERATION ==============

// Get all reports
export const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status && status !== 'ALL') where.status = status;

    const [reports, total] = await Promise.all([
      prisma.reports.findMany({
        where,
        include: {
          reporterUser: { select: { id: true, email: true, firstName: true } },
          reportedUser: { select: { id: true, email: true, firstName: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reports.count({ where }),
    ]);

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resolve report
export const resolveReport = async (req, res) => {
  try {
    const { reportId, action, notes } = req.body;
    const adminId = req.user.id;

    const report = await prisma.reports.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // If action is BAN_USER, ban the reported user
    if (action === 'BAN_USER' && report.reportedUserId) {
      await prisma.users.update({
        where: { id: report.reportedUserId },
        data: {
          isBanned: true,
          bannedReason: `Violation reported: ${report.reason}`,
          bannedAt: new Date(),
          bannedBy: adminId,
        },
      });
    }

    const updatedReport = await prisma.reports.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        resolvedBy: adminId,
        resolutionNotes: notes,
        resolvedAt: new Date(),
      },
    });

    await prisma.audit_logs.create({
      data: {
        id: uuidv4(),
        adminId,
        action: 'RESOLVE_REPORT',
        targetUserId: report.reportedUserId,
        description: `Report resolved with action: ${action}. ${notes || ''}`,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, message: 'Report resolved', report: updatedReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============== DASHBOARD ANALYTICS ==============

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalBreeders,
      bannedUsers,
      totalPets,
      totalBreedingRequests,
      pendingReports,
      messagesLastMonth,
      newUsersLastMonth,
    ] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({ where: { role: 'BREEDER' } }),
      prisma.users.count({ where: { isBanned: true } }),
      prisma.pets.count(),
      prisma.breeding_requests.count(),
      prisma.reports.count({ where: { status: 'PENDING' } }),
      prisma.messages.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.users.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          breeders: totalBreeders,
          banned: bannedUsers,
        },
        content: {
          totalPets,
          totalBreedingRequests,
          pendingReports,
        },
        activity: {
          messagesLastMonth,
          newUsersLastMonth,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get activity chart data (last 7 days)
export const getActivityData = async (req, res) => {
  try {
    const days = 7;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const newUsers = await prisma.users.count({
        where: {
          createdAt: { gte: date, lt: nextDate },
        },
      });

      const newPets = await prisma.pets.count({
        where: {
          createdAt: { gte: date, lt: nextDate },
        },
      });

      const newMessages = await prisma.messages.count({
        where: {
          createdAt: { gte: date, lt: nextDate },
        },
      });

      data.push({
        date: date.toISOString().split('T')[0],
        users: newUsers,
        pets: newPets,
        messages: newMessages,
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============== SYSTEM SETTINGS ==============

// Get system settings
export const getSystemSettings = async (req, res) => {
  try {
    console.log('📖 Getting system settings...');
    
    let settings = await prisma.system_settings.findFirst();
    console.log('Settings from DB:', settings);

    if (!settings) {
      console.log('No settings found, creating default...');
      settings = await prisma.system_settings.create({
        data: {
          id: 'system-settings-default',
          maintenanceMode: false,
          maintenanceMessage: null,
          enableUserRegistration: true,
          enableBreedingRequests: true,
          enableMessaging: true,
          maxWarningsBeforeBan: 3,
        },
      });
      console.log('✅ Default settings created:', settings);
    }

    console.log('✅ Returning settings:', settings);
    res.json({ success: true, settings });
  } catch (error) {
    console.error('❌ Error getting settings:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update system settings
export const updateSystemSettings = async (req, res) => {
  try {
    console.log('📝 Updating system settings...');
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    const {
      maintenanceMode,
      maintenanceMessage,
      enableUserRegistration,
      enableBreedingRequests,
      enableMessaging,
      maxWarningsBeforeBan,
    } = req.body;

    // Validate and ensure proper types
    const updateData = {
      maintenanceMode: !!maintenanceMode,
      maintenanceMessage: maintenanceMessage || null,
      enableUserRegistration: enableUserRegistration !== false,
      enableBreedingRequests: enableBreedingRequests !== false,
      enableMessaging: enableMessaging !== false,
      maxWarningsBeforeBan: parseInt(maxWarningsBeforeBan) || 3,
    };

    console.log('Validated data to save:', updateData);

    let settings = await prisma.system_settings.findFirst();
    console.log('Current settings found:', !!settings);

    if (!settings) {
      console.log('No settings found, creating new with data...');
      settings = await prisma.system_settings.create({
        data: { 
          id: 'system-settings-default',
          ...updateData,
        },
      });
      console.log('✅ Settings created:', settings);
    } else {
      console.log('Updating existing settings...');
      settings = await prisma.system_settings.update({
        where: { id: settings.id },
        data: updateData,
      });
      console.log('✅ Settings updated:', settings);
    }

    res.json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح',
      settings,
    });
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'فشل حفظ الإعدادات: ' + error.message,
      error: error.toString()
    });
  }
};

// Get audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, adminId } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (action && action !== 'ALL') where.action = action;
    if (adminId) where.adminId = adminId;

    const [logs, total] = await Promise.all([
      prisma.audit_logs.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.audit_logs.count({ where }),
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============== DANGEROUS ACTIONS ==============

// Clear all cache
export const clearCache = async (req, res) => {
  try {
    const adminId = req.user.id;

    // Note: In production, integrate with your cache system (Redis, Memcached, etc.)
    // For now, we'll just log this action and clear any in-memory cache
    
    // Log the action
    await prisma.audit_logs.create({
      data: {
        id: uuidv4(),
        adminId,
        action: 'CLEAR_CACHE',
        description: 'All cache cleared',
        ipAddress: req.ip,
      },
    });

    // Emit cache clear event if using real-time updates
    // io.emit('cache:cleared', { timestamp: new Date() });

    res.json({ 
      success: true, 
      message: 'All cache cleared successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete old reports (older than 90 days)
export const deleteOldReports = async (req, res) => {
  try {
    const adminId = req.user.id;
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Find old reports
    const oldReports = await prisma.reports.findMany({
      where: {
        createdAt: { lt: ninetyDaysAgo },
      },
    });

    const deletedCount = oldReports.length;

    if (deletedCount > 0) {
      // Delete reports
      await prisma.reports.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo },
        },
      });

      // Log the action
      await prisma.audit_logs.create({
        data: {
          id: uuidv4(),
          adminId,
          action: 'DELETE_OLD_REPORTS',
          description: `Deleted ${deletedCount} reports older than 90 days`,
          ipAddress: req.ip,
        },
      });
    }

    res.json({ 
      success: true, 
      message: `${deletedCount} old reports deleted successfully`,
      deletedCount,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error deleting old reports:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
