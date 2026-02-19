const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 فحص حالة قاعدة البيانات...\n');
    
    // Test database connection
    console.log('1. اختبار الاتصال بقاعدة البيانات...');
    await prisma.$connect();
    console.log('✅ الاتصال بقاعدة البيانات ناجح\n');
    
    // Check if tables exist
    console.log('2. فحص الجداول...');
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log(`✅ تم العثور على ${tables.length} جدول`);
    console.log('الجداول الموجودة:', tables.map(t => t.table_name).join(', '), '\n');
    
    // Check users table
    console.log('3. فحص جدول المستخدمين...');
    const userCount = await prisma.users.count();
    console.log(`✅ جدول users يحتوي على ${userCount} مستخدم\n`);
    
    // Check pets table
    console.log('4. فحص جدول الحيوانات الأليفة...');
    const petCount = await prisma.pets.count();
    console.log(`✅ جدول pets يحتوي على ${petCount} حيوان أليف\n`);
    
    // Test a simple query
    console.log('5. اختبار استعلام بسيط...');
    const recentUsers = await prisma.users.findMany({
      take: 3,
      select: {
        id: true,
        email: true,
        firstName: true,
        createdAt: true
      }
    });
    console.log('✅ آخر 3 مستخدمين:');
    recentUsers.forEach(user => {
      console.log(`   - ${user.firstName} (${user.email}) - ${user.createdAt.toLocaleDateString()}`);
    });
    console.log('');
    
    // Check if there are any pets
    if (petCount > 0) {
      console.log('6. فحص الحيوانات الأليفة...');
      const recentPets = await prisma.pets.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          breed: true,
          species: true,
          createdAt: true
        }
      });
      console.log('✅ آخر 3 حيوانات أليفة:');
      recentPets.forEach(pet => {
        console.log(`   - ${pet.name} (${pet.species} - ${pet.breed}) - ${pet.createdAt.toLocaleDateString()}`);
      });
    }
    
    console.log('\n🎉 قاعدة البيانات تعمل بشكل ممتاز!');
    
  } catch (error) {
    console.error('❌ خطأ في قاعدة البيانات:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 الحل: تأكد من أن PostgreSQL يعمل');
    } else if (error.code === '3D000') {
      console.error('💡 الحل: قاعدة البيانات غير موجودة، قم بإنشائها');
    } else if (error.code === '28P01') {
      console.error('💡 الحل: تحقق من اسم المستخدم وكلمة المرور');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
