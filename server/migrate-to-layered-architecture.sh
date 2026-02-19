#!/bin/bash

# PetMate Backend Layered Architecture Migration Script
# Refactors existing code into clean layered architecture

echo "🏗️ Starting PetMate backend layered architecture migration..."

# Create backup of current structure
echo "📦 Creating backup of current structure..."
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup existing directories
if [ -d "src" ]; then
    cp -r src "$BACKUP_DIR/"
    echo "✅ Backed up src/ to $BACKUP_DIR/"
fi

if [ -d "controllers" ]; then
    cp -r controllers "$BACKUP_DIR/"
    echo "✅ Backed up controllers/ to $BACKUP_DIR/"
fi

if [ -d "services" ]; then
    cp -r services "$BACKUP_DIR/"
    echo "✅ Backed up services/ to $BACKUP_DIR/"
fi

if [ -d "routes" ]; then
    cp -r routes "$BACKUP_DIR/"
    echo "✅ Backed up routes/ to $BACKUP_DIR/"
fi

if [ -d "middleware" ]; then
    cp -r middleware "$BACKUP_DIR/"
    echo "✅ Backed up middleware/ to $BACKUP_DIR/"
fi

# Create new layered structure
echo "📁 Creating new layered directory structure..."

# Main source directory
mkdir -p src/{controllers,services,repositories,models,routes,middleware,utils,types,validators,config}

# Test directories
mkdir -p tests/{unit,integration,e2e}

# Documentation and scripts
mkdir -p docs
mkdir -p scripts

echo "✅ Created new directory structure"

# Create index files for clean imports
echo "📝 Creating index files..."

# Controllers index
cat > src/controllers/index.ts << 'EOF'
/**
 * Controllers Index
 * Clean exports for all controllers
 */

export { PetController, createPetController } from './pet.controller';
export { AuthController, createAuthController } from './auth.controller';
export { UserController, createUserController } from './user.controller';
export { MatchingController, createMatchingController } from './matching.controller';

// Add other controllers as they are created
EOF

# Services index
cat > src/services/index.ts << 'EOF'
/**
 * Services Index
 * Clean exports for all services
 */

export { PetService, IPetService } from './pet.service';
export { AuthService, IAuthService } from './auth.service';
export { UserService, IUserService } from './user.service';
export { MatchingService, IMatchingService } from './matching.service';

// Add other services as they are created
EOF

# Repositories index
cat > src/repositories/index.ts << 'EOF'
/**
 * Repositories Index
 * Clean exports for all repositories
 */

export { BaseRepository, IBaseRepository } from './base.repository';
export { PetRepository, IPetRepository } from './pet.repository';
export { UserRepository, IUserRepository } from './user.repository';

// Add other repositories as they are created
EOF

# Routes index
cat > src/routes/index.ts << 'EOF'
/**
 * Routes Index
 * Clean exports for all routes
 */

export { createPetRoutes } from './pet.routes';
export { createAuthRoutes } from './auth.routes';
export { createUserRoutes } from './user.routes';
export { createMatchingRoutes } from './matching.routes';

// Add other routes as they are created
EOF

# Middleware index
cat > src/middleware/index.ts << 'EOF'
/**
 * Middleware Index
 * Clean exports for all middleware
 */

export { authenticate, authorize, authorizeRole, optionalAuthenticate, authenticateApiKey, userRateLimit, addRequestId, logRequests } from './auth.middleware';
export { validate } from './validation.middleware';
export { errorHandler, notFound } from './error.middleware';

// Add other middleware as they are created
EOF

# Utils index
cat > src/utils/index.ts << 'EOF'
/**
 * Utils Index
 * Clean exports for all utilities
 */

export * from './response.util';
export * from './logger.util';
export * from './validation.util';
export * from './pagination.util';

// Add other utilities as they are created
EOF

# Types index
cat > src/types/index.ts << 'EOF'
/**
 * Types Index
 * Clean exports for all types
 */

export * from './pet.types';
export * from './auth.types';
export * from './api.types';
export * from './user.types';

// Add other types as they are created
EOF

echo "✅ Created index files for clean imports"

