import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Client } = pkg;

async function addRolesToEnum() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('📊 Checking existing roles...');
    
    // Check current enum values
    const currentRoles = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'Role'
    `);
    
    console.log('Current roles:', currentRoles.rows.map(r => r.enumlabel).join(', '));
    
    // Add MODERATOR if not exists
    try {
      console.log('➕ Adding MODERATOR role...');
      await client.query(`
        ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MODERATOR'
      `);
      console.log('✅ MODERATOR added');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('✓ MODERATOR already exists');
      } else {
        throw e;
      }
    }
    
    // Add SUPER_ADMIN if not exists
    try {
      console.log('➕ Adding SUPER_ADMIN role...');
      await client.query(`
        ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'
      `);
      console.log('✅ SUPER_ADMIN added');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('✓ SUPER_ADMIN already exists');
      } else {
        throw e;
      }
    }
    
    console.log('');
    console.log('🎉 Roles updated successfully!');
    console.log('Now run: node make-super-admin-raw.js');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await client.end();
  }
}

addRolesToEnum();
