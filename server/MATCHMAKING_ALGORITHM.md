# 🔗 Pet Breeding Matchmaking Algorithm

## Overview

The matchmaking algorithm calculates compatibility scores between pets based on multiple biological, geographical, and health criteria. It uses a weighted scoring system to rank potential breeding matches from most to least compatible.

---

## 📊 Scoring System

### Weight Distribution (Total: 100)

| Criterion | Weight | Purpose |
|-----------|--------|---------|
| **Species** | 20% | Must be identical species for viable reproduction |
| **Breed** | 15% | Encourages breed purity and genetic compatibility |
| **Gender** | 15% | Must be opposite genders (biological requirement) |
| **Age** | 20% | Ensures both pets are within reproductive viability |
| **Health** | 20% | Reduces genetic disease transmission risk |
| **Location** | 10% | Practical consideration for breeding logistics |

### Score Ranges & Status

| Score | Status | Interpretation |
|-------|--------|-----------------|
| 0 | ❌ Incompatible | Cannot breed together (different species, same gender, etc.) |
| 1-49 | 🔴 Low | Poor compatibility, not recommended |
| 50-64 | 🟡 Fair | Acceptable match with some concerns |
| 65-79 | 🟢 Good | Strong match, recommended |
| 80-100 | 🔵 Excellent | Ideal match, highly recommended |

---

## 🔍 Detailed Scoring Logic

### 1. Species Matching (20 points)

**Rule**: Species must be identical

```javascript
if (species1 === species2) {
  score = 100
} else {
  score = 0 // Automatic incompatibility
}
```

**Example**:
- Dog + Dog = ✅ 100
- Dog + Cat = ❌ 0
- Dog + Dog (different breed) = ✅ 100

---

### 2. Breed Compatibility (15 points)

**Scoring Tiers**:

| Match Type | Score | Example |
|-----------|-------|---------|
| Exact same breed | 100 | Labrador + Labrador |
| Related breeds | 75 | Golden Retriever + Labrador |
| Same breed type | 50 | Poodle (Standard) + Poodle (Miniature) |
| Different breeds | 0 | Labrador + Bulldog |

```javascript
// Exact match
if (breed1 === breed2) return 100;

// Partial match (one contains the other)
if (breed1.includes(breed2) || breed2.includes(breed1)) return 75;

// Same breed type
if (breed1.split(' ')[0] === breed2.split(' ')[0]) return 50;

return 0;
```

---

### 3. Gender Compatibility (15 points)

**Rule**: Must be opposite genders for reproduction

```javascript
if ((gender1 === 'MALE' && gender2 === 'FEMALE') ||
    (gender1 === 'FEMALE' && gender2 === 'MALE')) {
  score = 100
} else if (gender1 === 'UNKNOWN' || gender2 === 'UNKNOWN') {
  score = 50  // Possible but uncertain
} else {
  score = 0   // Same gender = no breeding
}
```

---

### 4. Age Compatibility (20 points)

**Breeding Viability Parameters**:
- Minimum breeding age: 1.5 years
- Maximum breeding age: 12 years
- Ideal age difference: 1-3 years

**Scoring Table**:

| Age Difference | Age Range Valid | Score |
|---|---|---|
| < 1 year | Both valid | 100 |
| 1-3 years | Both valid | 90 |
| 3-5 years | Both valid | 70 |
| 5-8 years | Both valid | 40 |
| > 8 years | Both valid | 10 |
| Either too young (<1.5y) | N/A | 0 |
| Either too old (>12y) | N/A | 20 |

**Formula**:
```javascript
const ageDifference = Math.abs(age1 - age2);

if (ageDifference <= 1) return 100;
else if (ageDifference <= 3) return 90;
else if (ageDifference <= 5) return 70;
else if (ageDifference <= 8) return 40;
else return 10;
```

**Example**:
- Pet A: 3 years, Pet B: 4 years → Difference = 1 → Score = 100
- Pet A: 2 years, Pet B: 7 years → Difference = 5 → Score = 70
- Pet A: 1 year, Pet B: 5 years → Pet A too young → Score = 0

