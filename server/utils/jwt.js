import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const toPayload = (input, tokenType) => {
  if (typeof input === 'string') {
    return { id: input, tokenType };
  }
  return { ...input, tokenType };
};

/**
 * Generate JWT access token (includes user role in payload)
 */
export const generateAccessToken = (user) => {
  const payload = toPayload(user, 'access');
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (user) => {
  const payload = toPayload(user, 'refresh');
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verify JWT access token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Verify JWT refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Decode JWT token without verification
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
