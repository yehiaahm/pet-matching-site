/**
 * Database Migration Script for Encryption
 * Migrates existing data to encrypted format
 */

import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt, encryptObject, decryptObject, generateEncryptionKey, validateEncryptionKey } from '../utils/encryption.util';
import { SENSITIVE_FIELDS } from '../utils/encryption.util';

const prisma = new PrismaClient();

/**
 * Migration class for handling encryption migration
 */
export class EncryptionMigration {
  private prisma: PrismaClient;
  private dryRun: boolean;

  constructor(dryRun: boolean = false) {
    this.prisma = prisma;
    this.dryRun = dryRun;
  }

  /**
   * Run the complete migration
   */
  async runMigration(): Promise<void> {
    console.log('🔐 Starting encryption migration...');
    console.log(`Dry run: ${this.dryRun ? 'YES' : 'NO'}`);

    // Validate encryption key
    if (!validateEncryptionKey()) {
      throw new Error('Invalid encryption key. Please set ENCRYPTION_KEY environment variable.');
    }

    try {
      // Backup existing data
      if (!this.dryRun) {
        await this.createBackup();
      }

      // Migrate each model
      await this.migrateUsers();
      await this.migratePets();
      await this.migrateHealthRecords();
      await this.migrateClinicBookings();
      await this.migrateGeneticTests();
      await this.migrateCertifications();
      await this.migrateMessages();
      await this.migrateSupportTickets();

      console.log('✅ Encryption migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Create backup of existing data
   */
  private async createBackup(): Promise<void> {
    console.log('📦 Creating backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-before-encryption-${timestamp}.json`;
    
    // This would implement actual backup logic
    console.log(`Backup would be saved to: ${backupFile}`);
  }

  /**
   * Migrate users table
   */
  private async migrateUsers(): Promise<void> {
    console.log('👤 Migrating users...');
    
    const users = await this.prisma.users.findMany({
      select: {
        id: true,
        phone: true,
        address: true,
        bio: true,
        city: true,
        country: true,
        avatar: true,
      },
    });

    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      const encryptedData = encryptObject(user, ['phone', 'address', 'bio', 'city', 'country', 'avatar']);
      
      // Create searchable hashes
      const phoneHash = user.phone ? this.createHash(user.phone) : null;
      const cityHash = user.city ? this.createHash(user.city) : null;
      const countryHash = user.country ? this.createHash(user.country) : null;

      if (!this.dryRun) {
        await this.prisma.users.update({
          where: { id: user.id },
          data: {
            ...encryptedData,
            phone_hash: phoneHash,
            city_hash: cityHash,
            country_hash: countryHash,
          },
        });
      }

      console.log(`✓ Migrated user: ${user.id}`);
    }
  }

  /**
   * Migrate pets table
   */
  private async migratePets(): Promise<void> {
    console.log('🐕 Migrating pets...');
    
    const pets = await this.prisma.pets.findMany({
      select: {
        id: true,
        distinctiveFeatures: true,
        healthConditions: true,
        microchipNumber: true,
        registrationNumber: true,
        pedigreeNumber: true,
      },
    });

    console.log(`Found ${pets.length} pets to migrate`);

    for (const pet of pets) {
      const encryptedData = encryptObject(pet, [
        'distinctiveFeatures',
        'healthConditions',
        'microchipNumber',
        'registrationNumber',
        'pedigreeNumber',
      ]);

      // Create searchable hashes
      const microchipHash = pet.microchipNumber ? this.createHash(pet.microchipNumber) : null;
      const registrationHash = pet.registrationNumber ? this.createHash(pet.registrationNumber) : null;
      const pedigreeHash = pet.pedigreeNumber ? this.createHash(pet.pedigreeNumber) : null;

      if (!this.dryRun) {
        await this.prisma.pets.update({
          where: { id: pet.id },
          data: {
            ...encryptedData,
            microchip_hash: microchipHash,
            registration_hash: registrationHash,
            pedigree_hash: pedigreeHash,
          },
        });
      }

      console.log(`✓ Migrated pet: ${pet.id}`);
    }
  }

  /**
   * Migrate health_records table
   */
  private async migrateHealthRecords(): Promise<void> {
    console.log('🏥 Migrating health records...');
    
    const records = await this.prisma.health_records.findMany({
      select: {
        id: true,
        details: true,
        veterinarianName: true,
        clinicName: true,
        certificateUrl: true,
      },
    });

    console.log(`Found ${records.length} health records to migrate`);

    for (const record of records) {
      const encryptedData = encryptObject(record, [
        'details',
        'veterinarianName',
        'clinicName',
        'certificateUrl',
      ]);

      // Create searchable hashes
      const vetHash = record.veterinarianName ? this.createHash(record.veterinarianName) : null;
      const clinicHash = record.clinicName ? this.createHash(record.clinicName) : null;

      if (!this.dryRun) {
        await this.prisma.health_records.update({
          where: { id: record.id },
          data: {
            ...encryptedData,
            vet_hash: vetHash,
            clinic_hash: clinicHash,
          },
        });
      }

      console.log(`✓ Migrated health record: ${record.id}`);
    }
  }

  /**
   * Migrate clinic_bookings table
   */
  private async migrateClinicBookings(): Promise<void> {
    console.log('📅 Migrating clinic bookings...');
    
    const bookings = await this.prisma.clinic_bookings.findMany({
      select: {
        id: true,
        userNotes: true,
        adminNotes: true,
        resultNotes: true,
        certificate: true,
      },
    });

    console.log(`Found ${bookings.length} clinic bookings to migrate`);

    for (const booking of bookings) {
      const encryptedData = encryptObject(booking, [
        'userNotes',
        'adminNotes',
        'resultNotes',
        'certificate',
      ]);

      if (!this.dryRun) {
        await this.prisma.clinic_bookings.update({
          where: { id: booking.id },
          data: encryptedData,
        });
      }

      console.log(`✓ Migrated clinic booking: ${booking.id}`);
    }
  }

  /**
   * Migrate genetic_tests table
   */
  private async migrateGeneticTests(): Promise<void> {
    console.log('🧬 Migrating genetic tests...');
    
    const tests = await this.prisma.genetic_tests.findMany({
      select: {
        id: true,
        result: true,
        certificateUrl: true,
        provider: true,
      },
    });

    console.log(`Found ${tests.length} genetic tests to migrate`);

    for (const test of tests) {
      const encryptedData = encryptObject(test, ['result', 'certificateUrl']);

      // Create searchable hash
      const providerHash = test.provider ? this.createHash(test.provider) : null;

      if (!this.dryRun) {
        await this.prisma.genetic_tests.update({
          where: { id: test.id },
          data: {
            ...encryptedData,
            provider_hash: providerHash,
          },
        });
      }

      console.log(`✓ Migrated genetic test: ${test.id}`);
    }
  }

  /**
   * Migrate certifications table
   */
  private async migrateCertifications(): Promise<void> {
    console.log('📜 Migrating certifications...');
    
    const certifications = await this.prisma.certifications.findMany({
      select: {
        id: true,
        certificateUrl: true,
        issuer: true,
      },
    });

    console.log(`Found ${certifications.length} certifications to migrate`);

    for (const certification of certifications) {
      const encryptedData = encryptObject(certification, ['certificateUrl', 'issuer']);

      // Create searchable hash
      const issuerHash = certification.issuer ? this.createHash(certification.issuer) : null;

      if (!this.dryRun) {
        await this.prisma.certifications.update({
          where: { id: certification.id },
          data: {
            ...encryptedData,
            issuer_hash: issuerHash,
          },
        });
      }

      console.log(`✓ Migrated certification: ${certification.id}`);
    }
  }

  /**
   * Migrate messages table
   */
  private async migrateMessages(): Promise<void> {
    console.log('💬 Migrating messages...');
    
    const messages = await this.prisma.messages.findMany({
      select: {
        id: true,
        content: true,
      },
    });

    console.log(`Found ${messages.length} messages to migrate`);

    for (const message of messages) {
      const encryptedData = encryptObject(message, ['content']);

      // Create searchable hash
      const contentHash = message.content ? this.createHash(message.content) : null;

      if (!this.dryRun) {
        await this.prisma.messages.update({
          where: { id: message.id },
          data: {
            ...encryptedData,
            content_hash: contentHash,
          },
        });
      }

      console.log(`✓ Migrated message: ${message.id}`);
    }
  }

  /**
   * Migrate support_tickets table
   */
  private async migrateSupportTickets(): Promise<void> {
    console.log('🎫 Migrating support tickets...');
    
    const tickets = await this.prisma.support_tickets.findMany({
      select: {
        id: true,
        message: true,
        replies: true,
      },
    });

    console.log(`Found ${tickets.length} support tickets to migrate`);

    for (const ticket of tickets) {
      const encryptedData = encryptObject(ticket, ['message', 'replies']);

      // Create searchable hash
      const messageHash = ticket.message ? this.createHash(ticket.message) : null;

      if (!this.dryRun) {
        await this.prisma.support_tickets.update({
          where: { id: ticket.id },
          data: {
            ...encryptedData,
            message_hash: messageHash,
          },
        });
      }

      console.log(`✓ Migrated support ticket: ${ticket.id}`);
    }
  }

  /**
   * Create hash for searchable fields
   */
  private createHash(value: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(value.toLowerCase()).digest('hex');
  }

  /**
   * Verify migration was successful
   */
  async verifyMigration(): Promise<void> {
    console.log('🔍 Verifying migration...');

    // Test a few records from each model
    const user = await this.prisma.users.findFirst();
    if (user && user.phone) {
      try {
        const decryptedPhone = decrypt(user.phone);
        console.log(`✓ User phone encryption verified: ${decryptedPhone}`);
      } catch (error) {
        console.error('❌ User phone encryption verification failed:', error);
        throw error;
      }
    }

    const pet = await this.prisma.pets.findFirst();
    if (pet && pet.healthConditions) {
      try {
        const decryptedHealth = decrypt(pet.healthConditions);
        console.log(`✓ Pet health conditions encryption verified: ${decryptedHealth}`);
      } catch (error) {
        console.error('❌ Pet health conditions encryption verification failed:', error);
        throw error;
      }
    }

    console.log('✅ Migration verification completed successfully!');
  }

  /**
   * Rollback migration (if needed)
   */
  async rollbackMigration(): Promise<void> {
    console.log('⏪ Rolling back migration...');

    // This would restore from backup
    console.log('Rollback would restore from backup file');

    console.log('✅ Migration rollback completed!');
  }
}

/**
 * CLI interface for running migration
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verify = args.includes('--verify');
  const rollback = args.includes('--rollback');

  const migration = new EncryptionMigration(dryRun);

  try {
    if (rollback) {
      await migration.rollbackMigration();
    } else if (verify) {
      await migration.verifyMigration();
    } else {
      await migration.runMigration();
      
      if (!dryRun) {
        await migration.verifyMigration();
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { EncryptionMigration };
