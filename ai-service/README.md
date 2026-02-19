# PetMat AI Matching Service

FastAPI microservice for AI-powered pet breeding match scoring and recommendations.

## Endpoints

- `POST /train`: Train model with labeled pairs `{ petA, petB, label }` (min 10 samples)
- `POST /match-score`: Score a pair `{ petA, petB }` → `{ score, probability, contributions, explanation }`
- `POST /recommendations`: Rank candidate pets for one pet `{ pet, candidates[], limit }`
- `GET /health`: Health check

## Run

```bash
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

## Contract with Node.js

Node sends JSON in the shapes defined above and receives structured responses; model explains contributions via logistic regression coefficients or heuristic fallback.
