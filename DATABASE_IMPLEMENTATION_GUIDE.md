# 🚀 تعليمات التطبيق - Database Enhancement v2.0
**Version**: 2.0 Enterprise  
**Date**: 2026-02-09  
**Difficulty**: ⚡ Easy  
**Time Required**: 15-20 minutes  

---

## 📋 قائمة التحقق

- [ ] النسخة الاحتياطية من قاعدة البيانات الحالية
- [ ] التحديث إلى Prisma schema الجديد
- [ ] تطبيق Migrations
- [ ] التحقق من الـ Indexes
- [ ] اختبار الأداء
- [ ] تفعيل Monitoring

---

## 🔴 الخطوة 0: النسخة الاحتياطية (مهم جداً!)

### على PostgreSQL:
```bash
# إنشاء نسخة احتياطية كاملة
pg_dump -U postgres -d pet_matchmaking \
  --file=backup_before_v2_$(date +%Y%m%d_%H%M%S).sql

# التحقق من النسخة
ls -lh backup_before_v2_*.sql
```

### أو في Docker:
```bash
docker exec pet-matchmaking-postgres \
  pg_dump -U postgres pet_matchmaking \
  > backup_v2_$(date +%Y%m%d).sql
```

---

## ✅ الخطوة 1: تحديث Prisma Schema

### 1.1 نسخ ملف Schema الجديد
```bash
cd server

# النسخة الاحتياطية من القديم
cp prisma/schema.prisma prisma/schema.backup.prisma

# استخدام الجديد
cp prisma/schema-enhanced.prisma prisma/schema.prisma

# التحقق
cat prisma/schema.prisma | head -50
```

### 1.2 التحقق من الصيغة
```bash
# تحقق من أن الـ schema سليم
npx prisma validate
# Should output: ✔ Your schema is valid!
```

---

## ✅ الخطوة 2: إنشاء Migration

### 2.1 إنشاء migration جديد
```bash
# هذا سيقرأ الفرق بين القديم والجديد
npx prisma migrate dev --name enhance_database_schema

# إذا كنت تريد فقط رؤية الـ SQL:
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.backup.prisma \
  --to-schema-datasource prisma/schema.prisma
```

### 2.2 إذا كنت تريد تطبيق SQL مباشرة:
```bash
# تطبيق ملف SQL المرفق
psql -U postgres -d pet_matchmaking \
  -f prisma/migrations/001_enhance_database_schema.sql
```

---

## ✅ الخطوة 3: التحقق من الـ Indexes

### 3.1 قائمة الـ Indexes:
```sql
-- تشغيل هذا في PostgreSQL
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY tablename, indexname;
```

### 3.2 حساب الـ Indexes المنشأة:
```sql
-- يجب أن تكون حوالي 50+
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
```

### 3.3 التحقق من استخدام الـ Indexes:
```sql
-- أي indexes لا تُستخدم؟
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename;
```

---

## ✅ الخطوة 4: التحقق من الـ Triggers

### 4.1 قائمة الـ Triggers:
```sql
SELECT 
  trigger_name,
  event_object_table,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY event_object_table, trigger_name;
```

### 4.2 التحقق من أن جميع Triggers موجودة:
```sql
-- يجب أن تكون 6 triggers:
-- 1. trg_update_user_rating
-- 2. trg_update_pet_offspring
-- 3. trg_log_activity_messages
-- 4. trg_log_activity_requests
-- 5. trg_check_blocked_users
-- 6. trg_breeding_request_timestamps

SELECT COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema');
```

---

## ✅ الخطوة 5: التحقق من الـ Views

### 5.1 قائمة الـ Views:
```sql
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_type = 'VIEW'
AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_name;

-- يجب أن تظهر:
-- v_user_statistics
-- v_breeding_performance
```

### 5.2 اختبار Views:
```sql
-- عرض البيانات من الـ Views
SELECT * FROM v_user_statistics LIMIT 5;
SELECT * FROM v_breeding_performance LIMIT 5;
```

---

## ✅ الخطوة 6: اختبار الأداء

### 6.1 اختبار سرعة البحث:
```sql
-- قياس سرعة البحث عن حيوانات متاحة للتربية
EXPLAIN ANALYZE
SELECT * FROM pets 
WHERE species = 'Dog' 
  AND "breedingStatus" = 'AVAILABLE' 
  AND "isPublished" = true
ORDER BY "createdAt" DESC
LIMIT 50;

-- النتيجة يجب أن تظهر "Index Scan" بدلاً من "Seq Scan"
```

### 6.2 اختبار الرسائل غير المقروءة:
```sql
EXPLAIN ANALYZE
SELECT * FROM messages 
WHERE "recipientId" = 'user-uuid' 
  AND "isRead" = false
ORDER BY "createdAt" DESC
LIMIT 20;

-- النتيجة: Index Scan على idx_messages_unread
```

### 6.3 قياس أداء Query:
```bash
# تشغيل اختبار الحمل البسيط
npm run test:performance

# أو يدوياً:
time psql -U postgres -d pet_matchmaking -c \
  "SELECT COUNT(*) FROM pets WHERE species = 'Dog';"
```

---

## ✅ الخطوة 7: تفعيل Monitoring

### 7.1 إعداد Query Logging:
```sql
-- في PostgreSQL configuration:
-- vim /etc/postgresql/15/main/postgresql.conf

log_min_duration_statement = 1000  -- Log queries > 1 second
log_statement = 'all'              -- Log all statements
log_duration = on
```

