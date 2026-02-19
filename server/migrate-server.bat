@echo off
echo 🚀 Starting PetMate server migration...

REM Create backup directory
set BACKUP_DIR=archive\old-servers-%date:~0,4%%date:~5,2%%date:~8,2%
echo 📦 Creating backup in %BACKUP_DIR%...
mkdir %BACKUP_DIR% 2>nul

REM Backup current server files
copy server*.js %BACKUP_DIR%\ 2>nul
copy auth-server.js %BACKUP_DIR%\ 2>nul
copy location-server.js %BACKUP_DIR%\ 2>nul
copy pets-server.js %BACKUP_DIR%\ 2>nul

echo ✅ Backup created in %BACKUP_DIR%\

REM Create new directory structure
echo 📁 Creating new directory structure...
mkdir src\controllers 2>nul
mkdir src\services 2>nul
mkdir src\models 2>nul
mkdir src\middleware 2>nul
mkdir src\routes 2>nul
mkdir src\utils 2>nul
mkdir src\types 2>nul
mkdir src\config 2>nul

REM Check if unified server exists
if not exist "src\server.ts" (
    echo ❌ Unified server not found. Please create src\server.ts first.
    pause
    exit /b 1
)

echo ✅ Unified server found in src\

REM Update package.json
echo 📦 Updating package.json...
if exist "package.json" (
    copy package.json package.json.backup 2>nul
    
    REM Create new package.json with unified server scripts
    echo { > package.json.new
    echo   "name": "petmate-server", >> package.json.new
    echo   "version": "1.0.0", >> package.json.new
    echo   "description": "PetMate backend server", >> package.json.new
    echo   "main": "dist/server.js", >> package.json.new
    echo   "types": "dist/server.d.ts", >> package.json.new
    echo   "scripts": { >> package.json.new
    echo     "dev": "tsx watch src/server.ts", >> package.json.new
    echo     "build": "tsc", >> package.json.new
    echo     "start": "node dist/server.js", >> package.json.new
    echo     "test": "jest", >> package.json.new
    echo     "migrate": "npx prisma migrate dev", >> package.json.new
    echo     "generate": "npx prisma generate", >> package.json.new
    echo     "seed": "npx prisma db seed", >> package.json.new
    echo     "studio": "npx prisma studio", >> package.json.new
    echo     "clean": "rmdir /s /q dist 2>nul" >> package.json.new
    echo   }, >> package.json.new
    echo   "dependencies": { >> package.json.new
    echo     "express": "^4.18.2", >> package.json.new
    echo     "cors": "^2.8.5", >> package.json.new
    echo     "helmet": "^6.0.1", >> package.json.new
    echo     "compression": "^1.7.4", >> package.json.new
    echo     "morgan": "^1.10.0", >> package.json.new
    echo     "socket.io": "^4.6.1", >> package.json.new
    echo     "jsonwebtoken": "^9.0.0", >> package.json.new
    echo     "express-rate-limit": "^6.7.0", >> package.json.new
    echo     "uuid": "^9.0.0", >> package.json.new
    echo     "@prisma/client": "^4.15.0", >> package.json.new
    echo     "joi": "^17.9.2", >> package.json.new
    echo     "bcryptjs": "^2.4.3", >> package.json.new
    echo     "nodemailer": "^6.9.1", >> package.json.new
    echo     "multer": "^1.4.5-lts.1" >> package.json.new
    echo     "stripe": "^11.1.0" >> package.json.new
    echo   }, >> package.json.new
    echo   "devDependencies": { >> package.json.new
    echo     "@types/node": "^18.16.3", >> package.json.new
    echo     "@types/express": "^4.17.17", >> package.json.new
    echo     "@types/cors": "^2.8.13", >> package.json.new
    echo     "@types/compression": "^1.7.2", >> package.json.new
    echo     "@types/morgan": "^1.9.4", >> package.json.new
    echo     "@types/jsonwebtoken": "^9.0.2", >> package.json.new
    echo     "@types/uuid": "^9.0.2", >> package.json.new
    echo     "@types/bcryptjs": "^2.4.2", >> package.json.new
    echo     "@types/nodemailer": "^6.4.7", >> package.json.new
    echo     "@types/multer": "^1.4.7", >> package.json.new
    echo     "typescript": "^5.0.4", >> package.json.new
    echo     "tsx": "^3.12.7", >> package.json.new
    echo     "jest": "^29.5.0", >> package.json.new
    echo     "@types/jest": "^29.5.1", >> package.json.new
    echo     "ts-jest": "^29.1.0", >> package.json.new
    echo     "prisma": "^4.15.0" >> package.json.new
    echo   } >> package.json.new
    echo } >> package.json.new
    
    move package.json.new package.json
    echo ✅ Package.json updated
) else (
    echo ❌ package.json not found
)

