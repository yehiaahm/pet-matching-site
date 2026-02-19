# 🏗️ معمارية النظام

```
┌─────────────────────────────────────────────────────────────┐
│                   المتصفح (Vite React)                      │
│                   http://localhost:5173                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Frontend React Components                           │  │
│  │ ┌────────────────────────────────────────────────┐  │  │
│  │ │ - VerificationBadge.tsx                        │  │  │
│  │ │ - InstantAlerts.tsx                            │  │  │
│  │ │ - FeaturesShowcasePage.tsx                     │  │  │
│  │ │ - AIMatchingPage.tsx                           │  │  │
│  │ └────────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │ WebSocket (socket.io)          HTTP (Fetch/REST)    │  │
│  └────────────┬─────────────────────┬─────────────────┘  │
└───────────────┼─────────────────────┼──────────────────────┘
                │                     │
        ┌───────┴──────┐      ┌───────┴──────┐
        │              │      │              │
   ┌────▼──────────────▼──┐  ┌▼────────────────────┐
   │  Node.js Backend     │  │  FastAPI AI Service │
   │  (Express)           │  │  (Python)           │
   │  :5000               │  │  :8001              │
   ├──────────────────────┤  ├─────────────────────┤
   │                      │  │                     │
   │ Routes:              │  │ Endpoints:          │
   │ • /auth              │  │ • POST /match-score │
   │ • /pets              │  │ • POST /train       │
   │ • /matches           │  │ • POST /recommend   │
   │ • /ai-matches ◄──┐   │  │ • GET /health       │
   │ • /verification  │   │  │                     │
   │ • /analytics     │   │  │ Model:              │
   │                  │   │  │ LogisticRegression  │
   │ Services:        │   │  │                     │
   │ • Socket.io init │───┼──┼─ Features:          │
   │ • Scheduler      │   │  │ • Breed compat      │
   │ • Notifications  │   │  │ • Age compat        │
   │ • Verification   │   │  │ • Health            │
   │                  │   │  │ • Genetic           │
   └──────────┬───────┘   └──┼─ History            │
              │              │ • Temperament       │
              │              │ • Distance          │
              │              └─────────────────────┘
              │
        ┌─────▼──────────────┐
        │   PostgreSQL DB    │
        │   (Prisma ORM)     │
        ├────────────────────┤
        │ Tables:            │
        │ • users            │
        │ • pets             │
        │ • matches          │
        │ • notifications    │
        │ • breeding_requests│
        │ • health_records   │
        │ • messages         │
        └────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           Smart Contracts (Ethereum/Sepolia)                │
│   contracts/BreedingAgreement.sol                           │
│   - Party A & B signatures                                  │
│   - Document hashes (health, genetics)                      │
│   - Moderator approval                                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 تدفق البيانات (Data Flow)

### 1. توصيات المطابقة (AI Matching)
```
User Request
    ↓
Frontend (AIMatchingPage)
    ↓ HTTP GET /api/v1/ai-matches/recommendations/:petId
    ↓
Backend Controller
    ↓ (fetch pet + candidates from DB)
    ↓ HTTP POST → AI Service
    ↓
AI Service
    ├─ Feature Engineering (breed, age, health...)
    ├─ Run Model (LogisticRegression)
    └─ Return scores + explanations
    ↓
Backend (scores + metrics)
    ↓
Frontend (display badges + recommendations)
    ↓
User
```

### 2. التنبيهات الفورية (Real-time Alerts)
```
Cron Job (Daily 08:00 UTC)
    ↓
Scheduler Service
    ├─ Query pets in DB
    ├─ Calculate breeding windows
    └─ Create notification
    ↓
Notification Service
    ├─ Save to DB
    ├─ Emit Socket.io event
    └─ Send Email (fallback)
    ↓
Socket.io Server
    ↓
Frontend (InstantAlerts component)
    ↓
User sees alert in real-time!
```

### 3. شارات التحقق (Verification Badges)
```
Admin/System
    ↓
GET /api/v1/verification/:userId
    ↓
Backend Controller
    ├─ Count breeding requests
    ├─ Count successful matches
    ├─ Get average rating
    └─ Calculate complaints rate
    ↓
Determine Badge Level
    ├─ Platinum: >85% success, 4.8+ rating
    ├─ Gold: >75% success, 4.5+ rating
    ├─ Silver: >60% success, 4.2+ rating
    └─ Bronze: >45% success, 4.0+ rating
    ↓
Frontend (VerificationBadge component)
    ↓
Display badge with metrics
```

## 🔌 الاتصالات (Connections)

### HTTP/REST APIs
- Frontend ↔ Backend: `/api/v1/*`
- Backend ↔ AI Service: `http://localhost:8001`

### WebSocket (Socket.io)
- Frontend connects on login
- Backend emits `instantAlert` events
- Client receives notifications in real-time

### Database
- Prisma ORM ↔ PostgreSQL
- Connection pool for scaling

## 🚀 النشر (Deployment)

### Development
- Windows: `START_ALL.bat`
- Linux/Mac: `./START_ALL.sh`

### Production
- Backend: PM2 + Node
- AI Service: Uvicorn + Gunicorn
- Database: RDS PostgreSQL
- Frontend: Nginx/CDN
- Smart Contracts: Ethereum Network

```
                    ┌──────────────────┐
                    │  CDN/Nginx       │
                    │  Static Assets   │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼────┐          ┌────▼─────┐         ┌───▼────┐
    │ Backend │          │Frontend   │         │AI Svc  │
    │ PM2     │          │ Nginx     │         │Gunicorn│
    └────┬────┘          └─────┬─────┘         └───┬────┘
         │                     │                   │
         └─────────────────────┼───────────────────┘
                               │
                         ┌─────▼──────┐
                         │ RDS (DB)   │
                         │ PostgreSQL │
                         └────────────┘
```
