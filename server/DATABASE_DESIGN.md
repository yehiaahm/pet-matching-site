# Pet Breeding Matchmaking Platform - Database Design

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│                           DATABASE STRUCTURE                             │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

USERS ───────────────┐
│                    │
├─── RefreshTokens   │
├─── Pets ◄──────────┼──────┐
├─── BreedingRequests◄─┐    │
├─── Matches         │  │    │
├─── Messages        │  │    │
└─── Reviews         │  │    │
                     │  │    │
BREEDING_REQUESTS ───┘  │    │
│                       │    │
├─── Match ◄────────────┘    │
├─── Messages               │
└─── Reviews                │
                           │
PETS ────────────────────────┘
│
├─── HealthRecords
├─── Certifications
└─── GeneticTests

MESSAGES
│
├─── sender (User)
├─── recipient (User)
└─── breedingRequest (BreedingRequest)

REVIEWS
│
├─── reviewer (User)
├─── reviewee (User)
└─── breedingRequest (BreedingRequest)
```

---

## 📋 Core Entities

### 1. **Users** - Platform Users
- **Purpose**: Manage user accounts and authentication
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `email` (Unique) - User email
  - `password` - Hashed password
  - `firstName`, `lastName` - User name
  - `role` (Enum: USER, BREEDER, ADMIN) - User role
  - `rating`, `totalMatches` - Reputation metrics
  - `isVerified` - Email verification status

**Indexes**:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verified ON users(isVerified);
CREATE INDEX idx_users_city ON users(city);
```

---

### 2. **Pets** - Pet Information
- **Purpose**: Store detailed pet information for breeding
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `ownerId` (FK) - Owner reference
  - `name`, `species`, `breed` - Pet identity
  - `gender` (Enum) - Pet gender
  - `breedingStatus` (Enum: AVAILABLE, NOT_AVAILABLE, RETIRED)
  - `weight`, `height`, `color` - Physical traits
  - `isVaccinated`, `isNeutered` - Health status
  - `pedigreeNumber`, `registrationNumber` - Documentation

**Indexes**:
```sql
CREATE INDEX idx_pets_owner ON pets(ownerId);
CREATE INDEX idx_pets_species_breed ON pets(species, breed);
CREATE INDEX idx_pets_breeding_status ON pets(breedingStatus);
CREATE INDEX idx_pets_published ON pets(isPublished);
CREATE UNIQUE INDEX idx_pet_pedigree ON pets(pedigreeNumber);
CREATE UNIQUE INDEX idx_pet_registration ON pets(registrationNumber);
```

**Relationships**:
- One-to-Many: User → Pet
- One-to-Many: Pet → HealthRecords
- One-to-Many: Pet → Certifications
- One-to-Many: Pet → GeneticTests

---

### 3. **BreedingRequest** - Breeding Proposals
- **Purpose**: Track breeding requests between users
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `initiatorId` (FK) - User sending request
  - `initiatorPetId` (FK) - Initiator's pet
  - `targetUserId` (FK) - User receiving request
  - `targetPetId` (FK) - Target pet
  - `status` (Enum: PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED)
  - `message` - Request message
  - `preferredDate` - Requested breeding date

**Indexes**:
```sql
CREATE INDEX idx_breeding_req_initiator ON breeding_requests(initiatorId);
CREATE INDEX idx_breeding_req_target ON breeding_requests(targetUserId);
CREATE INDEX idx_breeding_req_status ON breeding_requests(status);
CREATE INDEX idx_breeding_req_created ON breeding_requests(createdAt);
CREATE UNIQUE INDEX idx_breeding_req_unique ON breeding_requests(
  initiatorId, initiatorPetId, targetUserId, targetPetId
);
```

**Relationships**:
- Many-to-One: BreedingRequest → User (initiator)
- Many-to-One: BreedingRequest → Pet (initiatorPet)
- Many-to-One: BreedingRequest → User (target)
- Many-to-One: BreedingRequest → Pet (targetPet)
- One-to-One: BreedingRequest → Match

---