REM Create TypeScript configuration
echo 📝 Creating TypeScript configuration...
if not exist "tsconfig.json" (
    echo { > tsconfig.json
    echo   "compilerOptions": { >> tsconfig.json
    echo     "target": "ES2020", >> tsconfig.json
    echo     "module": "commonjs", >> tsconfig.json
    echo     "lib": ["ES2020"], >> tsconfig.json
    echo     "outDir": "./dist", >> tsconfig.json
    echo     "rootDir": "./src", >> tsconfig.json
    echo     "strict": true, >> tsconfig.json
    echo     "esModuleInterop": true, >> tsconfig.json
    echo     "skipLibCheck": true, >> tsconfig.json
    echo     "forceConsistentCasingInFileNames": true, >> tsconfig.json
    echo     "resolveJsonModule": true, >> tsconfig.json
    echo     "declaration": true, >> tsconfig.json
    echo     "declarationMap": true, >> tsconfig.json
    echo     "sourceMap": true, >> tsconfig.json
    echo     "experimentalDecorators": true, >> tsconfig.json
    echo     "emitDecoratorMetadata": true, >> tsconfig.json
    echo     "moduleResolution": "node", >> tsconfig.json
    echo     "allowSyntheticDefaultImports": true, >> tsconfig.json
    echo     "baseUrl": "./src", >> tsconfig.json
    echo     "paths": { >> tsconfig.json
    echo       "@/*": ["*"], >> tsconfig.json
    echo       "@/config/*": ["config/*"], >> tsconfig.json
    echo       "@/controllers/*": ["controllers/*"], >> tsconfig.json
    echo       "@/services/*": ["services/*"], >> tsconfig.json
    echo       "@/middleware/*": ["middleware/*"], >> tsconfig.json
    echo       "@/routes/*": ["routes/*"], >> tsconfig.json
    echo       "@/utils/*": ["utils/*"], >> tsconfig.json
    echo       "@/types/*": ["types/*"] >> tsconfig.json
    echo     } >> tsconfig.json
    echo   }, >> tsconfig.json
    echo   "include": [ >> tsconfig.json
    echo     "src/**/*" >> tsconfig.json
    echo   ], >> tsconfig.json
    echo   "exclude": [ >> tsconfig.json
    echo     "node_modules", >> tsconfig.json
    echo     "dist", >> tsconfig.json
    echo     "**/*.test.ts", >> tsconfig.json
    echo     "**/*.spec.ts" >> tsconfig.json
    echo   ] >> tsconfig.json
    echo } >> tsconfig.json
    echo ✅ tsconfig.json created
) else (
    echo ✅ tsconfig.json already exists
)

