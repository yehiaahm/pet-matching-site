# Pet Breeding Backend - Complete Setup Guide

## 🎯 Overview

This is a **production-ready backend system** for a Pet Breeding & Matching Platform built with enterprise-grade architecture and best practices.

## 🚀 What's Included

### ✅ **Complete Backend System**
- **🔐 Authentication System**: JWT-based with refresh tokens
- **👥 User Management**: Registration, login, profiles, roles
- **🐾 Pet Management**: CRUD operations, photos, health records
- **💕 Breeding System**: Requests, matches, workflow management
- **💳 Payment Processing**: Multiple payment methods, status tracking
- **💬 Messaging System**: Real-time messaging between users
- **⭐ Review System**: User ratings and reviews
- **👨‍💼 Admin Dashboard**: Complete admin tools and analytics
- **🔒 Security**: Advanced security measures and validation
- **📝 Logging**: Comprehensive logging system
- **🗄️ Database**: PostgreSQL with Prisma ORM

### ✅ **Enterprise Features**
- **Clean Architecture**: Controllers, Services, Routes, Middleware
- **Type Safety**: Full TypeScript support with Zod validation
- **Error Handling**: Comprehensive error handling and logging
- **Rate Limiting**: Prevent abuse and attacks
- **CORS Protection**: Configurable cross-origin policies
- **File Upload**: Secure file upload with validation
- **Database Migrations**: Version-controlled database schema
- **Seed Data**: Sample data for testing and development

## 📁 Complete Project Structure

```
pet-breeding-backend/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── petController.js
│   │   ├── breedingController.js
│   │   ├── paymentController.js
│   │   ├── messageController.js
│   │   └── adminController.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── pets.js
│   │   ├── breeding.js
│   │   ├── payments.js
│   │   ├── messages.js
│   │   └── admin.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── upload.js
│   ├── services/            # Business logic
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── petService.js
│   │   ├── breedingService.js
│   │   ├── paymentService.js
│   │   ├── messageService.js
│   │   ├── emailService.js
│   │   └── matchingService.js
│   ├── utils/               # Utility functions
│   │   ├── logger.js
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   └── encryption.js
│   ├── config/              # Configuration files
│   │   ├── database.js
│   │   ├── jwt.js
│   │   ├── email.js
│   │   └── upload.js
│   └── app.js               # Express app setup
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.js              # Database seeding
├── uploads/                 # File uploads
├── logs/                    # Log files
├── tests/                   # Test files
├── docs/                    # Documentation
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore file
├── package.json            # Dependencies and scripts
├── README.md                # Documentation
└── server.js                # Server entry point
```

## 🛠️ Installation & Setup

### 1. **Prerequisites**
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### 2. **Clone and Install**
```bash
git clone <repository-url>
cd pet-breeding-backend
npm install
```

### 3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Database URL, JWT secret, CORS origins, etc.
```

### 4. **Database Setup**
```bash
# Create PostgreSQL database
createdb pet_breeding_db

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 5. **Start Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server starts on `http://localhost:5000`

## 📚 API Documentation

### 🔐 **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change password

### 🐾 **Pet Management**
- `POST /api/pets` - Create pet
- `GET /api/pets` - Get all pets (with filters)
- `GET /api/pets/my` - Get user's pets
- `GET /api/pets/:id` - Get pet by ID
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet
- `POST /api/pets/:id/photos` - Upload photo
- `DELETE /api/pets/:id/photos/:photoId` - Delete photo

### 💕 **Breeding System**
- `POST /api/breeding/requests` - Create breeding request
- `GET /api/breeding/requests` - Get breeding requests
- `GET /api/breeding/requests/:id` - Get request by ID
- `PUT /api/breeding/requests/:id` - Update request
- `DELETE /api/breeding/requests/:id` - Delete request
- `GET /api/breeding/matches` - Get matches

### 💳 **Payments**
- `POST /api/payments` - Create payment
- `GET /api/payments` - Get payments
- `GET /api/payments/:id` - Get payment by ID
- `PUT /api/payments/:id` - Update payment

