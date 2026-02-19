#!/bin/bash

# PetMate Server Migration Script
# Merges multiple server files into unified server.ts

echo "🚀 Starting PetMate server migration..."

# Backup current server files
echo "📦 Creating backup of current server files..."
mkdir -p archive/old-servers-$(date +%Y%m%d)
cp server*.js archive/old-servers-$(date +%Y%m%d)/ 2>/dev/null
cp auth-server.js archive/old-servers-$(date +%Y%m%d)/ 2>/dev/null
cp location-server.js archive/old-servers-$(date +%Y%m%d)/ 2>/dev/null
cp pets-server.js archive/old-servers-$(date +%Y%m%d)/ 2>/dev/null

echo "✅ Backup created in archive/old-servers-$(date +%Y%m%d)/"

# Create new directory structure if it doesn't exist
echo "📁 Creating new directory structure..."
mkdir -p src/{controllers,services,models,middleware,routes,utils,types,config}

# Move unified server to src directory
echo "📋 Moving unified server to src directory..."
if [ -f "src/server.ts" ]; then
    echo "✅ Unified server already exists in src/"
else
    echo "❌ Unified server not found. Please create src/server.ts first."
    exit 1
fi

# Update package.json scripts
echo "📦 Updating package.json scripts..."
if [ -f "package.json" ]; then
    # Create backup of package.json
    cp package.json package.json.backup
    
    # Update scripts using node
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        pkg.scripts = {
            'dev': 'tsx watch src/server.ts',
            'build': 'tsc',
            'start': 'node dist/server.js',
            'test': 'jest',
            'migrate': 'npx prisma migrate dev',
            'generate': 'npx prisma generate',
            'seed': 'npx prisma db seed',
            'studio': 'npx prisma studio',
            'clean': 'rm -rf dist'
        };
        
        pkg.main = 'dist/server.js';
        pkg.types = 'dist/server.d.ts';
        
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        console.log('✅ Package.json updated');
    "
else
    echo "❌ package.json not found"
fi

# Create TypeScript configuration if it doesn't exist
echo "📝 Creating TypeScript configuration..."
if [ ! -f "tsconfig.json" ]; then
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
      "@/config/*": ["config/*"],
      "@/controllers/*": ["controllers/*"],
      "@/services/*": ["services/*"],
      "@/middleware/*": ["middleware/*"],
      "@/routes/*": ["routes/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"]
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
    echo "✅ tsconfig.json created"
else
    echo "✅ tsconfig.json already exists"
fi

# Create environment setup script
echo "🔧 Creating environment setup script..."
cat > setup-env.sh << 'EOF'
#!/bin/bash

echo "🔧 Setting up environment for PetMate server..."

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backup created."
    cp .env .env.backup.$(date +%Y%m%d)
fi

# Ask user which environment to setup
echo "🌍 Choose environment setup:"
echo "1) Development (full features, mock data)"
echo "2) Production (optimized, secure)"
echo "3) Testing (minimal, fast)"
echo "4) Demo (lightweight, presentation-ready)"
echo "5) Custom (choose your own)"

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        cp .env.development .env
        echo "✅ Development environment configured"
        echo "📝 Features: All enabled, mock data, no rate limiting"
        ;;
    2)
        cp .env.production .env
        echo "✅ Production environment configured"
        echo "📝 Features: Secure, optimized, rate limited"
        echo "⚠️  Remember to update database URLs and secrets!"
        ;;
    3)
        cp .env.test .env
        echo "✅ Testing environment configured"
        echo "📝 Features: Minimal, fast, mock data only"
        ;;
    4)
        cp .env.demo .env
        echo "✅ Demo environment configured"
        echo "📝 Features: Demo-friendly, lightweight, no payments"
        ;;
    5)
        cp .env.unified .env
        echo "✅ Custom environment configured"
        echo "📝 Please edit .env file to customize your settings"
        ;;
    *)
        echo "❌ Invalid choice. Using development environment."
        cp .env.development .env
        ;;
esac

echo ""
echo "🎯 Next steps:"
echo "1. Review and update .env file if needed"
echo "2. Install dependencies: npm install"
echo "3. Start development server: npm run dev"
echo "4. Visit http://localhost:5000/api/v1 to see server status"
EOF

chmod +x setup-env.sh
echo "✅ Environment setup script created"

# Create migration guide
echo "📚 Creating migration guide..."
cat > MIGRATION_GUIDE.md << 'EOF'
# PetMate Server Migration Guide

## 🎯 Overview

This guide helps you migrate from multiple server files to the unified `server.ts` with feature toggles.

## 📋 Migration Steps

### 1. Backup Current Setup
```bash
# Backup already created by migration script
ls archive/old-servers-*
```

