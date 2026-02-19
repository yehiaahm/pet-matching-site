import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUserCount() {
  try {
    await prisma.$connect();
    
    const userCount = await prisma.users.count();
    console.log('👥 Total users in database:', userCount);
    
    const activeUsers = await prisma.users.count({
      where: { isActive: true }
    });
    console.log('✅ Active users:', activeUsers);
    
    const recentUsers = await prisma.users.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });
    console.log('🆕 New users (last 30 days):', recentUsers);
    
    // Get sample users
    const sampleUsers = await prisma.users.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n📋 Sample recent users:');
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email} - ${user.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getUserCount();
