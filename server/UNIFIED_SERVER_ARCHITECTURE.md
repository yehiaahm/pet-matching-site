# PetMate Unified Server Architecture

## 🎯 Overview

The PetMate Unified Server consolidates all your multiple server files (`server.js`, `server-complete.js`, `auth-server.js`, `location-server.js`, `pets-server.js`) into a single, configurable `server.ts` file with environment-based feature toggles.

## 🏗️ Architecture

### Core Components

```
server/
├── src/
│   ├── server.ts              # Unified server with feature toggles
│   ├── config/                 # Configuration modules
│   ├── controllers/            # Route handlers
│   ├── services/               # Business logic
│   ├── middleware/             # Express middleware
│   ├── routes/                 # API routes
│   ├── utils/                  # Utility functions
│   ├── types/                  # TypeScript types
│   └── models/                 # Database models
├── prisma/                     # Database schema & migrations
├── .env.example               # Environment template
├── .env.development           # Development config
├── .env.production            # Production config
├── .env.test                  # Testing config
├── .env.demo                  # Demo config
└── migrate-server.sh          # Migration script
```

## 🔧 Feature Toggles

### Core Features

| Feature | Environment Variable | Default | Description |
|---------|---------------------|---------|-------------|
| Authentication | `ENABLE_AUTH` | `true` | JWT-based authentication system |
| Real-time | `ENABLE_SOCKETS` | `false` | Socket.IO for live features |
| Logging | `ENABLE_LOGGING` | `true` | Morgan request logging |
| Compression | `ENABLE_COMPRESSION` | `true` | Gzip response compression |
| Rate Limiting | `ENABLE_RATE_LIMIT` | `true` | Express rate limiting |
| Security | `ENABLE_SECURITY` | `true` | Helmet security headers |
| CORS | `ENABLE_CORS` | `true` | Cross-origin resource sharing |
| Mock Data | `ENABLE_MOCK_DATA` | `false` | Use mock data instead of database |
| Database | `ENABLE_DATABASE` | `true` | Prisma database connection |

### Advanced Features

| Feature | Environment Variable | Default | Description |
|---------|---------------------|---------|-------------|
| Notifications | `ENABLE_NOTIFICATIONS` | `false` | Email/push notifications |
| Schedulers | `ENABLE_SCHEDULERS` | `false` | Background job schedulers |
| File Upload | `ENABLE_FILE_UPLOAD` | `true` | File upload functionality |
| Payments | `ENABLE_PAYMENTS` | `false` | Stripe payment processing |
| Email | `ENABLE_EMAIL` | `false` | Email service integration |
| GPS Matching | `ENABLE_GPS` | `true` | Location-based pet matching |
| AI Matching | `ENABLE_AI` | `true` | AI-powered recommendations |
| Analytics | `ENABLE_ANALYTICS` | `true` | Analytics dashboard |
| Vet Services | `ENABLE_VET_SERVICES` | `true` | Veterinary clinic services |
| Messaging | `ENABLE_MESSAGING` | `true` | Real-time messaging |

## 🌍 Environment Configurations

### Development Environment (`.env.development`)
```bash
# Full-featured development setup
ENABLE_AUTH=true
ENABLE_SOCKETS=true
ENABLE_MOCK_DATA=true
ENABLE_DATABASE=false
ENABLE_RATE_LIMIT=false
ENABLE_LOGGING=true
LOG_LEVEL=debug
```

**Use Case**: Active development with all features enabled, mock data for fast iteration.

### Production Environment (`.env.production`)
```bash
# Optimized production setup
ENABLE_AUTH=true
ENABLE_SOCKETS=true
ENABLE_MOCK_DATA=false
ENABLE_DATABASE=true
ENABLE_RATE_LIMIT=true
ENABLE_SECURITY=true
ENABLE_COMPRESSION=true
LOG_LEVEL=warn
```

**Use Case**: Production deployment with security, performance optimizations.

### Testing Environment (`.env.test`)
```bash
# Minimal testing setup
ENABLE_AUTH=true
ENABLE_MOCK_DATA=true
ENABLE_DATABASE=false
ENABLE_RATE_LIMIT=false
ENABLE_LOGGING=false
ENABLE_SOCKETS=false
```

**Use Case**: Automated testing with minimal overhead and predictable data.

