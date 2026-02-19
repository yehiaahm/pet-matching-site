# 🔗 API Routes Reference - شامل

## Base URL
```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

## 🔐 Authentication Routes

### POST /auth/register
**Register new user**

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Ahmed",
  "lastName": "Ali",
  "phone": "+1234567890"  // Optional
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "phone": "+1234567890",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (400):**
```json
{
  "status": "fail",
  "message": "Validation failed",
  "errors": [
    { "field": "password", "message": "Password must be at least 8 characters long" }
  ]
}
```

---

### POST /auth/login
**Login existing user**

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "phone": "+1234567890",
      "role": "USER",
      "isActive": true,
      "isEmailVerified": false,
      "profileImage": null,
      "bio": null,
      "location": null,
      "createdAt": "2024-01-16T10:30:00Z",
      "updatedAt": "2024-01-16T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (401):**
```json
{
  "status": "fail",
  "message": "Invalid email or password"
}
```

---

### POST /auth/refresh
**Refresh access token using refresh token**

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /auth/logout
**Logout user (Protected Route - Requires Auth)**

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // Optional
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Logout successful",
  "data": null
}
```

---

### GET /auth/profile
**Get current user profile (Protected Route)**

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "phone": "+1234567890",
      "role": "USER",
      "isActive": true,
      "profileImage": null,
      "bio": "Pet breeder",
      "location": "Cairo, Egypt",
      "createdAt": "2024-01-16T10:30:00Z",
      "updatedAt": "2024-01-16T10:30:00Z"
    }
  }
}
```

---

### PATCH /auth/profile
**Update user profile (Protected Route)**

**Request:**
```json
{
  "firstName": "Ahmed",  // Optional
  "lastName": "Ali",     // Optional
  "phone": "+1234567890", // Optional
  "bio": "Pet breeder",  // Optional
  "location": "Cairo"    // Optional
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "phone": "+1234567890",
      "role": "USER",
      "profileImage": null,
      "bio": "Pet breeder",
      "location": "Cairo",
      "updatedAt": "2024-01-16T10:30:00Z"
    }
  }
}
```

---

### PATCH /auth/change-password
**Change user password (Protected Route)**

**Request:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Password changed successfully",
  "data": null
}
```

---

## 🐕 Pet Routes

### POST /pets
**Create new pet (Protected)**

**Request:**
```json
{
  "name": "Fluffy",
  "species": "Dog",
  "breed": "Golden Retriever",
  "age": 3,
  "weight": 30.5,
  "gender": "MALE",
  "image": "url-to-image",
  "bio": "Friendly dog"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Pet created successfully",
  "data": {
    "pet": {
      "id": "pet-123",
      "name": "Fluffy",
      "species": "Dog",
      "breed": "Golden Retriever",
      "age": 3,
      "weight": 30.5,
      "gender": "MALE",
      "image": "url-to-image",
      "bio": "Friendly dog",
      "createdAt": "2024-01-16T10:30:00Z"
    }
  }
}
```

---

### GET /pets
**Get all user's pets (Protected)**

