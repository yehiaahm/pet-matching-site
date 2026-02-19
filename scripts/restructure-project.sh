#!/bin/bash

# PetMate Project Restructuring Script
# This script will reorganize your project according to the proposed architecture

echo "🚀 Starting PetMate project restructuring..."

# Create main directories
echo "📁 Creating directory structure..."
mkdir -p docs/{api,architecture,deployment,development,user}
mkdir -p archive/{old-frontend,old-backend,documentation}
mkdir -p frontend/{public,src/{components/{ui,features,layout},pages,hooks,services,utils,types,styles,assets,config}}
mkdir -p backend/{src/{controllers,services,models,middleware,routes,utils,types,config},prisma/{migrations,seeds},scripts,tests}
mkdir -p tests/{e2e,integration,fixtures}
mkdir -p scripts
mkdir -p config/{docker,nginx,ci-cd}

echo "✅ Directory structure created successfully!"

# Phase 1: Move documentation
echo "📚 Moving documentation files..."
cd docs

# API Documentation
mv ../API_ROUTES_REFERENCE.md api/
mv ../API_MATCHING_CONTRACT.md api/
mv ../SOCKET_EVENTS.md api/

# Architecture Documentation
mv ../ARCHITECTURE.md architecture/
mv ../ARCHITECTURE_DIAGRAM.md architecture/
mv ../VISUAL_ARCHITECTURE.md architecture/
mv ../SYSTEM_REDESIGN.md architecture/

# Development Documentation
mv ../README.md development/
mv ../QUICK_START.md development/
mv ../SETUP_AND_FEATURES_GUIDE.md development/
mv ../DEBUG_GUIDE.md development/
mv ../IMPLEMENTATION_CHECKLIST.md development/

# Deployment Documentation
mv ../DEPLOYMENT_STRATEGY.md deployment/
mv ../README-PRODUCTION.md deployment/

# User Documentation
mv ../ARABIC_GUIDE.md user/
mv ../FAQ.md user/
mv ../FEATURES_GUIDE.md user/

# Move remaining markdown files to appropriate categories
mv ../ALL_DOCUMENTATION.md development/
mv ../DOCUMENTATION_INDEX.md development/
mv ../FILES_INDEX.md development/

echo "✅ Documentation moved successfully!"

# Phase 2: Move frontend files
echo "🎨 Moving frontend files..."
cd ../

# Move frontend source
cp -r src/* frontend/src/

# Move frontend configs
cp package.json frontend/
cp vite.config.ts frontend/
cp tsconfig.json frontend/
cp postcss.config.mjs frontend/
cp index.html frontend/public/

# Move styles
cp -r src/styles frontend/src/

echo "✅ Frontend files moved successfully!"

# Phase 3: Move backend files
echo "🚀 Moving backend files..."
cp -r server/* backend/

# Reorganize backend structure
mkdir -p backend/src
mv backend/controllers backend/src/
mv backend/services backend/src/
mv backend/middleware backend/src/
mv backend/routes backend/src/
mv backend/utils backend/src/
mv backend/config backend/src/

# Create backend types directory
mkdir -p backend/src/types

# Move server files to src
mv backend/server*.js backend/src/
mv backend/auth-server.js backend/src/
mv backend/location-server.js backend/src/
mv backend/pets-server.js backend/src/
mv backend/mock-server.js backend/src/
mv backend/simple-server.js backend/src/

echo "✅ Backend files moved successfully!"

# Phase 4: Archive old files
echo "📦 Archiving old files..."
# Move any remaining old files to archive
find . -maxdepth 1 -name "*.md" -not -path "./docs/*" -not -path "./archive/*" -exec mv {} archive/documentation/ \;
find . -maxdepth 1 -name "*.bat" -not -path "./scripts/*" -not -path "./archive/*" -exec mv {} archive/documentation/ \;
find . -maxdepth 1 -name "*.sh" -not -path "./scripts/*" -not -path "./archive/*" -exec mv {} archive/documentation/ \;
find . -maxdepth 1 -name "*.js" -not -path "./frontend/*" -not -path "./backend/*" -not -path "./scripts/*" -not -path "./archive/*" -exec mv {} archive/documentation/ \;

echo "✅ Old files archived successfully!"

# Phase 5: Create new root files
echo "📋 Creating new root files..."
cat > README.md << 'EOF'
# PetMate - Pet Breeding Matchmaking Platform

A full-stack application for pet breeding matchmaking with React, TypeScript, Node.js, and Prisma.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Docker (optional)

### Development Setup

1. **Clone and setup**
```bash
git clone <repository-url>
cd petmate
chmod +x scripts/setup.sh
./scripts/setup.sh
```

2. **Start development**
```bash
./scripts/dev.sh
```

3. **Access applications**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Database: localhost:5432

## 📁 Project Structure

```
petmate/
├── docs/           # Documentation
├── frontend/       # React frontend
├── backend/        # Node.js backend
├── tests/          # Test files
├── scripts/        # Utility scripts
├── config/         # Configuration files
└── archive/        # Old files and backups
```

## 📚 Documentation

- [Development Guide](docs/development/quick-start.md)
- [API Documentation](docs/api/routes-reference.md)
- [Architecture Overview](docs/architecture/overview.md)
- [Deployment Guide](docs/deployment/strategy.md)

## 🛠️ Technologies

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Testing**: Jest, Playwright
- **Deployment**: Docker, Docker Compose

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
EOF

cat > package.json << 'EOF'
{
  "name": "petmate",
  "version": "1.0.0",
  "description": "Pet breeding matchmaking platform",
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm run test",
    "test:backend": "cd backend && npm run test",
    "setup": "./scripts/setup.sh",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF

echo "✅ New root files created!"

# Phase 6: Create utility scripts
echo "🔧 Creating utility scripts..."
cd scripts

cat > setup.sh << 'EOF'
#!/bin/bash

echo "🚀 Setting up PetMate project..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../backend
npm install

# Setup database
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

# Seed database (optional)
read -p "Do you want to seed the database? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma db seed
fi

echo "✅ Setup complete!"
echo "Run './scripts/dev.sh' to start development servers."
EOF

cat > dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting PetMate development servers..."

# Start backend
echo "🔧 Starting backend server..."
cd ../backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Development servers started!"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x setup.sh dev.sh

echo "✅ Utility scripts created!"

echo ""
echo "🎉 PetMate project restructuring completed!"
echo ""
echo "📋 Next steps:"
echo "1. Review the new structure"
echo "2. Update import paths in frontend code"
echo "3. Update import paths in backend code"
echo "4. Test the applications"
echo "5. Update any CI/CD pipelines"
echo ""
echo "📚 Documentation moved to: docs/"
echo "🎨 Frontend moved to: frontend/"
echo "🚀 Backend moved to: backend/"
echo "📦 Old files archived to: archive/"
echo ""
echo "🔧 Run './scripts/dev.sh' to start development!"
