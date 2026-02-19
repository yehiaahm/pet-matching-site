/**
 * Test System Settings - Direct Database Check
 * 
 * This file checks if system_settings table exists and contains data
 * Run with: npx ts-node test-settings-db.ts
 */

import prisma from './server/config/prisma.js';

async function main() {
  console.log('🔍 Checking system_settings table...\n');

  try {
    // Check if table exists and get count
    const count = await prisma.system_settings.count();
    console.log(`✅ Table exists. Records count: ${count}\n`);

    // Get all settings
    const allSettings = await prisma.system_settings.findMany();
    console.log('📋 All settings in database:');
    console.log(JSON.stringify(allSettings, null, 2));
    console.log();

    // Get or create default
    let settings = await prisma.system_settings.findFirst();
    
    if (!settings) {
      console.log('⚠️ No settings found. Creating default...');
      settings = await prisma.system_settings.create({
        data: {
          id: 'system-settings-default',
          maintenanceMode: false,
          maintenanceMessage: null,
          enableUserRegistration: true,
          enableBreedingRequests: true,
          enableMessaging: true,
          maxWarningsBeforeBan: 3,
        },
      });
      console.log('✅ Default settings created:');
      console.log(JSON.stringify(settings, null, 2));
    } else {
      console.log('✅ Current settings:');
      console.log(JSON.stringify(settings, null, 2));
    }

    // Test update
    console.log('\n📝 Testing update...');
    const updated = await prisma.system_settings.update({
      where: { id: settings.id },
      data: {
        maintenanceMode: true,
        maxWarningsBeforeBan: 5,
      },
    });
    console.log('✅ Settings updated:');
    console.log(JSON.stringify(updated, null, 2));

    // Verify it was saved
    const verified = await prisma.system_settings.findUnique({
      where: { id: settings.id },
    });
    console.log('\n✅ Verification (re-fetch):');
    console.log(JSON.stringify(verified, null, 2));

    if (verified.maintenanceMode === true && verified.maxWarningsBeforeBan === 5) {
      console.log('\n✅✅✅ SUCCESS: Data persistence works correctly!');
    } else {
      console.log('\n❌ ERROR: Data was not saved correctly!');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
