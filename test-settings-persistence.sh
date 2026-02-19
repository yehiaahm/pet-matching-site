#!/bin/bash

# Test System Settings Persistence
# This script tests if system settings are being saved and retrieved correctly

echo "=========================================="
echo "🧪 Testing System Settings Persistence"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/v1"
TOKEN="${1:-}"

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Error: Admin token required${NC}"
  echo "Usage: ./test-settings-persistence.sh <admin_token>"
  echo ""
  echo "To get token, login as admin and check localStorage.token"
  exit 1
fi

echo -e "${BLUE}📋 Step 1: Get current settings${NC}"
echo ""
curl -s -X GET "$API_URL/admin/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
echo ""

echo -e "${BLUE}📝 Step 2: Update settings${NC}"
echo ""
RESPONSE=$(curl -s -X PUT "$API_URL/admin/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maintenanceMode": true,
    "maintenanceMessage": "تحت الصيانة الآن - الموقع سيعود قريباً",
    "enableUserRegistration": true,
    "enableBreedingRequests": false,
    "enableMessaging": true,
    "maxWarningsBeforeBan": 5
  }')

echo "$RESPONSE" | jq .
echo ""

# Check if save was successful
if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
  echo -e "${GREEN}✅ Settings saved successfully${NC}"
else
  echo -e "${RED}❌ Failed to save settings${NC}"
  echo "$RESPONSE" | jq .
  exit 1
fi

echo ""
echo -e "${BLUE}🔄 Step 3: Verify settings were saved (reload)${NC}"
echo ""
sleep 1
curl -s -X GET "$API_URL/admin/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo ""
echo -e "${BLUE}⏱️  Step 4: Wait 3 seconds and verify again (simulate page reload)${NC}"
echo ""
sleep 3
curl -s -X GET "$API_URL/admin/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.settings | {maintenanceMode, maintenanceMessage, enableBreedingRequests, maxWarningsBeforeBan}'

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Test complete!${NC}"
echo "=========================================="