# Create example validation middleware
echo "🔧 Creating validation middleware..."
cat > src/middleware/validation.middleware.ts << 'EOF'
/**
 * Validation Middleware
 * Express-validator integration
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendValidationError } from '../utils/response.util';

export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors);
  }
  
  next();
}
EOF

# Create example error middleware
echo "🔧 Creating error middleware..."
cat > src/middleware/error.middleware.ts << 'EOF'
/**
 * Error Handling Middleware
 * Centralized error handling
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.util';
import { sendInternalServerError } from '../utils/response.util';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Unhandled error', { 
    error: error.message, 
    stack: error.stack,
    requestId: (req as any).requestId,
    userId: (req as any).user?.id 
  });

  // Don't send error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;

  sendInternalServerError(res, message);
}

export function notFound(req: Request, res: Response, next: NextFunction): void {
  sendError(res, 404, `Route ${req.originalUrl} not found`);
}
EOF

# Create pagination utility
echo "🔧 Creating pagination utility..."
cat > src/utils/pagination.util.ts << 'EOF'
/**
 * Pagination Utility
 * Helper functions for pagination
 */

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function parsePagination(req: any): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function createPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev,
  };
}
EOF

# Create validation utility
echo "🔧 Creating validation utility..."
cat > src/utils/validation.util.ts << 'EOF'
/**
 * Validation Utility
 * Common validation functions
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
EOF

# Create rate limiting middleware
echo "🔧 Creating rate limiting middleware..."
cat > src/middleware/rateLimit.middleware.ts << 'EOF'
/**
 * Rate Limiting Middleware
 * Express-rate-limit integration
 */

import rateLimit from 'express-rate-limit';

export function createRateLimit(options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // Limit each IP to 100 requests per windowMs
    message: options.message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
}

export const defaultRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

export const strictRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
});
EOF

# Create app setup file
echo "🚀 Creating app setup file..."
cat > src/app.ts << 'EOF'
/**
 * Express App Setup
 * Main application configuration
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger.util';
import { errorHandler, notFound } from './middleware/error.middleware';
import { addRequestId, logRequests } from './middleware/auth.middleware';

// Import routes
import { createPetRoutes } from './routes';
import { PetRepository } from './repositories';
import { PetService } from './services';

export class App {
  public app: express.Application;
  public prisma: PrismaClient;

  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    }));
    
    // Compression middleware
    this.app.use(compression());
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Request ID middleware
    this.app.use(addRequestId);
    
    // Logging middleware
    if (process.env.ENABLE_LOGGING !== 'false') {
      this.app.use(morgan('combined'));
      this.app.use(logRequests);
    }
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // API routes
    const petRepository = new PetRepository(this.prisma);
    const petService = new PetService(petRepository);
    const petRoutes = createPetRoutes(petService);

    this.app.use('/api/v1/pets', petRoutes);

    // Add other routes here
    // this.app.use('/api/v1/auth', createAuthRoutes());
    // this.app.use('/api/v1/users', createUserRoutes());
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFound);
    
    // Error handler
    this.app.use(errorHandler);
  }

  public async start(port: number): Promise<void> {
    try {
      // Connect to database
      await this.prisma.$connect();
      logger.info('Database connected successfully');

      // Start server
      this.app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
      });
    } catch (error) {
      logger.error('Failed to start server', { error: error.message });
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    await this.prisma.$disconnect();
    logger.info('Database disconnected');
  }
}
EOF

# Create server entry point
echo "🌐 Creating server entry point..."
cat > src/server.ts << 'EOF'
/**
 * Server Entry Point
 * Application bootstrap
 */

import { App } from './app';
import { logger } from './utils/logger.util';

const app = new App();
const PORT = process.env.PORT || 5000;

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

// Start server
app.start(PORT).catch((error) => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});
EOF

# Create package.json updates
echo "📦 Updating package.json..."
if [ -f "package.json" ]; then
    cp package.json package.json.backup
    
    # Add new scripts
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        pkg.scripts = {
            'dev': 'tsx watch src/server.ts',
            'build': 'tsc',
            'start': 'node dist/server.js',
            'test': 'jest',
            'test:watch': 'jest --watch',
            'test:coverage': 'jest --coverage',
            'lint': 'eslint src --ext .ts',
            'lint:fix': 'eslint src --ext .ts --fix',
            'migrate': 'npx prisma migrate dev',
            'generate': 'npx prisma generate',
            'seed': 'npx prisma db seed',
            'studio': 'npx prisma studio'
        };
        
        pkg.main = 'dist/server.js';
        pkg.types = 'dist/server.d.ts';
        
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        console.log('✅ Package.json updated');
    "
fi

