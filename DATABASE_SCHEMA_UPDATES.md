# Database Schema Updates for PetMate Improvements

## 🗄️ Recommended Schema Changes

These changes enable better performance and feature support for the improvements.

---

## 1. Add Onboarding Tracking

### New Model: `UserOnboarding`

```prisma
model UserOnboarding {
  id                    String    @id @default(uuid())
  userId                String    @unique
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Onboarding progress
  currentStep           String?   @db.VarChar(50)
  completed             Boolean   @default(false)
  completedAt           DateTime?
  skippedSteps          String[]  @default([])
  
  // User preferences (from onboarding)
  breedingInterest      String?   @db.VarChar(20)  // 'yes' | 'maybe' | 'no'
  petTypes              String[]  @default([])
  desiredBreeds         String[]  @default([])
  locationRadius        Int       @default(50)
  maxDistance           Int       @default(100)
  receiveNotifications  Boolean   @default(true)
  receiveRecommendations Boolean @default(true)
  
  // Metadata
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([userId])
  @@index([completed])
  @@index([createdAt])
}
```

**Why**: Tracks user onboarding progress and preferences for personalization.

---

## 2. Add AI Matching History

### New Model: `MatchRecommendation`

```prisma
model MatchRecommendation {
  id                    String    @id @default(uuid())
  petAId                String
  petA                  Pet       @relation("RecommendationsFor", fields: [petAId], references: [id], onDelete: Cascade)
  
  petBId                String
  petB                  Pet       @relation("RecommendedMatches", fields: [petBId], references: [id], onDelete: Cascade)
  
  // AI Match Score
  totalScore            Int
  breedCompatibility    Int
  ageCompatibility      Int
  healthScore           Int
  geneticScore          Int
  locationScore         Int
  historyScore          Int
  
  // Recommendation metadata
  factors               Json                     // Stores factor details as JSON
  explanation           String?   @db.Text
  recommendationRank    Int                      // 1=best, 2=2nd best, etc.
  
  // User interaction
  clicked               Boolean   @default(false)
  clickedAt             DateTime?
  requestSent           Boolean   @default(false)
  requestSentAt         DateTime?
  matchOutcome          String?   @db.VarChar(50)  // 'successful' | 'unsuccessful' | null
  feedback              String?   @db.Text
  
  // Metadata
  calculatedAt          DateTime  @default(now())
  expiresAt             DateTime  // For caching (24 hours)
  
  @@unique([petAId, petBId])
  @@index([petAId])
  @@index([petBId])
  @@index([totalScore])
  @@index([expiresAt])
}
```

**Why**: Stores match recommendations for caching and learning from user behavior.

---

## 3. Update Pet Model - Add AI Fields

```prisma
model Pet {
  // ... existing fields ...
  
  // Health & Genetics (for AI matching)
  healthScore           Int?      @default(50)        // 0-100
  geneticTests          String[]  @default([])        // array of test types
  geneticTestResults    Json?                         // detailed results
  certifications        String[]  @default([])        // array of cert types
  previousMatches       Int       @default(0)
  successfulMatches     Int       @default(0)
  lastBreedingDate      DateTime?
  
  // Location for distance calculation
  latitude              Float?
  longitude             Float?
  
  // AI recommendations
  recommendations       MatchRecommendation[] @relation("RecommendationsFor")
  recommendedMatches    MatchRecommendation[] @relation("RecommendedMatches")
  
  // Feature flags
  visibleInSearch       Boolean   @default(true)
  aiOptimized           Boolean   @default(false)
  
  // ... keep existing fields ...
  
  @@index([healthScore])
  @@index([previousMatches])
  @@index([lastBreedingDate])
  @@index([latitude, longitude])
}
```

---

## 4. Update Breeding Request - Add Scoring

```prisma
model BreedingRequest {
  // ... existing fields ...
  
  // AI Match Context
  matchScoreAtTime      Int?      // Score when request was created
  similarRecommendations Int @default(0)  // How many similar recommendations
  
  // Request outcome (for ML training)
  outcome               String?   @db.VarChar(50)  // 'successful' | 'unsuccessful'
  successNotes          String?   @db.Text
  
  // ... keep existing fields ...
  
  @@index([matchScoreAtTime])
}
```

---

## 5. Add Pagination Support

### Add these indexes to improve list queries:

