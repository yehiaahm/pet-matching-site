# Community Support - Quick Troubleshooting

## Problem: Search Returns No Users

### ✅ Solution Checklist:

1. **Verify Database is Seeded**
   ```bash
   # From server directory
   npm run seed
   ```

2. **Check Users Exist in Database**
   ```bash
   # Using Prisma Studio
   npx prisma studio
   ```
   - Navigate to User table
   - Verify at least 3 users exist
   - Check firstName, lastName, email are populated
   - Check isVerified status

3. **Verify Token/Authentication**
   - Open browser DevTools (F12)
   - Go to Application → Local Storage
   - Check `accessToken` or `token` exists
   - Value should be a long JWT string
   - If missing, login again

4. **Check Backend is Running**
   - Terminal should show: "Server running on port 3001"
   - No error messages in console
   - Try accessing http://localhost:3001/health (if endpoint exists)

5. **Try Search with Empty Query**
   - Leave search box blank
   - Should show all users (fallback search)
   - If this works, search filtering might need adjustment

6. **Check Browser Console**
   - F12 → Console tab
   - Look for error messages
   - Check network requests in Network tab
   - Verify `/api/v1/messages/users/search` returns data

---

## Problem: Users Show But Missing Names

### ✅ Solution Checklist:

1. **Check API Response Format**
   - Browser DevTools → Network tab
   - Click `/api/v1/messages/users/search` request
   - Look at Response tab
   - Verify response includes: `firstName`, `lastName`, `email`
   - If missing, database might not have this data

2. **Verify Demo Users Were Seeded**
   ```bash
   npx prisma studio
   ```
   - Open User table
   - Look for these users:
     - "John" "Smith" 
     - "Sarah" "Johnson"
     - "Mike" "Davis"
   - If missing, run seed again

3. **Check Component Displays Fields Correctly**
   - File: [src/app/components/CommunitySupport.tsx](src/app/components/CommunitySupport.tsx)
   - Line ~125: `{user.firstName} {user.lastName}` should display name
   - Line ~127: `{user.email}` should display email
   - If not showing, check browser console for JS errors

---

## Problem: Can't Click Contact Button

### ✅ Solution Checklist:

1. **Verify Button is Visible**
   - Search should return at least one user
   - Each user card should show "تواصل" (Contact) button
   - Button should be blue and clickable

2. **Check for Console Errors**
   - F12 → Console tab
   - Click Contact button
   - Look for any error messages
   - Check for network errors

3. **Verify User Selection Handler**
   - File: [src/app/components/MessagesDialog.tsx](src/app/components/MessagesDialog.tsx)
   - Check `handleSelectUserFromCommunity` function exists
   - Verify `onSelectUser={handleSelectUserFromCommunity}` prop is passed

4. **Check Token is Valid**
   - Logout and login again
   - Refresh the page
   - Try clicking Contact button again

---

## Problem: Message Won't Send

### ✅ Solution Checklist:

1. **Check Message Has Content**
   - Message input should not be empty
   - Text should have actual content (not just spaces)
   - Example: "Hello!"

2. **Verify Recipient Selected**
   - Selected conversation should show user's name at top
   - Conversation ID should be visible in browser console (for debugging)

3. **Check API Response**
   - F12 → Network tab
   - Look for POST request to `/api/v1/messages`
   - Status should be 200 or 201 (success)
   - If error, check response body for error details

4. **Common Error Codes**
   - **400 Bad Request**: recipientId or content missing
   - **401 Unauthorized**: Invalid or missing token
   - **404 Not Found**: Recipient user doesn't exist
   - **500 Server Error**: Check backend console for error details

5. **Verify Backend Received Request**
   - Terminal showing backend should have logs
   - Look for: `POST /api/v1/messages`
   - If not showing, frontend request might not be sending

---

## Problem: Message Sent But Doesn't Appear

### ✅ Solution Checklist:

1. **Refresh the Page**
   - Press F5 to refresh
   - Messages dialog should reload
   - Your sent message should appear

