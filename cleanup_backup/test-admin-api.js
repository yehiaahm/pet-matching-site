// test-admin-api.js
// اختبار سريع لـ Admin APIs

const API_BASE = 'http://localhost:3000/api/v1/admin';

// Token تجريبي (استبدله بـ token حقيقي)
const ADMIN_TOKEN = 'your_admin_token_here';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
};

// ============== اختبار إدارة المستخدمين ==============

async function testGetUsers() {
  console.log('\n📋 اختبار: الحصول على قائمة المستخدمين');
  try {
    const response = await fetch(`${API_BASE}/users?page=1&limit=10`, {
      headers,
    });
    const data = await response.json();
    console.log('✅ نجح:', data.stats);
  } catch (error) {
    console.error('❌ فشل:', error.message);
  }
}

async function testBanUser(userId) {
  console.log('\n🔒 اختبار: حظر مستخدم');
  try {
    const response = await fetch(`${API_BASE}/users/ban`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        reason: 'انتهاك متكرر للقوانين',
      }),
    });
    const data = await response.json();
    if (data.success) {
      console.log('✅ تم حظر المستخدم بنجاح');
    } else {
      console.log('❌ فشل:', data.message);
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

async function testAddWarning(userId) {
  console.log('\n⚠️  اختبار: إضافة تحذير');
  try {
    const response = await fetch(`${API_BASE}/users/warning`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        reason: 'محتوى غير لائق',
      }),
    });
    const data = await response.json();
    if (data.success) {
      console.log(`✅ تم إضافة تحذير. إجمالي التحذيرات: ${data.warnings}/${data.maxWarnings}`);
    } else {
      console.log('❌ فشل:', data.message);
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============== اختبار البلاغات ==============

async function testGetReports() {
  console.log('\n📋 اختبار: الحصول على البلاغات');
  try {
    const response = await fetch(`${API_BASE}/reports?status=PENDING`, {
      headers,
    });
    const data = await response.json();
    console.log(`✅ عدد البلاغات المعلقة: ${data.reports.length}`);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

async function testResolveReport(reportId) {
  console.log('\n✅ اختبار: حل البلاغ');
  try {
    const response = await fetch(`${API_BASE}/reports/${reportId}/resolve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'BAN_USER',
        notes: 'تم حظر المستخدم بسبب الانتهاكات المتكررة',
      }),
    });
    const data = await response.json();
    if (data.success) {
      console.log('✅ تم حل البلاغ بنجاح');
    } else {
      console.log('❌ فشل:', data.message);
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============== اختبار الإحصائيات ==============

async function testGetDashboardStats() {
  console.log('\n📊 اختبار: الحصول على إحصائيات لوحة التحكم');
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats`, {
      headers,
    });
    const data = await response.json();
    if (data.success) {
      console.log('✅ الإحصائيات:');
      console.log(`   - إجمالي المستخدمين: ${data.stats.users.total}`);
      console.log(`   - المُربيون: ${data.stats.users.breeders}`);
      console.log(`   - المحظورون: ${data.stats.users.banned}`);
      console.log(`   - الحيوانات: ${data.stats.content.totalPets}`);
      console.log(`   - البلاغات المعلقة: ${data.stats.content.pendingReports}`);
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

async function testGetActivityData() {
  console.log('\n📈 اختبار: بيانات النشاط (آخر 7 أيام)');
  try {
    const response = await fetch(`${API_BASE}/dashboard/activity`, {
      headers,
    });
    const data = await response.json();
    if (data.success) {
      console.log('✅ بيانات النشاط:');
      data.data.forEach(day => {
        console.log(`   ${day.date}: ${day.users} مستخدمين، ${day.pets} حيوانات، ${day.messages} رسالة`);
      });
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============== اختبار الإعدادات ==============

async function testGetSystemSettings() {
  console.log('\n⚙️  اختبار: الحصول على إعدادات النظام');
  try {
    const response = await fetch(`${API_BASE}/settings`, {
      headers,
    });
    const data = await response.json();
    if (data.success) {
      console.log('✅ الإعدادات:');
      console.log(`   - وضع الصيانة: ${data.settings.maintenanceMode ? 'مفعّل' : 'معطّل'}`);
      console.log(`   - التسجيل الجديد: ${data.settings.enableUserRegistration ? 'مفعّل' : 'معطّل'}`);
      console.log(`   - الرسائل: ${data.settings.enableMessaging ? 'مفعّلة' : 'معطّلة'}`);
      console.log(`   - الحد الأقصى للتحذيرات: ${data.settings.maxWarningsBeforeBan}`);
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

async function testUpdateSystemSettings() {
  console.log('\n✏️  اختبار: تحديث الإعدادات');
  try {
    const response = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        maintenanceMode: false,
        enableUserRegistration: true,
        enableMessaging: true,
        maxWarningsBeforeBan: 3,
      }),
    });
    const data = await response.json();
    if (data.success) {
      console.log('✅ تم تحديث الإعدادات بنجاح');
    } else {
      console.log('❌ فشل:', data.message);
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============== تشغيل الاختبارات ==============

async function runAllTests() {
  console.log('🧪 بدء اختبار Admin API endpoints...\n');
  
  await testGetUsers();
  await testGetDashboardStats();
  await testGetActivityData();
  await testGetReports();
  await testGetSystemSettings();
  
  console.log('\n✨ انتهت الاختبارات!');
}

// للاستخدام:
// node test-admin-api.js
runAllTests().catch(console.error);

module.exports = {
  testGetUsers,
  testBanUser,
  testAddWarning,
  testGetReports,
  testResolveReport,
  testGetDashboardStats,
  testGetActivityData,
  testGetSystemSettings,
  testUpdateSystemSettings,
};
