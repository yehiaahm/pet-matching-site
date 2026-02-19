import bcrypt from 'bcryptjs';
import config from '../config/index.js';

/**
 * Hash password
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, config.security.bcryptRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate random token
 */
export const generateRandomToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};
