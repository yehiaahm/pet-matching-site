# Production-Ready PostgreSQL Database Design

## 📌 Quick Reference

This document provides a comprehensive guide to the Pet Breeding Matchmaking Platform database design.

---

## 🏗️ Database Architecture Overview

### Total Entities: 10
- **User Management**: Users, RefreshTokens
- **Pet Management**: Pets, HealthRecords, Certifications, GeneticTests  
- **Breeding Operations**: BreedingRequest, Match
- **Communication**: Message
- **Feedback**: Review

### Total Indexes: 50+
Performance optimized with strategic indexing on:
- Foreign keys (all)
- Search fields (email, species, breed, role)
- Filter fields (status, dates, published state)
- Unique constraints

---

## 🔗 Relationship Map

```
User (Primary Entity)
├── Has Many: Pets (ownerId)
├── Has Many: BreedingRequest (initiatorId, targetUserId)
├── Has Many: Message (senderId, recipientId)
├── Has Many: Review (reviewerId, revieweeId)
└── Has Many: RefreshToken (userId)

Pet (Secondary Entity)
├── Belongs To: User (ownerId)
├── Has Many: HealthRecord
├── Has Many: Certification
├── Has Many: GeneticTest
└── Referenced By: BreedingRequest, Match

BreedingRequest (Core Process)
├── References: User (initiator, target)
├── References: Pet (initiatorPet, targetPet)
├── Has One: Match
├── Has Many: Message
└── Has Many: Review
```

---

## 📊 Key Statistics (Expected Scale)

| Metric | Value |
|--------|-------|
| Max Users | 100,000+ |
| Max Pets | 50,000+ |
| Max Breeding Requests/Month | 10,000+ |
| Max Messages/Day | 50,000+ |
| Average Response Time | < 100ms |

---

## 🚀 Getting Started

### 1. Apply Prisma Migrations
```bash
cd server
npx prisma migrate dev --name init
```

### 2. Seed Sample Data (Optional)
```bash
npx prisma db seed
```

### 3. View Database (Visual Explorer)
```bash
npx prisma studio
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

---

## 📈 Performance Recommendations

### Query Optimization Tips:

1. **Always use indexes** for:
   - Filtering by status
   - Searching by species/breed
   - User role-based queries

2. **Use pagination** for:
   - Pet listings (limit 50)
   - Message conversations (limit 20)
   - Breeding requests (limit 25)

3. **Cache frequently accessed data**:
   - User ratings
   - Popular breeds
   - Available pets by species

4. **Monitor slow queries**:
```bash
# In PostgreSQL logs
log_min_duration_statement = 1000  # Log queries > 1 second
```

---

## 🔒 Security Features

- ✅ UUID primary keys (prevents enumeration)
- ✅ Unique email addresses
- ✅ Cascade deletes for data integrity
- ✅ Encrypted password storage (bcrypt)
- ✅ JWT refresh token rotation
- ✅ Role-based access control (USER, BREEDER, ADMIN)

---

## 📚 Table Specifications

### Users (10 Indexes)
- Email verification tracking
- Role-based authorization
- Reputation metrics (rating, totalMatches)
- Soft deletes support (deletedAt)

### Pets (12+ Indexes)
- Species/breed/gender filtering
- Breeding status management
- Documentation tracking (pedigree, registration, microchip)
- Health and certification records

### BreedingRequest (7 Indexes)
- Initiator-Target relationship
- Status workflow (PENDING → COMPLETED)
- Unique constraint to prevent duplicates
- Associated matches and reviews

### Match (6 Indexes)
- One-to-one relationship with BreedingRequest
- Status tracking (PROPOSED → COMPLETED)
- Offspring tracking

### Message (7 Indexes)
- Conversation threading
- Read status tracking
- Related breeding request context

### Review (5 Indexes)
- Reviewee reputation impact
- Star rating filtering
- One review per request per reviewer

---

## ⚙️ Maintenance Tasks

### Daily
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Monitor slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### Weekly
```bash
# Run VACUUM ANALYZE
VACUUM ANALYZE;

