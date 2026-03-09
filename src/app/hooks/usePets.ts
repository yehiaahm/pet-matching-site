/**
 * usePets Hook - Fetches pets from real API
 */

import { useState, useEffect } from 'react';
import { safeGet } from '../utils/safeFetch';
import { Pet } from '../App';

interface UsePetsReturn {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePets(): UsePetsReturn {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapPet = (raw: any): Pet => {
        const normalizedImages: string[] = Array.isArray(raw?.images)
          ? raw.images
              .map((item: any) => {
                if (typeof item === 'string') return item;
                if (item && typeof item.url === 'string') return item.url;
                return null;
              })
              .filter(Boolean)
          : [];

        const primaryImage = normalizedImages[0] || raw?.image;

    const species = (raw?.species || raw?.type || 'DOG').toString().toLowerCase();
    const type = species === 'cat' || species === 'bird' ? species : 'dog';
    const gender = (raw?.gender || 'MALE').toString().toLowerCase() === 'female' ? 'female' : 'male';

    const rawAge = Number(raw?.age ?? 0);
    const isLegacyAgeYears = Boolean(raw?.type) && !raw?.species;
    const ageYears = Number.isFinite(rawAge) && rawAge > 0
      ? (isLegacyAgeYears ? Math.max(1, Math.round(rawAge)) : Math.max(1, Math.round(rawAge / 12)))
      : 1;

    const owner = raw?.users || raw?.owner || {};
    const healthRecords = Array.isArray(raw?.healthRecords) ? raw.healthRecords : [];
    const latestHealthRecord = healthRecords
      .slice()
      .sort((first: any, second: any) => new Date(second?.date || 0).getTime() - new Date(first?.date || 0).getTime())[0];

    const derivedVaccinations = healthRecords
      .filter((record: any) => Boolean(record?.vaccine))
      .map((record: any) => {
        const recordDate = new Date(record.date);
        const nextDueDate = Number.isNaN(recordDate.getTime())
          ? undefined
          : new Date(recordDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

        return {
          name: String(record.vaccine),
          date: String(record.date),
          nextDue: nextDueDate,
        };
      });

    const daysSince = (value?: string): number | null => {
      if (!value) return null;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return null;
      return Math.floor((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24));
    };

    const latestVaccineDate = derivedVaccinations
      .map((item) => item.date)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    const daysFromLastVaccine = daysSince(latestVaccineDate);
    const daysFromLastCheck = daysSince(latestHealthRecord?.date);

    const needsVaccination = daysFromLastVaccine == null || daysFromLastVaccine >= 365;
    const needsVetVisit = daysFromLastCheck == null || daysFromLastCheck >= 180;

    let urgency: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (needsVaccination || needsVetVisit) urgency = 'MEDIUM';
    if ((daysFromLastVaccine != null && daysFromLastVaccine >= 395) || (daysFromLastCheck != null && daysFromLastCheck >= 240)) {
      urgency = 'HIGH';
    }

    const reasons: string[] = [];
    if (needsVaccination) reasons.push('Vaccination update is recommended.');
    if (needsVetVisit) reasons.push('Routine vet visit is recommended.');
    if (!needsVaccination && !needsVetVisit) reasons.push('Health status is currently stable.');

    const suggestedActions: string[] = [];
    if (needsVaccination) suggestedActions.push('Book a vaccination appointment within 7 days.');
    if (needsVetVisit) suggestedActions.push('Book a vet checkup within 7 days.');
    if (!needsVaccination && !needsVetVisit) suggestedActions.push('Keep the current health schedule.');

    return {
      id: raw?.id,
      ownerId: raw?.ownerId || owner?.id,
      name: raw?.name || 'Unknown Pet',
      type,
      breed: raw?.breed || 'Unknown Breed',
      age: ageYears,
      gender,
      image: primaryImage,
      images: normalizedImages.length > 0 ? normalizedImages : undefined,
      owner: {
        name: owner?.firstName && owner?.lastName ? `${owner.firstName} ${owner.lastName}` : owner?.name || 'Pet Owner',
        phone: owner?.phone || '-',
        address: owner?.city || owner?.address || '-',
        rating: typeof owner?.rating === 'number' ? owner.rating : 5,
        verified: Boolean(owner?.verified),
      },
      vaccinations: Array.isArray(raw?.vaccinations) && raw.vaccinations.length > 0 ? raw.vaccinations : derivedVaccinations,
      healthCheck: raw?.healthCheck || {
        date: latestHealthRecord?.date || new Date().toISOString().slice(0, 10),
        veterinarian: latestHealthRecord?.vetName || 'N/A',
      },
      aiHealthRecommendation: {
        needsVaccination,
        needsVetVisit,
        urgency,
        reasons,
        suggestedActions,
        generatedAt: new Date().toISOString(),
      },
      description: raw?.description || '',
      verified: Boolean(raw?.verified || raw?.isPublished),
    };
  };

  const fetchPets = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🐕 Fetching pets from API...');
      const token = localStorage.getItem('accessToken');
      // Only use global listing endpoints so pets are visible to all users.
      const endpoints = ['/api/v1/pets/all', '/api/v1/pets', '/api/pets/all', '/api/pets'];
      let rawPets: any[] = [];
      let lastError = 'Failed to fetch pets';

      const extractPets = (payload: any): any[] => {
        if (Array.isArray(payload)) return payload;
        if (payload?.success && Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.pets)) return payload.pets;
        if (Array.isArray(payload?.items)) return payload.items;
        if (Array.isArray(payload?.data?.pets)) return payload.data.pets;
        if (Array.isArray(payload?.data?.items)) return payload.data.items;
        return [];
      };

      for (const endpoint of endpoints) {
        const response = await safeGet(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!response.success) {
          lastError = response.error || lastError;
          continue;
        }

        const extracted = extractPets(response.data);
        if (Array.isArray(extracted)) {
          rawPets = extracted;
          break;
        }
      }

      if (!Array.isArray(rawPets)) {
        throw new Error(lastError);
      }

      const normalizedPets = rawPets.map(mapPet).filter((pet: Pet) => Boolean(pet?.id));
      console.log('✅ Pets fetched successfully:', normalizedPets.length);
      setPets(normalizedPets);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pets';
      setError(errorMessage);
      console.error('❌ Error fetching pets:', error);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  return {
    pets,
    loading,
    error,
    refetch: fetchPets,
  };
}
