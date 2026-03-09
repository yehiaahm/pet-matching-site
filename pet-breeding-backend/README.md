# Pet Breeding Backend

A production-ready backend API for a Pet Breeding & Matching Platform built with Node.js, Express, PostgreSQL, and Prisma.

## 🚀 Features

- **🔐 Authentication & Authorization**: JWT-based auth with role-based access control
- **🐾 Pet Management**: Complete CRUD operations for pets with photos and health records
- **💕 Breeding System**: Request, match, and manage breeding between pets
- **💳 Payment Processing**: Secure payment handling with multiple methods
- **💬 Messaging**: Real-time messaging system between users
- **⭐ Reviews & Ratings**: User review system for breeders
- **📊 Admin Dashboard**: Comprehensive admin tools and analytics
- **🔒 Security**: Advanced security measures with rate limiting and validation
- **📝 Logging**: Comprehensive logging system with Winston
- **🗄️ Database**: PostgreSQL with Prisma ORM for type-safe database operations

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Testing**: Jest
- **File Upload**: Multer

## 📁 Project Structure

```
pet-breeding-backend/
├── src/
│   ├── controllers/         # Request handlers
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
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
├── README.md                # This file
└── server.js                # Server entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pet-breeding-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
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

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |

### Pet Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/pets` | Create new pet | Yes |
| GET | `/api/pets` | Get all pets (with filters) | No |
| GET | `/api/pets/my` | Get current user's pets | Yes |
| GET | `/api/pets/:id` | Get pet by ID | No |
| PUT | `/api/pets/:id` | Update pet | Yes |
| DELETE | `/api/pets/:id` | Delete pet | Yes |
| POST | `/api/pets/:id/photos` | Upload pet photo | Yes |
| DELETE | `/api/pets/:id/photos/:photoId` | Delete pet photo | Yes |

### Breeding Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/breeding/requests` | Create breeding request | Yes |
| GET | `/api/breeding/requests` | Get breeding requests | Yes |
| GET | `/api/breeding/requests/:id` | Get breeding request by ID | Yes |
| PUT | `/api/breeding/requests/:id` | Update breeding request | Yes |
| DELETE | `/api/breeding/requests/:id` | Delete breeding request | Yes |
| GET | `/api/breeding/matches` | Get matches | Yes |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments` | Create payment | Yes |
| GET | `/api/payments` | Get payments | Yes |
| GET | `/api/payments/:id` | Get payment by ID | Yes |
| PUT | `/api/payments/:id` | Update payment | Yes |

### Message Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/messages` | Send message | Yes |
| GET | `/api/messages/conversations` | Get conversations | Yes |
| GET | `/api/messages/conversations/:id` | Get conversation messages | Yes |
| PUT | `/api/messages/:id/read` | Mark message as read | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/stats` | Get platform statistics | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| PUT | `/api/admin/users/:id/status` | Update user status | Admin |
| GET | `/api/admin/pets` | Get all pets | Admin |
| POST | `/api/admin/pets/:id/approve` | Approve pet | Admin |
| POST | `/api/admin/pets/:id/reject` | Reject pet | Admin |

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/pet_breeding_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# CORS Configuration
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"

# File Upload Configuration
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=5242880

# Email Configuration (Optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Logging Configuration
LOG_LEVEL="info"
```

## 🧪 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: User accounts with roles and authentication
- **Pets**: Pet profiles with health records and photos
- **BreedingRequests**: Requests for breeding between pets
- **Matches**: Successful matches between pets
- **Payments**: Payment transactions
- **Messages**: User-to-user messaging
- **Reviews**: User reviews and ratings
- **HealthRecords**: Pet health documentation

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse and attacks
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configurable CORS policies
- **Helmet**: Security headers and protections
- **SQL Injection Prevention**: Prisma ORM protection

## 📝 Logging

The application uses Winston for structured logging:

- **Console**: Development logging
- **Files**: Production logging (error.log, combined.log)
- **Levels**: error, warn, info, debug
- **Categories**: HTTP, AUTH, DATABASE, BUSINESS, SECURITY, PERFORMANCE

## 🧪 Testing

Run tests with Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🐳 Docker Support

Build and run with Docker:

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

## 🚀 Deployment

### Railway

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Set environment variables
6. Deploy

### Heroku

1. Install Heroku CLI
2. Create app: `heroku create`
3. Set environment variables
4. Deploy: `git push heroku main`

## 📊 API Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## 🔑 Default Credentials

After running the seed script, you can use these credentials:

**Admin User:**
- Email: `admin@petbreeding.com`
- Password: `admin123`

**Regular Users:**
- Email: `john.doe@example.com` / Password: `user123`
- Email: `jane.smith@example.com` / Password: `user456`
- Email: `mike.johnson@example.com` / Password: `user789`

## 📞 Support

For support and questions:

1. Check the logs in the `logs/` directory
2. Review the API documentation above
3. Open an issue on GitHub

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**Happy coding! 🚀**
