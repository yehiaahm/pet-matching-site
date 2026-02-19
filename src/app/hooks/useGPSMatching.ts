/**
 * useGPSMatching Hook
 * GPS-based AI matching with real backend integration
 */

import { useState, useCallback } from 'react';
import { useGeolocation } from './useGeolocation';
import { safePost } from '../utils/safeFetch';

interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird';
  breed: string;
  age: number;
  gender: 'male' | 'female';
}

interface MatchResult {
  pet: Pet & {
    owner: {
      name: string;
      rating: number;
      verified: boolean;
    };
    images: string[];
    description: string;
    verified: boolean;
  };
  distance: number;
  matchScore: number;
  matchReason: string;
  breakdown: {
    breed: number;
    age: number;
    gender: number;
    location: number;
  };
}

interface UseGPSMatchingReturn {
  matches: MatchResult[] | null;
  loading: boolean;
  error: string | null;
  searchParams: {
    userLocation: { latitude: number; longitude: number } | null;
    maxDistance: number;
    totalCandidates: number;
    qualifiedMatches: number;
  } | null;
  findMatches: (userPet: Pet, maxDistance?: number, limit?: number) => Promise<void>;
  clearMatches: () => void;
}

const API_BASE = '/api/v1';

export function useGPSMatching(): UseGPSMatchingReturn {
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<UseGPSMatchingReturn['searchParams']>(null);
  
  const { location, loading: locationLoading, error: locationError, requestLocation, permission } = useGeolocation();

  const findMatches = useCallback(async (
    userPet: Pet, 
    maxDistance: number = 25, 
    limit: number = 10
  ) => {
    try {
      setLoading(true);
      setError(null);
      setMatches(null);
      setSearchParams(null);

      // Request location if not available
      if (!location && permission !== 'denied') {
        console.log('📍 Requesting location for matching...');
        await requestLocation();
      }

      // Check if location is available
      if (!location && permission !== 'granted') {
        if (permission === 'denied') {
          setError('Location permission denied. Please enable location access to find nearby matches.');
        } else {
          setError('Location access required to find nearby matches. Please allow location access.');
        }
        return;
      }

      if (!location) {
        setError('Unable to get your location. Please check your location settings.');
        return;
      }

      console.log(`🤖 Finding matches for ${userPet.name} near (${location.latitude}, ${location.longitude})`);

      const response = await safePost(`${API_BASE}/ai/matches`, {
        userPet,
        userLatitude: location.latitude,
        userLongitude: location.longitude,
        maxDistance,
        limit,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to find matches');
      }

      setMatches(response.data.data.matches);
      setSearchParams(response.data.data.searchParams);
      
      console.log(`✅ Found ${response.data.data.matches.length} matches within ${maxDistance}km`);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find matches';
      setError(message);
      console.error('❌ GPS Matching error:', err);
    } finally {
      setLoading(false);
    }
  }, [location, permission, requestLocation]);

  const clearMatches = useCallback(() => {
    setMatches(null);
    setSearchParams(null);
    setError(null);
  }, []);

  return {
    matches,
    loading: loading || locationLoading,
    error: error || locationError,
    searchParams,
    findMatches,
    clearMatches,
  };
}
