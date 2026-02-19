# Node.js ↔ AI Service Contract

- AI Base URL: `AI_SERVICE_URL` (default `http://localhost:8001`)

## Endpoints

- `POST /match-score`
  - Request: `{ petA: Pet, petB: Pet }`
  - Response: `{ score: number(0-100), probability: number(0-1), contributions: { breed, age, health, genetics, history }, explanation, timestamp }`

- `POST /recommendations`
  - Request: `{ pet: Pet, candidates: Pet[], limit?: number }`
  - Response: `{ petId, recommendations: Array<{ matchedPetId, score, contributions, explanation, breedCompatibility, ageCompatibility, healthScore, geneticScore }> }`

- `POST /train`
  - Request: `{ pairs: Array<{ petA: Pet, petB: Pet, label: 0|1 }> }`
  - Response: `{ status: 'trained', samples: number }`

## Pet Schema

```
Pet {
  id: string
  species: 'dog'|'cat'|'bird'
  breed: string
  gender: 'MALE'|'FEMALE'
  age: number
  health_score?: number(0-100)
  genetic_risk?: number(0-1)
  temperament?: 'calm'|'active'|'anxious'
  breeding_history_count?: number
  location_lat?: number
  location_lon?: number
}
```
