const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
  }

  // Validation schemas
  registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z.string().optional(),
  });

  loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  });

  /**
   * Register a new user
   */
  async register(userData) {
    try {
      // Validate input
      const validatedData = this.registerSchema.parse(userData);
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          ...validatedData,
          passwordHash,
          role: 'USER',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          avatarUrl: true,
          emailVerified: true,
          createdAt: true,
        }
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id);

      return {
        success: true,
        user,
        tokens,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Validate input
      const validatedData = this.loginSchema.parse({ email, password });

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id);

      // Return user data without password
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        tokens,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(userId) {
    try {
      // Generate access token
      const accessToken = jwt.sign(
        { userId, type: 'access' },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { userId, type: 'refresh' },
        this.jwtSecret,
        { expiresIn: this.refreshTokenExpiresIn }
      );

      // Store refresh token in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId,
          expiresAt,
        }
      });

      return {
        accessToken,
        refreshToken,
        expiresIn: this.jwtExpiresIn,
      };
    } catch (error) {
      throw new Error('Failed to generate tokens');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtSecret);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token');
      }

      // Remove old refresh token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id }
      });

      // Generate new tokens
      const tokens = await this.generateTokens(storedToken.userId);

      // Return user data without password
      const { passwordHash, ...userWithoutPassword } = storedToken.user;

      return {
        success: true,
        user: userWithoutPassword,
        tokens,
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken) {
    try {
      // Remove refresh token from database
      await prisma.refreshToken.delete({
        where: { token: refreshToken }
      });

      return { success: true };
    } catch (error) {
      // Token might not exist, but that's okay for logout
      return { success: true };
    }
  }

  /**
   * Logout all devices
   */
  async logoutAllDevices(userId) {
    try {
      // Remove all refresh tokens for user
      await prisma.refreshToken.deleteMany({
        where: { userId }
      });

      return { success: true };
    } catch (error) {
      throw new Error('Failed to logout from all devices');
    }
  }

  /**
   * Verify access token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
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
          createdAt: true,
        }
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return user;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash }
      });

      // Logout from all devices
      await this.logoutAllDevices(userId);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if user exists or not
        return { success: true };
      }

      // Generate reset token (valid for 1 hour)
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        this.jwtSecret,
        { expiresIn: '1h' }
      );

      // TODO: Send email with reset token
      // For now, just return success
      console.log('Password reset token:', resetToken);

      return { success: true };
    } catch (error) {
      throw new Error('Failed to request password reset');
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    try {
      // Verify token
      const decoded = jwt.verify(token, this.jwtSecret);
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash }
      });

      // Logout from all devices
      await this.logoutAllDevices(decoded.userId);

      return { success: true };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid or expired token');
      }
      throw error;
    }
  }
}

module.exports = new AuthService();
