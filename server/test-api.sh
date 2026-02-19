#!/bin/bash
# API Testing Script
# Tests authentication endpoints

BASE_URL="http://localhost:5000/api"

echo "🧪 Testing PetMat Authentication API"
echo "======================================="

# Test 1: Register
echo -e "\n1️⃣  Testing Registration..."
curl -X POST ${BASE_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "breeder@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Breeder",
    "phone": "+1234567890"
  }' \
  -w "\nStatus: %{http_code}\n"

# Test 2: Login (after database is seeded)
echo -e "\n2️⃣  Testing Login..."
curl -X POST ${BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "breeder@example.com",
    "password": "SecurePass123!"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -c cookies.txt

# Test 3: Get user profile (protected route)
echo -e "\n3️⃣  Testing Protected Route (Get Profile)..."
curl -X GET ${BASE_URL}/auth/me \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -w "\nStatus: %{http_code}\n"

# Test 4: Create Pet (requires auth)
echo -e "\n4️⃣  Testing Create Pet..."
curl -X POST ${BASE_URL}/pets \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Bella",
    "breed": "Golden Retriever",
    "species": "Dog",
    "gender": "FEMALE",
    "age": 24,
    "weight": 32.5,
    "color": "Golden",
    "isVaccinated": true,
    "isNeutered": false,
    "breedingStatus": "AVAILABLE"
  }' \
  -w "\nStatus: %{http_code}\n"

# Test 5: Get all pets
echo -e "\n5️⃣  Testing Get All Pets..."
curl -X GET ${BASE_URL}/pets \
  -b cookies.txt \
  -w "\nStatus: %{http_code}\n"

# Test 6: Refresh token
echo -e "\n6️⃣  Testing Token Refresh..."
curl -X POST ${BASE_URL}/auth/refresh \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -w "\nStatus: %{http_code}\n"

# Test 7: Logout
echo -e "\n7️⃣  Testing Logout..."
curl -X POST ${BASE_URL}/auth/logout \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -w "\nStatus: %{http_code}\n"

echo -e "\n\n✅ API Testing Complete!"
echo "📝 Note: Make sure server is running on port 5000"
echo "📊 Check server logs for detailed information"

# Cleanup
rm -f cookies.txt
