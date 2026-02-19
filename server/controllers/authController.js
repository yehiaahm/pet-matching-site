import { z } from 'zod';
import { randomUUID } from 'crypto';
import prisma from '../config/prisma.js';
import config from '../config/index.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { hashPassword, comparePassword } from '../utils/encryption.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendSuccess } from '../utils/response.js';
import { AppError, AuthenticationError, ConflictError } from '../utils/errors.js';
import logger from '../config/logger.js';

// Zod schema for registration validation
const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
  firstName: z
    .string()
    .trim()
    .min(2, { message: 'First name must be at least 2 characters' })
    .max(50, { message: 'First name must be at most 50 characters' }),
  lastName: z
    .string()
    .trim()
    .min(2, { message: 'Last name must be at least 2 characters' })
    .max(50, { message: 'Last name must be at most 50 characters' }),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/u, {
      message: 'Please provide a valid phone number',
    })
    .optional()
    .nullable(),
});

const formatZodErrors = (issues) =>
  issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));

const buildCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax',
  maxAge: maxAgeMs,
  path: '/',
});

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Register new user
 */
export const register = catchAsync(async (req, res, next) => {
  console.log('==========================================');
  console.log('📝 NEW REGISTRATION REQUEST');
  console.log('==========================================');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    console.error('❌ Validation failed:', parsed.error.issues);
    const errors = formatZodErrors(parsed.error.issues);
    return next(new AppError('Validation failed', 400, errors));
  }

  const { email, password, firstName, lastName, phone } = parsed.data;
  console.log('✅ Validation passed for:', email);

  // Check if user already exists
  console.log('🔍 Checking if user exists...');
  const existingUser = await prisma.users.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('❌ User already exists:', email);
    return next(new ConflictError('User with this email already exists'));
  }
  console.log('✅ User does not exist, proceeding...');

  // Hash password
  console.log('🔒 Hashing password...');
  const hashedPassword = await hashPassword(password);
  console.log('✅ Password hashed');

  // Create user
  console.log('👤 Creating user with data:', {
    email,
    firstName,
    lastName,
    phone: phone || 'null',
    hasPassword: !!hashedPassword
  });
  
  const user = await prisma.users.create({
    data: {
      id: randomUUID(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
  console.log('✅ User created successfully:', user.id);

  // Generate tokens
  console.log('🔑 Generating tokens...');
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });
  console.log('✅ Tokens generated');

  // Save refresh token
  console.log('💾 Saving refresh token...');
  await prisma.refresh_tokens.create({
    data: {
      id: randomUUID(),
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });
  console.log('✅ Refresh token saved');

  logger.info(`New user registered: ${user.email}`);

  // Set HttpOnly cookies
  res.cookie('accessToken', accessToken, buildCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
  res.cookie('refreshToken', refreshToken, buildCookieOptions(REFRESH_TOKEN_MAX_AGE_MS));

  console.log('📤 Sending success response...');
  
  // Send response with correct format: { status, message, data: { user, accessToken } }
  sendSuccess(res, 201, 'User registered successfully', {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
    },
    accessToken,
  });
  
  console.log('✅ Registration completed successfully!');
  console.log('==========================================');
});

/**
 * Login user
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  // Check if user exists
  const user = await prisma.users.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return next(new AuthenticationError('Invalid email or password'));
  }

  // Check if password is correct
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return next(new AuthenticationError('Invalid email or password'));
  }

  // Generate tokens
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

  // Save refresh token
  await prisma.refresh_tokens.create({
    data: {
      id: randomUUID(),
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Remove password from output
  const { password: _, ...userWithoutPassword } = user;

  logger.info(`User logged in: ${user.email}`);

  // Set HttpOnly cookies
  res.cookie('accessToken', accessToken, buildCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
  res.cookie('refreshToken', refreshToken, buildCookieOptions(REFRESH_TOKEN_MAX_AGE_MS));

  sendSuccess(res, 200, 'Login successful', {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  });
});

/**
 * Refresh access token
 */
export const refreshAccessToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AuthenticationError('Refresh token is required'));
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    return next(new AuthenticationError('Invalid or expired refresh token'));
  }

  // Check if refresh token exists and is not revoked
  const storedToken = await prisma.refresh_tokens.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.isRevoked) {
    return next(new AuthenticationError('Invalid or revoked refresh token'));
  }

  // Check if token is expired
  if (new Date() > storedToken.expiresAt) {
    return next(new AuthenticationError('Refresh token has expired'));
  }

  // Generate new access token (keep role from refresh token payload if present)
  const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });

  // Update access token cookie
  res.cookie('accessToken', accessToken, buildCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));

  sendSuccess(res, 200, 'Token refreshed successfully', {
    accessToken,
  });
});

/**
 * Logout user
 */
export const logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Revoke refresh token
    await prisma.refresh_tokens.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }

  logger.info(`User logged out: ${req.user?.email || 'Unknown'}`);

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  sendSuccess(res, 200, 'Logout successful', null);
});

/**
 * Get current user profile
 */
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await prisma.users.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isVerified: true,
      avatar: true,
      bio: true,
      address: true,
      city: true,
      country: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  sendSuccess(res, 200, 'Profile retrieved successfully', { user });
});

/**
 * Update user profile
 */
export const updateProfile = catchAsync(async (req, res, next) => {
  const { firstName, lastName, phone, bio, address, city, country } = req.body;

  const user = await prisma.users.update({
    where: { id: req.user.id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone && { phone }),
      ...(bio && { bio }),
      ...(address && { address }),
      ...(city && { city }),
      ...(country && { country }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      avatar: true,
      bio: true,
      address: true,
      city: true,
      country: true,
      updatedAt: true,
    },
  });

  logger.info(`User profile updated: ${user.email}`);

  sendSuccess(res, 200, 'Profile updated successfully', { user });
});

/**
 * Change password
 */
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await prisma.users.findUnique({
    where: { id: req.user.id },
  });

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    return next(new AuthenticationError('Current password is incorrect'));
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.users.update({
    where: { id: req.user.id },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  // Revoke all refresh tokens
  await prisma.refresh_tokens.updateMany({
    where: { userId: req.user.id },
    data: { isRevoked: true },
  });

  logger.info(`Password changed for user: ${user.email}`);

  sendSuccess(res, 200, 'Password changed successfully', null);
});
