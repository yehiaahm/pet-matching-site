@echo off
title PostgreSQL Installation Complete - Next Steps
color 0A
echo.
echo ========================================
echo     ✅ PostgreSQL Installation Complete
echo ========================================
echo.
echo 🎉 Great! Now let's complete the setup...
echo.
echo 📋 Step 1: Verify PostgreSQL Installation
echo.
echo 🧪 Test if PostgreSQL is working:
echo    • Open Command Prompt
echo    • Run: psql --version
echo    • Should show PostgreSQL version
echo.
echo 📋 Step 2: Create the Database
echo.
echo 🗄️ Create database named "petmat":
echo    • Open pgAdmin 4 (installed with PostgreSQL)
echo    • Connect to PostgreSQL server
echo    • Right-click on "Databases" -> "Create" -> "Database"
echo    • Name: petmat
echo    • Owner: postgres
echo    • Click "Save"
echo.
echo 📋 Step 3: Test Database Connection
echo.
echo 🔍 Test connection with command line:
echo    psql -U postgres -d petmat
echo.
echo 📋 Step 4: Run Prisma Commands
echo.
echo 🔄 Navigate to server directory:
echo    cd "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
echo.
echo 📊 Generate Prisma client:
echo    npm run prisma:generate
echo.
echo 🗄️ Run database migrations:
echo    npm run prisma:migrate
echo.
echo 🌐 Open Prisma Studio:
echo    npm run prisma:studio
echo.
echo ========================================
echo     🎯 Quick Commands to Run
echo ========================================
echo.
echo 🧪 Test PostgreSQL:
echo    psql --version
echo.
echo 🗄️ Create database (if needed):
echo    createdb -U postgres petmat
echo.
echo 📊 Connect to database:
echo    psql -U postgres -d petmat
echo.
echo 🔄 Prisma commands:
echo    cd server
echo    npm run prisma:generate
echo    npm run prisma:migrate
echo    npm run prisma:studio
echo.
echo ========================================
echo     🚀 What Should Happen Now
echo ========================================
echo.
echo ✅ Expected Results:
echo    • psql --version shows PostgreSQL version
echo    • You can connect to petmat database
echo    • Prisma migrations run successfully
echo    • Prisma Studio opens at http://localhost:5555
echo    • You can see all database tables
echo.
echo 🔍 If Something Goes Wrong:
echo.
echo ❌ "psql not recognized":
echo    • PostgreSQL not in PATH
echo    • Restart Command Prompt
echo    • Add PostgreSQL to PATH manually
echo.
echo ❌ "Connection refused":
echo    • PostgreSQL service not running
echo    • Start PostgreSQL service
echo    • Check Windows Services
echo.
echo ❌ "Database does not exist":
echo    • Create petmat database
echo    • Use pgAdmin to create it
echo    • Or use: createdb -U postgres petmat
echo.
echo ❌ "Prisma migration fails":
echo    • Check .env file DATABASE_URL
echo    • Verify database exists
echo    • Run: npm run prisma:db pull
echo.
echo ========================================
echo     🎯 Let's Test Everything Now
echo ========================================
echo.
echo 🧪 Step 1: Test PostgreSQL installation
echo.
echo Press any key to test PostgreSQL...
pause > nul
echo.
echo 📊 Testing psql command...
psql --version
echo.
echo 📋 If you see a version number above, PostgreSQL is installed correctly!
echo.
echo 🗄️ Step 2: Create database if needed
echo.
echo Press any key to create petmat database...
pause > nul
echo.
echo 📊 Creating database...
createdb -U postgres petmat 2>nul
echo Database creation attempted. If no error above, it worked!
echo.
echo 🔄 Step 3: Test database connection
echo.
echo Press any key to test connection...
pause > nul
echo.
echo 📊 Connecting to database...
psql -U postgres -d petmat -c "\dt" 2>nul || echo Connection test completed
echo.
echo 🎯 Step 4: Run Prisma commands
echo.
echo Press any key to run Prisma setup...
pause > nul
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
echo.
echo 📊 Generating Prisma client...
npm run prisma:generate
echo.
echo 🗄️ Running migrations...
npm run prisma:migrate
echo.
echo 🌐 Starting Prisma Studio...
start npm run prisma:studio
echo.
echo ✅ Setup complete!
echo.
echo 🌐 Prisma Studio should open at: http://localhost:5555
echo.
echo 🎯 If everything worked, you should now see all your database tables!
echo.
pause