**Query Params:**
```
?page=1
&limit=10
&species=Dog
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Pets retrieved successfully",
  "data": [
    {
      "id": "pet-123",
      "name": "Fluffy",
      "species": "Dog",
      "breed": "Golden Retriever",
      "age": 3,
      "weight": 30.5,
      "gender": "MALE",
      "image": "url-to-image",
      "bio": "Friendly dog",
      "createdAt": "2024-01-16T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### GET /pets/:id
**Get specific pet (Protected)**

**Response (200):**
```json
{
  "status": "success",
  "message": "Pet retrieved successfully",
  "data": {
    "pet": {
      "id": "pet-123",
      "name": "Fluffy",
      "species": "Dog",
      "breed": "Golden Retriever",
      "age": 3,
      "weight": 30.5,
      "gender": "MALE",
      "image": "url-to-image",
      "bio": "Friendly dog",
      "createdAt": "2024-01-16T10:30:00Z"
    }
  }
}
```

---

### PATCH /pets/:id
**Update pet (Protected)**

**Request:**
```json
{
  "name": "Fluffy",
  "age": 4
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Pet updated successfully",
  "data": {
    "pet": {
      "id": "pet-123",
      "name": "Fluffy",
      "age": 4,
      "updatedAt": "2024-01-16T10:30:00Z"
    }
  }
}
```

---

### DELETE /pets/:id
**Delete pet (Protected)**

**Response (200):**
```json
{
  "status": "success",
  "message": "Pet deleted successfully",
  "data": null
}
```

---

## 💕 Match Routes

### GET /matches
**Get all matches for user's pets (Protected)**

**Query:**
```
?page=1
&limit=10
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Matches retrieved successfully",
  "data": [
    {
      "id": "match-123",
      "myPet": { "id": "pet-123", "name": "Fluffy" },
      "matchedPet": { "id": "pet-456", "name": "Buddy" },
      "matchedUser": { "id": "user-456", "firstName": "John", "email": "john@ex.com" },
      "compatibility": 85,
      "status": "PENDING",
      "createdAt": "2024-01-16T10:30:00Z"
    }
  ]
}
```

---

### POST /matches
**Create match request (Protected)**

**Request:**
```json
{
  "myPetId": "pet-123",
  "matchedPetId": "pet-456",
  "message": "Interested in breeding"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Match created successfully",
  "data": {
    "match": {
      "id": "match-123",
      "status": "PENDING",
      "createdAt": "2024-01-16T10:30:00Z"
    }
  }
}
```

---

### PATCH /matches/:id
**Update match status (Protected)**

**Request:**
```json
{
  "status": "ACCEPTED"  // or REJECTED, CANCELLED
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Match updated successfully",
  "data": {
    "match": {
      "id": "match-123",
      "status": "ACCEPTED"
    }
  }
}
```

---

## 🏥 Health Records Routes

### POST /health-records
**Create health record (Protected)**

**Request:**
```json
{
  "petId": "pet-123",
  "recordType": "VACCINATION",
  "description": "Annual vaccination",
  "date": "2024-01-16",
  "notes": "All vaccines done"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Health record created successfully",
  "data": {
    "record": {
      "id": "record-123",
      "petId": "pet-123",
      "recordType": "VACCINATION",
      "description": "Annual vaccination",
      "date": "2024-01-16",
      "createdAt": "2024-01-16T10:30:00Z"
    }
  }
}
```
---

### GET /health-records
**Get health records (Protected)**

**Query:**
```
?petId=pet-123
&limit=10
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Health records retrieved successfully",
  "data": [
    {
      "id": "record-123",
      "petId": "pet-123",
      "recordType": "VACCINATION",
      "description": "Annual vaccination",
      "date": "2024-01-16",
      "createdAt": "2024-01-16T10:30:00Z"
    }
  ]
}
```

---

## 📊 Analytics Routes

### GET /analytics/overview
**Get analytics overview (Protected - Admin)**

**Response (200):**
```json
{
  "status": "success",
  "message": "Analytics retrieved successfully",
  "data": {
    "totalUsers": 150,
    "totalPets": 300,
    "totalMatches": 50,
    "activeMatches": 10,
    "newUsersThisMonth": 25
  }
}
```

---

## ❌ Error Responses

### 400 - Bad Request
```json
{
  "status": "fail",
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

### 401 - Unauthorized
```json
{
  "status": "fail",
  "message": "Invalid token. Please log in again."
}
```

### 403 - Forbidden
```json
{
  "status": "fail",
  "message": "You do not have permission to access this resource."
}
```

### 404 - Not Found
```json
{
  "status": "fail",
  "message": "The requested resource was not found."
}
```

### 409 - Conflict
```json
{
  "status": "fail",
  "message": "A record with this email already exists."
}
```

### 500 - Server Error
```json
{
  "status": "error",
  "message": "Something went wrong on the server."
}
```

---

## 🧪 Test Using cURL

### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123!@",
    "firstName":"Ahmed",
    "lastName":"Ali"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123!@"
  }'
```

### Protected Route (with token)
```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 📦 Response Format Standard

Every response follows this format:

```typescript
interface ApiResponse<T> {
  status: "success" | "error" | "fail";
  message: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

---

**آخر تحديث**: يناير 2026
