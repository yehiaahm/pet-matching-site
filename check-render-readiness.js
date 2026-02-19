#!/usr/bin/env node

/**
 * Render Deployment Readiness Check
 * فحص جاهزية المشروع للنشر على Render
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const log = {
  ok: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
};

let errors = 0;
let warnings = 0;

console.log('\n========================================');
console.log('🚀 Render Deployment Readiness Check');
console.log('========================================\n');

// Check 1: package.json exists and has correct fields
console.log('1️⃣  Checking package.json...');
const pkgPath = path.join(__dirname, 'server', 'package.json');
if (!fs.existsSync(pkgPath)) {
  log.error('server/package.json not found');
  errors++;
} else {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  if (pkg.type === 'module') {
    log.ok('package.json has "type": "module"');
  } else {
    log.error('package.json missing "type": "module"');
    errors++;
  }
  
  if (pkg.main === 'index.js') {
    log.ok('package.json has "main": "index.js"');
  } else {
    log.warn(`package.json main is "${pkg.main}", expected "index.js"`);
    warnings++;
  }
  
  if (pkg.scripts?.start === 'node index.js') {
    log.ok('package.json start script is "node index.js"');
  } else {
    log.error(`start script is "${pkg.scripts?.start}", expected "node index.js"`);
    errors++;
  }
  
  if (pkg.scripts?.postinstall?.includes('prisma generate')) {
    log.ok('postinstall script includes "prisma generate"');
  } else {
    log.warn('postinstall script missing or missing "prisma generate"');
    warnings++;
  }
  
  // Check dependencies
  const requiredDeps = [
    '@prisma/client', 'express', 'cors', 'helmet',
    'jsonwebtoken', 'bcryptjs', 'dotenv', 'express-rate-limit'
  ];
  
  const missing = requiredDeps.filter(dep => !pkg.dependencies?.[dep]);
  if (missing.length === 0) {
    log.ok(`All ${requiredDeps.length} required dependencies are listed`);
  } else {
    log.warn(`Missing dependencies: ${missing.join(', ')}`);
    warnings++;
  }
}

// Check 2: index.js exists
console.log('\n2️⃣  Checking entry point...');
const indexPath = path.join(__dirname, 'server', 'index.js');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  if (content.includes('server.js')) {
    log.ok('server/index.js exists and imports server.js');
  } else {
    log.warn('server/index.js exists but may not import server.js correctly');
    warnings++;
  }
} else {
  log.error('server/index.js not found');
  errors++;
}

// Check 3: server.js exists and has correct structure
console.log('\n3️⃣  Checking server implementation...');
const serverPath = path.join(__dirname, 'server', 'server.js');
if (fs.existsSync(serverPath)) {
  const content = fs.readFileSync(serverPath, 'utf8');
  
  if (content.includes('import express')) {
    log.ok('server.js uses ES modules');
  } else {
    log.error('server.js does not use ES modules');
    errors++;
  }
  
  if (content.includes('0.0.0.0') || content.includes('process.env.HOST')) {
    log.ok('server.js supports HOST binding');
  } else {
    log.warn('server.js may not bind to 0.0.0.0');
    warnings++;
  }
  
  if (content.includes('process.env.PORT') || content.includes('config.server.port')) {
    log.ok('server.js reads PORT from environment');
  } else {
    log.warn('server.js may not read PORT from environment');
    warnings++;
  }
} else {
  log.error('server/server.js not found');
  errors++;
}

// Check 4: config setup
console.log('\n4️⃣  Checking config...');
const configPath = path.join(__dirname, 'server', 'config', 'index.js');
if (fs.existsSync(configPath)) {
  const content = fs.readFileSync(configPath, 'utf8');
  
  if (content.includes('0.0.0.0')) {
    log.ok('config defaults host to 0.0.0.0');
  } else if (content.includes('process.env.HOST')) {
    log.ok('config reads HOST from environment');
  } else {
    log.warn('config may have localhost hardcoded');
    warnings++;
  }
  
  if (content.includes("origin: '*'") || content.includes('CORS_ORIGIN')) {
    log.ok('config supports flexible CORS origins');
  } else {
    log.warn('config may restrict CORS to localhost');
    warnings++;
  }
} else {
  log.warn('server/config/index.js not found');
  warnings++;
}

// Check 5: .env.example exists
console.log('\n5️⃣  Checking environment documentation...');
const envExamplePath = path.join(__dirname, '.env.example');
if (fs.existsSync(envExamplePath)) {
  const content = fs.readFileSync(envExamplePath, 'utf8');
  
  if (content.includes('DATABASE_URL')) {
    log.ok('.env.example includes DATABASE_URL');
  } else {
    log.warn('.env.example missing DATABASE_URL');
    warnings++;
  }
  
  if (content.includes('JWT_SECRET')) {
    log.ok('.env.example includes JWT_SECRET');
  } else {
    log.warn('.env.example missing JWT_SECRET');
    warnings++;
  }
} else {
  log.warn('.env.example not found');
  warnings++;
}

// Check 6: Frontend API usage
console.log('\n6️⃣  Checking frontend API configuration...');
const apiTsPath = path.join(__dirname, 'src', 'lib', 'api.ts');
if (fs.existsSync(apiTsPath)) {
  const content = fs.readFileSync(apiTsPath, 'utf8');
  
  if (content.includes('window.location.origin')) {
    log.ok('Frontend API correctly uses window.location.origin in production');
  } else if (content.includes('/api/v1')) {
    log.ok('Frontend API uses relative URL fallback');
  } else {
    log.warn('Frontend API may use hardcoded localhost');
    warnings++;
  }
} else {
  log.warn('src/lib/api.ts not found');
  warnings++;
}

// Check sensitive hardcoded URLs
console.log('\n7️⃣  Checking for hardcoded localhost references...');
const searchPaths = [
  path.join(__dirname, 'src', 'app', 'components'),
  path.join(__dirname, 'src', 'services'),
];

let hardcodedCount = 0;
for (const searchPath of searchPaths) {
  if (!fs.existsSync(searchPath)) continue;
  
  const files = fs.readdirSync(searchPath, { recursive: true });
  for (const file of files) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
    
    const filePath = path.join(searchPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for problematic patterns
    if (content.includes("'http://localhost") || content.includes('"http://localhost')) {
      if (!content.includes('process.env') && !content.includes('import.meta.env')) {
        hardcodedCount++;
        if (hardcodedCount <= 3) {
          log.warn(`Hardcoded localhost found in ${path.relative(__dirname, filePath)}`);
        }
      }
    }
  }
}

if (hardcodedCount > 0) {
  log.warn(`Found ${hardcodedCount} potential hardcoded localhost references`);
  warnings++;
}

if (hardcodedCount === 0) {
  log.ok('No hardcoded localhost references detected (or already fixed)');
}

// Check 8: Prisma
console.log('\n8️⃣  Checking Prisma setup...');
const prismaSchemaPath = path.join(__dirname, 'server', 'prisma', 'schema.prisma');
if (fs.existsSync(prismaSchemaPath)) {
  const content = fs.readFileSync(prismaSchemaPath, 'utf8');
  
  if (content.includes('env("DATABASE_URL")')) {
    log.ok('Prisma schema uses DATABASE_URL environment variable');
  } else {
    log.error('Prisma schema may not use DATABASE_URL correctly');
    errors++;
  }
} else {
  log.error('Prisma schema not found');
  errors++;
}

// Summary
console.log('\n========================================');
console.log('📊 Summary');
console.log('========================================\n');

const totalChecks = 8;
const passedChecks = totalChecks - (errors > 0 ? 1 : 0) - (warnings > 0 ? 1 : 0);

console.log(`✅ Errors: ${errors}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`ℹ️  Total Checks: ${totalChecks}\n`);

if (errors === 0 && warnings === 0) {
  console.log('🎉 All checks passed! Project is ready for Render deployment.\n');
  process.exit(0);
} else if (errors === 0) {
  console.log('⚠️  Minor warnings found, but project should deploy OK.\n');
  process.exit(0);
} else {
  console.log('❌ Critical errors found. Please fix before deploying.\n');
  process.exit(1);
}
