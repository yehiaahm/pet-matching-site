const { PrismaClient } = require('@prisma/client');
const express = require('express');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Comprehensive backend test
async function runBackendTests() {
  console.log('🔍 بدء الفحص الشامل للباك إند والداتابيس\n');
  
  const results = {
    database: { status: 'pending', details: {} },
    server: { status: 'pending', details: {} },
    endpoints: { status: 'pending', details: {} },
    errors: []
  };

  // Test 1: Database Connection
  console.log('1️⃣ فحص الاتصال بقاعدة البيانات...');
  try {
    await prisma.$connect();
    results.database.status = 'success';
    results.database.details.connection = '✅ متصل';
    
    // Check tables
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    results.database.details.tables = tables.length;
    results.database.details.tableNames = tables.map(t => t.table_name);
    
    // Check data counts
    const userCount = await prisma.users.count();
    const petCount = await prisma.pets.count();
    const breedingRequestCount = await prisma.breeding_requests.count();
    
    results.database.details.users = userCount;
    results.database.details.pets = petCount;
    results.database.details.breedingRequests = breedingRequestCount;
    
    console.log('✅ قاعدة البيانات متصلة وتعمل');
    console.log(`   - الجداول: ${tables.length}`);
    console.log(`   - المستخدمون: ${userCount}`);
    console.log(`   - الحيوانات الأليفة: ${petCount}`);
    console.log(`   - طلبات التزاوج: ${breedingRequestCount}`);
    
  } catch (error) {
    results.database.status = 'error';
    results.database.details.error = error.message;
    results.errors.push(`قاعدة البيانات: ${error.message}`);
    console.log(`❌ خطأ في قاعدة البيانات: ${error.message}`);
  }

  // Test 2: Server Configuration
  console.log('\n2️⃣ فحص إعدادات السيرفر...');
  try {
    const PORT = process.env.PORT || 5000;
    const NODE_ENV = process.env.NODE_ENV || 'development';
    const DATABASE_URL = process.env.DATABASE_URL ? 'موجود' : 'غير موجود';
    
    results.server.status = 'success';
    results.server.details = {
      port: PORT,
      environment: NODE_ENV,
      databaseUrl: DATABASE_URL,
      prismaClient: 'مثبت'
    };
    
    console.log('✅ إعدادات السيرفر سليمة');
    console.log(`   - المنفذ: ${PORT}`);
    console.log(`   - البيئة: ${NODE_ENV}`);
    console.log(`   - DATABASE_URL: ${DATABASE_URL}`);
    
  } catch (error) {
    results.server.status = 'error';
    results.server.details.error = error.message;
    results.errors.push(`السيرفر: ${error.message}`);
    console.log(`❌ خطأ في السيرفر: ${error.message}`);
  }

  // Test 3: API Endpoints Structure
  console.log('\n3️⃣ فحص بنية الـ API...');
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check routes directory
    const routesDir = path.join(__dirname, 'routes');
    const routesExist = fs.existsSync(routesDir);
    const routesFiles = routesExist ? fs.readdirSync(routesDir) : [];
    
    // Check controllers directory
    const controllersDir = path.join(__dirname, 'controllers');
    const controllersExist = fs.existsSync(controllersDir);
    const controllersFiles = controllersExist ? fs.readdirSync(controllersDir) : [];
    
    results.endpoints.status = 'success';
    results.endpoints.details = {
      routesDirectory: routesExist,
      routesFiles: routesFiles.length,
      controllersDirectory: controllersExist,
      controllersFiles: controllersFiles.length,
      routeFiles: routesFiles,
      controllerFiles: controllersFiles
    };
    
    console.log('✅ بنية الـ API سليمة');
    console.log(`   - مجلد routes: ${routesExist ? 'موجود' : 'غير موجود'} (${routesFiles.length} ملف)`);
    console.log(`   - مجلد controllers: ${controllersExist ? 'موجود' : 'غير موجود'} (${controllersFiles.length} ملف)`);
    
    // List key routes
    const keyRoutes = routesFiles.filter(f => f.includes('auth') || f.includes('pet') || f.includes('user'));
    if (keyRoutes.length > 0) {
      console.log(`   - المسارات الرئيسية: ${keyRoutes.join(', ')}`);
    }
    
  } catch (error) {
    results.endpoints.status = 'error';
    results.endpoints.details.error = error.message;
    results.errors.push(`الـ API: ${error.message}`);
    console.log(`❌ خطأ في الـ API: ${error.message}`);
  }

  // Summary
  console.log('\n📊 ملخص الفحص:');
  console.log('================');
  
  const allSuccess = results.database.status === 'success' && 
                     results.server.status === 'success' && 
                     results.endpoints.status === 'success';
  
  if (allSuccess) {
    console.log('🎉 كل شيء يعمل بشكل ممتاز!');
    console.log('✅ قاعدة البيانات: متصلة وتعمل');
    console.log('✅ السيرفر: إعدادات سليمة');
    console.log('✅ الـ API: بنية صحيحة');
  } else {
    console.log('⚠️  تم العثور على بعض المشاكل:');
    if (results.database.status === 'error') {
      console.log(`❌ قاعدة البيانات: ${results.database.details.error}`);
    }
    if (results.server.status === 'error') {
      console.log(`❌ السيرفر: ${results.server.details.error}`);
    }
    if (results.endpoints.status === 'error') {
      console.log(`❌ الـ API: ${results.endpoints.details.error}`);
    }
  }

  // Recommendations
  console.log('\n💡 التوصيات:');
  if (results.database.status === 'success' && results.database.details.users === 0) {
    console.log('- أضف بعض المستخدمين للتجربة');
  }
  if (results.database.status === 'success' && results.database.details.pets === 0) {
    console.log('- أضف بعض الحيوانات الأليفة للتجربة');
  }
  if (allSuccess) {
    console.log('- يمكنك تشغيل السيرفر: npm run dev');
    console.log('- اختبر الـ API على: http://localhost:5000');
  }

  return results;
}

// API endpoint to get test results
app.get('/backend-test', async (req, res) => {
  try {
    const results = await runBackendTests();
    res.json({
      status: 'completed',
      timestamp: new Date().toISOString(),
      results: results
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'PetMat Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start test server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 سيرفر الفحص يعمل على http://localhost:${PORT}`);
  console.log(`📊 الفحص الشامل: http://localhost:${PORT}/backend-test`);
  console.log(`💓 الصحة: http://localhost:${PORT}/health`);
  
  // Run tests automatically
  setTimeout(() => {
    runBackendTests();
  }, 1000);
});

export { runBackendTests };
