import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function makeSuperAdmin() {
  try {
    console.log('🔍 Searching for user: yehiaahmed195200@gmail.com...');
    
    const user = await prisma.users.update({
      where: { 
        email: 'yehiaahmed195200@gmail.com' 
      },
      data: { 
        role: 'SUPER_ADMIN' 
      }
    });
    
    console.log('✅ SUCCESS! User updated:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.firstName, user.lastName);
    console.log('   Role:', user.role);
    console.log('');
    console.log('🎉 You are now a SUPER_ADMIN!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
    console.log('2. Logout from the website');
    console.log('3. Login again');
    console.log('4. Go to http://localhost:5173/admin');
    console.log('');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    
    if (error.code === 'P2025') {
      console.log('');
      console.log('User not found! Make sure you have registered with this email first:');
      console.log('yehiaahmed195200@gmail.com');
    }
  } finally {
    await prisma.$disconnect();
  }
}

makeSuperAdmin();
