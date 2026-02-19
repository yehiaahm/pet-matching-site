import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: 'test@test.com' }
    });

    if (existingUser) {
      console.log('✅ User already exists: test@test.com');
      console.log('📧 Email: test@test.com');
      console.log('🔑 Password: Test123!@#');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Test123!@#', 10);

    // Create test user
    const user = await prisma.users.create({
      data: {
        id: randomUUID(),
        email: 'test@test.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        phone: '+201234567890',
        role: 'USER',
        updatedAt: new Date()
      }
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@test.com');
    console.log('🔑 Password: Test123!@#');
    console.log('👤 User ID:', user.id);

    // Also create admin user
    const existingAdmin = await prisma.users.findUnique({
      where: { email: 'yehiaahmed195200@gmail.com' }
    });

    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('yehia.hema195200', 10);
      const admin = await prisma.users.create({
        data: {
          id: randomUUID(),
          email: 'yehiaahmed195200@gmail.com',
          password: adminPassword,
          firstName: 'Yehia',
          lastName: 'Ahmed',
          phone: null,
          role: 'ADMIN',
          updatedAt: new Date()
        }
      });
      console.log('✅ Admin user created!');
      console.log('📧 Email: yehiaahmed195200@gmail.com');
      console.log('🔑 Password: yehia.hema195200');
      console.log('👤 Admin ID:', admin.id);
    } else {
      console.log('✅ Admin user already exists');
    }

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
