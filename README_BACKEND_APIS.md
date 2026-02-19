# Backend APIs (New)

- `GET /api/v1/ai-matches/recommendations/:petId` → AI recommendations
- `POST /api/v1/ai-matches/calculate-score` → Pair scoring
- `GET /api/v1/analytics/*` → Admin-only analytics
- `GET /api/v1/verification/:userId` → Compute badge
- `POST /api/v1/verification/:userId/revoke` → Admin revoke

Auth: Bearer JWT required for protected routes.
