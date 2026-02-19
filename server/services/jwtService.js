const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

class JWTService {
  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    
    // In production, store these in a secure database
    this.refreshTokenStore = new Map(); // userId -> { token, family, createdAt, lastUsed }
    this.blacklistedTokens = new Set(); // Blacklisted access tokens
  }

  /**
   * Generate a cryptographically secure random token
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create access and refresh tokens for a user
   */
  async generateTokenPair(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user',
      sessionId: this.generateSecureToken(16)
    };

    // Generate access token
    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'petmat-api',
      audience: 'petmat-client'
    });

    // Generate refresh token family
    const tokenFamily = this.generateSecureToken(16);
    const refreshTokenValue = this.generateSecureToken(64);

    // Store refresh token info
    this.refreshTokenStore.set(user.id, {
      token: refreshTokenValue,
      family: tokenFamily,
      createdAt: new Date(),
      lastUsed: new Date(),
      sessionId: payload.sessionId
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      tokenFamily,
      sessionId: payload.sessionId,
      expiresIn: this.parseExpiry(this.accessTokenExpiry)
    };
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token) {
    try {
      // Check if token is blacklisted
      if (this.blacklistedTokens.has(token)) {
        throw new Error('Token has been revoked');
      }

      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'petmat-api',
        audience: 'petmat-client'
      });

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token');
      } else {
        throw error;
      }
    }
  }

  /**
   * Refresh tokens with rotation
   */
  async refreshTokens(refreshToken, userAgent, ipAddress) {
    try {
      // Find the refresh token in store
      let tokenInfo = null;
      let userId = null;

      for (const [uid, info] of this.refreshTokenStore.entries()) {
        if (info.token === refreshToken) {
          tokenInfo = info;
          userId = uid;
          break;
        }
      }

      if (!tokenInfo) {
        throw new Error('Invalid or expired refresh token');
      }

      // Check for suspicious activity (token reuse detection)
      const timeSinceLastUse = Date.now() - tokenInfo.lastUsed.getTime();
      if (timeSinceLastUse < 1000) { // Less than 1 second - possible replay attack
        // Invalidate entire token family
        this.invalidateTokenFamily(userId);
        throw new Error('Possible token reuse detected - all tokens invalidated');
      }

      // Get user information (in production, fetch from database)
      const user = {
        id: userId,
        email: `user${userId}@example.com`,
        role: 'user'
      };

      // Generate new token pair
      const newTokens = await this.generateTokenPair(user);

      // Maintain the same token family for rotation tracking
      newTokens.tokenFamily = tokenInfo.family;

      // Update refresh token store with new token
      this.refreshTokenStore.set(userId, {
        token: newTokens.refreshToken,
        family: tokenInfo.family,
        createdAt: tokenInfo.createdAt,
        lastUsed: new Date(),
        sessionId: newTokens.sessionId
      });

      // Log token rotation for security monitoring
      console.log(`Token rotated for user ${userId} from ${ipAddress} (${userAgent})`);

      return newTokens;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Invalidate a specific token family (security measure)
   */
  invalidateTokenFamily(userId) {
    const tokenInfo = this.refreshTokenStore.get(userId);
    if (tokenInfo) {
      // Add family to blacklist
      this.blacklistedTokens.add(tokenInfo.family);
      // Remove from active store
      this.refreshTokenStore.delete(userId);
      
      console.log(`Token family ${tokenInfo.family} invalidated for user ${userId}`);
    }
  }

  /**
   * Logout user and invalidate tokens
   */
  async logout(userId, accessToken = null) {
    // Invalidate refresh token
    this.invalidateTokenFamily(userId);

    // Blacklist access token if provided
    if (accessToken) {
      this.blacklistedTokens.add(accessToken);
    }

    return { success: true };
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices(userId) {
    this.invalidateTokenFamily(userId);
    return { success: true };
  }

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(userId) {
    const tokenInfo = this.refreshTokenStore.get(userId);
    if (!tokenInfo) {
      return [];
    }

    return [{
      sessionId: tokenInfo.sessionId,
      createdAt: tokenInfo.createdAt,
      lastUsed: tokenInfo.lastUsed,
      family: tokenInfo.family
    }];
  }

  /**
   * Cleanup expired tokens (run periodically)
   */
  cleanupExpiredTokens() {
    const now = new Date();
    const expiredThreshold = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago

    for (const [userId, tokenInfo] of this.refreshTokenStore.entries()) {
      if (tokenInfo.createdAt < expiredThreshold) {
        this.refreshTokenStore.delete(userId);
      }
    }

    // Clean up blacklisted tokens older than 1 hour
    const blacklistCleanup = [];
    for (const token of this.blacklistedTokens) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp * 1000 < Date.now() - 3600000) { // 1 hour ago
          blacklistCleanup.push(token);
        }
      } catch (error) {
        blacklistCleanup.push(token);
      }
    }

    blacklistCleanup.forEach(token => this.blacklistedTokens.delete(token));
  }

  /**
   * Parse expiry string to seconds
   */
  parseExpiry(expiry) {
    const units = {
      's': 1,
      'm': 60,
      'h': 3600,
      'd': 86400
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const [, amount, unit] = match;
    return parseInt(amount) * (units[unit] || 60);
  }

  /**
   * Validate token strength and format
   */
  validateTokenFormat(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // JWT tokens should have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }
}

module.exports = JWTService;
