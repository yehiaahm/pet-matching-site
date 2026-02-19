# PetMat Backend API

Production-ready Node.js backend for the Pet Breeding Matchmaking Platform.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with refresh tokens
- 🛡️ **Security** - Helmet, CORS, rate limiting, input sanitization
- 📊 **Database** - PostgreSQL with Prisma ORM
- ✅ **Validation** - Request validation with express-validator
- 📝 **Logging** - Winston logger with file and console output
- 🚀 **Performance** - Compression, optimized queries
- 🔄 **Error Handling** - Centralized error handling
- 🏥 **Health Checks** - Database and server health monitoring

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Security:** helmet, cors, express-rate-limit
- **Logging:** winston, morgan
- **Password Hashing:** bcryptjs

## Project Structure

```
server/
├── config/           # Configuration files
│   ├── index.js     # Main config
│   └── logger.js    # Winston logger config
├── controllers/      # Route controllers
│   ├── authController.js
│   ├── petController.js
│   └── healthController.js
├── middleware/       # Custom middleware
│   ├── auth.js      # Authentication middleware
│   ├── errorHandler.js
│   ├── security.js  # Security middleware
│   └── validation.js
├── prisma/          # Prisma schema and migrations
│   ├── schema.prisma
│   └── seed.js
├── routes/          # API routes
│   ├── index.js
│   ├── authRoutes.js
│   ├── petRoutes.js
│   └── healthRoutes.js
├── utils/           # Utility functions
│   ├── errors.js
│   ├── jwt.js
│   ├── encryption.js
│   ├── response.js
│   └── queryHelpers.js
├── .env.example     # Environment variables template
├── .gitignore
├── package.json
└── server.js        # Main server file
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm >= 9.0.0

### Installation

1. **Clone the repository and navigate to server directory**

```bash
cd server
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/petmat_db"
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
CORS_ORIGIN=http://localhost:5173
```

4. **Set up database**

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

5. **Start the server**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check

- `GET /api/v1/health` - Server health status

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user (requires auth)
- `GET /api/v1/auth/profile` - Get user profile (requires auth)
- `PATCH /api/v1/auth/profile` - Update user profile (requires auth)
- `PATCH /api/v1/auth/change-password` - Change password (requires auth)

### Pets

- `GET /api/v1/pets` - Get all pets (with pagination & filters)
- `GET /api/v1/pets/:id` - Get pet by ID
- `POST /api/v1/pets` - Create new pet (requires auth)
- `PATCH /api/v1/pets/:id` - Update pet (requires auth)
- `DELETE /api/v1/pets/:id` - Delete pet (requires auth)
- `GET /api/v1/pets/user/my-pets` - Get current user's pets (requires auth)

## Database Schema

The database includes the following main models:

- **User** - User accounts with authentication
- **Pet** - Pet profiles with breeding information
- **MatchRequest** - Breeding match requests between pets
- **VetService** - Veterinary service listings
- **VetAppointment** - Appointments for vet services
- **Review** - Pet reviews and ratings
- **Message** - User messaging system
- **RefreshToken** - JWT refresh token management

## Security Features

- **Helmet** - Sets security HTTP headers
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - Prevents brute force attacks
- **Input Sanitization** - Prevents NoSQL injection
- **Password Hashing** - bcrypt with configurable rounds
- **JWT Authentication** - Secure token-based auth
- **Request Validation** - express-validator for input validation
- **Error Handling** - Secure error messages in production

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | 30d |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | http://localhost:5173 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |

## Demo Credentials

After running the seed script:

- **Admin:** yehiaahmed195200@gmail.com / yehia.hema195200
- **User 1:** john.doe@example.com / Demo@12345
- **User 2:** jane.smith@example.com / Demo@12345

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed database with demo data

## Error Handling

The API uses a centralized error handling system with standardized error responses:

```json
{
  "status": "error",
  "message": "Error message here",
  "errors": [] // Optional validation errors
}
```

## Response Format

Success responses follow this format:

```json
{
  "status": "success",
  "message": "Success message",
  "data": {},
  "meta": {} // Optional metadata (pagination, etc.)
}
```

## Logging

Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (error logs only)

## License

MIT
