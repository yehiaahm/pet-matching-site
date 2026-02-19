# Database Setup Guide

## Prerequisites
- Docker Desktop installed and running

## Quick Start

### 1. Start PostgreSQL Database
```bash
cd server
docker-compose up -d
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Run Database Migrations
```bash
npx prisma migrate dev --name init
```

### 4. Seed Database (Optional)
```bash
npx prisma db seed
```

### 5. View Database (Optional)
```bash
npx prisma studio
```

## Stop Database
```bash
docker-compose down
```

## Reset Database
```bash
docker-compose down -v
npx prisma migrate reset
```

## Connection String
```
postgresql://postgres:postgres@localhost:5432/pet_matchmaking
```