REM Create environment setup script
echo 🔧 Creating environment setup script...
echo @echo off > setup-env.bat
echo echo 🔧 Setting up environment for PetMate server... >> setup-env.bat
echo. >> setup-env.bat
echo if exist .env ( >> setup-env.bat
echo     echo ⚠️  .env file already exists. Backup created. >> setup-env.bat
echo     copy .env .env.backup.%%date:~0,4%%%%date:~5,2%%%%date:~8,2%% 2^>nul >> setup-env.bat
echo ) >> setup-env.bat
echo. >> setup-env.bat
echo echo 🌍 Choose environment setup: >> setup-env.bat
echo echo 1) Development ^(full features, mock data^) >> setup-env.bat
echo echo 2) Production ^(optimized, secure^) >> setup-env.bat
echo echo 3) Testing ^(minimal, fast^) >> setup-env.bat
echo echo 4) Demo ^(lightweight, presentation-ready^) >> setup-env.bat
echo echo 5) Custom ^(choose your own^) >> setup-env.bat
echo. >> setup-env.bat
echo set /p choice=Enter choice ^(1-5^):  >> setup-env.bat
echo. >> setup-env.bat
echo if "%%choice%%"=="1" ( >> setup-env.bat
echo     copy .env.development .env 2^>nul >> setup-env.bat
echo     echo ✅ Development environment configured >> setup-env.bat
echo     echo 📝 Features: All enabled, mock data, no rate limiting >> setup-env.bat
echo ^) else if "%%choice%%"=="2" ( >> setup-env.bat
echo     copy .env.production .env 2^>nul >> setup-env.bat
echo     echo ✅ Production environment configured >> setup-env.bat
echo     echo 📝 Features: Secure, optimized, rate limited >> setup-env.bat
echo     echo ⚠️  Remember to update database URLs and secrets! >> setup-env.bat
echo ^) else if "%%choice%%"=="3" ( >> setup-env.bat
echo     copy .env.test .env 2^>nul >> setup-env.bat
echo     echo ✅ Testing environment configured >> setup-env.bat
echo     echo 📝 Features: Minimal, fast, mock data only >> setup-env.bat
echo ^) else if "%%choice%%"=="4" ( >> setup-env.bat
echo     copy .env.demo .env 2^>nul >> setup-env.bat
echo     echo ✅ Demo environment configured >> setup-env.bat
echo     echo 📝 Features: Demo-friendly, lightweight, no payments >> setup-env.bat
echo ^) else ( >> setup-env.bat
echo     copy .env.unified .env 2^>nul >> setup-env.bat
echo     echo ✅ Custom environment configured >> setup-env.bat
echo     echo 📝 Please edit .env file to customize your settings >> setup-env.bat
echo ^) >> setup-env.bat
echo. >> setup-env.bat
echo echo. >> setup-env.bat
echo echo 🎯 Next steps: >> setup-env.bat
echo echo 1. Review and update .env file if needed >> setup-env.bat
echo echo 2. Install dependencies: npm install >> setup-env.bat
echo echo 3. Start development server: npm run dev >> setup-env.bat
echo echo 4. Visit http://localhost:5000/api/v1 to see server status >> setup-env.bat
echo pause >> setup-env.bat

echo ✅ Environment setup script created

REM Create start script
echo 🚀 Creating start script...
echo @echo off > start-server.bat
echo echo 🚀 Starting PetMate Server... >> start-server.bat
echo. >> start-server.bat
echo if exist .env ( >> start-server.bat
echo     echo ✅ Environment loaded from .env >> start-server.bat
echo ^) else ( >> start-server.bat
echo     echo ⚠️  No .env file found. Using defaults. >> start-server.bat
echo ^) >> start-server.bat
echo. >> start-server.bat
echo if not exist dist\server.js ( >> start-server.bat
echo     echo 🔧 Compiling TypeScript... >> start-server.bat
echo     npm run build >> start-server.bat
echo ^) >> start-server.bat
echo. >> start-server.bat
echo echo 🔧 Starting server... >> start-server.bat
echo npm run dev >> start-server.bat

echo ✅ Start script created

echo.
echo 🎉 Migration completed successfully!
echo.
echo 📋 Next steps:
echo 1. Setup environment: setup-env.bat
echo 2. Install dependencies: npm install typescript tsx
echo 3. Configure .env file for your needs
echo 4. Start server: npm run dev
echo 5. Test at: http://localhost:5000/api/v1
echo.
echo 📚 Documentation: MIGRATION_GUIDE.md
echo 📦 Backup location: %BACKUP_DIR%\
echo.
echo 🔧 Feature toggles available in .env file!
echo 🌍 Multiple environment configs available:
echo    - .env.development (full features)
echo    - .env.production (secure, optimized)
echo    - .env.test (minimal, fast)
echo    - .env.demo (lightweight)
echo.
pause
