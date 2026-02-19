#!/usr/bin/env bash
# Test Post-Registration Flow
# Run this after starting both backend and frontend

echo "🧪 Testing Post-Registration Flow"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "🔍 Checking Backend..."
if curl -s http://localhost:5000/api/v1 > /dev/null; then
  echo -e "${GREEN}✅ Backend is running on http://localhost:5000${NC}"
else
  echo -e "${RED}❌ Backend is NOT running on http://localhost:5000${NC}"
  echo "   Fix: cd server && npm run dev"
  exit 1
fi

echo ""

# Check if frontend is running
echo "🔍 Checking Frontend..."
if curl -s http://localhost:5173 > /dev/null; then
  echo -e "${GREEN}✅ Frontend is running on http://localhost:5173${NC}"
else
  echo -e "${RED}❌ Frontend is NOT running on http://localhost:5173${NC}"
  echo "   Fix: npm run dev"
  exit 1
fi

echo ""
echo -e "${YELLOW}📋 Manual Testing Checklist:${NC}"
echo ""
echo "1. Open http://localhost:5173 in browser"
echo "2. Switch to 'Register' tab"
echo "3. Fill in form:"
echo "   - Email: testuser@example.com"
echo "   - Password: Test@1234 (uppercase, lowercase, number, special char)"
echo "   - First Name: Test"
echo "   - Last Name: User"
echo "   - Phone: (optional)"
echo ""
echo "4. Press F12 to open DevTools → Console"
echo "5. Click 'Register'"
echo ""
echo "✅ EXPECTED RESULTS:"
echo "   a) Console should show logs:"
echo "      - '📝 Attempting register to: http://localhost:5000/api/auth/register'"
echo "      - '✅ Register response received: 201'"
echo "      - '📦 Full response: { success: true, data: { ... } }'"
echo "      - '🔐 Calling login() with: { email: ..., role: ... }'"
echo "      - '✅ User authenticated in context'"
echo ""
echo "   b) Page should redirect to main app (not stay on /register)"
echo ""
echo "   c) Check localStorage:"
echo "      - DevTools → Application → localStorage"
echo "      - Should see 'accessToken' key"
echo "      - Should see 'user' key with user data"
echo ""
echo "   d) User should be logged in:"
echo "      - See user's name in header"
echo "      - See 'Logout' button"
echo "      - See pet browsing interface"
echo ""
echo "❌ IF IT DOESN'T WORK:"
echo ""
echo "   Check these logs in Console:"
echo "   - Search for '🔐 Calling login()' - if not found, login() not called"
echo "   - Search for '❌ Invalid response' - if found, API response format wrong"
echo "   - Search for 'Network connection failed' - if found, backend not running"
echo ""
echo "   Verify Backend Response:"
echo "   - DevTools → Network tab → find 'register' request"
echo "   - Click it → Response tab"
echo "   - Should see: { status: 'success', data: { user: {...}, accessToken: '...' } }"
echo ""
echo "   Check Files:"
echo "   - server/controllers/authController.js - register function fixed?"
echo "   - src/app/components/AuthPage.tsx - has useNavigate and navigate('/') ?"
echo "   - src/main.tsx - has BrowserRouter wrapper?"
echo ""
echo -e "${GREEN}All ready! Test the registration flow now.${NC}"
