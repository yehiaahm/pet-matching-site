const { authService } = require('../services/authService');
const { logger } = require('../utils/logger');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      
      logger.info(`User registered: ${result.user.email}`);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          ...result,
          user: sanitizeUser(result.user),
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
        error: 'REGISTRATION_FAILED'
      });
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const password = req.body?.password;
      const email = String(req.body?.email || '').trim().toLowerCase();
      const result = await authService.login(email, password);
      
      logger.info(`User logged in: ${result.user.email}`);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          ...result,
          user: sanitizeUser(result.user),
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
        error: 'LOGIN_FAILED'
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res) {
    try {
      const result = req.authResult;
      
      logger.info(`Token refreshed for user: ${result.user.email}`);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      
      res.status(401).json({
        success: false,
        message: error.message || 'Token refresh failed',
        error: 'TOKEN_REFRESH_FAILED'
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      
      logger.info(`User logged out: ${req.user?.email}`);
      
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      
      res.status(400).json({
        success: false,
        message: error.message || 'Logout failed',
        error: 'LOGOUT_FAILED'
      });
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(req, res) {
    try {
      await authService.logoutAllDevices(req.user.id);
      
      logger.info(`User logged out from all devices: ${req.user.email}`);
      
      res.status(200).json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
    } catch (error) {
      logger.error('Logout all devices error:', error);
      
      res.status(400).json({
        success: false,
        message: error.message || 'Logout from all devices failed',
        error: 'LOGOUT_ALL_FAILED'
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          avatarUrl: true,
          emailVerified: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            pets: true,
            initiatedRequests: true,
            targetRequests: true,
            reviews: true
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get profile',
        error: 'GET_PROFILE_FAILED'
      });
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      await authService.changePassword(req.user.id, currentPassword, newPassword);
      
      logger.info(`Password changed for user: ${req.user.email}`);
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error:', error);
      
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to change password',
        error: 'CHANGE_PASSWORD_FAILED'
      });
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      
      await authService.requestPasswordReset(email);
      
      logger.info(`Password reset requested for: ${email}`);
      
      res.status(200).json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    } catch (error) {
      logger.error('Request password reset error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to request password reset',
        error: 'REQUEST_PASSWORD_RESET_FAILED'
      });
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      await authService.resetPassword(token, newPassword);
      
      logger.info(`Password reset completed`);
      
      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reset password',
        error: 'RESET_PASSWORD_FAILED'
      });
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req, res) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { emailVerified: true }
      });

      logger.info(`Email verified for user: ${user.email}`);
      
      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify email',
        error: 'EMAIL_VERIFICATION_FAILED'
      });
    }
  }
}

module.exports = new AuthController();
