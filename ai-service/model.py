from typing import Tuple, Dict
import numpy as np
from sklearn.linear_model import LogisticRegression

class MatchingModel:
    def __init__(self):
        # Balanced class weights for imbalanced data
        self.model = LogisticRegression(max_iter=500, class_weight="balanced")
        self.fitted = False

    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        self.model.fit(X, y)
        self.fitted = True

    def predict_proba(self, x: np.ndarray) -> Tuple[float, Dict[str, float]]:
        # x shape: (n_features,)
        if not self.fitted:
            # Heuristic fallback: weighted sum of first few features
            total = float(0.35 * x[0] + 0.2 * x[1] + 0.2 * x[2] + 0.15 * x[3] + 0.1 * x[4])
            prob = max(0.0, min(1.0, total))
            contrib = {
                "breed": float(x[0] * 0.35),
                "age": float(x[1] * 0.2),
                "health": float(x[2] * 0.2),
                "genetics": float(x[3] * 0.15),
                "history": float(x[4] * 0.1),
            }
            return prob, contrib
        proba = self.model.predict_proba(x.reshape(1, -1))[0][1]
        # Feature contributions via coefficients (simple explanation)
        coefs = self.model.coef_[0]
        contrib = {
            "breed": float(coefs[0] * x[0]),
            "age": float(coefs[1] * x[1]),
            "health": float(coefs[2] * x[2]),
            "genetics": float(coefs[3] * x[3]),
            "history": float(coefs[4] * x[4]),
        }
        return float(proba), contrib