### 4. **Match** - Confirmed Breeding Matches
- **Purpose**: Track confirmed breeding matches
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `breedingRequestId` (FK, Unique) - Associated request
  - `initiatorPetId` (FK) - Initiator's pet
  - `targetPetId` (FK) - Target pet
  - `status` (Enum: PROPOSED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
  - `scheduledDate` - Breeding date
  - `completedDate` - Completion date
  - `resultingOffspring` - Number of offspring

**Indexes**:
```sql
CREATE INDEX idx_match_status ON matches(status);
CREATE INDEX idx_match_scheduled_date ON matches(scheduledDate);
CREATE INDEX idx_match_completed_date ON matches(completedDate);
CREATE UNIQUE INDEX idx_match_breeding_req ON matches(breedingRequestId);
```

**Relationships**:
- One-to-One: Match ← BreedingRequest
- Many-to-One: Match → Pet

---

### 5. **Message** - User Communication
- **Purpose**: Enable communication between users
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `senderId` (FK) - Message sender
  - `recipientId` (FK) - Message recipient
  - `breedingRequestId` (FK, Optional) - Related breeding request
  - `content` - Message text
  - `status` (Enum: SENT, DELIVERED, READ)
  - `isRead`, `readAt` - Read status

**Indexes**:
```sql
CREATE INDEX idx_message_sender ON messages(senderId);
CREATE INDEX idx_message_recipient ON messages(recipientId);
CREATE INDEX idx_message_breeding_req ON messages(breedingRequestId);
CREATE INDEX idx_message_is_read ON messages(isRead);
CREATE INDEX idx_message_created ON messages(createdAt);
```

**Relationships**:
- Many-to-One: Message → User (sender)
- Many-to-One: Message → User (recipient)
- Many-to-One: Message → BreedingRequest

---

### 6. **Review** - User Ratings and Feedback
- **Purpose**: Track reviews for breeding transactions
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `reviewerId` (FK) - Who gave the review
  - `revieweeId` (FK) - Who received the review
  - `breedingRequestId` (FK) - Related breeding request
  - `rating` (1-5) - Star rating
  - `comment` - Review text
  - `helpfulCount` - Helpful votes

**Indexes**:
```sql
CREATE INDEX idx_review_reviewee ON reviews(revieweeId);
CREATE INDEX idx_review_rating ON reviews(rating);
CREATE INDEX idx_review_created ON reviews(createdAt);
CREATE UNIQUE INDEX idx_review_unique ON reviews(reviewerId, breedingRequestId);
```

**Relationships**:
- Many-to-One: Review → User (reviewer)
- Many-to-One: Review → User (reviewee)
- Many-to-One: Review → BreedingRequest

---

### 7. **HealthRecord** - Pet Health History
- **Purpose**: Track pet health records and veterinary visits
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `petId` (FK) - Associated pet
  - `recordType` - Type of record (VACCINATION, CHECKUP, TEST, etc.)
  - `recordDate` - Date of record
  - `veterinarianName` - Vet name
  - `details` - Record details
  - `certificateUrl` - Certificate document

**Relationships**:
- Many-to-One: HealthRecord → Pet

---

### 8. **Certification** - Pet Certifications
- **Purpose**: Store pet certifications and documentation
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `petId` (FK) - Associated pet
  - `type` (Enum: PEDIGREE, GENETIC_TEST, HEALTH_CHECK, etc.)
  - `name` - Certification name
  - `issueDate` - Issue date
  - `expiryDate` - Expiration date (if applicable)
  - `issuer` - Issuing organization

**Relationships**:
- Many-to-One: Certification → Pet

---

### 9. **GeneticTest** - Genetic Testing Results
- **Purpose**: Store genetic testing results for breeding
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `petId` (FK) - Associated pet
  - `testName` - Name of test
  - `provider` - Testing provider
  - `testDate` - Test date
  - `result` - Test results
  - `status` - COMPLETED, PENDING, etc.

**Relationships**:
- Many-to-One: GeneticTest → Pet

---

### 10. **RefreshToken** - JWT Session Management
- **Purpose**: Manage JWT refresh tokens for security
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `token` (Unique) - Refresh token
  - `userId` (FK) - Associated user
  - `expiresAt` - Token expiration
  - `createdAt` - Token creation date

**Indexes**:
```sql
CREATE INDEX idx_refresh_token_user ON refresh_tokens(userId);
CREATE INDEX idx_refresh_token_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_token_expires ON refresh_tokens(expiresAt);
```

---

## 🔑 Key Relationships

### One-to-Many Relationships:
```
User → Pet (owner has many pets)
User → BreedingRequest (initiator has many requests)
User → Message (sender has many messages)
User → Review (reviewer has many reviews)
Pet → HealthRecord (pet has many health records)
Pet → Certification (pet has many certifications)
Pet → GeneticTest (pet has many genetic tests)
```

### Many-to-One Relationships:
```
Pet → User (owner)
BreedingRequest → User (initiator, target)
BreedingRequest → Pet (initiatorPet, targetPet)
Match → Pet (initiatorPet, targetPet)
Message → User (sender, recipient)
Message → BreedingRequest (related request)
Review → User (reviewer, reviewee)
Review → BreedingRequest (related request)
```

### One-to-One Relationships:
```
BreedingRequest ← → Match (one request has one match)
RefreshToken → User (one token per session)
```

---

## 📊 Performance Optimization

### Indexing Strategy:
1. **Foreign Keys**: All FK columns are indexed
2. **Search Fields**: Email, role, species, breed
3. **Filter Fields**: Status, dates, published state
4. **Unique Constraints**: Email, pedigree number, registration number
5. **Composite Indexes**: (species, breed), (breedingStatus, isPublished)

### Query Examples:

**Find available pets by species and breed:**
```sql
SELECT * FROM pets 
WHERE species = 'Dog' 
  AND breed = 'Golden Retriever' 
  AND breedingStatus = 'AVAILABLE'
  AND isPublished = true
ORDER BY createdAt DESC;
```

**Get breeding requests for a user:**
```sql
SELECT * FROM breeding_requests 
WHERE targetUserId = $1 
  AND status = 'PENDING'
ORDER BY createdAt DESC;
```

**Get user reviews with rating:**
```sql
SELECT r.*, u.firstName, u.lastName, u.rating 
FROM reviews r 
JOIN users u ON r.reviewerId = u.id 
WHERE r.revieweeId = $1 
ORDER BY r.createdAt DESC;
```

---

## 🛡️ Data Integrity & Constraints

### Cascade Deletes:
- User deletion cascades to: Pets, BreedingRequests, Messages, Reviews
- Pet deletion cascades to: HealthRecords, Certifications, GeneticTests
- BreedingRequest deletion cascades to: Match, Messages, Reviews

### Unique Constraints:
- User email (prevents duplicate accounts)
- Pet pedigree number (prevents duplicate pedigrees)
- Pet registration number (ensures unique registration)
- Pet microchip number (prevents duplicate microchips)
- BreedingRequest unique combination (prevents duplicate requests)
- Review unique (one review per breeding request per reviewer)

### Check Constraints:
```sql
ALTER TABLE reviews ADD CONSTRAINT check_rating CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE pets ADD CONSTRAINT check_weight CHECK (weight > 0);
ALTER TABLE pets ADD CONSTRAINT check_height CHECK (height > 0);
```

---

## 📈 Database Statistics & Monitoring

**Recommended Queries for Monitoring:**

```sql
-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public';

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Most active tables
SELECT schemaname, tablename, seq_scan, idx_scan, n_tup_ins, n_tup_upd, n_tup_del 
FROM pg_stat_user_tables 
ORDER BY seq_scan DESC;
```

---

## 🚀 Migration Strategy

Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

This will:
1. Create all tables with proper structure
2. Add all indexes automatically
3. Set up foreign key relationships
4. Initialize with default values

---

## 📝 Enums Reference

**Role**: USER, BREEDER, ADMIN
**Gender**: MALE, FEMALE, UNKNOWN
**BreedingStatus**: AVAILABLE, NOT_AVAILABLE, RETIRED
**RequestStatus**: PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED
**MatchStatus**: PROPOSED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
**MessageStatus**: SENT, DELIVERED, READ
**CertificationType**: PEDIGREE, GENETIC_TEST, HEALTH_CHECK, VACCINATION, MICROCHIP, REGISTRATION, OTHER
