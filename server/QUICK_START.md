# 🚀 Quick Start Guide - Pet Breeding Platform

## 📋 Overview

This guide will help you set up the complete Pet Breeding Platform with mock data and access the setup page.

## 🔧 Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- Git

## 🗄️ Database Setup

### 1. Install PostgreSQL
```bash
# Windows
# Download and install from: https://www.postgresql.org/download/windows/

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql
```

### 2. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pet_breeding_db;

# Create user (optional)
CREATE USER petbreeding WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pet_breeding_db TO petbreeding;

# Exit
\q
```

## 🌐 Server Setup

### 1. Navigate to Server Directory
```bash
cd "d:/PetMat_Project/Pet Breeding Matchmaking Website (3)/server"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
# Copy environment file
copy .env.complete .env

# Edit the .env file with your database credentials
notepad .env
```

### 4. Update DATABASE_URL
```env
DATABASE_URL="postgresql://username:password@localhost:5432/pet_breeding_db?schema=public"
```

### 5. Generate Prisma Client
```bash
npx prisma generate --schema=./schema-complete.prisma
```

### 6. Run Database Migrations
```bash
npx prisma migrate dev --schema=./schema-complete.prisma --name init
```

### 7. Seed Database with Mock Data
```bash
node prisma/seed-complete.js
```

## 🚀 Start the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on: `http://localhost:5000`

## 📱 Access the Application

### 1. API Endpoints
- **Health Check**: http://localhost:5000/api/health
- **API Documentation**: http://localhost:5000/api
- **Auth Register**: http://localhost:5000/api/auth/signup
- **Auth Login**: http://localhost:5000/api/auth/login

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd "d:/PetMat_Project/Pet Breeding Matchmaking Website (3)"

# Install frontend dependencies
npm install

# Start frontend development server
npm run dev
```

The frontend will start on: `http://localhost:3000`

### 3. Access Setup Page
Navigate to: `http://localhost:3000/setup`

## 🔑 Default Login Credentials

### Admin Account
- **Email**: admin@petbreeding.com
- **Password**: Admin123!

### User Accounts
- **Email**: john.doe@example.com
- **Password**: User123!

- **Email**: sarah.smith@example.com
- **Password**: User123!

- **Email**: mike.wilson@example.com
- **Password**: User123!

## 📊 Mock Data Included

### Users (8 accounts)
- 1 Admin user
- 7 Regular users with complete profiles

### Pets (10 pets)
- 6 Dogs (Golden Retriever, Labrador, German Shepherd, Bulldog, Beagle, Poodle)
- 3 Cats (Persian, Siamese, Maine Coon, British Shorthair)
- 1 Bird (Various breeds)

### Vet Services (3 clinics)
- General Practice
- Emergency Clinic
- Grooming Services

### Health Records (4 records)
- Vaccination records
- Health checkups
- Medical history

### Messages (5 conversations)
- User-to-user messaging
- Breeding requests
- Match discussions

### Breeding Requests (2 requests)
- Accepted requests
- Pending requests

### Matches (3 matches)
- High compatibility matches
- Match scores and reasons

## 🧪 Test the Application

### 1. Register New User
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+201234567890"
  }'
```

### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 3. Get All Pets
```bash
curl -X GET http://localhost:5000/api/pets
```

### 4. Get User's Pets
```bash
curl -X GET http://localhost:5000/api/pets/my-pets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔍 Features to Test

### ✅ Authentication
- User registration
- Email verification
- Password reset
- JWT login/logout

### ✅ Pet Management
- Add new pets
- Edit pet information
- Upload pet photos
- Set pet location

### ✅ Health Records
- Add vaccination records
- Track medical history
- Set health reminders

### ✅ Messaging
- Send messages to other users
- Real-time chat with Socket.io
- Read/unread status

### ✅ GPS Matching
- Update user location
- Find nearby pets
- Distance-based matching

### ✅ Vet Services
- Browse vet clinics
- Read reviews
- Book appointments

### ✅ File Upload
- Upload pet photos
- Cloudinary integration
- Image optimization

### ✅ Payments
- Stripe integration
- Subscription plans
- Payment history

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
pg_isready

# Check if database exists
psql -U postgres -l

# Test connection
psql -U postgres -d pet_breeding_db
```

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Prisma Issues
```bash
# Reset database
npx prisma migrate reset --schema=./schema-complete.prisma

# Regenerate client
npx prisma generate --schema=./schema-complete.prisma

# View database
npx prisma studio --schema=./schema-complete.prisma
```

### Frontend Issues
```bash
# Clear node_modules
rm -rf node_modules
npm install

# Clear cache
npm run build
```

## 📚 Next Steps

1. **Explore the API**: Test all endpoints at `http://localhost:5000/api`
2. **Setup Frontend**: Configure React app to connect to backend
3. **Customize Data**: Modify seed data to match your needs
4. **Add Features**: Extend the platform with additional functionality
5. **Deploy**: Follow the deployment guide in README-PRODUCTION.md

## 🎯 Success Criteria

- ✅ Server running on port 5000
- ✅ Database connected and seeded
- ✅ Mock data populated
- ✅ API endpoints responding
- ✅ Frontend accessible on port 3000
- ✅ Setup page functional
- ✅ Users can register and login
- ✅ Pets can be added and managed

## 🆘 Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify database connection
3. Ensure all environment variables are set
4. Check that ports 5000 and 3000 are available
5. Review the troubleshooting section above

---

**🎉 Your Pet Breeding Platform is now ready for development and testing!**
