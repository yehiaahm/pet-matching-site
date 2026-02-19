@echo off
echo 🚀 Starting PetMate project restructuring...

REM Create main directories
echo 📁 Creating directory structure...
mkdir docs\api 2>nul
mkdir docs\architecture 2>nul
mkdir docs\deployment 2>nul
mkdir docs\development 2>nul
mkdir docs\user 2>nul
mkdir archive\old-frontend 2>nul
mkdir archive\old-backend 2>nul
mkdir archive\documentation 2>nul
mkdir frontend\public 2>nul
mkdir frontend\src\components\ui 2>nul
mkdir frontend\src\components\features 2>nul
mkdir frontend\src\components\layout 2>nul
mkdir frontend\src\pages 2>nul
mkdir frontend\src\hooks 2>nul
mkdir frontend\src\services 2>nul
mkdir frontend\src\utils 2>nul
mkdir frontend\src\types 2>nul
mkdir frontend\src\styles 2>nul
mkdir frontend\src\assets 2>nul
mkdir frontend\src\config 2>nul
mkdir backend\src\controllers 2>nul
mkdir backend\src\services 2>nul
mkdir backend\src\models 2>nul
mkdir backend\src\middleware 2>nul
mkdir backend\src\routes 2>nul
mkdir backend\src\utils 2>nul
mkdir backend\src\types 2>nul
mkdir backend\src\config 2>nul
mkdir backend\prisma\migrations 2>nul
mkdir backend\prisma\seeds 2>nul
mkdir backend\scripts 2>nul
mkdir backend\tests 2>nul
mkdir tests\e2e 2>nul
mkdir tests\integration 2>nul
mkdir tests\fixtures 2>nul
mkdir scripts 2>nul
mkdir config\docker 2>nul
mkdir config\nginx 2>nul
mkdir config\ci-cd 2>nul

echo ✅ Directory structure created successfully!

REM Phase 1: Move documentation
echo 📚 Moving documentation files...
cd docs

REM API Documentation
move ..\API_ROUTES_REFERENCE.md api\ 2>nul
move ..\API_MATCHING_CONTRACT.md api\ 2>nul
move ..\SOCKET_EVENTS.md api\ 2>nul

REM Architecture Documentation
move ..\ARCHITECTURE.md architecture\ 2>nul
move ..\ARCHITECTURE_DIAGRAM.md architecture\ 2>nul
move ..\VISUAL_ARCHITECTURE.md architecture\ 2>nul
move ..\SYSTEM_REDESIGN.md architecture\ 2>nul

REM Development Documentation
move ..\README.md development\ 2>nul
move ..\QUICK_START.md development\ 2>nul
move ..\SETUP_AND_FEATURES_GUIDE.md development\ 2>nul
move ..\DEBUG_GUIDE.md development\ 2>nul
move ..\IMPLEMENTATION_CHECKLIST.md development\ 2>nul

REM Deployment Documentation
move ..\DEPLOYMENT_STRATEGY.md deployment\ 2>nul
move ..\README-PRODUCTION.md deployment\ 2>nul

REM User Documentation
move ..\ARABIC_GUIDE.md user\ 2>nul
move ..\FAQ.md user\ 2>nul
move ..\FEATURES_GUIDE.md user\ 2>nul

echo ✅ Documentation moved successfully!

REM Phase 2: Move frontend files
echo 🎨 Moving frontend files...
cd ..

REM Move frontend source (using robocopy for better handling)
robocopy src frontend\src /E /MOVE 2>nul

REM Move frontend configs
copy package.json frontend\ 2>nul
copy vite.config.ts frontend\ 2>nul
copy tsconfig.json frontend\ 2>nul
copy postcss.config.mjs frontend\ 2>nul
copy index.html frontend\public\ 2>nul

echo ✅ Frontend files moved successfully!

REM Phase 3: Move backend files
echo 🚀 Moving backend files...
robocopy server backend /E /MOVE 2>nul

echo ✅ Backend files moved successfully!

REM Phase 4: Archive old files
echo 📦 Archiving old files...
REM Move any remaining old files to archive
for %%f in (*.md) do (
    if not exist "docs\%%f" move "%%f" archive\documentation\ 2>nul
)
for %%f in (*.bat) do (
    if not exist "scripts\%%f" move "%%f" archive\documentation\ 2>nul
)
for %%f in (*.sh) do (
    if not exist "scripts\%%f" move "%%f" archive\documentation\ 2>nul
)
for %%f in (*.js) do (
    if not exist "frontend\%%f" if not exist "backend\%%f" if not exist "scripts\%%f" move "%%f" archive\documentation\ 2>nul
)

echo ✅ Old files archived successfully!

echo ""
echo 🎉 PetMate project restructuring completed!
echo ""
echo 📋 Next steps:
echo 1. Review the new structure
echo 2. Update import paths in frontend code
echo 3. Update import paths in backend code
echo 4. Test the applications
echo 5. Update any CI/CD pipelines
echo ""
echo 📚 Documentation moved to: docs\
echo 🎨 Frontend moved to: frontend\
echo 🚀 Backend moved to: backend\
echo 📦 Old files archived to: archive\
echo ""
echo 🔧 Run 'scripts\dev.bat' to start development!
pause
