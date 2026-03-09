const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    await prisma.review.deleteMany();
    await prisma.message.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.match.deleteMany();
    await prisma.breedingRequest.deleteMany();
    await prisma.healthRecord.deleteMany();
    await prisma.petPhoto.deleteMany();
    await prisma.pet.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create sample users
    const users = [];
    
    // Super Admin user
    const superAdminPassword = await bcrypt.hash('yehia.hema195200', 12);
    const superAdmin = await prisma.user.create({
      data: {
        email: 'yehiaahmed195200@gmail.com',
        passwordHash: superAdminPassword,
        firstName: 'Yehia',
        lastName: 'Ahmed',
        phone: '+201234567890',
        role: 'SUPER_ADMIN',
        emailVerified: true,
        isActive: true,
      },
    });
    users.push(superAdmin);

    // Regular admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@petbreeding.com',
        passwordHash: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890',
        role: 'ADMIN',
        emailVerified: true,
        isActive: true,
      },
    });
    users.push(admin);

    // Regular users
    const userPasswords = ['user123', 'user456', 'user789'];
    const userData = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '+1234567891' },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '+1234567892' },
      { firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@example.com', phone: '+1234567893' },
    ];

    for (let i = 0; i < userData.length; i++) {
      const passwordHash = await bcrypt.hash(userPasswords[i], 12);
      const user = await prisma.user.create({
        data: {
          ...userData[i],
          passwordHash,
          role: 'USER',
          emailVerified: true,
          isActive: true,
        },
      });
      users.push(user);
    }

    console.log(`👥 Created ${users.length} users`);

    // Create sample pets
    const pets = [];
    const petData = [
      {
        ownerId: users[1].id,
        name: 'Buddy',
        species: 'DOG',
        breed: 'Golden Retriever',
        gender: 'MALE',
        age: 2,
        weight: 30.5,
        description: 'Friendly and energetic Golden Retriever looking for a mate',
        status: 'AVAILABLE',
        vaccinated: true,
        healthCertified: true,
        price: 1500,
        birthDate: new Date('2022-03-15'),
        registrationNo: 'GR-2022-001',
        microchipNo: 'MC-987654321',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: 'New York, NY, USA'
        }
      },
      {
        ownerId: users[2].id,
        name: 'Luna',
        species: 'DOG',
        breed: 'Labrador Retriever',
        gender: 'FEMALE',
        age: 3,
        weight: 28.0,
        description: 'Beautiful Labrador with excellent bloodline',
        status: 'AVAILABLE',
        vaccinated: true,
        healthCertified: true,
        price: 1200,
        birthDate: new Date('2021-06-20'),
        registrationNo: 'LR-2021-002',
        location: {
          lat: 40.7589,
          lng: -73.9851,
          address: 'Brooklyn, NY, USA'
        }
      },
      {
        ownerId: users[3].id,
        name: 'Whiskers',
        species: 'CAT',
        breed: 'Persian',
        gender: 'MALE',
        age: 2,
        weight: 4.5,
        description: 'Purebred Persian cat with beautiful coat',
        status: 'AVAILABLE',
        vaccinated: true,
        healthCertified: true,
        price: 800,
        birthDate: new Date('2022-08-10'),
        location: {
          lat: 40.7831,
          lng: -73.9712,
          address: 'Manhattan, NY, USA'
        }
      },
      {
        ownerId: users[1].id,
        name: 'Max',
        species: 'DOG',
        breed: 'German Shepherd',
        gender: 'MALE',
        age: 4,
        weight: 35.0,
        description: 'Well-trained German Shepherd, great with kids',
        status: 'AVAILABLE',
        vaccinated: true,
        healthCertified: true,
        price: 2000,
        birthDate: new Date('2020-11-25'),
        registrationNo: 'GS-2020-003',
        location: {
          lat: 40.7489,
          lng: -73.9680,
          address: 'Queens, NY, USA'
        }
      },
      {
        ownerId: users[2].id,
        name: 'Bella',
        species: 'CAT',
        breed: 'Siamese',
        gender: 'FEMALE',
        age: 1,
        weight: 3.2,
        description: 'Playful Siamese kitten, very social',
        status: 'AVAILABLE',
        vaccinated: true,
        healthCertified: false,
        price: 600,
        birthDate: new Date('2023-02-14'),
        location: {
          lat: 40.7282,
          lng: -73.9942,
          address: 'Bronx, NY, USA'
        }
      }
    ];

    for (const pet of petData) {
      const createdPet = await prisma.pet.create({
        data: pet,
      });
      pets.push(createdPet);

      // Add sample photos
      await prisma.petPhoto.create({
        data: {
          petId: createdPet.id,
          url: `/uploads/pets/${createdPet.name.toLowerCase()}-main.jpg`,
          isMain: true,
        }
      });

      await prisma.petPhoto.create({
        data: {
          petId: createdPet.id,
          url: `/uploads/pets/${createdPet.name.toLowerCase()}-2.jpg`,
          isMain: false,
        }
      });

      // Add health records
      await prisma.healthRecord.create({
        data: {
          petId: createdPet.id,
          recordType: 'Vaccination',
          description: 'Annual vaccination completed',
          examinationDate: new Date('2024-01-15'),
          veterinarianName: 'Dr. Sarah Johnson',
          clinicName: 'Happy Paws Veterinary Clinic',
          nextVisitDate: new Date('2025-01-15'),
        }
      });

      await prisma.healthRecord.create({
        data: {
          petId: createdPet.id,
          recordType: 'Health Check',
          description: 'General health examination - all vitals normal',
          examinationDate: new Date('2024-02-20'),
          veterinarianName: 'Dr. Michael Chen',
          clinicName: 'Pet Care Center',
        }
      });
    }

    console.log(`🐾 Created ${pets.length} pets with photos and health records`);

    // Create breeding requests
    const breedingRequests = [];
    
    // Create some sample breeding requests
    const requestData = [
      {
        initiatorId: users[1].id,
        targetUserId: users[2].id,
        initiatorPetId: pets[0].id, // Buddy
        targetPetId: pets[1].id,   // Luna
        status: 'PENDING',
        message: 'I would like to breed my Golden Retriever with your Labrador',
        preferredDate: new Date('2024-03-15'),
      },
      {
        initiatorId: users[3].id,
        targetUserId: users[1].id,
        initiatorPetId: pets[3].id, // Max
        targetPetId: pets[0].id,   // Buddy
        status: 'ACCEPTED',
        message: 'Excellent match! Both dogs have great temperament',
        preferredDate: new Date('2024-04-01'),
        estimatedDelivery: new Date('2024-06-01'),
      },
      {
        initiatorId: users[2].id,
        targetUserId: users[3].id,
        initiatorPetId: pets[4].id, // Bella
        targetPetId: pets[2].id,   // Whiskers
        status: 'PENDING',
        message: 'Would love to breed my Siamese with your Persian',
        preferredDate: new Date('2024-03-20'),
      }
    ];

    for (const request of requestData) {
      const createdRequest = await prisma.breedingRequest.create({
        data: request,
      });
      breedingRequests.push(createdRequest);

      // Create matches for accepted requests
      if (createdRequest.status === 'ACCEPTED') {
        await prisma.match.create({
          data: {
            breedingRequestId: createdRequest.id,
            pet1Id: createdRequest.initiatorPetId,
            pet2Id: createdRequest.targetPetId,
            compatibilityScore: 0.85,
            matchFactors: {
              breed: 0.3,
              age: 0.2,
              location: 0.3,
              health: 0.2
            },
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          }
        });
      }

      // Create messages
      await prisma.message.create({
        data: {
          senderId: createdRequest.initiatorId,
          receiverId: createdRequest.targetUserId,
          breedingRequestId: createdRequest.id,
          content: createdRequest.message,
          messageType: 'TEXT',
        }
      });

      // Create payment
      await prisma.payment.create({
        data: {
          userId: createdRequest.initiatorId,
          breedingRequestId: createdRequest.id,
          amount: 500,
          paymentMethod: 'INSTAPAY',
          status: 'CONFIRMED',
          description: 'Breeding service fee',
          confirmedAt: new Date(),
        }
      });
    }

    console.log(`💕 Created ${breedingRequests.length} breeding requests with matches and messages`);

    // Create reviews
    const reviews = [];
    const reviewData = [
      {
        reviewerId: users[1].id,
        reviewedId: users[2].id,
        breedingRequestId: breedingRequests[0].id,
        rating: 5,
        title: 'Excellent experience!',
        content: 'Very professional and responsible pet owner. Highly recommend!',
      },
      {
        reviewerId: users[2].id,
        reviewedId: users[1].id,
        breedingRequestId: breedingRequests[0].id,
        rating: 5,
        title: 'Great communication',
        content: 'Responsive and caring. Would definitely work with them again.',
      },
    ];

    for (const review of reviewData) {
      const createdReview = await prisma.review.create({
        data: review,
      });
      reviews.push(createdReview);
    }

    console.log(`⭐ Created ${reviews.length} reviews`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🐾 Pets: ${pets.length}`);
    console.log(`   💕 Breeding Requests: ${breedingRequests.length}`);
    console.log(`   ⭐ Reviews: ${reviews.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Super Admin: yehiaahmed195200@gmail.com / yehia.hema195200');
    console.log('   Admin: admin@petbreeding.com / admin123');
    console.log('   User 1: john.doe@example.com / user123');
    console.log('   User 2: jane.smith@example.com / user456');
    console.log('   User 3: mike.johnson@example.com / user789');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
