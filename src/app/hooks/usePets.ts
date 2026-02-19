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

  const fetchPets = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🐕 Fetching pets from API...');
      // Use relative path so Vite proxy applies and respects API version
      const response = await safeGet('/api/v1/pets');

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch pets');
      }

      console.log('✅ Pets fetched successfully:', response.data?.length || 0);
      const data = response.data || [];
      if (Array.isArray(data) && data.length > 0) {
        setPets(data as Pet[]);
      } else {
        // Provide enhanced demo pets with real pet images when API returns empty
        const demoPets: Pet[] = [
          {
            id: 'demo-1',
            name: 'Buddy',
            type: 'dog',
            breed: 'Golden Retriever',
            age: 3,
            gender: 'male',
            image: 'https://images.unsplash.com/photo-1633722715463-d30628519d51?w=800&h=600&fit=crop',
            owner: { name: 'Omar', phone: '+2010-0000', address: 'Nasr City, Cairo', rating: 4.8, verified: true },
            vaccinations: [{ name: 'Rabies', date: '2024-03-10' }, { name: 'DHPP', date: '2024-03-10' }],
            healthCheck: { date: '2025-11-12', veterinarian: 'Dr. Salem' },
            description: 'Friendly, healthy, and ready for breeding. Well-trained and socialized.',
            verified: true,
            // @ts-ignore
            availability: { from: new Date().toISOString() }
          },
          {
            id: 'demo-2',
            name: 'Luna',
            type: 'cat',
            breed: 'British Shorthair',
            age: 2,
            gender: 'female',
            image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=800&h=600&fit=crop',
            owner: { name: 'Sara', phone: '+2011-1111', address: 'Heliopolis, Cairo', rating: 4.9, verified: true },
            vaccinations: [{ name: 'FVRCP', date: '2024-06-25' }, { name: 'Rabies', date: '2024-06-25' }],
            healthCheck: { date: '2025-10-03', veterinarian: 'Dr. Mona' },
            description: 'Calm, purebred with excellent temperament. Perfect for breeding programs.',
            verified: true,
            // @ts-ignore
            availability: { from: new Date().toISOString() }
          },
          {
            id: 'demo-3',
            name: 'Rio',
            type: 'bird',
            breed: 'Macaw',
            age: 4,
            gender: 'male',
            image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=600&fit=crop',
            owner: { name: 'Mahmoud', phone: '+2012-2222', address: 'Giza', rating: 4.7, verified: true },
            vaccinations: [],
            healthCheck: { date: '2025-08-21', veterinarian: 'Dr. Karim' },
            description: 'Colorful, energetic, and trained. Excellent health records available.',
            verified: true,
            // @ts-ignore
            availability: { from: new Date().toISOString() }
          },
          {
            id: 'demo-4',
            name: 'Max',
            type: 'dog',
            breed: 'German Shepherd',
            age: 5,
            gender: 'male',
            image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=600&fit=crop',
            owner: { name: 'Hadi', phone: '+2013-3333', address: 'Alexandria', rating: 4.6, verified: true },
            vaccinations: [{ name: 'DHPP', date: '2024-07-10' }, { name: 'Rabies', date: '2024-07-10' }],
            healthCheck: { date: '2025-09-05', veterinarian: 'Dr. Layla' },
            description: 'Active, intelligent, and loyal. Certified pedigree. Great for breeding.',
            verified: true,
            // @ts-ignore
            availability: { from: new Date().toISOString() }
          },
          {
            id: 'demo-5',
            name: 'Bella',
            type: 'dog',
            breed: 'Labrador Retriever',
            age: 4,
            gender: 'female',
            image: 'https://images.unsplash.com/photo-1633722715463-d30628519d51?w=800&h=600&fit=crop',
            owner: { name: 'Noor', phone: '+2014-4444', address: 'Maadi, Cairo', rating: 4.9, verified: true },
            vaccinations: [{ name: 'DHPP', date: '2024-08-15' }, { name: 'Rabies', date: '2024-08-15' }],
            healthCheck: { date: '2025-12-01', veterinarian: 'Dr. Amira' },
            description: 'Sweet temperament, excellent bloodline. Multiple champion ancestors.',
            verified: true,
            // @ts-ignore
            availability: { from: new Date().toISOString() }
          },
          {
            id: 'demo-6',
            name: 'Whiskers',
            type: 'cat',
            breed: 'Persian Cat',
            age: 3,
            gender: 'female',
            image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop',
            owner: { name: 'Fatima', phone: '+2015-5555', address: 'Downtown Cairo', rating: 4.8, verified: true },
            vaccinations: [{ name: 'FVRCP', date: '2024-09-20' }, { name: 'Rabies', date: '2024-09-20' }],
            healthCheck: { date: '2025-11-30', veterinarian: 'Dr. Randa' },
            description: 'Gorgeous coat, friendly, shows regularly. Excellent breeding history.',
            verified: true,
            // @ts-ignore
            availability: { from: new Date().toISOString() }
          }
        ];
        setPets(demoPets);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pets';
      setError(errorMessage);
      console.error('❌ Error fetching pets:', error);
      
      // Provide demo pets on error to keep UI populated
      const demoPets: Pet[] = [
        {
          id: 'demo-7',
          name: 'Charlie',
          type: 'dog',
          breed: 'Siberian Husky',
          age: 2,
          gender: 'male',
          image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=600&fit=crop',
          vaccinations: [{ name: 'DHPP', date: '2024-07-10' }, { name: 'Rabies', date: '2024-07-10' }],
          healthCheck: { date: '2025-09-05', veterinarian: 'Dr. Layla' },
          description: 'Active, playful, and pedigree confirmed. Excellent health records.',
          verified: true,
          // @ts-ignore
          availability: { from: new Date().toISOString() },
          // @ts-ignore
          owner: { name: 'Hadi Mohammed', phone: '+2013-3333-3333', address: 'Alexandria', rating: 4.6, verified: true, totalMatches: 15 }
        },
        {
          id: 'demo-8',
          name: 'Sophie',
          type: 'cat',
          breed: 'Siamese',
          age: 3,
          gender: 'female',
          image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=800&h=600&fit=crop',
          vaccinations: [{ name: 'FVRCP', date: '2024-10-05' }, { name: 'Rabies', date: '2024-10-05' }],
          healthCheck: { date: '2025-11-15', veterinarian: 'Dr. Hoda' },
          description: 'Elegant, affectionate, and show quality. Perfect breeding companion.',
          verified: true,
          // @ts-ignore
          availability: { from: new Date().toISOString() },
          // @ts-ignore
          owner: { name: 'Leila Samir', phone: '+2016-6666-6666', address: 'Gezira, Cairo', rating: 4.7, verified: true, totalMatches: 14 }
        }
      ];
      setPets(demoPets);
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
