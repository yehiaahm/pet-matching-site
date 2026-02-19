/**
 * Password Security Utilities
 * Handles password validation, hashing (client-side preparation), and security checks
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number;
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPatterns: string[];
}

class PasswordSecurity {
  private readonly requirements: PasswordRequirements = {
    minLength: 6, // ✅ Reduced from 8 to 6
    requireUppercase: false, // ✅ Changed to false
    requireLowercase: true,
    requireNumbers: false, // ✅ Changed to false
    requireSpecialChars: false, // ✅ Already false
    forbiddenPatterns: ['password', '123456', 'qwerty', 'admin', 'petmat']
  };

  private readonly specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  private readonly commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];

  /**
   * Validate password against security requirements
   */
  validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Check minimum length
    if (password.length < this.requirements.minLength) {
      errors.push(`Password must be at least ${this.requirements.minLength} characters long`);
    } else {
      score += 1;
    }

    // Check for uppercase letters
    if (this.requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
      score += 1;
    }

    // Check for lowercase letters
    if (this.requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
      score += 1;
    }

    // Check for numbers
    if (this.requirements.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (/\d/.test(password)) {
      score += 1;
    }

    // Check for special characters
    if (this.requirements.requireSpecialChars) {
      const hasSpecialChar = new RegExp(`[${this.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password);
      if (!hasSpecialChar) {
        errors.push(`Password must contain at least one special character (${this.specialChars})`);
      } else if (hasSpecialChar) {
        score += 1;
      }
    }

    // Check for forbidden patterns
    const lowerPassword = password.toLowerCase();
    for (const pattern of this.requirements.forbiddenPatterns) {
      if (lowerPassword.includes(pattern)) {
        errors.push(`Password cannot contain common patterns like "${pattern}"`);
        score -= 1;
      }
    }

    // Check against common passwords
    if (this.commonPasswords.includes(lowerPassword)) {
      errors.push('Password is too common and easily guessable');
      score -= 2;
    }

    // Additional strength checks
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password should not contain repeating characters');
      score -= 1;
    }

    // Calculate strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 6) strength = 'strong';
    else if (score >= 4) strength = 'medium';

    const isValid = errors.length === 0 && score >= 1; // ✅ Reduced from 3 to 1

    return {
      isValid,
      errors,
      strength,
      score: Math.max(0, Math.min(10, score))
    };
  }

  /**
   * Generate password strength indicator text
   */
  getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
      case 'weak':
        return 'ضعيفة - يوصى بالتحسين';
      case 'medium':
        return 'متوسطة - جيدة';
      case 'strong':
        return 'قوية - ممتازة';
      default:
        return 'غير معروفة';
    }
  }

  /**
   * Generate password strength color
   */
  getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
      case 'weak':
        return '#ef4444'; // red
      case 'medium':
        return '#f59e0b'; // amber
      case 'strong':
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = this.specialChars;
    const allChars = uppercase + lowercase + numbers + special;

    let password = '';
    
    // Ensure at least one of each required type
    if (this.requirements.requireUppercase) {
      password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    }
    if (this.requirements.requireLowercase) {
      password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    }
    if (this.requirements.requireNumbers) {
      password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    if (this.requirements.requireSpecialChars) {
      password += special.charAt(Math.floor(Math.random() * special.length));
    }

    // Fill remaining length with random characters
    for (let i = password.length; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password to avoid predictable patterns
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Check if password has been exposed in data breaches (simulated)
   * In production, this would integrate with HaveIBeenPwned API
   */
  async checkPasswordBreach(password: string): Promise<{ isBreached: boolean; count?: number }> {
    try {
      // Check against HaveIBeenPwned API
      const response = await fetch(`${import.meta.env.VITE_PWNED_PASSWORDS_API_URL}/range/${password.slice(0, 5)}`);
      const data = await response.text();
      
      // Simple check - in production, this would be more sophisticated
      const isBreached = data.includes(password.toLowerCase());
      
      return {
        isBreached,
        count: isBreached ? Math.floor(Math.random() * 1000) + 1 : 0
      };
    } catch (error) {
      console.error('Error checking password breach:', error);
      // Fallback to common password check if API fails
      const isBreached = this.commonPasswords.includes(password.toLowerCase());
      
      return {
        isBreached,
        count: isBreached ? Math.floor(Math.random() * 1000) + 1 : 0
      };
    }
  }

  /**
   * Hash password using SHA-1 (for breach checking)
   */
  private async hashPasswordSHA1(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  /**
   * Prepare password for server transmission (client-side hashing)
   * Note: This is additional security, server should still hash the password
   */
  async preparePasswordForServer(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a random salt for password preparation
   */
  generateSalt(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Check if two passwords match
   */
  passwordsMatch(password1: string, password2: string): boolean {
    return password1 === password2;
  }

  /**
   * Get password requirements as user-friendly text
   */
  getPasswordRequirementsText(): string[] {
    const requirements: string[] = [];
    
    requirements.push(`At least ${this.requirements.minLength} characters long`);
    
    if (this.requirements.requireUppercase) {
      requirements.push('One uppercase letter (A-Z)');
    }
    
    if (this.requirements.requireLowercase) {
      requirements.push('One lowercase letter (a-z)');
    }
    
    if (this.requirements.requireNumbers) {
      requirements.push('One number (0-9)');
    }
    
    if (this.requirements.requireSpecialChars) {
      requirements.push(`One special character (${this.specialChars})`);
    }
    
    requirements.push('Not easily guessable or common');
    
    return requirements;
  }

  /**
   * Calculate password entropy
   */
  calculateEntropy(password: string): number {
    let charsetSize = 0;
    
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/\d/.test(password)) charsetSize += 10;
    if (new RegExp(`[${this.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
      charsetSize += this.specialChars.length;
    }
    
    const entropy = password.length * Math.log2(charsetSize);
    return Math.round(entropy * 100) / 100;
  }
}

// Export singleton instance
export const passwordSecurity = new PasswordSecurity();
export default passwordSecurity;
