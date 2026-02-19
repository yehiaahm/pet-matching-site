from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from pathlib import Path
import joblib
import numpy as np
from datetime import datetime

from model import MatchingModel
from features import featurize_pair, featurize_candidates

MODEL_PATH = Path("./models/matching_model.joblib")

app = FastAPI(title="PetMat AI Matching Service", version="1.0.0")

# In-memory model instance
matching_model: Optional[MatchingModel] = None


class Pet(BaseModel):
    id: str
    species: str
    breed: str
    gender: str
    age: float
    weight: Optional[float] = None
    health_score: Optional[float] = None  # 0-100
    genetic_risk: Optional[float] = None  # 0-1
    temperament: Optional[str] = None  # calm, active, anxious
    breeding_history_count: Optional[int] = 0
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None


class MatchPairRequest(BaseModel):
    petA: Pet
    petB: Pet


class TrainRequest(BaseModel):
    pairs: List[Dict[str, Any]] = Field(..., description="List of labeled pairs with features and label")
    # Each pair item example:
    # {
    #   "petA": { ...Pet... },
    #   "petB": { ...Pet... },
    #   "label": 1  # 1=successful match, 0=unsuccessful
    # }


class CandidatesRequest(BaseModel):
    pet: Pet
    candidates: List[Pet]
    limit: int = 5


class ScoreResponse(BaseModel):
    score: float
    probability: float
    contributions: Dict[str, float]
    explanation: str
    timestamp: str


@app.on_event("startup")
def load_model():
    global matching_model
    if MODEL_PATH.exists():
        try:
            matching_model = joblib.load(MODEL_PATH)
        except Exception:
            matching_model = None
    if matching_model is None:
        matching_model = MatchingModel()


@app.post("/train")
def train_model(req: TrainRequest):
    global matching_model
    X, y = [], []
    for item in req.pairs:
        pair = MatchPairRequest(petA=item["petA"], petB=item["petB"])  # type: ignore
        x = featurize_pair(pair.petA, pair.petB)
        X.append(x["vector"])  # feature vector
        y.append(item.get("label", 0))
    if len(X) < 10:
        raise HTTPException(status_code=400, detail="Not enough training samples (min 10)")
    matching_model.fit(np.array(X), np.array(y))
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(matching_model, MODEL_PATH)
    return {"status": "trained", "samples": len(X)}


@app.post("/match-score", response_model=ScoreResponse)
def match_score(req: MatchPairRequest):
    global matching_model
    features = featurize_pair(req.petA, req.petB)
    prob, contrib = matching_model.predict_proba(features["vector"])  # type: ignore
    score = float(prob * 100)
    explanation = features["explanation"]
    return ScoreResponse(
        score=score,
        probability=float(prob),
        contributions=contrib,
        explanation=explanation,
        timestamp=datetime.utcnow().isoformat(),
    )


@app.post("/recommendations")
def recommendations(req: CandidatesRequest):
    global matching_model
    scored: List[Dict[str, Any]] = []
    for cand in req.candidates:
        f = featurize_pair(req.pet, cand)
        prob, contrib = matching_model.predict_proba(f["vector"])  # type: ignore
        scored.append({
            "matchedPetId": cand.id,
            "score": float(prob * 100),
            "contributions": contrib,
            "explanation": f["explanation"],
            "breedCompatibility": f["fields"]["breed_compat"],
            "ageCompatibility": f["fields"]["age_compat"],
            "healthScore": f["fields"]["health_compat"],
            "geneticScore": f["fields"]["genetic_compat"],
        })
    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"petId": req.pet.id, "recommendations": scored[:req.limit]}


@app.get("/health")
def health():
    return {"status": "ok", "modelLoaded": matching_model is not None}
