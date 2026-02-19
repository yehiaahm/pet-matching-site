import type { MatchScore } from './mockAIMatchingService';
import { getApiBaseUrl, getEnvironmentApiUrl } from '../../env';

const API_BASE = getEnvironmentApiUrl();

export async function fetchRecommendations(petId: string, token: string, limit = 5) {
  const res = await fetch(`${API_BASE}/ai-matches/recommendations/${petId}?limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.data;
}

export async function calculateScore(petAId: string, petBId: string, token: string) {
  const res = await fetch(`${API_BASE}/ai-matches/calculate-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ petAId, petBId })
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.data as {
    petAId: string;
    petBId: string;
    score: MatchScore;
  };
}