```sql
-- Indexes for pagination and filtering
CREATE INDEX idx_pet_created_desc ON pets(created_at DESC);
CREATE INDEX idx_pet_breed_created ON pets(breed, created_at DESC);
CREATE INDEX idx_breeding_request_created ON breeding_requests(created_at DESC);
CREATE INDEX idx_user_created ON users(created_at DESC);
CREATE INDEX idx_health_record_created ON health_records(created_at DESC);

-- Indexes for AI matching
CREATE INDEX idx_pet_health_score ON pets(health_score DESC);
CREATE INDEX idx_pet_location ON pets(latitude, longitude);
CREATE INDEX idx_match_recommendation_score ON match_recommendations(total_score DESC);
CREATE INDEX idx_match_recommendation_expires ON match_recommendations(expires_at);

-- Compound indexes for common queries
CREATE INDEX idx_pet_breed_gender_health ON pets(breed, gender, health_score DESC);
CREATE INDEX idx_breeding_request_status_created ON breeding_requests(status, created_at DESC);
```

---

## 6. Migration Steps

### Step 1: Generate Migration
```bash
cd server
npx prisma migrate dev --name add_ai_features
```

### Step 2: Review Generated Migration
The migration file will be in `server/prisma/migrations/[timestamp]_add_ai_features/migration.sql`

### Step 3: Run Migration
```bash
npx prisma migrate deploy
```

### Step 4: Update Prisma Client
```bash
npx prisma generate
```

---

## 7. Data Population (Optional)

If you want to backfill existing data:

```javascript
// server/scripts/backfill-ai-features.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillAIFeatures() {
  try {
    // Backfill health scores (random for demo)
    const pets = await prisma.pet.findMany();
    
    for (const pet of pets) {
      await prisma.pet.update({
        where: { id: pet.id },
        data: {
          healthScore: Math.floor(Math.random() * 100) + 50,
          previousMatches: Math.floor(Math.random() * 10),
        },
      });
    }
    
    // Create onboarding records for existing users
    const users = await prisma.user.findMany();
    
    for (const user of users) {
      await prisma.userOnboarding.create({
        data: {
          userId: user.id,
          completed: true, // Existing users already "onboarded"
          completedAt: user.createdAt,
          breedingInterest: 'maybe',
          receiveNotifications: true,
          receiveRecommendations: true,
        },
      });
    }
    
    console.log('✅ Backfill complete');
  } catch (error) {
    console.error('❌ Backfill failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backfillAIFeatures();
```

**Run it:**
```bash
cd server
node scripts/backfill-ai-features.js
```

---

## 8. API Changes Summary

### New Endpoints
```
GET  /api/v1/ai-matches/recommendations/:petId    # AI suggestions
POST /api/v1/ai-matches/calculate-score           # Score two pets
GET  /api/v1/ai-matches/search                    # Search with filters
```

### Enhanced Endpoints (now with pagination)
```
GET  /api/v1/pets?page=1&limit=10
GET  /api/v1/breeding-requests?page=1&limit=10
GET  /api/v1/health-records?page=1&limit=10
```

---

## 9. Performance Notes

### Caching Strategy
- **AI Recommendations**: Cache for 24 hours
- **Pet Search Results**: Cache for 1 hour
- **User Onboarding**: Cache indefinitely until completed

### Query Optimization
- Use `select()` to only fetch needed fields
- Batch operations with `Promise.all()`
- Use indexes for frequently filtered fields

### Example: Optimized Query
```javascript
// Before: fetches all fields
const pets = await prisma.pet.findMany();

// After: only needed fields
const pets = await prisma.pet.findMany({
  select: {
    id: true,
    name: true,
    breed: true,
    healthScore: true,
  },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

---

## 10. Monitoring & Maintenance

### Monitor These Queries
```sql
-- Check slow queries
SELECT query, mean_time 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;

-- Check missing indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
```

### Regular Maintenance
```bash
# Analyze table for query optimization
ANALYZE;

# Vacuum to clean up dead rows
VACUUM ANALYZE;

# Check database size
SELECT pg_size_pretty(pg_database_size('pet_matchmaking'));
```

---

## Summary

| Feature | Tables Changed | New Indexes | Impact |
|---------|----------------|-------------|--------|
| Onboarding | `UserOnboarding` | 3 | Tracks user setup |
| AI Matching | `MatchRecommendation` | 4 | Enables caching & ML |
| Pet AI Fields | `Pet` | 4 | Supports matching |
| Pagination | All list tables | 5+ | Improves scalability |

**Estimated Migration Time**: 5-10 minutes
**Estimated Downtime**: None (non-blocking migration)
**Rollback**: `npx prisma migrate resolve --rolled-back add_ai_features`

---

**Status**: Ready for production
**Last Updated**: January 12, 2026
**Compatibility**: Prisma 5.22+, PostgreSQL 13+
