# Pet Breeding Backend - Deployment Guide

## 🚀 Deployment Options

### 🌐 Railway (Recommended for Beginners)

#### 1. **Setup Railway Account**
1. Go to [railway.app](https://railway.app)
2. Sign up for a free account
3. Connect your GitHub repository

#### 2. **Create New Project**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Set project name: `pet-breeding-backend`

#### 3. **Configure Environment Variables**
Add these environment variables in Railway dashboard:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/pet_breeding_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
CORS_ORIGINS=https://your-frontend-domain.railway.app
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
LOG_LEVEL=info
```

#### 4. **Configure Build Settings**
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`

#### 5. **Deploy**
- Click "Deploy"
- Railway will automatically build and deploy your app
- Your app will be available at `https://your-app-name.railway.app`

---

### 🎨 Render (Professional Option)

#### 1. **Setup Render Account**
1. Go to [render.com](https://render.com)
2. Sign up for a free account
3. Connect your GitHub repository

#### 2. **Create Web Service**
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Set service name: `pet-breeding-backend`

#### 3. **Configure Build Settings**
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`

#### 4. **Add Environment Variables**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/pet_breeding_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
CORS_ORIGINS=https://your-frontend-domain.onrender.com
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
LOG_LEVEL=info
```

#### 5. **Deploy**
- Click "Create Web Service"
- Render will automatically build and deploy
- Your app will be available at `https://your-app-name.onrender.com`

---

### 🚀 Heroku (Classic Option)

#### 1. **Setup Heroku CLI**
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login
```

#### 2. **Create Heroku App**
```bash
heroku create pet-breeding-backend
```

#### 3. **Add PostgreSQL Database**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

#### 4. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-in-production
heroku config:set JWT_EXPIRES_IN=7d
heroku config:set REFRESH_TOKEN_EXPIRES_IN=30d
heroku config:set CORS_ORIGINS=https://your-frontend-domain.herokuapp.com
heroku config:set UPLOAD_DIR=uploads
heroku config:set MAX_FILE_SIZE=5242880
heroku config:set LOG_LEVEL=info
```

#### 5. **Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

---

### 🐳 Docker Deployment

#### 1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

#### 2. **Create docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/pet_breeding_db
      - JWT_SECRET=your-super-secret-jwt-key
      - CORS_ORIGINS=http://localhost:5173
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=pet_breeding_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
```

#### 3. **Deploy with Docker**
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build and push to Docker Hub
docker build -t your-username/pet-breeding-backend .
docker push your-username/pet-breeding-backend
```

---

### ☁️ Vercel (Serverless)

#### 1. **Install Vercel CLI**
```bash
npm install -g vercel
```

#### 2. **Create vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 3. **Deploy**
```bash
vercel --prod
```

---

## 🗄️ Database Setup for Production

### PostgreSQL Configuration

#### 1. **Create Database**
```sql
CREATE DATABASE pet_breeding_db;
CREATE USER petbreeding_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE pet_breeding_db TO petbreeding_user;
```

#### 2. **Run Migrations**
```bash
npm run db:migrate
```

#### 3. **Seed Data (Optional)**
```bash
npm run db:seed
```

---

## 🔧 Production Configuration

### Environment Variables

Create `.env.production`:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:5432/pet_breeding_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
CORS_ORIGINS=https://your-frontend-domain.com
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
LOG_LEVEL=info
```

### Security Considerations

1. **Use HTTPS** in production
2. **Strong JWT secrets** - use random 256-bit strings
3. **Database credentials** - use strong passwords
4. **Rate limiting** - already configured
5. **CORS** - restrict to your frontend domain
6. **File uploads** - validate file types and sizes

---

## 📊 Monitoring & Logging

### Health Check
- Endpoint: `/api/health`
- Returns server status and environment info

### Logging
- **Development**: Console output
- **Production**: File-based logging in `/logs/`
- **Log Levels**: error, warn, info, debug

### Monitoring Services
- **Railway**: Built-in monitoring
- **Render**: Built-in metrics
- **Heroku**: Add-ons available
- **Custom**: Use services like Datadog or New Relic

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Railway
        uses: railway-app/railway-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
          service-id: ${{ secrets.RAILWAY_SERVICE_ID }}
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. **Database Connection Failed**
- Check DATABASE_URL environment variable
- Verify PostgreSQL is running
- Check network connectivity

#### 2. **JWT Token Issues**
- Verify JWT_SECRET is set
- Check token expiration
- Refresh token mechanism

#### 3. **File Upload Issues**
- Check UPLOAD_DIR permissions
- Verify file size limits
- Check disk space

#### 4. **CORS Errors**
- Verify CORS_ORIGINS includes frontend domain
- Check if frontend is using HTTPS
- Verify API endpoints are correct

### Debugging Steps

1. **Check application logs**
2. **Verify environment variables**
3. **Test database connection**
4. **Check network connectivity**
5. **Monitor resource usage**

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ALB, Nginx)
- Multiple app instances
- Database connection pooling
- Redis for session storage

### Database Optimization
- Add database indexes
- Implement connection pooling
- Use read replicas for reads
- Optimize slow queries

### Performance Optimization
- Implement caching strategies
- Use CDN for static files
- Optimize image uploads
- Compress responses

---

## 💰 Cost Optimization

### Free Tier Options
- **Railway**: $0/month (limited usage)
- **Render**: $7/month (starter)
- **Heroku**: $7/month (hobby)
- **Vercel**: Free for serverless

### Cost Reduction Tips
- Optimize database queries
- Implement caching
- Use CDN for static files
- Monitor resource usage
- Scale down when not needed

---

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database set up and migrated
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Health check endpoint working
- [ ] Error handling tested
- [ ] Load tested
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] CI/CD pipeline set up

---

**🚀 Your Pet Breeding Backend is now ready for production deployment!**
