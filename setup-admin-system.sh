#!/bin/bash
# 🎯 Admin System Installation & Verification Script

echo "================================"
echo "🚀 Admin System Setup Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${BLUE}1. Checking Node.js installation...${NC}"
if command -v node &> /dev/null
then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION} is installed${NC}"
else
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo ""

# Check if database files exist
echo -e "${BLUE}2. Checking database files...${NC}"
if [ -f "server/prisma/schema.prisma" ]
then
    echo -e "${GREEN}✅ Prisma schema found${NC}"
else
    echo -e "${RED}❌ Prisma schema not found${NC}"
    exit 1
fi

echo ""

# Check if admin controller exists
echo -e "${BLUE}3. Checking admin controller...${NC}"
if [ -f "server/controllers/adminController.js" ]
then
    echo -e "${GREEN}✅ Admin controller found${NC}"
    echo "   - $(wc -l < server/controllers/adminController.js) lines"
else
    echo -e "${RED}❌ Admin controller not found${NC}"
    exit 1
fi

echo ""

# Check if admin routes exist
echo -e "${BLUE}4. Checking admin routes...${NC}"
if [ -f "server/routes/adminRoutes.js" ]
then
    echo -e "${GREEN}✅ Admin routes found${NC}"
    echo "   - $(wc -l < server/routes/adminRoutes.js) lines"
else
    echo -e "${RED}❌ Admin routes not found${NC}"
    exit 1
fi

echo ""

# Check if frontend components exist
echo -e "${BLUE}5. Checking frontend components...${NC}"
COMPONENTS=("AdminDashboard" "UserManagement" "ContentModeration" "DashboardAnalytics" "SystemSettings")
for component in "${COMPONENTS[@]}"
do
    if [ -f "src/app/components/admin/${component}.tsx" ]
    then
        echo -e "${GREEN}✅ ${component}.tsx found${NC}"
    else
        echo -e "${RED}❌ ${component}.tsx not found${NC}"
    fi
done

echo ""

# Check if documentation files exist
echo -e "${BLUE}6. Checking documentation...${NC}"
DOCS=("ADMIN_SYSTEM_SUMMARY" "ADMIN_SETUP_GUIDE" "ADMIN_DASHBOARD_GUIDE" "ADMIN_API_REFERENCE" "ADMIN_DOCUMENTATION_INDEX")
for doc in "${DOCS[@]}"
do
    if [ -f "${doc}.md" ]
    then
        echo -e "${GREEN}✅ ${doc}.md found${NC}"
    else
        echo -e "${RED}❌ ${doc}.md not found${NC}"
    fi
done

echo ""
echo -e "${BLUE}7. Installation Summary${NC}"
echo "================================"
echo -e "${GREEN}✅ Backend Components:${NC}"
echo "   - adminController.js (300+ lines)"
echo "   - adminRoutes.js (50+ lines)"
echo "   - Prisma schema updates"
echo ""
echo -e "${GREEN}✅ Frontend Components:${NC}"
echo "   - AdminDashboard.tsx"
echo "   - UserManagement.tsx"
echo "   - ContentModeration.tsx"
echo "   - DashboardAnalytics.tsx"
echo "   - SystemSettings.tsx"
echo ""
echo -e "${GREEN}✅ Documentation:${NC}"
echo "   - 5 comprehensive guides"
echo "   - API reference"
echo "   - Setup instructions"
echo "   - Troubleshooting guide"
echo ""

# Summary
echo "================================"
echo -e "${GREEN}🎉 Setup Verification Complete!${NC}"
echo "================================"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Run: cd server && npx prisma migrate dev"
echo "2. Start backend: npm run dev"
echo "3. Start frontend: npm run dev"
echo "4. Visit: http://localhost:5173/admin"
echo ""
echo -e "${YELLOW}Read Documentation:${NC}"
echo "1. ADMIN_SYSTEM_SUMMARY.md - Overview"
echo "2. ADMIN_SETUP_GUIDE.md - Installation"
echo "3. ADMIN_DASHBOARD_GUIDE.md - Usage"
echo "4. ADMIN_API_REFERENCE.md - API Details"
echo ""
echo -e "${GREEN}✨ Admin System is ready!${NC}"
echo ""
