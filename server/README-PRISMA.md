# Pet Breeding Platform - Prisma Integration

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Copy environment file
cp server/.env.prisma server/.env

# Edit the .env file with your database credentials
nano server/.env
```

### 2. Database Setup
```bash
cd server

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

### 3. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify-token` - Verify JWT token

### Pet Management
- `POST /api/pets` - Create new pet (private)
- `GET /api/pets` - Get all pets (public)
- `GET /api/pets/my-pets` - Get user's pets (private)
- `GET /api/pets/:id` - Get pet by ID (public)
- `PUT /api/pets/:id` - Update pet (private, owner only)
- `DELETE /api/pets/:id` - Delete pet (private, owner only)

### System
- `GET /api/health` - Health check
- `GET /api` - API documentation

## 🔐 Authentication

### JWT Token Format
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "USER"
}
```

### Authorization Header
```
Authorization: Bearer <jwt_token>
```

## 📝 Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "01234567890"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

### Create Pet
```bash
curl -X POST http://localhost:5000/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "name": "Max",
    "type": "DOG",
    "breed": "Golden Retriever",
    "age": 3,
    "gender": "MALE",
    "description": "Friendly and playful Golden Retriever",
    "image": "https://example.com/max.jpg",
    "vaccinations": [
      {
        "name": "Rabies",
        "date": "2024-01-15",
        "nextDue": "2025-01-15"
      }
    ],
    "healthCheck": {
      "date": "2024-12-01",
      "veterinarian": "Dr. Smith",
      "notes": "Healthy and active"
    }
  }'
```

### Get All Pets
```bash
curl -X GET "http://localhost:5000/api/pets?page=1&limit=10&type=DOG&verified=true"
```

### Get My Pets
```bash
curl -X GET http://localhost:5000/api/pets/my-pets \
  -H "Authorization: Bearer <your_jwt_token>"
```

## 🔧 Configuration

### Environment Variables
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRE` - Token expiration time (default: 7d)
- `DATABASE_URL` - PostgreSQL connection string
- `FRONTEND_URL` - Frontend application URL
- `NODE_ENV` - Environment (development/production)

### Rate Limiting
- Authentication endpoints: 5 requests per 15 minutes
- Other endpoints: No rate limiting (configurable)

## 🛡️ Security Features

- JWT authentication with Bearer tokens
- Password hashing with bcrypt (12 salt rounds)
- Rate limiting on authentication endpoints
- Input validation with express-validator
- CORS protection
- Security headers with Helmet
- SQL injection prevention with Prisma

## 📊 Database Schema

### User Model
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  firstName     String
  lastName      String
  phone         String?
  role          Role      @default(USER)
  isActive      Boolean   @default(true)
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLogin     DateTime?
  
  pets          Pet[]
  profile       UserProfile?
  
  @@map("users")
}
```

### Pet Model
```prisma
model Pet {
  id          String     @id @default(uuid())
  name        String
  type        PetType
  breed       String
  age         Int
  gender      Gender
  description String?
  image       String?
  verified    Boolean    @default(false)
  status      PetStatus  @default(AVAILABLE)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  ownerId     String
  owner       User       @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  
  vaccinations Vaccination[]
  healthChecks HealthCheck[]
  breedingRequests BreedingRequest[]
  matches     Match[]
  
  @@map("pets")
}
```

## 🚨 Error Handling

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ], // For validation errors
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (permission denied)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### API Documentation
```bash
curl http://localhost:5000/api
```

## 📝 Development Notes

- All passwords are hashed with bcrypt (12 salt rounds)
- JWT tokens contain userId, email, and role
- Pets are automatically linked to the authenticated user
- Admin users can access any resource
- Regular users can only access their own resources
- All timestamps are in ISO 8601 format
- Database operations use Prisma transactions for consistency

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper `DATABASE_URL`
4. Set up SSL/TLS
5. Configure reverse proxy (nginx/Apache)
6. Set up monitoring and logging
7. Regular database backups
8. Update CORS origins for production domain

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify database credentials

2. **JWT Token Error**
   - Check `JWT_SECRET` in `.env`
   - Ensure token is sent in `Authorization: Bearer <token>` header

3. **CORS Error**
   - Update `FRONTEND_URL` in `.env`
   - Check frontend URL configuration

4. **Rate Limiting**
   - Wait 15 minutes after 5 failed auth attempts
   - Check server logs for rate limit hits

### Logs
```bash
# Development logs
npm run dev

# Production logs
pm2 logs pet-breeding-api
```

## 📞 Support

For issues and questions:
1. Check the console logs
2. Verify environment variables
3. Test with the provided curl examples
4. Check the API documentation at `/api`
