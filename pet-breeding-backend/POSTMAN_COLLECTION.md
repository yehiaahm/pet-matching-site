# Pet Breeding Backend - Postman Collection

## 📋 API Endpoints Collection

### 🔐 Authentication

#### Register User
```http
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### Login User
```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "user123"
}
```

#### Refresh Token
```http
POST {{baseUrl}}/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

#### Get Profile
```http
GET {{baseUrl}}/api/auth/profile
Authorization: Bearer {{accessToken}}
```

#### Change Password
```http
PUT {{baseUrl}}/api/auth/change-password
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

#### Logout
```http
POST {{baseUrl}}/api/auth/logout
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

---

### 🐾 Pet Management

#### Create Pet
```http
POST {{baseUrl}}/api/pets
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Buddy",
  "species": "DOG",
  "breed": "Golden Retriever",
  "gender": "MALE",
  "age": 2,
  "weight": 30.5,
  "description": "Friendly and energetic Golden Retriever",
  "status": "AVAILABLE",
  "vaccinated": true,
  "healthCertified": true,
  "price": 1500,
  "birthDate": "2022-03-15T00:00:00.000Z",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "New York, NY, USA"
  }
}
```

#### Get All Pets
```http
GET {{baseUrl}}/api/pets?page=1&limit=20&species=DOG&gender=MALE&status=AVAILABLE
```

#### Get Pet by ID
```http
GET {{baseUrl}}/api/pets/{{petId}}
```

#### Update Pet
```http
PUT {{baseUrl}}/api/pets/{{petId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Buddy Updated",
  "price": 1800,
  "status": "UNAVAILABLE"
}
```

#### Delete Pet
```http
DELETE {{baseUrl}}/api/pets/{{petId}}
Authorization: Bearer {{accessToken}}
```

#### Upload Pet Photo
```http
POST {{baseUrl}}/api/pets/{{petId}}/photos
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data

file: [pet photo file]
isMain: true
```

---

### 💕 Breeding Requests

#### Create Breeding Request
```http
POST {{baseUrl}}/api/breeding/requests
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "targetUserId": "target-user-id",
  "targetPetId": "target-pet-id",
  "initiatorPetId": "initiator-pet-id",
  "message": "I would like to breed my pet with yours",
  "preferredDate": "2024-03-15T00:00:00.000Z"
}
```

#### Get Breeding Requests
```http
GET {{baseUrl}}/api/breeding/requests
Authorization: Bearer {{accessToken}}
```

#### Update Breeding Request
```http
PUT {{baseUrl}}/api/breeding/requests/{{requestId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "status": "ACCEPTED",
  "message": "Great match! Let's proceed with breeding."
}
```

---

### 💳 Payments

#### Create Payment
```http
POST {{baseUrl}}/api/payments
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "amount": 500,
  "paymentMethod": "INSTAPAY",
  "breedingRequestId": "breeding-request-id",
  "description": "Breeding service fee"
}
```

#### Get Payments
```http
GET {{baseUrl}}/api/payments
Authorization: Bearer {{accessToken}}
```

#### Update Payment
```http
PUT {{baseUrl}}/api/payments/{{paymentId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "status": "CONFIRMED",
  "transactionId": "txn_123456789"
}
```

---

### 💬 Messages

#### Send Message
```http
POST {{baseUrl}}/api/messages
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "receiverId": "receiver-user-id",
  "breedingRequestId": "breeding-request-id",
  "content": "Hi! I'm interested in your pet.",
  "messageType": "TEXT"
}
```

#### Get Conversations
```http
GET {{baseUrl}}/api/messages/conversations
Authorization: Bearer {{accessToken}}
```

#### Get Conversation Messages
```http
GET {{baseUrl}}/api/messages/conversations/{{conversationId}}
Authorization: Bearer {{accessToken}}
```

#### Mark Message as Read
```http
PUT {{baseUrl}}/api/messages/{{messageId}}/read
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "isRead": true
}
```

---

### 👨‍💼 Admin Endpoints

#### Get Statistics
```http
GET {{baseUrl}}/api/admin/stats
Authorization: Bearer {{adminAccessToken}}
```