### Demo Environment (`.env.demo`)
```bash
# Lightweight demo setup
ENABLE_AUTH=true
ENABLE_MOCK_DATA=true
ENABLE_SOCKETS=true
ENABLE_MESSAGING=true
ENABLE_GPS=true
ENABLE_AI=true
ENABLE_FILE_UPLOAD=false
ENABLE_PAYMENTS=false
```

**Use Case**: Presentations and demos with impressive features but no external dependencies.

## 🔄 Migration from Multiple Servers

### From `server.js`
- ✅ All core functionality preserved
- ✅ Security middleware configurable
- ✅ Database connection optional
- ✅ Mock data fallback available

### From `server-complete.js`
- ✅ All routes included
- ✅ Socket.IO optional via `ENABLE_SOCKETS`
- ✅ Compression configurable
- ✅ Security features toggleable

### From `auth-server.js`
- ✅ Authentication system preserved
- ✅ Rate limiting configurable
- ✅ Mock users available
- ✅ JWT token generation

### From `location-server.js`
- ✅ GPS matching preserved
- ✅ Distance calculations included
- ✅ Mock pet data with coordinates
- ✅ Toggle via `ENABLE_GPS`

### From `pets-server.js`
- ✅ Pet CRUD operations preserved
- ✅ Health records included
- ✅ Vaccination tracking
- ✅ Mock data available

## 🚀 Getting Started

### 1. Migration
```bash
# Run migration script
./migrate-server.sh  # Unix/macOS
# or
migrate-server.bat   # Windows
```

### 2. Setup Environment
```bash
# Choose environment setup
./setup-env.sh
# or
setup-env.bat
```

### 3. Install Dependencies
```bash
npm install typescript tsx @types/node @types/express
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📊 API Endpoints

### Base URL: `http://localhost:5000/api/v1`

### Core Endpoints (Always Available)
- `GET /` - Server status and feature info
- `GET /health` - Health check

### Conditional Endpoints
| Endpoint | Feature Toggle | Description |
|----------|----------------|-------------|
| `POST /auth/login` | `ENABLE_AUTH` | User authentication |
| `GET /pets` | Always | Pet listing |
| `POST /pets` | Always | Create pet |
| `GET /matches` | Always | Pet matches |
| `GET /ai-matches` | `ENABLE_AI` | AI recommendations |
| `GET /gps-matching` | `ENABLE_GPS` | Location-based matches |
| `POST /upload` | `ENABLE_FILE_UPLOAD` | File upload |
| `POST /payments` | `ENABLE_PAYMENTS` | Payment processing |
| `POST /email` | `ENABLE_EMAIL` | Send email |
| `GET /analytics` | `ENABLE_ANALYTICS` | Analytics data |
| `GET /vet-services` | `ENABLE_VET_SERVICES` | Vet clinic info |
| `/socket.io` | `ENABLE_SOCKETS` | Real-time connections |

## 🔧 Configuration Examples

### Enable Only Core Features
```bash
ENABLE_AUTH=true
ENABLE_DATABASE=true
ENABLE_MOCK_DATA=false
# Disable everything else
ENABLE_SOCKETS=false
ENABLE_FILE_UPLOAD=false
ENABLE_PAYMENTS=false
ENABLE_EMAIL=false
ENABLE_AI=false
ENABLE_ANALYTICS=false
ENABLE_VET_SERVICES=false
ENABLE_MESSAGING=false
```

### Demo Mode Setup
```bash
ENABLE_AUTH=true
ENABLE_MOCK_DATA=true
ENABLE_SOCKETS=true
ENABLE_MESSAGING=true
ENABLE_GPS=true
ENABLE_AI=true
# Disable external dependencies
ENABLE_DATABASE=false
ENABLE_FILE_UPLOAD=false
ENABLE_PAYMENTS=false
ENABLE_EMAIL=false
```

### Testing Mode Setup
```bash
ENABLE_AUTH=true
ENABLE_MOCK_DATA=true
ENABLE_DATABASE=false
# Disable all non-essential features
ENABLE_LOGGING=false
ENABLE_RATE_LIMIT=false
ENABLE_SOCKETS=false
ENABLE_FILE_UPLOAD=false
ENABLE_PAYMENTS=false
ENABLE_EMAIL=false
ENABLE_AI=false
ENABLE_ANALYTICS=false
ENABLE_VET_SERVICES=false
ENABLE_MESSAGING=false
```

