// Security utilities for frontend JWT authentication

export class SecurityUtils {
  /**
   * Generate cryptographically secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate JWT token format
   */
  static validateJWTFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Decode JWT payload without verification (for debugging only)
   */
  static decodeJWTPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to decode JWT payload:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeJWTPayload(token);
      if (!payload || !payload.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const payload = this.decodeJWTPayload(token);
      if (!payload || !payload.exp) {
        return null;
      }

      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Time until token expires (in milliseconds)
   */
  static getTimeUntilExpiration(token: string): number {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      return 0;
    }

    return expiration.getTime() - Date.now();
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 6) {
      score += 1;
    } else {
      feedback.push('Password must be at least 6 characters long');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one number');
    }

    // Special character check (optional - bonus points)
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    }

    // Common patterns check
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      feedback.push('Avoid repeating characters');
    }

    // Common passwords check (basic list)
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      score -= 2;
      feedback.push('Avoid common passwords');
    }

    return {
      isValid: score >= 3 && feedback.length === 0,
      score: Math.max(0, Math.min(5, score)),
      feedback
    };
  }

  /**
   * Generate password strength indicator
   */
  static getPasswordStrengthText(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return 'Very Weak';
      case 2:
        return 'Weak';
      case 3:
        return 'Fair';
      case 4:
        return 'Strong';
      case 5:
        return 'Very Strong';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get password strength color
   */
  static getPasswordStrengthColor(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return 'red';
      case 2:
        return 'orange';
      case 3:
        return 'yellow';
      case 4:
        return 'lightgreen';
      case 5:
        return 'green';
      default:
        return 'gray';
    }
  }

  /**
   * Rate limiting for client-side
   */
  static createRateLimiter(maxAttempts: number, windowMs: number) {
    const attempts = new Map<string, { count: number; resetTime: number }>();

    return {
      canAttempt(identifier: string): boolean {
        const now = Date.now();
        const record = attempts.get(identifier);

        if (!record || now > record.resetTime) {
          attempts.set(identifier, {
            count: 1,
            resetTime: now + windowMs
          });
          return true;
        }

        if (record.count >= maxAttempts) {
          return false;
        }

        record.count++;
        return true;
      },

      getRemainingAttempts(identifier: string): number {
        const record = attempts.get(identifier);
        if (!record) return maxAttempts;
        return Math.max(0, maxAttempts - record.count);
      },

      getResetTime(identifier: string): number | null {
        const record = attempts.get(identifier);
        return record ? record.resetTime : null;
      },

      reset(identifier: string): void {
        attempts.delete(identifier);
      }
    };
  }

  /**
   * Detect suspicious activity
   */
  static detectSuspiciousActivity(attempts: number[], timeWindow: number): boolean {
    if (attempts.length < 3) return false;

    const recentAttempts = attempts.filter(time => Date.now() - time <= timeWindow);
    
    // More than 5 attempts in 5 minutes is suspicious
    if (recentAttempts.length > 5 && timeWindow <= 5 * 60 * 1000) {
      return true;
    }

    // More than 10 attempts in 15 minutes is suspicious
    if (recentAttempts.length > 10 && timeWindow <= 15 * 60 * 1000) {
      return true;
    }

    return false;
  }

  /**
   * Secure storage for sensitive data
   */
  static secureStorage = {
    set(key: string, value: string, ttl?: number): void {
      try {
        const encrypted = btoa(value); // Basic encoding (use proper encryption in production)
        const data = {
          value: encrypted,
          timestamp: Date.now(),
          ttl: ttl || 24 * 60 * 60 * 1000 // 24 hours default
        };

        localStorage.setItem(`secure_${key}`, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to store secure data:', error);
      }
    },

    get(key: string): string | null {
      try {
        const stored = localStorage.getItem(`secure_${key}`);
        if (!stored) return null;

        const data = JSON.parse(stored);
        
        // Check TTL
        if (Date.now() - data.timestamp > data.ttl) {
          localStorage.removeItem(`secure_${key}`);
          return null;
        }

        return atob(data.value);
      } catch (error) {
        console.error('Failed to retrieve secure data:', error);
        return null;
      }
    },

    remove(key: string): void {
      localStorage.removeItem(`secure_${key}`);
    },

    clear(): void {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('secure_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  /**
   * CSRF token utilities
   */
  static csrf = {
    generate(): string {
      return this.generateSecureRandom(32);
    },

    validate(token: string, expectedToken: string): boolean {
      return token === expectedToken;
    },

    getFromMeta(): string | null {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta?.getAttribute('content') || null;
    },

    addToForm(form: HTMLFormElement): void {
      const token = this.getFromMeta() || this.generate();
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'csrf_token';
      input.value = token;
      form.appendChild(input);
    }
  };

  /**
   * Device fingerprinting for security
   */
  static getDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas?.toDataURL() || '',
      navigator.hardwareConcurrency || 'unknown'
    ].join('|');

    return btoa(fingerprint);
  }

  /**
   * Check if connection is secure
   */
  static isSecureConnection(): boolean {
    return (
      location.protocol === 'https:' ||
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1'
    );
  }

  /**
   * Validate URL is safe
   */
  static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url, window.location.origin);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export types
export interface SecurityAuditLog {
  timestamp: string;
  action: string;
  userId?: string;
  ip: string;
  userAgent: string;
  success: boolean;
  details?: any;
}

export interface RateLimitInfo {
  canAttempt: boolean;
  remainingAttempts: number;
  resetTime?: number;
}

export default SecurityUtils;