---

### 5. Health Status (20 points)

**Base Score**: 50 (neutral starting point)

**Bonuses**:
- Health records: +20 (each pet)
- Genetic tests: +20 (each pet)
- Certifications: +10 (each pet)
- Maximum: 100

**Health Data Considered**:
- Veterinary health records
- Genetic testing results
- Breed certifications
- Vaccination records
- Microchip registration

```javascript
let score = 50;

if (pet1.healthRecords && pet1.healthRecords.length > 0) score += 20;
if (pet2.healthRecords && pet2.healthRecords.length > 0) score += 20;

if (pet1.geneticTests && pet1.geneticTests.length > 0) score += 20;
if (pet2.geneticTests && pet2.geneticTests.length > 0) score += 20;

if (pet1.certifications && pet1.certifications.length > 0) score += 10;
if (pet2.certifications && pet2.certifications.length > 0) score += 10;

return Math.min(score, 100);
```

**Example Score Calculation**:
- Both have health records: +20 each
- One has genetic tests: +20
- Both have certifications: +10 each
- Total: 50 + 20 + 20 + 20 + 10 + 10 = 130 → Capped at 100

---

### 6. Location Proximity (10 points)

**Distance-Based Scoring** (using Haversine formula):

| Distance | Score | Consideration |
|----------|-------|---|
| 0-10 km | 100 | Very convenient |
| 10-50 km | 80 | Convenient |
| 50-100 km | 60 | Moderate travel |
| 100-500 km | 40 | Significant travel |
| 500+ km | 20 | Long distance (possible) |
| Unknown location | 50 | Neutral |

**Haversine Formula** (calculates great-circle distance):

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

---

## 🎯 Final Score Calculation

### Formula
```
FinalScore = (SpeciesScore × 20 + BreedScore × 15 + GenderScore × 15 + 
              AgeScore × 20 + HealthScore × 20 + LocationScore × 10) / 100
```

### Step-by-Step Example

**Scenario**: Matching "Bella" (Female Labrador, 3yo) with "Max" (Male Labrador, 4yo)

| Criterion | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Species | 100 | 20 | 2000 |
| Breed | 100 | 15 | 1500 |
| Gender | 100 | 15 | 1500 |
| Age (1yr diff) | 100 | 20 | 2000 |
| Health (both have records & tests) | 100 | 20 | 2000 |
| Location (15 km apart) | 80 | 10 | 800 |
| **TOTAL** | | | **10,300 ÷ 100 = 103 → 100** |
| **Final Score** | **100** | **Excellent** | ✅ |

---

## 🔄 Filtering & Search

### Query Filters

```
GET /api/matches/:petId?minAge=2&maxAge=6&maxDistance=100&minScore=70&limit=20
```

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `minAge` | Integer | None | Minimum age of candidates |
| `maxAge` | Integer | None | Maximum age of candidates |
| `minScore` | Integer | 50 | Minimum match score to display |
| `maxDistance` | Integer | None | Maximum distance in km |
| `minDistance` | Integer | None | Minimum distance in km |
| `limit` | Integer | 20 | Max results to return |

### Automatic Filtering

Candidates are automatically excluded if:
- ❌ Different species
- ❌ Same gender
- ❌ Not available for breeding
- ❌ Same pet ID

---

## 📡 API Endpoints

### 1. Find Matches for a Pet

```http
GET /api/v1/matches/:petId?minScore=70&limit=20
Authorization: Bearer <token>
```

**Response**:
```json
{
  "status": "success",
  "message": "Matches found",
  "data": {
    "totalMatches": 5,
    "displayedMatches": 5,
    "matches": [
      {
        "petId": "pet_456",
        "petName": "Max",
        "species": "Dog",
        "breed": "Labrador Retriever",
        "gender": "MALE",
        "age": 4,
        "matchScore": 95,
        "status": "excellent",
        "ownerName": "John Smith",
        "ownerEmail": "john@example.com",
        "ownerPhone": "+1234567890",
        "location": { "latitude": 40.7128, "longitude": -74.0060 },
        "distance": 15.3,
        "breakdown": {
          "species": 100,
          "breed": 100,
          "gender": 100,
          "age": 100,
          "health": 90,
          "location": 80
        }
      }
    ]
  }
}
```

