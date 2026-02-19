import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

/**
 * Seed data for the database
 */
async function main() {
  logger.info('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('yehia.hema195200', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'yehiaahmed195200@gmail.com' },
    update: {},
    create: {
      email: 'yehiaahmed195200@gmail.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isVerified: true,
      bio: 'Platform administrator',
      city: 'New York',
      country: 'USA',
      rating: 5.0,
    },
  });

  logger.info(`Admin user created: ${admin.email}`);

  // Create demo users
  const demoPassword = await bcrypt.hash('Demo@12345', 12);
  
  // Breeder 1
  const breeder1 = await prisma.user.upsert({
    where: { email: 'john.breeder@example.com' },
    update: {},
    create: {
      email: 'john.breeder@example.com',
      password: demoPassword,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1234567890',
      role: 'BREEDER',
      isVerified: true,
      bio: 'Professional dog breeder specializing in Golden Retrievers. 15 years experience.',
      city: 'Los Angeles',
      country: 'USA',
      rating: 4.8,
      totalMatches: 23,
    },
  });

  // Breeder 2
  const breeder2 = await prisma.user.upsert({
    where: { email: 'sarah.breeder@example.com' },
    update: {},
    create: {
      email: 'sarah.breeder@example.com',
      password: demoPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1234567891',
      role: 'BREEDER',
      isVerified: true,
      bio: 'Experienced cat breeder specializing in Persian cats.',
      city: 'Miami',
      country: 'USA',
      rating: 4.9,
      totalMatches: 18,
    },
  });

  // Regular user
  const user1 = await prisma.user.upsert({
    where: { email: 'mike.user@example.com' },
    update: {},
    create: {
      email: 'mike.user@example.com',
      password: demoPassword,
      firstName: 'Mike',
      lastName: 'Davis',
      phone: '+1234567892',
      role: 'USER',
      isVerified: false,
      bio: 'Pet enthusiast looking for breeding partners.',
      city: 'Chicago',
      country: 'USA',
      rating: 4.5,
      totalMatches: 8,
    },
  });

  logger.info('Demo users created');

  // Create demo pets
  const pet1 = await prisma.pet.create({
    data: {
      name: 'Champion Max',
      breed: 'Golden Retriever',
      species: 'dog',
      gender: 'MALE',
      color: 'Golden',
      weight: 32.5,
      height: 61,
      description: 'Champion bloodline Golden Retriever with excellent health.',
      images: ['https://images.unsplash.com/photo-1633722715463-d30f4f325e24'],
      isVaccinated: true,
      isNeutered: false,
      breedingStatus: 'AVAILABLE',
      breedingPrice: 1500,
      hasPedigree: true,
      owner: {
        connect: { id: breeder1.id }
      }
    },
  });

  const pet2 = await prisma.pet.create({
    data: {
      name: 'Princess Luna',
      breed: 'Persian',
      species: 'cat',
      gender: 'FEMALE',
      color: 'White',
      weight: 4.5,
      height: 25,
      description: 'Beautiful white Persian cat with blue eyes.',
      images: ['https://images.unsplash.com/photo-1519052537078-e6302a4968d4'],
      isVaccinated: true,
      isNeutered: false,
      breedingStatus: 'AVAILABLE',
      breedingPrice: 2000,
      hasPedigree: true,
      owner: {
        connect: { id: breeder2.id }
      }
    },
  });

  const pet3 = await prisma.pet.create({
    data: {
      name: 'Buddy',
      breed: 'Labrador Retriever',
      species: 'dog',
      gender: 'MALE',
      color: 'Chocolate',
      weight: 35.0,
      height: 58,
      description: 'Friendly Labrador looking for a breeding partner.',
      images: ['https://images.unsplash.com/photo-1558788353-f76d92427f16'],
      isVaccinated: true,
      isNeutered: false,
      breedingStatus: 'AVAILABLE',
      breedingPrice: 500,
      hasPedigree: false,
      owner: {
        connect: { id: user1.id }
      }
    },
  });

  logger.info('Demo pets created');

  logger.info('Database seed completed successfully!');
  logger.info('\n===========================================');
  logger.info('Demo credentials:');
  logger.info('===========================================');
  logger.info('Admin:    yehiaahmed195200@gmail.com / yehia.hema195200');
  logger.info('Breeder 1: john.breeder@example.com / Demo@12345');
  logger.info('Breeder 2: sarah.breeder@example.com / Demo@12345');
  logger.info('User:     mike.user@example.com / Demo@12345');
  logger.info('===========================================\n');
}

main()
  .catch((e) => {
    logger.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