### 2. Setup Environment
```bash
# Run environment setup
./setup-env.sh

# Or manually copy environment file
cp .env.development .env
```

### 3. Install Dependencies
```bash
npm install typescript tsx @types/node @types/express
npm install --save-dev
```

### 4. Update Configuration
Edit `.env` file to configure:
- Database connection
- Feature toggles
- Third-party services
- Rate limiting
- Security settings

### 5. Start Server
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🔧 Feature Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_AUTH` | `true` | Authentication system |
| `ENABLE_SOCKETS` | `false` | Real-time features |
| `ENABLE_LOGGING` | `true` | Request logging |
| `ENABLE_MOCK_DATA` | `false` | Use mock data |
| `ENABLE_DATABASE` | `true` | Database connection |
| `ENABLE_RATE_LIMIT` | `true` | Rate limiting |
| `ENABLE_SECURITY` | `true` | Security headers |

### Quick Configurations

#### Development
```bash
cp .env.development .env
# All features enabled, mock data, relaxed security
```

#### Production
```bash
cp .env.production .env
# Secure, optimized, rate limited
```

#### Testing
```bash
cp .env.test .env
# Minimal features, fast, no database
```

#### Demo
```bash
cp .env.demo .env
# Lightweight, presentation-ready
```

## 🔄 Migration from Old Servers

### From server.js
- All functionality preserved
- Feature toggles control what's enabled
- Environment variables replace hardcoded values

### From server-complete.js
- All routes included
- Security middleware configurable
- Socket.IO optional via `ENABLE_SOCKETS`

### From auth-server.js
- Authentication preserved
- Rate limiting configurable
- Mock data option available

### From location-server.js
- GPS features preserved
- Distance calculations included
- Toggle via `ENABLE_GPS`

### From pets-server.js
- Pet functionality preserved
- Mock pets available
- Database integration optional

## 🧪 Testing Migration

### Test Basic Functionality
```bash
curl http://localhost:5000/api/v1
```

### Test Authentication
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@petmate.com","password":"test123"}'
```

### Test with Different Environments
```bash
# Test with mock data
ENABLE_MOCK_DATA=true npm run dev

# Test with database
ENABLE_DATABASE=true ENABLE_MOCK_DATA=false npm run dev
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change `PORT` in `.env`
   - Kill existing process: `lsof -ti:5000 | xargs kill`

2. **Database connection failed**
   - Check `DATABASE_URL` in `.env`
   - Set `ENABLE_DATABASE=false` to use mock data

3. **TypeScript errors**
   - Run `npm install` for missing types
   - Check `tsconfig.json` paths

4. **Missing routes**
   - Check feature toggles in `.env`
   - Enable required features

### Getting Help

1. Check server logs for errors
2. Verify environment configuration
3. Test with minimal features first
4. Enable features one by one

## ✅ Migration Complete

Once you've completed these steps:
- ✅ Unified server with feature toggles
- ✅ Environment-based configuration
- ✅ Easy development/deployment setup
- ✅ Backup of old servers available

## 🎯 Benefits

- **Single source of truth**: One server file
- **Feature toggles**: Enable/disable functionality
- **Environment configs**: Different setups for different needs
- **Easy testing**: Minimal configs for fast testing
- **Production ready**: Secure, optimized configuration
EOF

echo "✅ Migration guide created"

# Create start script
echo "🚀 Creating start script..."
cat > start-server.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting PetMate Server..."

# Load environment
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment loaded from .env"
else
    echo "⚠️  No .env file found. Using defaults."
fi

# Check if TypeScript is compiled
if [ ! -f "dist/server.js" ]; then
    echo "🔧 Compiling TypeScript..."
    npm run build
fi

# Start server
if [ "$NODE_ENV" = "development" ]; then
    echo "🔧 Starting in development mode..."
    npm run dev
else
    echo "🚀 Starting in production mode..."
    npm start
fi
EOF

chmod +x start-server.sh
echo "✅ Start script created"

echo ""
echo "🎉 Migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Setup environment: ./setup-env.sh"
echo "2. Install dependencies: npm install typescript tsx"
echo "3. Configure .env file for your needs"
echo "4. Start server: npm run dev"
echo "5. Test at: http://localhost:5000/api/v1"
echo ""
echo "📚 Documentation: MIGRATION_GUIDE.md"
echo "📦 Backup location: archive/old-servers-$(date +%Y%m%d)/"
echo ""
echo "🔧 Feature toggles available in .env file!"
echo "🌍 Multiple environment configs available:"
echo "   - .env.development (full features)"
echo "   - .env.production (secure, optimized)"
echo "   - .env.test (minimal, fast)"
echo "   - .env.demo (lightweight)"
