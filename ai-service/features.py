from typing import Dict, Tuple
from math import exp
import numpy as np

# Simple mapping for temperament to numeric
TEMPERAMENT_MAP = {
    "calm": 0.8,
    "active": 0.6,
    "anxious": 0.3,
}


def normalize(val: float, min_v: float, max_v: float) -> float:
    if val is None:
        return 0.5
    if max_v == min_v:
        return 0.5
    v = (val - min_v) / (max_v - min_v)
    return max(0.0, min(1.0, v))


def breed_compat(b1: str, b2: str, species: str) -> float:
    if not b1 or not b2:
        return 0.5
    if b1.lower() == b2.lower():
        return 1.0
    groups = {
        "dog": {
            "retrievers": {"golden retriever", "labrador"},
            "working": {"german shepherd", "doberman"},
        },
        "cat": {
            "longhair": {"persian", "maine coon"},
            "siamese": {"siamese"},
        },
    }
    g = groups.get(species.lower())
    if g:
        for _, breeds in g.items():
            if b1.lower() in breeds and b2.lower() in breeds:
                return 0.75
    return 0.4


def age_compat(a1: float, a2: float) -> float:
    if a1 is None or a2 is None:
        return 0.5
    diff = abs(a1 - a2)
    if diff <= 1:
        return 0.9
    if diff <= 3:
        return 0.7
    return 0.4


def health_compat(h1: float, h2: float) -> float:
    h1n = normalize(h1 or 70, 0, 100)
    h2n = normalize(h2 or 70, 0, 100)
    return (h1n + h2n) / 2


def genetic_compat(r1: float, r2: float) -> float:
    r1n = 1.0 - normalize(r1 or 0.2, 0, 1)
    r2n = 1.0 - normalize(r2 or 0.2, 0, 1)
    return (r1n + r2n) / 2


def history_compat(cnt1: int, cnt2: int) -> float:
    # Fewer previous breedings → higher score (avoid overuse)
    c1 = normalize(max(0, 10 - (cnt1 or 0)), 0, 10)
    c2 = normalize(max(0, 10 - (cnt2 or 0)), 0, 10)
    return (c1 + c2) / 2


def temperament_score(t1: str, t2: str) -> float:
    s1 = TEMPERAMENT_MAP.get((t1 or "active").lower(), 0.6)
    s2 = TEMPERAMENT_MAP.get((t2 or "active").lower(), 0.6)
    return (s1 + s2) / 2


def distance_score(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Placeholder: if locations are missing, neutral score
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 0.5
    # Very rough proximity measure
    d = abs(lat1 - lat2) + abs(lon1 - lon2)
    if d < 0.5:
        return 0.9
    elif d < 1.5:
        return 0.7
    else:
        return 0.5


def featurize_pair(petA: Dict, petB: Dict) -> Dict:
    breed = breed_compat(petA.get("breed", ""), petB.get("breed", ""), petA.get("species", "dog"))
    age = age_compat(petA.get("age"), petB.get("age"))
    health = health_compat(petA.get("health_score"), petB.get("health_score"))
    genetic = genetic_compat(petA.get("genetic_risk"), petB.get("genetic_risk"))
    history = history_compat(petA.get("breeding_history_count", 0), petB.get("breeding_history_count", 0))
    temper = temperament_score(petA.get("temperament"), petB.get("temperament"))
    dist = distance_score(petA.get("location_lat"), petA.get("location_lon"), petB.get("location_lat"), petB.get("location_lon"))
    # feature vector
    vector = np.array([breed, age, health, genetic, history, temper, dist], dtype=float)
    explanation = (
        f"Breed={breed:.2f}, Age={age:.2f}, Health={health:.2f}, Genetics={genetic:.2f}, "
        f"History={history:.2f}, Temperament={temper:.2f}, Distance={dist:.2f}"
    )
    return {
        "vector": vector,
        "explanation": explanation,
        "fields": {
            "breed_compat": breed,
            "age_compat": age,
            "health_compat": health,
            "genetic_compat": genetic,
            "history_compat": history,
            "temperament": temper,
            "distance": dist,
        }
    }


def featurize_candidates(pet: Dict, candidates: list) -> list:
    return [featurize_pair(pet, c) for c in candidates]
