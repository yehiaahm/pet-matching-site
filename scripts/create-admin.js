/**
 * Create Admin User Script
 * 
 * يستخدم هذا السكريبت لإنشاء حساب مشرف عام بسرعة
 * 
 * Usage:
 *   node scripts/create-admin.js
 *   
 * Environment Variables:
 *   ADMIN_EMAIL=admin@example.com
 *   ADMIN_PASSWORD=secure-password
 *   ADMIN_FIRSTNAME=Admin
 *   ADMIN_LASTNAME=User
 *   ADMIN_ROLE=ADMIN (or SUPER_ADMIN)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * Generate secure password hash
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isStrongPassword(password) {
  // At least 8 characters, contains uppercase, lowercase, and number
  return password.length >= 8;
}

/**
 * Create admin user
 */
async function createAdmin(userData) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      console.log('\n⚠️  المستخدم موجود بالفعل. هل تريد ترقيته إلى مشرف؟');
      const upgrade = await question('الترقية؟ (y/n): ');
      
      if (upgrade.toLowerCase() === 'y') {
        const updatedUser = await prisma.user.update({
          where: { email: userData.email },
          data: { 
            role: userData.role,
            emailVerified: true
          }
        });
        
        console.log('\n✅ تم ترقية المستخدم إلى مشرف بنجاح!');
        return updatedUser;
      } else {
        console.log('\n❌ تم إلغاء العملية');
        return null;
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create new admin user
    const admin = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        emailVerified: true,
        profileComplete: true
      }
    });

    console.log('\n✅ تم إنشاء حساب المشرف بنجاح!');
    return admin;

  } catch (error) {
    console.error('\n❌ خطأ في إنشاء المشرف:', error.message);
    throw error;
  }
}

/**
 * Interactive admin creation
 */
async function interactiveCreate() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║      إنشاء حساب مشرف عام (Admin User Creator)       ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  try {
    // Get admin details
    const email = await question('البريد الإلكتروني (Email): ');
    
    if (!isValidEmail(email)) {
      console.log('❌ البريد الإلكتروني غير صالح');
      rl.close();
      return;
    }

    const password = await question('كلمة المرور (Password): ');
    
    if (!isStrongPassword(password)) {
      console.log('⚠️  كلمة المرور ضعيفة. يجب أن تحتوي على 8 أحرف على الأقل');
      const proceed = await question('المتابعة على أي حال؟ (y/n): ');
      if (proceed.toLowerCase() !== 'y') {
        rl.close();
        return;
      }
    }

    const firstName = await question('الاسم الأول (First Name): ');
    const lastName = await question('الاسم الأخير (Last Name): ');
    
    console.log('\nاختر نوع الصلاحية:');
    console.log('1. ADMIN (مشرف عام)');
    console.log('2. SUPER_ADMIN (مشرف أعلى)');
    const roleChoice = await question('الاختيار (1-2): ');
    
    const role = roleChoice === '2' ? 'SUPER_ADMIN' : 'ADMIN';

    // Confirm details
    console.log('\n📋 معلومات الحساب:');
    console.log('─'.repeat(50));
    console.log(`البريد الإلكتروني: ${email}`);
    console.log(`الاسم: ${firstName} ${lastName}`);
    console.log(`الصلاحية: ${role}`);
    console.log('─'.repeat(50));

    const confirm = await question('\nتأكيد الإنشاء؟ (y/n): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('\n❌ تم إلغاء العملية');
      rl.close();
      return;
    }

    // Create admin
    const admin = await createAdmin({
      email,
      password,
      firstName,
      lastName,
      role
    });

    if (admin) {
      console.log('\n📊 معلومات الحساب المنشأ:');
      console.log('─'.repeat(50));
      console.log(`ID: ${admin.id}`);
      console.log(`البريد: ${admin.email}`);
      console.log(`الاسم: ${admin.firstName} ${admin.lastName}`);
      console.log(`الصلاحية: ${admin.role}`);
      console.log(`تم التحقق: ${admin.emailVerified ? '✅' : '❌'}`);
      console.log('─'.repeat(50));
      
      console.log('\n🎉 حساب المشرف جاهز للاستخدام!');
      console.log('\n📝 ملاحظات:');
      console.log('  - هذا الحساب لديه صلاحيات غير محدودة');
      console.log('  - لا يوجد حدود على عدد الطلبات');
      console.log('  - يتم تخطي جميع قيود Rate Limiting');
      console.log('\nللمزيد: ADMIN_UNLIMITED_ACCESS.md\n');
    }

  } catch (error) {
    console.error('\n❌ حدث خطأ:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

/**
 * Create admin from environment variables
 */
async function createFromEnv() {
  const {
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_FIRSTNAME = 'Admin',
    ADMIN_LASTNAME = 'User',
    ADMIN_ROLE = 'ADMIN'
  } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ خطأ: يجب توفير ADMIN_EMAIL و ADMIN_PASSWORD');
    console.log('\nمثال:');
    console.log('ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secure123 node scripts/create-admin.js --env');
    process.exit(1);
  }

  if (!isValidEmail(ADMIN_EMAIL)) {
    console.error('❌ البريد الإلكتروني غير صالح');
    process.exit(1);
  }

  console.log('\n🔧 إنشاء حساب مشرف من متغيرات البيئة...\n');

  try {
    const admin = await createAdmin({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      firstName: ADMIN_FIRSTNAME,
      lastName: ADMIN_LASTNAME,
      role: ADMIN_ROLE
    });

    if (admin) {
      console.log(`\n✅ تم إنشاء المشرف: ${admin.email} (${admin.role})`);
    }
  } catch (error) {
    console.error('❌ فشل الإنشاء:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * List all admin users
 */
async function listAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    });

    console.log('\n📊 حسابات المشرفين الحالية:');
    console.log('═'.repeat(80));
    
    if (admins.length === 0) {
      console.log('لا يوجد حسابات مشرفين حالياً');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.email}`);
        console.log(`   الاسم: ${admin.firstName} ${admin.lastName}`);
        console.log(`   الصلاحية: ${admin.role}`);
        console.log(`   تم التحقق: ${admin.emailVerified ? '✅' : '❌'}`);
        console.log(`   تاريخ الإنشاء: ${admin.createdAt.toLocaleDateString('ar-EG')}`);
      });
    }
    
    console.log('\n═'.repeat(80));
    console.log(`\nالإجمالي: ${admins.length} مشرف\n`);
    
  } catch (error) {
    console.error('❌ خطأ في عرض المشرفين:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list')) {
    await listAdmins();
  } else if (args.includes('--env')) {
    await createFromEnv();
  } else {
    await interactiveCreate();
  }
}

// Run main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { createAdmin, listAdmins };
