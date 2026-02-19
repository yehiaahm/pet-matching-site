# Database Setup Instructions

## Prerequisites
- PostgreSQL 12+ installed
- Node.js 18+

## Option 1: Local PostgreSQL Setup (Windows)

### 1. Install PostgreSQL
Download and install from: https://www.postgresql.org/download/windows/
- Username: `postgres`
- Password: `postgres`
- Port: `5432`

### 2. Create Database
Open pgAdmin or Command Prompt and run:
```sql
CREATE DATABASE pet_matchmaking;
```

### 3. Update .env
Ensure `.env` contains:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pet_matchmaking"
```

### 4. Run Prisma Migrations
```bash
cd server
npx prisma migrate dev --name init
```

### 5. Seed Database (Optional)
```bash
npx prisma db seed
```

## Option 2: Docker Setup (Recommended)

### 1. Install Docker Desktop
https://www.docker.com/products/docker-desktop

### 2. Run PostgreSQL Container
```bash
docker run --name pet-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pet_matchmaking \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 3. Run Prisma Migrations
```bash
cd server
npx prisma migrate dev --name init
```

### 4. Start Server
```bash
npm start
```

## Option 3: PostgreSQL Hosting (Cloud)

Use services like:
- Vercel PostgreSQL
- Supabase
- Railway
- Render

Update `.env` DATABASE_URL with your connection string.

## Verify Database Connection

```bash
npx prisma db push
npx prisma studio  # Opens web UI to view data
```

## Test Authentication

After database is ready:

```bash
# Terminal 1: Start server
cd server
npm start

# Terminal 2: Test endpoints
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "USER"
  }'
```

## Troubleshooting

**Error: Can't reach database server**
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Check firewall settings

**Error: relation does not exist**
- Run: `npx prisma migrate dev`

**Permission denied errors**
- Ensure postgres user has correct permissions
- Check database ownership

