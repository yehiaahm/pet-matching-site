@echo off
title Prisma Studio - Database Management
color 0B
echo.
echo ========================================
echo     🗄️ Prisma Studio - Database Management
echo ========================================
echo.
echo 🎯 Starting Prisma Studio...
echo.
echo 🌐 Prisma Studio will open in your default browser
echo 📊 You can view and manage your database visually
echo.
echo 🔗 Expected URL: http://localhost:5555
echo.
echo ========================================
echo     📋 What You Can Do in Prisma Studio
echo ========================================
echo.
echo 👥 Users Management:
echo    • View all users
echo    • Edit user profiles
echo    • Change user roles
echo    • Reset passwords
echo.
echo 🐾 Pet Management:
echo    • View all pets
echo    • Edit pet information
echo    • Add new pets
echo    • Delete pets
echo.
echo 💕 Breeding Requests:
echo    • View breeding requests
echo    • Update request status
echo    • Approve/reject requests
echo.
echo 💳 Payment Management:
echo    • View all payments
echo    • Update payment status
echo    • Add payment records
echo.
echo 💬 Messages:
echo    • View conversations
echo    • Read messages
echo    • Manage communications
echo.
echo ⭐ Reviews:
echo    • View user reviews
echo    • Manage ratings
echo    • Moderate content
echo.
echo ========================================
echo     🔑 Database Connection Details
echo ========================================
echo.
echo 🗄️ Database: PostgreSQL
echo 🏠 Host: localhost
echo 🔌 Port: 5432
echo 📊 Database: pet_breeding_db
echo 👤 User: postgres
echo 🔑 Password: yehia.hema195200
echo.
echo 🔗 Connection String:
echo postgresql://postgres:yehia.hema195200@localhost:5432/pet_breeding_db
echo.
echo ========================================
echo     🚀 Starting Prisma Studio
echo ========================================
echo.
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\pet-breeding-backend"
echo 🔄 Launching Prisma Studio...
npx prisma studio
echo.
echo ✅ Prisma Studio should be opening in your browser...
echo.
echo 🌐 If not opening automatically, visit: http://localhost:5555
echo.
echo ========================================
echo     🎯 Quick Access Links
echo ========================================
echo.
echo 🌐 Prisma Studio:
echo    http://localhost:5555
echo.
echo 🌐 Frontend Application:
echo    http://localhost:5173
echo.
echo 🔗 Backend API:
echo    http://localhost:5000
echo.
echo 🏥 API Health Check:
echo    http://localhost:5000/api/health
echo.
echo ========================================
echo     📱 Mobile Access
echo ========================================
echo.
echo 📱 On mobile device, use your local IP:
echo    http://[YOUR-LOCAL-IP]:5555
echo.
echo 🔍 Find your IP:
echo    • Windows: ipconfig
echo    • Look for "IPv4 Address" under your network adapter
echo.
echo ========================================
echo     🛠️ Prisma Commands Reference
echo ========================================
echo.
echo 🔄 Generate Prisma Client:
echo    npx prisma generate
echo.
echo 🗄️ Run Migrations:
echo    npx prisma migrate dev
echo.
echo 🌱 Seed Database:
echo    npx prisma db seed
echo.
echo 📊 Open Studio:
echo    npx prisma studio
echo.
echo 🗑️ Reset Database:
echo    npx prisma migrate reset
echo.
echo 📋 View Schema:
echo    npx prisma db pull
echo.
echo ========================================
echo     🔍 Troubleshooting
echo ========================================
echo.
echo If Prisma Studio doesn't open:
echo.
echo 1️⃣ Check if port 5555 is available:
echo    netstat -an | findstr 5555
echo.
echo 2️⃣ Try different port:
echo    npx prisma studio --port 3000
echo.
echo 3️⃣ Check database connection:
echo    npx prisma db pull
echo.
echo 4️⃣ Verify .env configuration:
echo    • DATABASE_URL should be correct
echo    • Database should be accessible
echo.
echo 5️⃣ Check PostgreSQL service:
echo    • PostgreSQL should be running
echo    • Port 5432 should be available
echo.
echo ========================================
echo     🎉 Database Management Ready
echo ========================================
echo.
echo 🗄️ Prisma Studio gives you full control over your database!
echo.
echo 🎯 You can:
echo    • View all data in beautiful tables
echo    • Edit records with a simple interface
echo    • Add new data easily
echo    • Filter and search records
echo    • View relationships between tables
echo    • Export data
echo.
echo 🌟 Perfect for managing your Pet Breeding platform! 🐾💕
echo.
echo 🎯 Studio URL: http://localhost:5555
echo.
pause
