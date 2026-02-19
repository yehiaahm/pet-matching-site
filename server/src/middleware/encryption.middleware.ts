/**
 * Prisma Encryption Middleware
 * Automatically encrypts and decrypts sensitive fields
 */

import { Prisma } from '@prisma/client';
import { encrypt, decrypt, encryptObject, decryptObject, SENSITIVE_FIELDS } from '../utils/encryption.util';

/**
 * Prisma middleware for encryption/decryption
 */
export function encryptionMiddleware() {
  return Prisma.defineExtension((prisma) => {
    return prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ operation, args, query }) {
            // Get model name from the operation
            const modelName = this.$model.name as keyof typeof SENSITIVE_FIELDS;
            const sensitiveFields = SENSITIVE_FIELDS[modelName] || [];

            // Encrypt data on create and update operations
            if (operation === 'create' || operation === 'createMany' || operation === 'update' || operation === 'updateMany') {
              if (args.data) {
                if (Array.isArray(args.data)) {
                  // Handle createMany/updateMany with array data
                  args.data = args.data.map(item => encryptObject(item, sensitiveFields));
                } else {
                  // Handle single create/update
                  args.data = encryptObject(args.data, sensitiveFields);
                }
              }
            }

            // Execute the query
            const result = await query(args);

            // Decrypt data on read operations
            if (operation === 'findFirst' || operation === 'findMany' || operation === 'findFirstOrThrow' || operation === 'findUnique' || operation === 'findUniqueOrThrow') {
              if (Array.isArray(result)) {
                // Handle findMany
                return result.map(item => decryptObject(item, sensitiveFields));
              } else if (result) {
                // Handle single record
                return decryptObject(result, sensitiveFields);
              }
            }

            // Handle aggregate queries
            if (operation === 'aggregate' && args._count) {
              return result;
            }

            // Handle groupBy queries
            if (operation === 'groupBy') {
              if (Array.isArray(result)) {
                return result.map(item => decryptObject(item, sensitiveFields));
              }
            }

            return result;
          },
        },
      },
    });
  });
}

/**
 * Custom middleware for specific models
 */
export function createModelEncryptionMiddleware<T extends Record<string, any>>(
  modelName: keyof typeof SENSITIVE_FIELDS,
  sensitiveFields: string[]
) {
  return {
    beforeCreate: (data: T): T => {
      return encryptObject(data, sensitiveFields);
    },

    beforeUpdate: (data: Partial<T>): Partial<T> => {
      return encryptObject(data, sensitiveFields);
    },

    afterCreate: (data: T): T => {
      return decryptObject(data, sensitiveFields);
    },

    afterUpdate: (data: T): T => {
      return decryptObject(data, sensitiveFields);
    },

    afterFind: (data: T | T[] | null): T | T[] | null => {
      if (!data) return data;
      
      if (Array.isArray(data)) {
        return data.map(item => decryptObject(item, sensitiveFields));
      }
      
      return decryptObject(data, sensitiveFields);
    },
  };
}

/**
 * Field-level encryption middleware
 */
export function fieldEncryptionMiddleware() {
  return {
    users: createModelEncryptionMiddleware('users', SENSITIVE_FIELDS.users),
    pets: createModelEncryptionMiddleware('pets', SENSITIVE_FIELDS.pets),
    health_records: createModelEncryptionMiddleware('health_records', SENSITIVE_FIELDS.health_records),
    clinic_bookings: createModelEncryptionMiddleware('clinic_bookings', SENSITIVE_FIELDS.clinic_bookings),
    genetic_tests: createModelEncryptionMiddleware('genetic_tests', SENSITIVE_FIELDS.genetic_tests),
    certifications: createModelEncryptionMiddleware('certifications', SENSITIVE_FIELDS.certifications),
    messages: createModelEncryptionMiddleware('messages', SENSITIVE_FIELDS.messages),
    support_tickets: createModelEncryptionMiddleware('support_tickets', SENSITIVE_FIELDS.support_tickets),
  };
}

/**
 * Location-specific encryption for GPS coordinates
 */
export function encryptLocation(location: { latitude: number; longitude: number; address?: string }): string {
  const locationData = {
    lat: location.latitude,
    lng: location.longitude,
    addr: location.address || '',
  };
  return encrypt(JSON.stringify(locationData));
}

export function decryptLocation(encryptedLocation: string): { latitude: number; longitude: number; address?: string } {
  try {
    const decrypted = decrypt(encryptedLocation);
    const locationData = JSON.parse(decrypted);
    return {
      latitude: locationData.lat,
      longitude: locationData.lng,
      address: locationData.addr,
    };
  } catch (error) {
    throw new Error('Failed to decrypt location data');
  }
}

/**
 * Health record specific encryption
 */
export function encryptHealthRecord(record: {
  details?: string;
  veterinarianName?: string;
  clinicName?: string;
  certificateUrl?: string;
}): any {
  return encryptObject(record, ['details', 'veterinarianName', 'clinicName', 'certificateUrl']);
}

export function decryptHealthRecord(record: any): any {
  return decryptObject(record, ['details', 'veterinarianName', 'clinicName', 'certificateUrl']);
}

/**
 * Message content encryption
 */
export function encryptMessage(content: string): string {
  return encrypt(content);
}

export function decryptMessage(encryptedContent: string): string {
  return decrypt(encryptedContent);
}

/**
 * Searchable encrypted field handling
 * For fields that need to be searchable but also encrypted
 */
export function createSearchableHash(value: string): string {
  // Create a hash for searching while keeping the original value encrypted
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(value.toLowerCase()).digest('hex');
}

/**
 * Batch encryption for migration purposes
 */
export async function batchEncryptModel(
  prisma: any,
  modelName: string,
  sensitiveFields: string[],
  batchSize: number = 100
) {
  const model: any = prisma[modelName];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const records = await model.findMany({
      take: batchSize,
      skip: offset,
    });

    if (records.length === 0) {
      hasMore = false;
      break;
    }

    // Update records with encrypted data
    for (const record of records) {
      const encryptedData = encryptObject(record, sensitiveFields);
      await model.update({
        where: { id: record.id },
        data: encryptedData,
      });
    }

    offset += batchSize;
    console.log(`Encrypted ${records.length} records for ${modelName}`);
  }
}

/**
 * Validation middleware to ensure encryption key is valid
 */
export function validateEncryptionKey(): boolean {
  const crypto = require('crypto');
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  
  if (!ENCRYPTION_KEY) {
    console.error('ENCRYPTION_KEY environment variable is not set');
    return false;
  }

  try {
    const buffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    if (buffer.length !== 32) {
      console.error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
      return false;
    }

    // Test encryption/decryption
    const testValue = 'test-encryption';
    const encrypted = encrypt(testValue);
    const decrypted = decrypt(encrypted);
    
    if (decrypted !== testValue) {
      console.error('Encryption test failed');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Invalid ENCRYPTION_KEY format:', error);
    return false;
  }
}