## 🧪 Testing Feature Toggles

### Test with Mock Data
```bash
# Start with mock data
ENABLE_MOCK_DATA=true ENABLE_DATABASE=false npm run dev
```

### Test with Database
```bash
# Start with database
ENABLE_MOCK_DATA=false ENABLE_DATABASE=true npm run dev
```

### Test Individual Features
```bash
# Test only authentication
ENABLE_AUTH=true ENABLE_SOCKETS=false ENABLE_AI=false npm run dev

# Test only AI features
ENABLE_AI=true ENABLE_AUTH=false ENABLE_SOCKETS=false npm run dev

# Test only real-time features
ENABLE_SOCKETS=true ENABLE_AUTH=false ENABLE_AI=false npm run dev
```

## 📈 Performance Benefits

### Before (Multiple Servers)
- ❌ Multiple processes running
- ❌ Code duplication
- ❌ Configuration conflicts
- ❌ Hard to maintain
- ❌ Inconsistent feature sets

### After (Unified Server)
- ✅ Single process
- ✅ No code duplication
- ✅ Centralized configuration
- ✅ Easy maintenance
- ✅ Consistent features
- ✅ Feature toggles for optimization
- ✅ Environment-specific configs

## 🔒 Security Considerations

### Production Security
```bash
# Enable all security features
ENABLE_SECURITY=true
ENABLE_RATE_LIMIT=true
ENABLE_CORS=true
ENABLE_LOGGING=true
LOG_LEVEL=warn

# Use strong secrets
JWT_SECRET=your-super-secure-secret-key
DATABASE_URL=secure-connection-string
```

### Development Security
```bash
# Relaxed security for development
ENABLE_RATE_LIMIT=false
LOG_LEVEL=debug
ENABLE_MOCK_DATA=true
```

## 🚀 Deployment Strategies

### Development Deployment
```bash
# Use development environment
cp .env.development .env
npm run dev
```

### Production Deployment
```bash
# Use production environment
cp .env.production .env
npm run build
npm start
```

### Demo Deployment
```bash
# Use demo environment
cp .env.demo .env
npm run build
npm start
```

## 🎯 Benefits Summary

### For Developers
- **Single Source of Truth**: One server file to maintain
- **Feature Toggles**: Enable/disable functionality without code changes
- **Environment Configs**: Different setups for different needs
- **Easy Testing**: Minimal configs for fast testing
- **Better DX**: Clear configuration and setup process

### For Operations
- **Simplified Deployment**: One binary to deploy
- **Environment Isolation**: Different configs for different environments
- **Feature Control**: Enable/disable features per environment
- **Monitoring**: Centralized logging and health checks
- **Security**: Configurable security settings

### For Business
- **Faster Development**: Feature toggles enable rapid iteration
- **Cost Optimization**: Disable unused features in production
- **Demo Ready**: Lightweight demo configuration
- **Scalable**: Easy to add new features
- **Maintainable**: Reduced complexity and technical debt

## 🔮 Future Enhancements

### Planned Features
- **Dynamic Feature Toggles**: Runtime feature switching
- **A/B Testing**: Feature flag management
- **Performance Monitoring**: Built-in metrics collection
- **Health Checks**: Comprehensive health monitoring
- **Auto-scaling**: Feature-based resource allocation

### Extension Points
- **Custom Features**: Easy to add new feature toggles
- **Plugin System**: Modular feature loading
- **Configuration Validation**: Environment validation
- **Migration Tools**: Automated configuration updates

---

## 🎉 Conclusion

The PetMate Unified Server provides a clean, scalable, and maintainable solution that consolidates your multiple server files into a single, configurable system. With environment-based feature toggles, you can easily adapt the server to different use cases while maintaining code quality and reducing complexity.

**Key Benefits:**
- 🎯 **Single Server**: One file to maintain
- 🔧 **Feature Toggles**: Enable/disable functionality
- 🌍 **Environment Configs**: Different setups for different needs
- 🚀 **Easy Deployment**: Simplified production setup
- 📈 **Scalable**: Easy to add new features
- 🔒 **Secure**: Configurable security settings

Your PetMate backend is now ready for production, development, testing, and demo scenarios with just a simple environment configuration change! 🚀