# Reindex large tables
REINDEX TABLE breeding_requests;
REINDEX TABLE messages;
```

### Monthly
```bash
# Full backup
pg_dump database_name > backup.sql

# Monitor unused indexes
SELECT idx_scan FROM pg_stat_user_indexes WHERE idx_scan < 100;
```

---

## 🔄 Data Migration Path

```
Phase 1: Schema Creation (✓ Done)
├── Create all tables
├── Add indexes
└── Add constraints

Phase 2: Sample Data Loading
├── Create admin users
├── Import test users
└── Create sample pets

Phase 3: Verification
├── Test all relationships
├── Verify constraints
└── Check index effectiveness

Phase 4: Production Deployment
├── Enable automated backups
├── Set up monitoring
└── Configure logging
```

---

## 🛠️ Useful Commands

### Prisma Commands
```bash
# Generate client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# View data
npx prisma studio

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Check schema
npx prisma validate
```

### PostgreSQL Commands
```sql
-- Connect to database
psql -U postgres -d pet_matchmaking

-- List all tables
\dt

-- Describe table
\d table_name

-- List indexes
\di

-- Check database size
SELECT pg_size_pretty(pg_database_size('pet_matchmaking'));

-- Analyze table
ANALYZE table_name;

-- Create backup
pg_dump pet_matchmaking > backup.sql

-- Restore backup
psql pet_matchmaking < backup.sql
```

---

## 📊 Schema Statistics

| Entity | Fields | Indexes | Relations |
|--------|--------|---------|-----------|
| User | 15 | 6 | 5 |
| Pet | 25 | 12 | 5 |
| BreedingRequest | 10 | 7 | 6 |
| Match | 8 | 6 | 2 |
| Message | 8 | 7 | 3 |
| Review | 7 | 5 | 3 |
| HealthRecord | 8 | 3 | 1 |
| Certification | 9 | 3 | 1 |
| GeneticTest | 8 | 3 | 1 |
| RefreshToken | 7 | 3 | 1 |

---

## 🎯 Common Queries

### Find Available Pets by Species
```javascript
const pets = await prisma.pet.findMany({
  where: {
    species: 'Dog',
    breedingStatus: 'AVAILABLE',
    isPublished: true
  },
  include: { owner: true },
  orderBy: { createdAt: 'desc' }
});
```

### Get Breeding Requests for User
```javascript
const requests = await prisma.breedingRequest.findMany({
  where: {
    targetUserId: userId,
    status: 'PENDING'
  },
  include: {
    initiator: true,
    initiatorPet: true,
    targetPet: true
  }
});
```

### Get User Reviews
```javascript
const reviews = await prisma.review.findMany({
  where: { revieweeId: userId },
  include: {
    reviewer: true,
    breedingRequest: true
  },
  orderBy: { createdAt: 'desc' }
});
```

---

## 🔐 Backup & Disaster Recovery

### Automated Backup (Recommended)
```bash
# Using pg_dump in cron job
0 2 * * * pg_dump pet_matchmaking | gzip > /backups/pet_matchmaking_$(date +\%Y\%m\%d).sql.gz
```

### Restore from Backup
```bash
# Extract and restore
gunzip < backup.sql.gz | psql pet_matchmaking
```

---

## 📝 Enums Reference

| Enum | Values |
|------|--------|
| Role | USER, BREEDER, ADMIN |
| Gender | MALE, FEMALE, UNKNOWN |
| BreedingStatus | AVAILABLE, NOT_AVAILABLE, RETIRED |
| RequestStatus | PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED |
| MatchStatus | PROPOSED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED |
| MessageStatus | SENT, DELIVERED, READ |
| CertificationType | PEDIGREE, GENETIC_TEST, HEALTH_CHECK, VACCINATION, MICROCHIP, REGISTRATION, OTHER |

---

## 📞 Support & Documentation

- **Prisma Docs**: https://www.prisma.io/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Database Design**: See `DATABASE_DESIGN.md`
- **Indexes Guide**: See `INDEXES.sql`

---

**Last Updated**: January 10, 2026  
**Version**: 1.0 (Production Ready)
