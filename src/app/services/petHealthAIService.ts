export interface AIHealthRecommendation {
  petId: string;
  petName: string;
  needsVaccination: boolean;
  needsVetVisit: boolean;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  daysFromLastVaccine: number | null;
  daysFromLastCheck: number | null;
  lastVaccineDate: string | null;
  lastHealthCheckDate: string | null;
  reasons: string[];
  suggestedActions: string[];
  generatedAt: string;
}

interface AIHealthResponse {
  success: boolean;
  data: AIHealthRecommendation;
  notificationCreated?: {
    id: string;
  } | null;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export const petHealthAIService = {
  async checkPetHealth(petId: string, notify: boolean = true): Promise<AIHealthResponse> {
    const response = await fetch(`/api/v1/ai/health-check/${petId}?notify=${notify ? 'true' : 'false'}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || 'Failed to run AI health check');
    }

    return payload as AIHealthResponse;
  },
};