### 💬 **Messages**
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversations/:id` - Get conversation messages
- `PUT /api/messages/:id/read` - Mark as read

### 👨‍💼 **Admin**
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/pets` - Get all pets
- `POST /api/admin/pets/:id/approve` - Approve pet
- `POST /api/admin/pets/:id/reject` - Reject pet

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Password Hashing**: bcrypt with 12 salt rounds
- **Rate Limiting**: Prevents abuse (100 requests per 15 minutes)
- **Input Validation**: Zod schema validation for all inputs
- **CORS Protection**: Configurable cross-origin policies
- **Helmet**: Security headers and protections
- **SQL Injection Prevention**: Prisma ORM protection
- **File Upload Security**: Multer with file type validation

## 📊 Database Schema

### **Core Entities**
- **Users**: Authentication, profiles, roles
- **Pets**: Pet information, photos, health records
- **BreedingRequests**: Breeding requests and workflow
- **Matches**: Successful pet matches
- **Payments**: Payment transactions
- **Messages**: User messaging system
- **Reviews**: User reviews and ratings
- **HealthRecords**: Pet health documentation

### **Relationships**
- Users 1:N Pets
- Users 1:N BreedingRequests (as initiator/target)
- Pets 1:N BreedingRequests
- BreedingRequests 1:1 Matches
- Users 1:N Messages
- Users 1:N Reviews
- Pets 1:N HealthRecords

## 🧪 Testing

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📝 Logging System

**Winston-based structured logging**:
- **Console**: Development logging
- **Files**: Production logging (error.log, combined.log)
- **Categories**: HTTP, AUTH, DATABASE, BUSINESS, SECURITY, PERFORMANCE
- **Levels**: error, warn, info, debug

## 🚀 Deployment

### **Railway**
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### **Render**
1. Create Web Service
2. Connect GitHub
3. Set build: `npm install`
4. Set start: `npm start`
5. Add environment variables
6. Deploy

### **Heroku**
1. `heroku create`
2. `heroku config:set DATABASE_URL=...`
3. `git push heroku main`

## 🔑 Default Credentials

After seeding:
- **Admin**: `admin@petbreeding.com` / `admin123`
- **User 1**: `john.doe@example.com` / `user123`
- **User 2**: `jane.smith@example.com` / `user456`
- **User 3**: `mike.johnson@example.com` / `user789`

## 📋 Available Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "lint": "eslint src/",
  "lint:fix": "eslint src/ --fix",
  "db:generate": "prisma generate",
  "db:migrate": "prisma migrate dev",
  "db:deploy": "prisma migrate deploy",
  "db:studio": "prisma studio",
  "db:seed": "node prisma/seed.js",
  "db:reset": "prisma migrate reset"
}
```

## 🎯 Production Readiness

This backend is **production-ready** with:

✅ **Enterprise Architecture**: Clean, scalable, maintainable
✅ **Security**: Advanced security measures
✅ **Error Handling**: Comprehensive error handling
✅ **Logging**: Structured logging system
✅ **Testing**: Jest test framework
✅ **Documentation**: Complete API documentation
✅ **Database**: PostgreSQL with migrations
✅ **Validation**: Input validation with Zod
✅ **Performance**: Optimized queries and caching
✅ **Scalability**: Ready for horizontal scaling

## 🌟 Key Features

- **🔐 Complete Auth System**: JWT with refresh tokens
- **🐾 Full Pet Management**: CRUD with photos and health records
- **💕 Breeding Workflow**: Complete breeding request system
- **💳 Payment Processing**: Multiple payment methods
- **💬 Real-time Messaging**: User-to-user communication
- **⭐ Review System**: User ratings and feedback
- **👨‍💼 Admin Tools**: Comprehensive admin dashboard
- **📊 Analytics**: Platform statistics and insights
- **🔒 Enterprise Security**: Advanced security measures
- **📝 Structured Logging**: Comprehensive logging system

---

**🎉 This is a complete, production-ready backend system ready for real-world deployment!**