#### Get All Users
```http
GET {{baseUrl}}/api/admin/users?page=1&limit=20&role=USER
Authorization: Bearer {{adminAccessToken}}
```

#### Update User Status
```http
PUT {{baseUrl}}/api/admin/users/{{userId}}/status
Authorization: Bearer {{adminAccessToken}}
Content-Type: application/json

{
  "isActive": false,
  "role": "ADMIN"
}
```

#### Get All Pets
```http
GET {{baseUrl}}/api/admin/pets?page=1&limit=20&status=AVAILABLE
Authorization: Bearer {{adminAccessToken}}
```

#### Approve Pet
```http
POST {{baseUrl}}/api/admin/pets/{{petId}}/approve
Authorization: Bearer {{adminAccessToken}}
```

#### Reject Pet
```http
POST {{baseUrl}}/api/admin/pets/{{petId}}/reject
Authorization: Bearer {{adminAccessToken}}
Content-Type: application/json

{
  "reason": "Incomplete documentation"
}
```

---

## 📋 Environment Variables

Create a `postman_environment.json` file:

```json
{
  "name": "Pet Breeding Backend",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000",
      "enabled": true
    },
    {
      "key": "accessToken",
      "value": "your-access-token-here",
      "enabled": true
    },
    {
      "key": "adminAccessToken",
      "value": "your-admin-access-token-here",
      "enabled": true
    },
    {
      "key": "petId",
      "value": "your-pet-id-here",
      "enabled": true
    },
    {
      "key": "requestId",
      "value": "your-request-id-here",
      "enabled": true
    },
    {
      "key": "paymentId",
      "value": "your-payment-id-here",
      "enabled": true
    },
    {
      "key": "messageId",
      "value": "your-message-id-here",
      "enabled": true
    },
    {
      "key": "userId",
      "value": "your-user-id-here",
      "enabled": true
    },
    {
      "key": "conversationId",
      "value": "your-conversation-id-here",
      "enabled": true
    },
    {
      "key": "receiverId",
      "value": "your-receiver-id-here",
      "enabled": true
    },
    {
      "key": "targetUserId",
      "value": "your-target-user-id-here",
      "enabled": true
    },
    {
      "key": "targetPetId",
      value": "your-target-pet-id-here",
      "enabled": true
    },
    {
      "key": "initiatorPetId",
      value": "your-initiator-pet-id-here",
      "enabled": true
    }
  ]
}
```

## 🧪 Testing Workflow

### 1. **Authentication Flow**
1. Register a new user
2. Login to get access token
3. Use token for authenticated requests
4. Refresh token when needed
5. Logout when done

### 2. **Pet Management Flow**
1. Create a pet profile
2. Upload pet photos
3. Update pet information
4. View pet details
5. Delete pet if needed

### 3. **Breeding Workflow**
1. Create breeding request
2. Wait for acceptance
3. Monitor request status
4. Handle acceptance/rejection
5. View match results

### 4. **Payment Flow**
1. Create payment for breeding request
2. Upload payment proof
3. Wait for admin confirmation
4. Monitor payment status
5. Handle confirmation/rejection

### 5. **Messaging Flow**
1. Send messages to other users
2. View conversations
3. Mark messages as read
4. Manage communication

### 6. **Admin Workflow**
1. View platform statistics
2. Manage users and pets
3. Approve/reject listings
4. Monitor platform activity

## 📝 Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "errors": ["Validation error details"]
}
```

## 🔒 Authentication Headers

For protected endpoints, include:
```
Authorization: Bearer {{accessToken}}
```

## 📊 Pagination

For list endpoints, use:
```
?page=1&limit=20
```

Response includes pagination:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

## 🎯 Tips for Testing

1. **Start with authentication** - Register and login first
2. **Use real data** - Test with realistic pet information
3. **Test all flows** - Complete breeding workflow
4. **Check error handling** - Test invalid inputs
5. **Verify permissions** - Test role-based access
6. **Monitor logs** - Check server logs for debugging

---

**🎉 This collection covers all major API endpoints for comprehensive testing!**
