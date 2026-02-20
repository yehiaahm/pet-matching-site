import { execSync } from 'child_process';

try {
	console.log('Running Prisma migration...');
	execSync('npx prisma db push', { stdio: 'inherit' });
	console.log('Database synced');
} catch (e) {
	console.log('Migration error:', e);
}

import './server.js';
