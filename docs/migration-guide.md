# PetMate Project Migration Guide

## 🎯 Overview

This guide will help you migrate your PetMate project from the current cluttered structure to a clean, scalable architecture following industry best practices.

## 📋 Before You Start

### Prerequisites
- **Backup your project**: Create a complete backup before starting
- **Git**: Commit all current changes or create a new branch
- **Time**: Allow 30-60 minutes for complete migration
- **Testing**: Have your test environment ready

### Current Issues Identified
- ❌ 100+ files cluttering root directory
- ❌ Mixed frontend/backend configurations
- ❌ Duplicate server files and configs
- ❌ Scattered documentation
- ❌ No clear separation of concerns

## 🚀 Migration Steps

### Step 1: Backup & Preparation
```bash
# Create backup
cp -r petmate petmate-backup-$(date +%Y%m%d)

# Or on Windows
xcopy petmate petmate-backup-%date% /E /I /H
```

### Step 2: Run Migration Script
```bash
# On Unix/Linux/macOS
chmod +x scripts/restructure-project.sh
./scripts/restructure-project.sh

# On Windows
scripts\restructure-project.bat
```

### Step 3: Update Import Paths

#### Frontend Import Updates
```typescript
// Before
import { authService } from '../services/authService';
import { Button } from './components/ui/button';

// After
import { authService } from '../services/authService';
import { Button } from './components/ui/button';
```

#### Backend Import Updates
```typescript
// Before
const petController = require('../controllers/petController');
const { PrismaClient } = require('@prisma/client');

// After
import { petController } from '../controllers/petController';
import { PrismaClient } from '@prisma/client';
```

### Step 4: Update Configuration Files

#### Frontend Config Updates
```json
// frontend/package.json
{
  "name": "petmate-frontend",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

#### Backend Config Updates
```json
// backend/package.json
{
  "name": "petmate-backend",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  }
}
```

### Step 5: Update Environment Files
```bash
# Root .env.example
# Frontend .env (in frontend/)
# Backend .env (in backend/)
```

### Step 6: Test Applications
```bash
# Start development servers
./scripts/dev.sh

# Or on Windows
scripts\dev.bat

# Test:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3001
# - Database connectivity
# - API endpoints
```

## 📁 New Structure Overview

### Frontend Structure (`/frontend`)
```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/            # Base UI (Button, Input, etc.)
│   │   ├── features/      # Feature components
│   │   └── layout/        # Layout components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   ├── styles/            # Styles and themes
│   ├── assets/            # Images, fonts
│   ├── config/            # Configuration
│   ├── App.tsx            # Main app
│   └── main.tsx           # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Backend Structure (`/backend`)
```
backend/
├── src/
│   ├── controllers/       # Route handlers
│   ├── services/          # Business logic
│   ├── models/            # Database models
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── utils/             # Utilities
│   ├── types/             # TypeScript types
│   ├── config/            # Configuration
│   └── app.ts             # Express app
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # DB migrations
│   └── seeds/             # Seed data
├── scripts/               # Utility scripts
├── tests/                 # Tests
├── package.json
└── tsconfig.json
```

### Documentation Structure (`/docs`)
```
docs/
├── api/                   # API documentation
├── architecture/          # Architecture docs
├── deployment/            # Deployment guides
├── development/           # Development guides
└── user/                  # User guides
```

## 🔧 Common Migration Issues & Solutions

### Issue 1: Import Path Errors
**Problem**: Import paths break after moving files
**Solution**: Update all import paths to reflect new structure

### Issue 2: Environment Variables
**Problem**: Environment files not found
**Solution**: Create separate .env files for frontend and backend

### Issue 3: Database Connection
**Problem**: Prisma can't find schema
**Solution**: Update prisma schema path in backend

### Issue 4: Build Failures
**Problem**: Build scripts not working
**Solution**: Update package.json scripts in both frontend and backend

## 🧪 Testing Checklist

### Frontend Tests
- [ ] Application starts without errors
- [ ] All pages load correctly
- [ ] API calls work
- [ ] Styles load properly
- [ ] Build process works

### Backend Tests
- [ ] Server starts without errors
- [ ] Database connection works
- [ ] All API endpoints respond
- [ ] Authentication works
- [ ] Database operations work

### Integration Tests
- [ ] Frontend can communicate with backend
- [ ] User registration/login flow
- [ ] Pet CRUD operations
- [ ] File uploads work

## 🚀 Post-Migration Benefits

### Before Migration
- ❌ 100+ files in root directory
- ❌ Hard to find specific files
- ❌ Mixed concerns
- ❌ Difficult to maintain
- ❌ Poor developer experience

### After Migration
- ✅ Clean, organized structure
- ✅ Easy navigation
- ✅ Clear separation of concerns
- ✅ Scalable architecture
- ✅ Better developer experience
- ✅ Industry best practices
- ✅ Easier onboarding for new developers

## 📚 Additional Resources

### Development Scripts
- `./scripts/setup.sh` - Initial project setup
- `./scripts/dev.sh` - Start development servers
- `./scripts/build.sh` - Build for production

### Documentation
- [Development Guide](docs/development/quick-start.md)
- [API Documentation](docs/api/routes-reference.md)
- [Architecture Overview](docs/architecture/overview.md)

## 🆘 Troubleshooting

### If Something Goes Wrong
1. **Restore from backup**: Use the backup created in Step 1
2. **Check migration logs**: Review any error messages
3. **Verify file permissions**: Ensure all files are accessible
4. **Test incrementally**: Test frontend and backend separately

### Getting Help
- Review the migration script logs
- Check the documentation in `/docs`
- Compare with the proposed structure
- Test with a small subset first

## ✅ Migration Complete!

Once you've completed all steps and verified everything works:

1. **Commit the changes** to version control
2. **Update team documentation** about the new structure
3. **Update CI/CD pipelines** if applicable
4. **Enjoy your clean, organized project!** 🎉

---

**Remember**: This migration is a one-time process that will save you countless hours in the future and make your project much more maintainable and scalable.