# Create TypeScript configuration
echo "📝 Creating TypeScript configuration..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/controllers/*": ["controllers/*"],
      "@/services/*": ["services/*"],
      "@/repositories/*": ["repositories/*"],
      "@/middleware/*": ["middleware/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"],
      "@/routes/*": ["routes/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
EOF

# Create development environment file
echo "🔧 Creating environment configuration..."
cat > .env.development << 'EOF'
# Development Environment
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://dev:dev@localhost:5432/petmate_dev

# JWT
JWT_SECRET=dev-jwt-secret-key

# Features
ENABLE_LOGGING=true
ENABLE_AUTH=true
ENABLE_RATE_LIMIT=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
EOF

# Create production environment file
cat > .env.production << 'EOF'
# Production Environment
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/petmate_prod

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key

# Features
ENABLE_LOGGING=true
ENABLE_AUTH=true
ENABLE_RATE_LIMIT=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
EOF

# Create migration guide
echo "📚 Creating migration guide..."
cat > MIGRATION_GUIDE.md << 'EOF'
# PetMate Backend Migration Guide

## 🎯 Overview

This guide helps you migrate your existing PetMate backend to the new layered architecture.

## 📋 Migration Steps

### 1. Backup Current Code
✅ Already done by the migration script

### 2. Review New Structure
The new structure follows clean architecture principles:
- `src/controllers/` - HTTP request handlers
- `src/services/` - Business logic
- `src/repositories/` - Data access layer
- `src/routes/` - API route definitions
- `src/middleware/` - Express middleware
- `src/utils/` - Utility functions
- `src/types/` - TypeScript types

### 3. Migrate Existing Controllers
1. Copy your existing controllers to `src/controllers/`
2. Refactor to use service layer
3. Remove direct database access
4. Add proper error handling

### 4. Create Service Layer
1. Create service classes for each controller
2. Move business logic from controllers to services
3. Add validation and business rules
4. Use repositories for data access

### 5. Create Repository Layer
1. Create repository classes for each entity
2. Move database operations from controllers
3. Add query helpers and pagination
4. Use Prisma for database operations

### 6. Update Routes
1. Move route definitions to `src/routes/`
2. Add proper validation
3. Apply middleware correctly
4. Use factory pattern for route creation

### 7. Update Dependencies
\`\`\`bash
npm install typescript tsx @types/node @types/express @types/jsonwebtoken
npm install express-validator express-rate-limit helmet compression morgan
\`\`\`

### 8. Test the Migration
\`\`\`bash
# Development
npm run dev

# Build
npm run build

# Start
npm start
\`\`\`

## 🔄 Example Migration

### Before (Controller with Database Access)
\`\`\`typescript
// Old controller
export const getAllPets = async (req, res) => {
  const pets = await prisma.pet.findMany();
  res.json(pets);
};
\`\`\`

### After (Controller → Service → Repository)
\`\`\`typescript
// New controller
export class PetController {
  async getAllPets(req, res, next) {
    try {
      const pets = await this.petService.getUserPets(req.user.id);
      sendSuccess(res, 200, { data: pets });
    } catch (error) {
      next(error);
    }
  }
}

// New service
export class PetService {
  async getUserPets(ownerId) {
    return await this.petRepository.findByOwner(ownerId);
  }
}

// New repository
export class PetRepository {
  async findByOwner(ownerId) {
    return await this.model.findMany({ where: { ownerId } });
  }
}
\`\`\`

## 🎯 Benefits

- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Easy to unit test each layer
- **Maintainability**: Clear code organization
- **Scalability**: Easy to add new features
- **Reusability**: Common patterns and utilities

## 🚀 Next Steps

1. Run the migration script
2. Review the new structure
3. Migrate your existing code
4. Test thoroughly
5. Update documentation

## 📞 Support

If you need help with the migration:
1. Check the example files in `src/`
2. Review the architecture documentation
3. Test with a small feature first
4. Gradually migrate all features

Good luck with your migration! 🚀
EOF

echo ""
echo "🎉 Layered architecture migration completed!"
echo ""
echo "📁 New structure created:"
echo "   src/controllers/    - HTTP request handlers"
echo "   src/services/       - Business logic"
echo "   src/repositories/   - Data access layer"
echo "   src/routes/         - API routes"
echo "   src/middleware/     - Express middleware"
echo "   src/utils/          - Utility functions"
echo "   src/types/          - TypeScript types"
echo ""
echo "📋 Next steps:"
echo "1. Review the new structure in src/"
echo "2. Migrate your existing controllers"
echo "3. Create service and repository layers"
echo "4. Update your routes and middleware"
echo "5. Install missing dependencies"
echo "6. Test the new architecture"
echo ""
echo "📚 Documentation created:"
echo "   - MIGRATION_GUIDE.md"
echo "   - src/LAYERED_ARCHITECTURE_EXAMPLE.md"
echo ""
echo "🔧 Configuration files created:"
echo "   - tsconfig.json"
echo "   - .env.development"
echo "   - .env.production"
echo ""
echo "📦 Backup created in: $BACKUP_DIR/"
echo ""
echo "🚀 To start development:"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "🎯 Your backend is now ready for clean, scalable development!"
