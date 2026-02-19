
import prisma from './config/prisma.js';

async function checkUsers() {
    try {
        const count = await prisma.user.count();
        const users = await prisma.user.findMany({
            select: { email: true, firstName: true },
            take: 5
        });
        console.log(`Total users: ${count}`);
        console.log('Sample users:', JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error checking users:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