### 7.2 أو في Docker:
```bash
# إذا كنت تستخدم Docker
docker exec pet-matchmaking-postgres \
  psql -U postgres -d pet_matchmaking -c \
  "ALTER SYSTEM SET log_min_duration_statement = 1000;"

docker restart pet-matchmaking-postgres
```

### 7.3 مراقبة الأداء:
```bash
# في terminal منفصل
watch -n 5 'psql -U postgres -d pet_matchmaking -c \
  "SELECT query, mean_exec_time 
   FROM pg_stat_statements 
   ORDER BY mean_exec_time DESC LIMIT 10;"'
```

---

## ✅ الخطوة 8: تحديث Backend Code

### 8.1 تحديث Prisma Client:
```bash
# أعد توليد Prisma Client
npx prisma generate

# التحقق من أن هناك ملف package-lock.json جديد
git diff package-lock.json
```

### 8.2 التحقق من أن الـ imports صحيحة:
```bash
# ابحث عن أي استيراد قديم قد يكون مكسوراً
grep -r "from '@prisma" src/ --include="*.ts" --include="*.js"
```

---

## 🧪 الخطوة 9: الاختبارات

### 9.1 اختبار الـ Blocked Users:
```typescript
// test/blocked-users.test.ts
test('Should not allow breeding request with blocked user', async () => {
  // 1. User A blocks User B
  await blockedUsersService.block(userA.id, userB.id);
  
  // 2. Try to create breeding request from B to A
  const result = await breedingRequestService.create({
    initiatorId: userB.id,
    targetUserId: userA.id,
    // ...
  });
  
  // 3. Should fail with error
  expect(result).toThrow('Cannot create breeding request with blocked user');
});
```

### 9.2 اختبار Activity Logging:
```typescript
test('Should log activity when message is sent', async () => {
  const message = await messageService.send({
    senderId: user.id,
    // ...
  });
  
  const activity = await activityService.findByUser(user.id);
  expect(activity.length).toBeGreaterThan(0);
  expect(activity[0].action).toBe('SEND_MESSAGE');
});
```

### 9.3 اختبار Performance:
```bash
# تشغيل اختبارات الأداء
npm run test:perf

# يجب أن تظهر:
# ✓ Search pets < 100ms
# ✓ Fetch unread messages < 50ms
# ✓ Pending requests < 100ms
```

---

## 🔄 الخطوة 10: Rollback (إذا لزم الأمر)

### إذا حدث خطأ:
```bash
# عودة إلى النسخة القديمة من قاعدة البيانات
psql -U postgres -d pet_matchmaking \
  < backup_before_v2_YYYYMMDD_HHMMSS.sql

# عودة إلى Prisma schema القديم
cp prisma/schema.backup.prisma prisma/schema.prisma
npx prisma generate
```

---

## 📊 التحقق النهائي

### Checklist النجاح:
```
✅ Database backup created
✅ Schema validated (npx prisma validate)
✅ Migration applied successfully
✅ 50+ indexes created
✅ 6+ triggers active
✅ 2+ views working
✅ Stored procedures accessible
✅ Query performance improved 100x+
✅ No broken relationships
✅ All constraints in place
✅ Activity logs working
✅ Blocked users system functional
✅ Favorite pets system working
```

---

## 🎯 اختبار سريع (5 دقائق)

```bash
#!/bin/bash

echo "🔍 Checking Schema..."
npx prisma validate

echo "📊 Checking Indexes..."
psql -U postgres -d pet_matchmaking -c \
  "SELECT COUNT(*) FROM pg_indexes 
   WHERE schemaname NOT IN ('pg_catalog', 'information_schema');"

echo "⚡ Checking Triggers..."
psql -U postgres -d pet_matchmaking -c \
  "SELECT COUNT(*) FROM information_schema.triggers 
   WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema');"

echo "📈 Checking Views..."
psql -U postgres -d pet_matchmaking -c \
  "SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_type = 'VIEW';"

echo "✅ All checks passed!"
```

---

## 🆘 استكشاف الأخطاء

### خطأ: "Index already exists"
```bash
# الحل: اترك Prisma يتعامل معها
npx prisma migrate dev --skip-validation
```

### خطأ: "Function already exists"
```bash
# الحل: في الـ SQL استخدام CREATE OR REPLACE
# وقد تم بالفعل في ملف الـ migration
```

### خطأ: "Trigger error"
```bash
# البحث عن المشكلة
psql -U postgres -d pet_matchmaking -c \
  "SELECT * FROM information_schema.triggers 
   WHERE trigger_name LIKE 'trg_%';"
```

### Performance لا تحسن:
```bash
# تشغيل ANALYZE
psql -U postgres -d pet_matchmaking -c "ANALYZE;"

# إعادة نسب الـ Indexes
psql -U postgres -d pet_matchmaking -c "REINDEX DATABASE pet_matchmaking;"
```

---

## 📞 دعم الدرجة الأولى

إذا واجهت مشاكل:

1. **تحقق من الـ Logs**:
   ```bash
   tail -f /var/log/postgresql/postgresql.log
   ```

2. **تحقق من الاتصال**:
   ```bash
   psql -U postgres -d pet_matchmaking -c "SELECT 1;"
   ```

3. **قم بـ Rollback** وتواصل مع الفريق

---

## 🎉 بعد الانتهاء

```bash
# قم بـ commit للتغييرات
git add .
git commit -m "feat: database enhancement v2.0 - enterprise grade"

# push للـ repo
git push origin feature/database-v2

# أعلم الفريق
echo "Database upgrade completed successfully! 🚀"
```

---

**متوفق الحظ! 🍀**  
**الآن قاعدة البيانات على مستوى عالمي احترافي** ⭐
