import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Client } = pkg;

async function makeSuperAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('🔍 Searching for user: yehiaahmed195200@gmail.com...');
    
    const result = await client.query(
      `UPDATE users 
       SET role = 'SUPER_ADMIN', "updatedAt" = NOW() 
       WHERE email = $1 
       RETURNING id, email, "firstName", "lastName", role`,
      ['yehiaahmed195200@gmail.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found!');
      console.log('Make sure you have registered with: yehiaahmed195200@gmail.com');
      return;
    }
    
    const user = result.rows[0];
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
  } finally {
    await client.end();
  }
}

makeSuperAdmin();
