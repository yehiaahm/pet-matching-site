/**
 * Complete Database Seed - Production Ready
 * Creates realistic mock data for testing and demonstration
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Mock data generators
const generateUsers = () => [
  {
    email: 'admin@petbreeding.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+201234567890',
    role: 'ADMIN',
    emailVerified: true,
    isActive: true
  },
  {
    email: 'john.doe@example.com',
    password: 'User123!',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+201234567891',
    role: 'USER',
    emailVerified: true,
    isActive: true
  },
  {
    email: 'sarah.smith@example.com',
    password: 'User123!',
    firstName: 'Sarah',
    lastName: 'Smith',
    phone: '+201234567892',
    role: 'USER',
    emailVerified: true,
    isActive: true
  },
  {
    email: 'mike.wilson@example.com',
    password: 'User123!',
    firstName: 'Mike',
    lastName: 'Wilson',
    phone: '+201234567893',
    role: 'USER',
    emailVerified: true,
    isActive: true
  },
  {
    email: 'emma.jones@example.com',
    password: 'User123!',
    firstName: 'Emma',
    lastName: 'Jones',
    phone: '+201234567894',
    role: 'USER',
    emailVerified: true,
    isActive: true
  },
  {
    email: 'david.brown@example.com',
    password: 'User123!',
    firstName: 'David',
    lastName: 'Brown',
    phone: '+201234567895',
    role: 'USER',
    emailVerified: true,
    isActive: true
  },
  {
    email: 'lisa.davis@example.com',
    password: 'User123!',
    firstName: 'Lisa',
    lastName: 'Davis',
    phone: '+201234567896',
    role: 'USER',
    emailVerified: true,
    isActive: true
  },
  {
    email: 'james.miller@example.com',
    password: 'User123!',
    firstName: 'James',
    lastName: 'Miller',
    phone: '+201234567897',
    role: 'USER',
    emailVerified: true,
    isActive: true
  }
];

const generatePets = (users) => [
  {
    name: 'Max',
    type: 'DOG',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'MALE',
    description: 'Friendly and playful Golden Retriever looking for a perfect match. Loves to play fetch and swim.',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
    verified: true,
    status: 'AVAILABLE',
    ownerId: users[1].id, // John Doe
    location: {
      latitude: 30.0444,
      longitude: 31.2357,
      address: 'Cairo, Egypt'
    }
  },
  {
    name: 'Luna',
    type: 'DOG',
    breed: 'Labrador Retriever',
    age: 2,
    gender: 'FEMALE',
    description: 'Beautiful and energetic Labrador. Great with kids and other pets.',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
    verified: true,
    status: 'AVAILABLE',
    ownerId: users[2].id, // Sarah Smith
    location: {
      latitude: 30.0444,
      longitude: 31.2357,
      address: 'Cairo, Egypt'
    }
  },
  {
    name: 'Charlie',
    type: 'DOG',
    breed: 'German Shepherd',
    age: 4,
    gender: 'MALE',
    description: 'Loyal and intelligent German Shepherd. Well-trained and protective.',
    image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400',
    verified: true,
    status: 'AVAILABLE',
    ownerId: users[3].id, // Mike Wilson
    location: {
      latitude: 30.0444,
      longitude: 31.2357,
      address: 'Cairo, Egypt'
    }
  },
  {
    name: 'Bella',
    type: 'CAT',
    breed: 'Persian',
    age: 2,
    gender: 'FEMALE',
    description: 'Elegant Persian cat with beautiful long fur. Calm and affectionate.',
    image: 'https://images.unsplash.com/photo-1513245543132-31f5014ccd41?w=400',
    verified: true,
    status: 'AVAILABLE',
    ownerId: users[4].id, // Emma Jones
    location: {
      latitude: 30.0444,
      longitude: 31.2357,
      address: 'Cairo, Egypt'
    }
  },
  {
    name: 'Rocky',
    type: 'DOG',
    breed: 'Bulldog',
    age: 3,
    gender: 'MALE',
    description: 'Strong and friendly Bulldog. Great companion for families.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    verified: true,
    status: 'AVAILABLE',
    ownerId: users[5].id, // David Brown
    location: {
      latitude: 30.0444,
      longitude: 31.2357,
      address: 'Cairo, Egypt'
    }
  },
  {
    name: 'Daisy',
    type: 'CAT',
    breed: 'Siamese',
    age: 1,
    gender: 'FEMALE',
    description: 'Playful Siamese kitten with beautiful blue eyes. Very social and vocal.',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
    verified: true,
    status: 'AVAILABLE',
    ownerId: users[6].id, // Lisa Davis
    location: {
      latitude: 30.0444,
      longitude: 31.2357,
      address: 'Cairo, Egypt'
    }
  },
  {
    name: 'Cooper',
    type: 'DOG',
    breed: 'Beagle',
    age: 2,
    gender: 'MALE',
    description: 'Curious and friendly Beagle. Loves to explore and sniff around.',
    image: 'https://images.unsplash.com/photo-1543466835-2a68a25d0f74?w=400',
    verified: true,
    status: 'AVAILABLE',
    ownerId: users[7].id, // James Miller
    location: {
      latitude: 30.0444,
      longitude: 31.2357,
      address: 'Cairo, Egypt'
    }
  },
  {
    name: 'Lucy',
    type: 'CAT',
    breed: 'Maine Coon',
    age: 3,
    gender: 'FEMALE',
    description: 'Gentle giant Maine Coon. Very friendly and good with children.',
    image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400',
    verified: true,
    status: 'AVAILABLE',
    ownerId: users[1].id, // John Doe
    location: {
      latitude: 30.0444,
      longitude: 31.2357,
      address: 'Cairo, Egypt'
    }
  },
  {
    name: 'Milo',
    type: 'CAT',
    breed: 'British Shorthair',
    age: 2,
    gender: 'MALE',
    description: 'Calm and independent British Shorthair. Perfect indoor companion.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    verified: true,
    status: 'AVAILABLE',
    ownerId: users[2].id, // Sarah Smith
    location: {
      latitude: 30.0444,
      longitude: 31.2357,
      address: 'Cairo, Egypt'
    }
  },
  {
    name: 'Zoe',
    type: 'DOG',
    breed: 'Poodle',
    age: 1,
    gender: 'FEMALE',
    description: 'Intelligent and hypoallergenic Poodle. Great for allergy sufferers.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    verified: true,
    status: 'AVAILABLE',
    ownerId: users[3].id, // Mike Wilson
    location: {
      latitude: 30.0444,
      longitude: 31.2357,
      address: 'Cairo, Egypt'
    }
  }
];

const generateVetServices = (users) => [
  {
    name: 'Cairo Pet Care Center',
    description: 'Full-service veterinary clinic with experienced staff and modern equipment.',
    category: 'GENERAL',
    price: 50.00,
    duration: 30,
    location: 'Nasr City, Cairo',
    contactPhone: '+201234567800',
    contactEmail: 'info@cairopetcare.com',
    website: 'https://cairopetcare.com',
    services: ['General Checkup', 'Vaccination', 'Spaying/Neutering', 'Dental Care'],
    workingHours: {
      'Monday': '9:00 AM - 8:00 PM',
      'Tuesday': '9:00 AM - 8:00 PM',
      'Wednesday': '9:00 AM - 8:00 PM',
      'Thursday': '9:00 AM - 8:00 PM',
      'Friday': '9:00 AM - 8:00 PM',
      'Saturday': '10:00 AM - 6:00 PM',
      'Sunday': '10:00 AM - 6:00 PM'
    },
    images: [
      'https://images.unsplash.com/photo-1559590943-7b6a2e5c6c2f?w=400'
    ],
    verified: true,
    createdBy: users[0].id // Admin
  },
  {
    name: 'Pet Emergency Clinic',
    description: '24/7 emergency veterinary services for urgent pet care needs.',
    category: 'EMERGENCY',
    price: 150.00,
    duration: 60,
    location: 'Dokki, Cairo',
    contactPhone: '+201234567801',
    contactEmail: 'emergency@petclinic.com',
    website: 'https://petemergency.com',
    services: ['Emergency Surgery', 'Critical Care', 'Trauma Treatment', 'Poison Control'],
    workingHours: {
      'Monday': '24/7',
      'Tuesday': '24/7',
      'Wednesday': '24/7',
      'Thursday': '24/7',
      'Friday': '24/7',
      'Saturday': '24/7',
      'Sunday': '24/7'
    },
    images: [
      'https://images.unsplash.com/photo-1559590943-7b6a2e5c6c2f?w=400'
    ],
    verified: true,
    createdBy: users[0].id // Admin
  },
  {
    name: 'Happy Paws Grooming',
    description: 'Professional pet grooming services with gentle care and attention to detail.',
    category: 'GROOMING',
    price: 30.00,
    duration: 45,
    location: 'Maadi, Cairo',
    contactPhone: '+201234567802',
    contactEmail: 'info@happypaws.com',
    website: 'https://happypaws.com',
    services: ['Full Grooming', 'Bathing', 'Nail Trimming', 'Teeth Cleaning'],
    workingHours: {
      'Monday': '9:00 AM - 6:00 PM',
      'Tuesday': '9:00 AM - 6:00 PM',
      'Wednesday': '9:00 AM - 6:00 PM',
      'Thursday': '9:00 AM - 6:00 PM',
      'Friday': '9:00 AM - 6:00 PM',
      'Saturday': '10:00 AM - 4:00 PM',
      'Sunday': 'Closed'
    },
    images: [
      'https://images.unsplash.com/photo-1559590943-7b6a2e5c6c2f?w=400'
    ],
    verified: true,
    createdBy: users[0].id // Admin
  }
];

const generateHealthRecords = (pets) => [
  {
    petId: pets[0].id, // Max
    type: 'CHECKUP',
    title: 'Annual Health Checkup',
    description: 'Complete physical examination. All vitals normal.',
    veterinarian: 'Dr. Ahmed Mohamed',
    clinic: 'Cairo Pet Care Center',
    date: new Date('2024-01-15'),
    nextDue: new Date('2025-01-15'),
    notes: 'Pet is in excellent health. Continue regular exercise and balanced diet.'
  },
  {
    petId: pets[0].id, // Max
    type: 'VACCINATION',
    title: 'Rabies Vaccination',
    description: 'Annual rabies vaccination administered.',
    veterinarian: 'Dr. Ahmed Mohamed',
    clinic: 'Cairo Pet Care Center',
    date: new Date('2024-01-15'),
    nextDue: new Date('2025-01-15'),
    notes: 'No adverse reactions observed.'
  },
  {
    petId: pets[1].id, // Luna
    type: 'CHECKUP',
    title: 'Routine Health Check',
    description: 'Regular wellness examination.',
    veterinarian: 'Dr. Sarah Johnson',
    clinic: 'Pet Emergency Clinic',
    date: new Date('2024-02-20'),
    nextDue: new Date('2025-02-20'),
    notes: 'Healthy and active. Recommended dental cleaning in 6 months.'
  },
  {
    petId: pets[3].id, // Bella
    type: 'VACCINATION',
    title: 'FVRCP Vaccination',
    description: 'Feline viral rhinotracheitis, calicivirus, and panleukopenia vaccine.',
    veterinarian: 'Dr. Lisa Chen',
    clinic: 'Happy Paws Grooming',
    date: new Date('2024-03-10'),
    nextDue: new Date('2025-03-10'),
    notes: 'Vaccination completed successfully.'
  }
];

const generateMessages = (users) => [
  {
    senderId: users[1].id, // John Doe
    recipientId: users[2].id, // Sarah Smith
    content: 'Hi Sarah! I saw your Labrador Luna. She looks beautiful! Would you be interested in breeding with my Golden Retriever Max?',
    type: 'TEXT',
    read: true
  },
  {
    senderId: users[2].id, // Sarah Smith
    recipientId: users[1].id, // John Doe
    content: 'Hi John! Thank you for your message. Max looks wonderful! I would love to discuss breeding possibilities. When would be a good time to meet?',
    type: 'TEXT',
    read: true
  },
  {
    senderId: users[1].id, // John Doe
    recipientId: users[2].id, // Sarah Smith
    content: 'That sounds great! How about this weekend? I can bring Max to your place or we can meet at a neutral location.',
    type: 'TEXT',
    read: false
  },
  {
    senderId: users[3].id, // Mike Wilson
    recipientId: users[4].id, // Emma Jones
    content: 'Hello Emma! I noticed you have a Persian cat named Bella. My German Shepherd Charlie is very gentle with cats. Would you consider a meet-up?',
    type: 'TEXT',
    read: true
  },
  {
    senderId: users[4].id, // Emma Jones
    recipientId: users[3].id, // Mike Wilson
    content: 'Hi Mike! Bella is quite particular about dogs, but I\'m open to a supervised meeting. Charlie sounds well-behaved.',
    type: 'TEXT',
    read: false
  }
];

const generateBreedingRequests = (pets, users) => [
  {
    requesterPetId: pets[0].id, // Max (John's pet)
    targetPetId: pets[1].id, // Luna (Sarah's pet)
    status: 'ACCEPTED',
    message: 'Would love to arrange a breeding session between Max and Luna.',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12')
  },
  {
    requesterPetId: pets[2].id, // Charlie (Mike's pet)
    targetPetId: pets[3].id, // Bella (Emma's pet)
    status: 'PENDING',
    message: 'Charlie is very gentle and would be a great match for Bella.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

const generateMatches = (pets) => [
  {
    pet1Id: pets[0].id, // Max
    pet2Id: pets[1].id, // Luna
    score: 0.95,
    reasons: [
      'Both are healthy and vaccinated',
      'Compatible breeds (Golden Retriever x Labrador)',
      'Similar age range',
      'Good temperament match',
      'Close location'
    ]
  },
  {
    pet1Id: pets[2].id, // Charlie
    pet2Id: pets[3].id, // Bella
    score: 0.75,
    reasons: [
      'Both are well-trained',
      'Good health records',
      'Different species (dog x cat) - unique match',
      'Experienced owners'
    ]
  },
  {
    pet1Id: pets[4].id, // Rocky
    pet2Id: pets[5].id, // Daisy
    score: 0.80,
    reasons: [
      'Complementary personalities',
      'Similar energy levels',
      'Both young and healthy',
      'Compatible sizes'
    ]
  }
];

// Main seeding function
async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.breedingRequest.deleteMany();
    await prisma.match.deleteMany();
    await prisma.healthRecord.deleteMany();
    await prisma.vetServiceReview.deleteMany();
    await prisma.vetService.deleteMany();
    await prisma.pet.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.userLocation.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    console.log('👥 Creating users...');
    const users = [];
    for (const userData of generateUsers()) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      });
      users.push(user);
    }

    // Create user profiles
    console.log('📝 Creating user profiles...');
    for (const user of users) {
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          bio: `Passionate pet owner with years of experience in breeding and care.`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          address: 'Cairo, Egypt',
          city: 'Cairo',
          country: 'Egypt',
          website: `https://${user.firstName.toLowerCase()}.petbreeding.com`
        }
      });
    }

    // Create user locations
    console.log('📍 Creating user locations...');
    for (const user of users) {
      await prisma.userLocation.create({
        data: {
          userId: user.id,
          latitude: 30.0444 + (Math.random() - 0.5) * 0.1,
          longitude: 31.2357 + (Math.random() - 0.5) * 0.1,
          address: 'Cairo, Egypt',
          accuracy: 10.0
        }
      });
    }

    // Create pets
    console.log('🐕 Creating pets...');
    const pets = [];
    for (const petData of generatePets(users)) {
      const { location, ...petInfo } = petData;
      const pet = await prisma.pet.create({
        data: {
          ...petInfo,
          location: location ? {
            create: location
          } : undefined
        },
        include: {
          location: true
        }
      });
      pets.push(pet);
    }

    // Create vet services
    console.log('🏥 Creating vet services...');
    for (const serviceData of generateVetServices(users)) {
      await prisma.vetService.create({
        data: serviceData
      });
    }

    // Create health records
    console.log('🏥 Creating health records...');
    for (const recordData of generateHealthRecords(pets)) {
      await prisma.healthRecord.create({
        data: recordData
      });
    }

    // Create messages and conversations
    console.log('💬 Creating messages...');
    for (const messageData of generateMessages(users)) {
      // Create conversation first
      const conversation = await prisma.conversation.upsert({
        where: {
          participant1Id_participant2Id: {
            participant1Id: Math.min(messageData.senderId, messageData.recipientId),
            participant2Id: Math.max(messageData.senderId, messageData.recipientId)
          }
        },
        update: {},
        create: {
          participant1Id: Math.min(messageData.senderId, messageData.recipientId),
          participant2Id: Math.max(messageData.senderId, messageData.recipientId)
        }
      });

      // Create message
      await prisma.message.create({
        data: {
          ...messageData,
          createdAt: new Date()
        }
      });
    }

    // Create breeding requests
    console.log('💝 Creating breeding requests...');
    for (const requestData of generateBreedingRequests(pets, users)) {
      await prisma.breedingRequest.create({
        data: requestData
      });
    }

    // Create matches
    console.log('💕 Creating matches...');
    for (const matchData of generateMatches(pets)) {
      await prisma.match.create({
        data: matchData
      });
    }

    // Create some payments
    console.log('💳 Creating payments...');
    await prisma.payment.create({
      data: {
        userId: users[1].id,
        stripePaymentIntentId: 'pi_test_1234567890',
        amount: 19.99,
        currency: 'USD',
        status: 'COMPLETED',
        planType: 'PREMIUM',
        metadata: { description: 'Premium subscription' },
        stripePaymentMethodId: 'pm_test_1234567890',
        completedAt: new Date()
      }
    });

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🐕 Pets: ${pets.length}`);
    console.log(`   🏥 Vet Services: 3`);
    console.log(`   🏥 Health Records: 4`);
    console.log(`   💬 Messages: 5`);
    console.log(`   💝 Breeding Requests: 2`);
    console.log(`   💕 Matches: 3`);
    console.log(`   💳 Payments: 1`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@petbreeding.com / Admin123!');
    console.log('   User: john.doe@example.com / User123!');
    console.log('   User: sarah.smith@example.com / User123!');
    console.log('\n🚀 You can now start the server and test the application!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Run seeding
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