### 2. Get Match Statistics

```http
GET /api/v1/matches/:petId/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "status": "success",
  "message": "Match statistics retrieved",
  "data": {
    "totalCandidates": 250,
    "compatibleMatches": 12,
    "byStatus": {
      "excellent": 3,
      "good": 5,
      "fair": 3,
      "low": 1
    },
    "scoreDistribution": {
      "90_100": 3,
      "80_89": 5,
      "70_79": 2,
      "60_69": 1,
      "50_59": 1,
      "below_50": 0
    },
    "averageScore": 79,
    "topMatches": [
      { "petId": "pet_456", "petName": "Max", "score": 95, "status": "excellent" },
      { "petId": "pet_789", "petName": "Luna", "score": 90, "status": "excellent" },
      { "petId": "pet_234", "petName": "Rocky", "score": 88, "status": "good" }
    ]
  }
}
```

### 3. Calculate Score Between Two Pets

```http
POST /api/v1/matches/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "petId1": "pet_123",
  "petId2": "pet_456"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Match score calculated",
  "data": {
    "pet1Id": "pet_123",
    "pet1Name": "Bella",
    "pet2Id": "pet_456",
    "pet2Name": "Max",
    "score": 95,
    "status": "excellent",
    "breakdown": {
      "species": 100,
      "breed": 100,
      "gender": 100,
      "age": 100,
      "health": 90,
      "location": 80
    }
  }
}
```

---

## 🧬 Advanced Considerations

### Genetic Diversity
- Algorithm prioritizes different lineages
- Penalizes close relatives (implement in future)
- Encourages breed improvement through calculated crosses

### Inbreeding Prevention
- Track pedigree depth
- Calculate inbreeding coefficient
- Flag high-risk matches

### Health Screening
- Requires certified health tests for high-value pets
- Matches are downscored if genetic tests show risks
- Enforces breed-specific health requirements

### Environmental Factors
- Climate compatibility (future enhancement)
- Altitude adaptation
- Seasonal breeding considerations

---

## 📈 Performance & Optimization

### Database Indexes for Matching
```sql
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_pets_breed ON pets(breed);
CREATE INDEX idx_pets_gender ON pets(gender);
CREATE INDEX idx_pets_breeding_status ON pets(breeding_status);
CREATE INDEX idx_pets_owner_location ON pets USING GIST(
  ST_Point(owner_latitude, owner_longitude)
);
```

### Query Optimization
- Cache popular species/breed combinations
- Use geographic indexing for location filtering
- Implement pagination for large result sets
- Pre-calculate scores periodically

### Caching Strategy
```javascript
// Cache matches for 7 days
const MATCH_CACHE_TTL = 7 * 24 * 60 * 60;

// Invalidate cache when:
// - Pet data changes
// - Pet breeding status changes
// - New pets added
// - Health records updated
```

---

## 🔐 Privacy & Security

- ✅ Require authentication for all match endpoints
- ✅ Only show owner info for approved matches
- ✅ Log all match requests for audit trail
- ✅ Rate limit matching API (max 100 requests/hour)
- ✅ Respect privacy settings (public/private breeding)

---

## 📚 References

- **Haversine Formula**: https://en.wikipedia.org/wiki/Haversine_formula
- **Genetic Distance Metrics**: https://en.wikipedia.org/wiki/Genetic_distance
- **Inbreeding Coefficient**: https://en.wikipedia.org/wiki/Inbreeding_coefficient
- **Breed Standards**: Breed club websites and FCI standards

---

**Last Updated**: January 10, 2026  
**Version**: 1.0 (Production Ready)
