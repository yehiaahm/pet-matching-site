# 🗄️ Prisma Studio Setup Guide

## 🚨 **Problem Solved**
Prisma Studio couldn't find the database URL because it wasn't properly configured for local development.

## ✅ **Solution Applied**

### 1. **Direct Command (Immediate Fix)**
```bash
npx prisma studio --url "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"
```

### 2. **Environment File (Permanent Fix)**
Created `.env.local` file with proper database URL:
```env
DATABASE_URL="postgresql://postgres:yehia.hema195200@localhost:5432/petmat"
```

---

## 🔧 **How to Run Prisma Studio**

### **Option 1: Direct Command**
```bash
cd "D:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
npx prisma studio --url "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"
```

### **Option 2: Using Environment File**
```bash
cd "D:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
npx prisma studio
```

### **Option 3: With Browser Auto-Open**
```bash
cd "D:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
npx prisma studio --browser
```

---

## 📋 **Database Connection Details**

| Property | Value |
|----------|--------|
| **Host** | localhost |
| **Port** | 5432 |
| **Database** | petmat |
| **User** | postgres |
| **Password** | yehia.hema195200 |
| **URL** | `postgresql://postgres:yehia.hema195200@localhost:5432/petmat` |

---

## 🗄️ **Prisma Studio Features**

Once running, you can:

### **📊 Database Management**
- ✅ View all tables and records
- ✅ Add, edit, delete records
- ✅ Filter and search data
- ✅ Sort and paginate results

### **🐾 Pet Management**
- ✅ View all pets (`pets` table)
- ✅ Manage users (`users` table)
- ✅ Handle breeding requests (`breeding_requests` table)
- ✅ Review matches (`matches` table)
- ✅ Manage messages (`messages` table)

### **🔧 Advanced Features**
- ✅ Relationship visualization
- ✅ Data export
- ✅ Bulk operations
- ✅ Query builder

---

## 🚀 **Quick Start Commands**

```bash
# 1. Navigate to project directory
cd "D:\PetMat_Project\Pet Breeding Matchmaking Website (3)"

# 2. Start Prisma Studio
npx prisma studio

# 3. Or with explicit URL
npx prisma studio --url "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"

# 4. Generate Prisma Client (if needed)
npx prisma generate

# 5. Run database migrations
npx prisma migrate dev
```

---

## 🛠️ **Troubleshooting**

### **If Studio doesn't open:**
```bash
# Try with specific browser
npx prisma studio --browser chrome

# Or specify port
npx prisma studio --port 5555
```

### **If database connection fails:**
1. **Check PostgreSQL is running:**
   ```bash
   pg_ctl status
   ```

2. **Verify database exists:**
   ```bash
   psql -U postgres -l
   ```

3. **Test connection:**
   ```bash
   psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"
   ```

### **If permission denied:**
```bash
# Create database if it doesn't exist
createdb -U postgres petmat

# Grant permissions
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE petmat TO postgres;"
```

---

## 📱 **Accessing Prisma Studio**

Once started, Prisma Studio will be available at:
- **Default URL**: http://localhost:5555
- **Alternative**: http://localhost:3000 (if 5555 is occupied)

---

## 🎯 **Next Steps**

1. **Open Prisma Studio** using one of the commands above
2. **Explore your database** tables and relationships
3. **Add test data** if needed for development
4. **Verify schema** matches your application models

---

## 🎉 **Status: PRISMA STUDIO READY** ✅

You can now access and manage your PetMat database through Prisma Studio!

**Database URL**: `postgresql://postgres:yehia.hema195200@localhost:5432/petmat`  
**Studio URL**: http://localhost:5555

**Happy database management!** 🗄️✨