2. **Check Message in Database**
   ```bash
   npx prisma studio
   ```
   - Go to Message table
   - Verify message row exists
   - Check senderId, recipientId, content are correct
   - Check status is "SENT"

3. **Verify Recipient User Exists**
   - Message recipientId should match an actual user ID
   - User ID format: typically starts with "clx" or similar UUID

4. **Check Frontend State**
   - F12 → Console tab
   - Type: `localStorage.getItem('token')` or `localStorage.getItem('accessToken')`
   - Should return a long JWT string
   - If missing, login again

---

## Problem: Verification Badge Not Showing

### ✅ Solution Checklist:

1. **Check User's Verification Status**
   ```bash
   npx prisma studio
   ```
   - Open User table
   - Find the user in search results
   - Check if `isVerified` field = true
   - If false, mark as verified

2. **Verify API Returns Correct Field**
   - F12 → Network tab
   - Click search request
   - Response should include: `"isVerified": true`
   - If showing `"verified"` instead, backend needs fix

3. **Refresh Frontend Cache**
   - Press Ctrl+Shift+R (hard refresh) in browser
   - Close and reopen Messages dialog
   - Try search again

4. **Check Component Logic**
   - File: [src/app/components/CommunitySupport.tsx](src/app/components/CommunitySupport.tsx)
   - Line ~130: `{user.isVerified && (...)}`
   - This displays the green badge
   - Verify `isVerified` is being passed correctly

---

## Problem: Can't See Other User's Messages

### ✅ Solution Checklist:

1. **Verify Message Was Sent Correctly**
   - Check database if message exists
   - Verify recipientId matches the other user's ID
   - Check message status is "SENT"

2. **Check Other User Logged In**
   - They need to login to their account
   - Their account ID should match message recipientId

3. **Other User Opens Messages Dialog**
   - Click envelope icon (Messages)
   - Should see conversation in list
   - Click conversation to view messages

4. **Refresh Conversation List**
   - F12 → Console: `location.reload()`
   - Or close and reopen Messages dialog
   - Conversation should refresh

---

## Problem: Backend Returns Error

### ✅ Check Error Logs:

1. **Server Terminal Output**
   ```
   Error: Cannot read property 'id' of undefined
   ```
   - User might not be authenticated
   - Check token is valid

2. **Database Error**
   ```
   Error: Invalid Prisma query
   ```
   - Check field names are correct
   - Verify table/model names match schema

3. **Network Error**
   ```
   Failed to fetch
   ```
   - Backend might be down
   - Check `npm run dev` is running
   - Verify port number is correct (default 3001)

---

## Quick Debug Checklist

- [ ] Database seeded: `npm run seed`
- [ ] Backend running: See "Server running on port 3001"
- [ ] Frontend running: See Vite server in terminal
- [ ] Logged in: Token visible in localStorage
- [ ] Can see "+ إضافة مستخدم" button
- [ ] Search returns results
- [ ] User cards display names and emails
- [ ] Can click Contact button
- [ ] Conversation opens
- [ ] Can type and send message
- [ ] Message appears in conversation
- [ ] Verification badge shows (if applicable)

---

## Still Having Issues?

1. **Check the full guide:** [COMMUNITY_SUPPORT_GUIDE.md](COMMUNITY_SUPPORT_GUIDE.md)

2. **Enable debug logging** in MessagesDialog.tsx:
   ```typescript
   console.log('Selected user:', user);
   console.log('Conversation ID:', conversationId);
   ```

3. **Check all error messages:**
   - Browser Console (F12)
   - Backend Terminal output
   - Network tab responses

4. **Verify files were modified correctly:**
   - [server/routes/messageRoutes.js](server/routes/messageRoutes.js)
   - [src/app/components/CommunitySupport.tsx](src/app/components/CommunitySupport.tsx)
   - [src/app/components/MessagesDialog.tsx](src/app/components/MessagesDialog.tsx)

5. **Reset everything:**
   - Kill backend and frontend
   - Clear browser cache (Ctrl+Shift+Delete)
   - Reseed database: `npm run seed`
   - Restart everything: `npm run dev`
