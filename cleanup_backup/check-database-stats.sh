#!/bin/bash

# Script لعرض إحصائيات قاعدة البيانات

echo "🔍 جاري الاتصال بقاعدة البيانات..."
echo ""

cd "$(dirname "$0")/server"

# عرض عدد المستخدمين
echo "👥 إحصائيات المستخدمين:"
npx prisma db execute --stdin <<'SQL'
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN role = 'BREEDER' THEN 1 ELSE 0 END) as breeders,
  SUM(CASE WHEN role = 'USER' THEN 1 ELSE 0 END) as users
FROM users;
SQL

echo ""

# عرض عدد الحيوانات
echo "🐾 إحصائيات الحيوانات:"
npx prisma db execute --stdin <<'SQL'
SELECT 
  species,
  COUNT(*) as count,
  SUM(CASE WHEN "breedingStatus" = 'AVAILABLE' THEN 1 ELSE 0 END) as available_for_breeding
FROM pets
GROUP BY species
ORDER BY species;
SQL

echo ""
echo "✅ تم!"
