/**
 * Encryption Utilities for Prisma
 * AES-256-GCM encryption for sensitive data
 * bcrypt for password hashing
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 16;
const TAG_LENGTH = 16; // 128 bits for GCM tag

// Bcrypt configuration
const BCRYPT_ROUNDS = 12;

/**
 * Encrypt sensitive data using AES-256-GCM
 * Format: iv:encrypted_data:tag
 */
export function encrypt(text: string): string {
  if (!text) return text;

  try {
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'));
    cipher.setAAD(Buffer.from('petmate-encryption', 'utf8'));
    
    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine IV + encrypted data + tag
    const result = `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
    
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data using AES-256-GCM
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;

  try {
    // Split IV, encrypted data, and tag
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, encrypted, tagHex] = parts;
    
    // Create decipher
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'));
    decipher.setAAD(Buffer.from('petmate-encryption', 'utf8'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) return password;
  
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify password using bcrypt
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate encryption key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate encryption key
 */
export function validateEncryptionKey(key: string): boolean {
  try {
    const buffer = Buffer.from(key, 'hex');
    return buffer.length === 32; // 256 bits
  } catch {
    return false;
  }
}

/**
 * Encrypt object fields recursively
 */
export function encryptObject(obj: any, sensitiveFields: string[]): any {
  if (!obj || typeof obj !== 'object') return obj;

  const encrypted = { ...obj };

  for (const field of sensitiveFields) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encrypt(encrypted[field]);
    }
  }

  return encrypted;
}

/**
 * Decrypt object fields recursively
 */
export function decryptObject(obj: any, sensitiveFields: string[]): any {
  if (!obj || typeof obj !== 'object') return obj;

  const decrypted = { ...obj };

  for (const field of sensitiveFields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        decrypted[field] = decrypt(decrypted[field]);
      } catch (error) {
        // If decryption fails, keep original value
        console.warn(`Failed to decrypt field: ${field}`);
      }
    }
  }

  return decrypted;
}

/**
 * Encrypt JSON data
 */
export function encryptJSON(data: any): string {
  return encrypt(JSON.stringify(data));
}

/**
 * Decrypt JSON data
 */
export function decryptJSON(encryptedData: string): any {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted);
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive identifier (for search/indexing)
 */
export function hashIdentifier(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

// Field mappings for different models
export const SENSITIVE_FIELDS = {
  users: [
    'phone',
    'address',
    'bio',
    'city',
    'country',
    'avatar',
  ],
  pets: [
    'healthConditions',
    'microchipNumber',
    'registrationNumber',
    'pedigreeNumber',
    'distinctiveFeatures',
  ],
  health_records: [
    'details',
    'veterinarianName',
    'clinicName',
    'certificateUrl',
  ],
  clinic_bookings: [
    'userNotes',
    'adminNotes',
    'resultNotes',
    'certificate',
  ],
  genetic_tests: [
    'result',
    'certificateUrl',
  ],
  certifications: [
    'certificateUrl',
    'issuer',
  ],
  messages: [
    'content',
  ],
  support_tickets: [
    'message',
    'replies',
  ],
} as const;

// Type definitions
export type SensitiveModel = keyof typeof SENSITIVE_FIELDS;
export type SensitiveField = typeof SENSITIVE_FIELDS[SensitiveModel][number];
