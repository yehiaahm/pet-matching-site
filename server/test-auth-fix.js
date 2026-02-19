const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🔍 Testing authentication fix...');
    
    // Test 1: Check if we can find users
    const userCount = await prisma.users.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    // Test 2: Create a test user
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { email: testEmail }
    });
    
    if (existingUser) {
      console.log('✅ User lookup working - found existing test user');
      
      // Test password comparison
      const isPasswordValid = await bcrypt.compare(testPassword, existingUser.password);
      console.log(`✅ Password comparison working: ${isPasswordValid ? 'VALID' : 'INVALID'}`);
      
    } else {
      console.log('📝 Creating test user...');
      
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      
      const newUser = await prisma.users.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'USER'
        }
      });
      
      console.log(`✅ Created test user: ${newUser.email} (${newUser.id})`);
      
      // Test login
      const foundUser = await prisma.users.findUnique({
        where: { email: testEmail },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          role: true
        }
      });
      
      if (foundUser) {
        const isPasswordValid = await bcrypt.compare(testPassword, foundUser.password);
        console.log(`✅ Login test successful: ${isPasswordValid ? 'PASSWORD MATCH' : 'PASSWORD MISMATCH'}`);
      }
    }
    
    console.log('🎉 Authentication fix verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
