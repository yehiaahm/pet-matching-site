# Database Setup - Multiple Options

## ✅ Option 1: Supabase (Recommended - Free & Easy)

### Steps:
1. Go to https://supabase.com/
2. Sign up for free account
3. Create new project
4. Copy connection string from project settings
5. Update `.env` file with your connection string:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
   ```

## Option 2: Local PostgreSQL Installation

### Windows:
1. Download from: https://www.postgresql.org/download/windows/
2. Install PostgreSQL 15
3. Set password to: `postgres`
4. Keep default port: `5432`
5. Run migrations:
   ```bash
   cd server
   npx prisma migrate dev --name init
   ```

## Option 3: Docker (If installed)

```bash
cd server
docker compose up -d
npx prisma migrate dev --name init
```

## After Setup - Run Migrations

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

## Test Connection

```bash
cd server
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('✅ Connected!')).catch(e => console.log('❌ Error:', e.message))"
```
