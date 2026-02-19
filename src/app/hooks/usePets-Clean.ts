/**
 * usePets Hook - Fetches pets from real API
 */

import { useState, useEffect } from 'react';
import { safeGet } from '../utils/safeFetch';
import { Pet } from '../App-Clean';

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

  const fetchPets = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🐕 Fetching pets from API...');
      const response = await safeGet('/api/v1/pets');

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch pets');
      }

      console.log('✅ Pets fetched successfully:', response.data?.length || 0);
      setPets(response.data || []);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pets';
      setError(errorMessage);
      console.error('❌ Error fetching pets:', error);
      
      // Set empty array on error to prevent crashes
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
