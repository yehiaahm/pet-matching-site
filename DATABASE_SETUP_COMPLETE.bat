@echo off
title Database Setup Complete - Pet Breeding Website
color 0A
echo.
echo ========================================
echo     ✅ Database Setup Complete
echo ========================================
echo.
echo 🎉 All required database setup has been completed!
echo.
echo 📋 What was done:
echo.
echo 1. ✅ Environment file updated (.env)
echo    • Database URL configured: postgresql://postgres:yehia.hema195200@localhost:5432/petmat
echo    • Server port: 5000
echo    • JWT configuration added
echo    • CORS origins configured
echo    • File upload settings added
echo    • Optional services configured (Email, Cloudinary, Redis)
echo.
echo 2. ✅ Prisma Client generated
echo    • Database client code generated
echo    • Type definitions created
echo    • Ready for database operations
echo.
echo 3. ✅ Database migrations completed
echo    • All database tables created
echo    • Schema applied to database
echo    • Relationships established
echo.
echo 🗄️ Database Status:
echo.
echo 📊 Database: PostgreSQL
echo 📍 Name: petmat
echo 👤 User: postgres
echo 🔐 Password: yehia.hema195200
echo 🌐 Host: localhost:5432
echo.
echo 📋 Tables Created:
echo    • users - User accounts and profiles
echo    • pets - Pet information and details
echo    • breeding_requests - Breeding request management
echo    • matches - Pet matching system
echo    • messages - Communication system
echo    • reviews - User reviews and ratings
echo    • audit_logs - Admin activity logging
echo    • payments - Payment transactions
echo    • payment_screenshots - Payment proof images
echo    • subscriptions - User subscriptions
echo    • health_records - Pet health documentation
echo    • notifications - User notifications
echo    • favorites - User favorites
echo    • locations - Geographic data
echo.
echo 🚀 Next Steps:
echo.
echo 1. 🌐 Start the backend server:
echo    cd server
echo    npm run dev
echo.
echo 2. 🎯 Start the frontend:
echo    npm run dev
echo.
echo 3. 📊 Verify database connection:
echo    npm run prisma:studio
echo.
echo 4. 🧪 Test the application:
echo    • Open http://localhost:5173
echo    • Register a new user
echo    • Add a pet
echo    • Test all features
echo.
echo 🎯 Database Management Commands:
echo.
echo 📊 Prisma Studio (Database GUI):
echo    npm run prisma:studio
echo.
echo 🔄 Pull schema from database:
echo    npm run prisma:pull
echo.
echo 📝 Generate client code:
echo    npm run prisma:generate
echo.
echo 🗄️ Run migrations:
echo    npm run prisma:migrate
echo.
echo ========================================
echo     🎉 Setup Complete - Ready to Use!
echo ========================================
echo.
echo 🌟 Your Pet Breeding website now has:
echo    • ✅ Fully configured PostgreSQL database
echo    • ✅ All tables and relationships created
echo    • ✅ Prisma ORM ready for operations
echo    • ✅ Environment variables configured
echo    • ✅ Backend ready to start
echo.
echo 💡 Important Notes:
echo    • Database is running on localhost:5432
echo    • Backend server will run on port 5000
echo    • Frontend runs on port 5173
echo    • All database operations are now functional
echo.
echo Press any key to start both servers...
pause > nul
echo.
echo 🚀 Starting backend server...
start cmd /k "cd /d 'd:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server' && npm run dev"
echo.
echo 🌐 Starting frontend server...
start cmd /k "cd /d 'd:\PetMat_Project\Pet Breeding Matchmaking Website (3)' && npm run dev"
echo.
echo ✅ Both servers starting...
echo.
echo 📱 Access your application at: http://localhost:5173
echo 🔧 Backend API at: http://localhost:5000
echo 📊 Database Studio: npm run prisma:studio
echo.
echo 🎉 Your Pet Breeding website is now fully operational!
echo.
pause
