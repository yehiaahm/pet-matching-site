# 📡 Admin API Reference

## 🔐 المتطلبات المشتركة

جميع الـ endpoints تتطلب:
```
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

---

## 👥 User Management API

### 1. الحصول على قائمة المستخدمين
```
GET /api/v1/admin/users
```

**Parameters:**
```
page: int (default: 1)
limit: int (default: 10)
search: string (اختياري - بحث في الإيميل والاسم)
role: string (اختياري - USER, BREEDER, ADMIN, MODERATOR, ALL)
isBanned: string (اختياري - true, false, ALL)
```

**Response Success (200):**
```json
{
  "success": true,
  "users": [
    {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "Ahmed",
      "lastName": "Mohamed",
      "phone": "+20123456789",
      "role": "BREEDER",
      "isBanned": false,
      "bannedReason": null,
      "warnings": 0,
      "rating": 4.5,
      "totalMatches": 12,
      "createdAt": "2025-01-15T10:30:00Z",
      "isVerified": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2450,
    "pages": 245
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

### 2. حظر مستخدم
```
POST /api/v1/admin/users/ban
```

**Required:** ADMIN or higher

**Body:**
```json
{
  "userId": "user-123",
  "reason": "محتوى غير لائق"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User banned successfully",
  "user": {
    "id": "user-123",
    "isBanned": true,
    "bannedReason": "محتوى غير لائق",
    "bannedAt": "2025-01-31T15:45:00Z",
    "bannedBy": "admin-001"
  }
}
```

---

### 3. فك حظر مستخدم
```
POST /api/v1/admin/users/unban
```

**Required:** SUPER_ADMIN only

**Body:**
```json
{
  "userId": "user-123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User unbanned successfully",
  "user": {
    "id": "user-123",
    "isBanned": false,
    "warnings": 0
  }
}
```

---

### 4. إضافة تحذير
```
POST /api/v1/admin/users/warning
```

**Required:** ADMIN or higher

**Body:**
```json
{
  "userId": "user-123",
  "reason": "انتهاك سلوك المجتمع"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Warning added successfully",
  "warnings": 2,
  "maxWarnings": 3
}
```

**ملاحظة:** إذا تجاوز التحذيرات الحد الأقصى، يتم حظر المستخدم تلقائياً.

---

### 5. تغيير دور المستخدم
```
POST /api/v1/admin/users/change-role
```

**Required:** SUPER_ADMIN only

**Body:**
```json
{
  "userId": "user-123",
  "newRole": "ADMIN"
}
```

**Valid Roles:**
```
USER
BREEDER
ADMIN
MODERATOR
```

**Response (200):**
```json
{
  "success": true,
  "message": "Role changed successfully",
  "user": {
    "id": "user-123",
    "role": "ADMIN"
  }
}
```

---

### 6. حذف حساب مستخدم
```
DELETE /api/v1/admin/users/:userId
```

**Required:** SUPER_ADMIN only

**Body:**
```json
{
  "reason": "سبب الحذف"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User account deleted successfully"
}
```

---

## 📋 Content Moderation API

### 1. الحصول على البلاغات
```
GET /api/v1/admin/reports
```

**Parameters:**
```
page: int (default: 1)
limit: int (default: 10)
status: string (اختياري - PENDING, REVIEWING, RESOLVED, REJECTED, ALL)
```

**Response (200):**
```json
{
  "success": true,
  "reports": [
    {
      "id": "report-001",
      "reporterUser": {
        "id": "user-456",
        "email": "reporter@example.com",
        "firstName": "Mohammed"
      },
      "reportedUser": {
        "id": "user-789",
        "email": "reported@example.com",
        "firstName": "Ali"
      },
      "reason": "INAPPROPRIATE_CONTENT",
      "contentType": "USER",
      "description": "وصف الانتهاك",
      "status": "PENDING",
      "createdAt": "2025-01-31T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

---

### 2. حل البلاغ
```
POST /api/v1/admin/reports/:reportId/resolve
```

**Required:** ADMIN or higher

**Body:**
```json
{
  "action": "BAN_USER",
  "notes": "تم حظر المستخدم بسبب الانتهاكات المتكررة"
}
```

**Valid Actions:**
```
DISMISS
WARNING
BAN_USER
DELETE_CONTENT
```

**Response (200):**
```json
{
  "success": true,
  "message": "Report resolved",
  "report": {
    "id": "report-001",
    "status": "RESOLVED",
    "resolvedBy": "admin-001",
    "resolutionNotes": "تم حظر المستخدم",
    "resolvedAt": "2025-01-31T15:45:00Z"
  }
}
```

---

## 📊 Dashboard Analytics API

### 1. إحصائيات المنصة
```
GET /api/v1/admin/dashboard/stats
```

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 2450,
      "breeders": 650,
      "banned": 15
    },
    "content": {
      "totalPets": 8230,
      "totalBreedingRequests": 523,
      "pendingReports": 8
    },
    "activity": {
      "messagesLastMonth": 15420,
      "newUsersLastMonth": 187
    }
  }
}
```

---

### 2. بيانات النشاط (آخر 7 أيام)
```
GET /api/v1/admin/dashboard/activity
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-24",
      "users": 12,
      "pets": 8,
      "messages": 142
    },
    {
      "date": "2025-01-25",
      "users": 15,
      "pets": 10,
      "messages": 168
    }
  ]
}
```

---

## ⚙️ System Settings API

### 1. الحصول على الإعدادات
```
GET /api/v1/admin/settings
```

**Required:** SUPER_ADMIN only

**Response (200):**
```json
{
  "success": true,
  "settings": {
    "id": "settings-001",
    "maintenanceMode": false,
    "maintenanceMessage": null,
    "enableUserRegistration": true,
    "enableBreedingRequests": true,
    "enableMessaging": true,
    "maxWarningsBeforeBan": 3,
    "autoDeleteReportsAfter": 90
  }
}
```

---

### 2. تحديث الإعدادات
```
PUT /api/v1/admin/settings
```

**Required:** SUPER_ADMIN only

**Body:**
```json
{
  "maintenanceMode": true,
  "maintenanceMessage": "الموقع قيد الصيانة الآن",
  "enableUserRegistration": true,
  "enableBreedingRequests": true,
  "enableMessaging": true,
  "maxWarningsBeforeBan": 4
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": {
    "id": "settings-001",
    "maintenanceMode": true,
    "maintenanceMessage": "الموقع قيد الصيانة الآن",
    "enableUserRegistration": true,
    "enableBreedingRequests": true,
    "enableMessaging": true,
    "maxWarningsBeforeBan": 4,
    "updatedAt": "2025-01-31T16:00:00Z"
  }
}
```

---

### 3. سجلات التدقيق
```
GET /api/v1/admin/logs
```

**Required:** SUPER_ADMIN only

**Parameters:**
```
page: int (default: 1)
limit: int (default: 20)
action: string (اختياري - BAN_USER, DELETE_CONTENT, etc)
adminId: string (اختياري - معرف المسؤول)
```

**Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "id": "log-001",
      "adminId": "admin-001",
      "action": "BAN_USER",
      "targetUserId": "user-123",
      "description": "Banned user: inappropriate content",
      "changes": {
        "isBanned": true,
        "bannedReason": "inappropriate content"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-01-31T15:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

---

## ⚠️ Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "User ID and reason required"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🧪 اختبار سريع مع cURL

```bash
# احصل على التوكن أولاً
TOKEN="your_admin_token_here"

# 1. احصل على قائمة المستخدمين
curl -X GET "http://localhost:3000/api/v1/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 2. احصل على الإحصائيات
curl -X GET "http://localhost:3000/api/v1/admin/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN"

# 3. احصل على البلاغات
curl -X GET "http://localhost:3000/api/v1/admin/reports?status=PENDING" \
  -H "Authorization: Bearer $TOKEN"

# 4. حظر مستخدم
curl -X POST "http://localhost:3000/api/v1/admin/users/ban" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "reason": "inappropriate content"
  }'
```

---

## 📝 ملاحظات مهمة

### تحديد الدول المسموحة:
- `ADMIN` و أعلى: يمكن حظر، إضافة تحذيرات، مراجعة بلاغات
- `SUPER_ADMIN` فقط: يمكن فك حظر، تغيير أدوار، تحديث الإعدادات

### الحد الأقصى للتحذيرات:
- الإعداد الافتراضي: 3 تحذيرات
- يمكن تعديله من `/admin/settings`
- يتم حظر المستخدم تلقائياً عند تجاوزه

### Soft Delete:
- المستخدمون المحذوفون لا يُحذفون نهائياً
- يتم تعيين `deletedAt` لهم
- يمكن استعادتهم إذا لزم الأمر

---

## 🔄 رموز الحالات

### حالات البلاغ:
```
PENDING    - في انتظار المراجعة
REVIEWING  - قيد المراجعة
RESOLVED   - تم حلها
REJECTED   - تم رفضها
APPEALED   - تحت الاستئناف
```

### أنواع البلاغ:
```
INAPPROPRIATE_CONTENT - محتوى غير لائق
HARASSMENT            - مضايقات
SPAM                  - رسائل عشوائية
FRAUD                 - احتيال
SCAM                  - نصب
DANGEROUS_BEHAVIOR    - سلوك خطر
ANIMAL_ABUSE          - إساءة للحيوانات
FAKE_PROFILE          - ملف مزيف
OTHER                 - أخرى
```

---

**آخر تحديث:** يناير 2025

