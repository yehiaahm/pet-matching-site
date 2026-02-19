#!/bin/bash

# ============================================================================
# DATABASE v2.0 - Quick Verification Script
# ============================================================================

echo "🔍 Database v2.0 Verification Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

# Function to check file existence
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅ $2${NC}"
    ((passed++))
  else
    echo -e "${RED}❌ $2 (Missing: $1)${NC}"
    ((failed++))
  fi
}

# Function to check keyword in file
check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✅ $3${NC}"
    ((passed++))
  else
    echo -e "${RED}❌ $3 (Not found in: $1)${NC}"
    ((failed++))
  fi
}

echo "📋 Checking Files..."
echo "-------------------"

# Check main files
check_file "server/prisma/schema-enhanced.prisma" "Prisma Schema Enhanced"
check_file "server/prisma/migrations/001_enhance_database_schema.sql" "SQL Migration"
check_file "server/src/services/enhanced-services.example.ts" "Enhanced Services"
check_file "DATABASE_ENHANCEMENT_V2.md" "Enhancement Documentation"
check_file "DATABASE_IMPLEMENTATION_GUIDE.md" "Implementation Guide"
check_file "DATABASE_COMPLETION_REPORT.md" "Completion Report"
check_file "DATABASE_QUICK_REFERENCE.md" "Quick Reference"
check_file "DATABASE_V2_FINAL_SUMMARY.md" "Final Summary"
check_file "DATABASE_INDEX_NAVIGATION.md" "Index Navigation"
check_file "START_HERE_DATABASE_V2.md" "Start Here"
check_file "README_DATABASE_V2.md" "README"
check_file "DATABASE_V2_60_SECOND.md" "60 Second Summary"

echo ""
echo "🔍 Checking Schema Content..."
echo "-----------------------------"

# Check schema content
check_content "server/prisma/schema-enhanced.prisma" "blocked_users" "blocked_users table"
check_content "server/prisma/schema-enhanced.prisma" "activity_logs" "activity_logs table"
check_content "server/prisma/schema-enhanced.prisma" "favorite_pets" "favorite_pets table"
check_content "server/prisma/schema-enhanced.prisma" "lastActivityDate" "lastActivityDate field"
check_content "server/prisma/schema-enhanced.prisma" "healthScore" "healthScore field"
check_content "server/prisma/schema-enhanced.prisma" "rejectionReason" "rejectionReason field"

echo ""
echo "🔍 Checking Migration Content..."
echo "--------------------------------"

# Check migration content
check_content "server/prisma/migrations/001_enhance_database_schema.sql" "blocked_users" "blocked_users creation"
check_content "server/prisma/migrations/001_enhance_database_schema.sql" "activity_logs" "activity_logs creation"
check_content "server/prisma/migrations/001_enhance_database_schema.sql" "idx_pets_breeding_available" "Breeding index"
check_content "server/prisma/migrations/001_enhance_database_schema.sql" "idx_messages_unread" "Messages index"
check_content "server/prisma/migrations/001_enhance_database_schema.sql" "trg_update_user_rating" "Rating trigger"
check_content "server/prisma/migrations/001_enhance_database_schema.sql" "v_user_statistics" "User statistics view"

echo ""
echo "🔍 Checking Services Examples..."
echo "--------------------------------"

# Check services
check_content "server/src/services/enhanced-services.example.ts" "blockUser" "Block user method"
check_content "server/src/services/enhanced-services.example.ts" "logActivity" "Log activity method"
check_content "server/src/services/enhanced-services.example.ts" "addToFavorites" "Favorites method"
check_content "server/src/services/enhanced-services.example.ts" "getUnreadMessages" "Unread messages method"

echo ""
echo "📊 Summary"
echo "=========="
echo -e "${GREEN}Passed: $passed${NC}"
echo -e "${RED}Failed: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Database v2.0 is ready.${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️ Some files are missing. Please review.${NC}"
  exit 1
fi
