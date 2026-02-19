# Community Support Feature - Complete Guide

## Overview
The Community Support feature allows users to search for and contact other breeders and pet owners on the platform for advice, collaboration, and communication.

## How It Works

### 1. **Accessing Community Support**
- Open the Messages dialog (envelope icon in the navbar)
- Click the "+ إضافة مستخدم" (Add User) button in the header
- This opens the Community Support search dialog

### 2. **Searching for Users**
- Type in the search box to find users by:
  - **First Name** (e.g., "John")
  - **Last Name** (e.g., "Smith")
  - **Email** (e.g., "john@example.com")
- Results are sorted by:
  - Rating (highest first)
  - Name (alphabetically)

### 3. **Viewing User Profiles**
Each user card shows:
- ✅ Avatar (initials in colored circle)
- ✅ Full Name (firstName + lastName)
- ✅ Email Address
- ✅ Rating (with star icon)
- ✅ Verification Badge (green shield icon if verified)
- ✅ Contact Button

### 4. **Starting a Conversation**
- Click the "تواصل" (Contact) button on a user's card
- This creates a new conversation with that user
- The chat window opens immediately
- You can start typing your message

### 5. **Sending Messages**
- Type your message in the input field
- Press Enter or click the Send button
- The message is sent to the recipient's account
- Messages are stored with the correct sender/recipient IDs

---

## Database Requirements

### Users Must Have:
- ✅ `id` (User ID)
- ✅ `firstName` (First name)
- ✅ `lastName` (Last name)
- ✅ `email` (Email address)
- ✅ `isVerified` (Verification status - boolean)
- ⚠️ `rating` (Optional but recommended for sorting)

### Demo Users (Pre-seeded)
The database includes demo users for testing:

1. **John Smith** (Breeder)
   - Email: `john.breeder@example.com`
   - Password: `Demo@12345`
   - Specialization: Golden Retrievers
   - Experience: 15 years

2. **Sarah Johnson** (Breeder)
   - Email: `sarah.breeder@example.com`
   - Password: `Demo@12345`
   - Specialization: Persian Cats
   - Experience: 8 years

3. **Mike Davis** (Regular User)
   - Email: `mike.user@example.com`
   - Password: `Demo@12345`

---

## Testing Steps

### Step 1: Seed Database (if needed)
```bash
# From the server directory
npm run seed
```

### Step 2: Start the Application
```bash
# From the project root
npm run dev
```

### Step 3: Login
- Use any demo user credentials
- Email: `john.breeder@example.com`
- Password: `Demo@12345`

### Step 4: Test Community Support
1. Click the Messages icon (envelope) in navbar
2. Click "+ إضافة مستخدم" (Add User)
3. Search for "Sarah" or "Mike"
4. Click "تواصل" (Contact) to select a user
5. Type a message and send it
6. Verify the message appears in the conversation

### Step 5: Verify Message Delivery (Admin Check)
```bash
# Check messages in database
sqlite3 petmat.db "SELECT * FROM Message;" 
```

Or from Node.js console:
```javascript
const messages = await prisma.message.findMany({
  include: {
    sender: { select: { firstName: true, email: true } },
    recipient: { select: { firstName: true, email: true } }
  }
});
```

---

## Technical Details

### Frontend Components

**CommunitySupport.tsx**
- Handles user search dialog
- Displays search results
- Manages user selection
- Location: `src/app/components/CommunitySupport.tsx`

**MessagesDialog.tsx**
- Main messaging interface
- Integrates with CommunitySupport
- Manages conversations
- Sends/receives messages
- Location: `src/app/components/MessagesDialog.tsx`

### Backend Endpoints

#### 1. Search Users
```
GET /api/v1/messages/users/search?query=john&limit=20
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@example.com",
      "avatar": null,
      "rating": 4.8,
      "isVerified": true
    }
  ]
}
```

#### 2. List All Users (Paginated)
```
GET /api/v1/messages/users/list?page=1&limit=20
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### 3. Send Message
```
POST /api/v1/messages
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "recipientId": "user_456",
  "content": "Hello! I'd like to discuss breeding practices."
}

Response:
{
  "success": true,
  "data": {
    "id": "msg_789",
    "senderId": "user_123",
    "recipientId": "user_456",
    "content": "Hello! I'd like to discuss breeding practices.",
    "createdAt": "2024-01-15T10:30:00Z",
    "sender": { "firstName": "John", "lastName": "Smith" },
    "recipient": { "firstName": "Sarah", "lastName": "Johnson" }
  }
}
```

#### 4. Get Conversations
```
GET /api/v1/messages/conversations
Headers: Authorization: Bearer <token>

Returns list of active conversations with last message
```

#### 5. Get Messages with Specific User
```
GET /api/v1/messages/user/user_456
Headers: Authorization: Bearer <token>

Returns all messages with that user
```

---

## Field Mapping

| Frontend | Database | Notes |
|----------|----------|-------|
| `user.id` | `User.id` | Unique user identifier |
| `user.firstName` | `User.firstName` | User's first name |
| `user.lastName` | `User.lastName` | User's last name |
| `user.email` | `User.email` | User's email address |
| `user.rating` | `User.rating` | Average user rating (0-5) |
| `user.isVerified` | `User.isVerified` | Verification status flag |
| `conversationId` | Used as ref | Format: `user_${recipientId}` |

---

## Troubleshooting

### Problem: No users showing in search
**Solutions:**
1. Ensure database has been seeded: `npm run seed`
2. Check user is logged in (token exists)
3. Verify user exists in database (check isVerified status)
4. Try searching with empty query to see all users

### Problem: Can't send message to selected user
**Solutions:**
1. Verify both users exist in database
2. Check tokens are stored correctly in localStorage
3. Ensure backend API is running
4. Check browser console for error messages

### Problem: Message doesn't appear in recipient's view
**Solutions:**
1. Verify message was created in database
2. Check message has correct recipientId
3. Refresh Messages dialog to reload conversations
4. Check message status is 'SENT'

### Problem: Verification badge not showing
**Solutions:**
1. Check user has `isVerified: true` in database
2. Restart frontend to clear cache
3. Verify API is returning `isVerified` field

---

## Features Implemented ✅

- ✅ User search by first name, last name, or email
- ✅ Display user information (name, email, rating, verification)
- ✅ Search result sorting by rating
- ✅ Fallback search when no exact matches
- ✅ Create conversations dynamically
- ✅ Send messages to selected users
- ✅ Message persistence in database
- ✅ Bilingual support (English/Arabic)
- ✅ Loading states and error handling
- ✅ Toast notifications for user actions
- ✅ Real-time message sync

---

## Future Enhancements

- 📌 Message read receipts
- 📌 Typing indicators
- 📌 User online status
- 📌 Message attachments
- 📌 Group conversations
- 📌 Message search/filtering
- 📌 Conversation blocking/muting
- 📌 Message reactions/emojis

---

## Support

For issues or questions about Community Support:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Check network tab to verify API calls are working
4. Verify database seed has been run successfully
