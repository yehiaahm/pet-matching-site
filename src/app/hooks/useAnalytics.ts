/**
 * useAnalytics Hook
 * Custom hook for fetching analytics data using mock service
 */

import { useState, useEffect, useCallback } from 'react';
import { mockAnalyticsService, type OverviewStats, type UserStats, type PetStats, type BreedStats, type MatchStats, type DailyActivityData, type MatchRequestsByDay, type RevenueStats } from '../services/mockAnalyticsService';

interface UseAnalyticsReturn {
  overview: OverviewStats | null;
  users: UserStats | null;
  pets: PetStats | null;
  breeds: BreedStats | null;
  matches: MatchStats | null;
  dailyActivity: DailyActivityData[] | null;
  matchRequestsByDay: MatchRequestsByDay[] | null;
  revenue: RevenueStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [users, setUsers] = useState<UserStats | null>(null);
  const [pets, setPets] = useState<PetStats | null>(null);
  const [breeds, setBreeds] = useState<BreedStats | null>(null);
  const [matches, setMatches] = useState<MatchStats | null>(null);
  const [dailyActivity, setDailyActivity] = useState<DailyActivityData[] | null>(null);
  const [matchRequestsByDay, setMatchRequestsByDay] = useState<MatchRequestsByDay[] | null>(null);
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching analytics data...');

      const data = await mockAnalyticsService.fetchAllAnalytics();

      setOverview(data.overview);
      setUsers(data.users);
      setPets(data.pets);
      setBreeds(data.breeds);
      setMatches(data.matches);
      setDailyActivity(data.dailyActivity);
      setMatchRequestsByDay(data.matchRequestsByDay);
      setRevenue(data.revenue);

      console.log('✅ Analytics data loaded successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(message);
      console.error('❌ Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    overview,
    users,
    pets,
    breeds,
    matches,
    dailyActivity,
    matchRequestsByDay,
    revenue,
    loading,
    error,
    refetch: fetchData,
  };
}
