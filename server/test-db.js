const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test basic query
    const userCount = await prisma.users.count();
    console.log(`📊 Users table has ${userCount} records`);
    
    const petCount = await prisma.pets.count();
    console.log(`🐾 Pets table has ${petCount} records`);
    
    // List all tables
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('🗂️ Available tables:', tables.map(t => t.table_name));
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
