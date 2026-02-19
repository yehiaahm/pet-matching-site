// Personalized recommendation scoring combining behavior, preferences, and history
export function scoreCandidate({ preferences, behavior }, candidate) {
  // preferences: { breeds: string[], minAge, maxAge, locationRadiusKm }
  // behavior: { views: number, likes: number, messages: number }
  const weights = { breed: 0.3, age: 0.2, history: 0.2, behavior: 0.2, location: 0.1 };
  const breedScore = preferences.breeds?.includes(candidate.breed) ? 1 : 0.6;
  const ageScore = candidate.age >= (preferences.minAge ?? 1) && candidate.age <= (preferences.maxAge ?? 12) ? 1 : 0.7;
  const historyScore = 1 - Math.min(1, (candidate.breeding_history_count || 0) / 10);
  const behaviorScore = Math.min(1, ((behavior.views || 0) + (behavior.likes || 0) + (behavior.messages || 0)) / 50);
  const locationScore = 0.8; // placeholder
  const total = breedScore * weights.breed + ageScore * weights.age + historyScore * weights.history + behaviorScore * weights.behavior + locationScore * weights.location;
  return total * 100;
}
