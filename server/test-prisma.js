import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Prisma Client:', typeof prisma);
console.log('Has user?:', typeof prisma.user);

prisma.$connect()
  .then(() => console.log('✅ Connected'))
  .catch(e => console.error('❌ Connection error:', e.message))
  .finally(() => prisma.$disconnect());
