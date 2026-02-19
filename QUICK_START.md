# استخدام Online Database بدون تثبيت محلي

## الخطوة 1: إنشء Free Database على Render
1. اذهب إلى https://render.com
2. سجل حساب جديد (مجاني)
3. اضغط "New" → "PostgreSQL"
4. اختر "Free" plan
5. ضع الاسم: "pet-matchmaking"
6. انسخ الـ Database URL

## الخطوة 2: تحديث .env
استبدل هذا السطر في server/.env:
```
DATABASE_URL="postgresql://user:password@host:port/database"
```

بالـ URL اللي نسخته من Render

## الخطوة 3: شغّل Migrations
```bash
cd server
npx prisma migrate dev --name init
```

## الخطوة 4: شغّل Backend
```bash
npm start
```

## الخطوة 5: شغّل Frontend
في terminal جديد:
```bash
npm install
npm run dev
```

## النتيجة:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
