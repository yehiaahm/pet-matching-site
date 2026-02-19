/**
 * Analytics Dashboard Component
 * Main admin dashboard with all charts and statistics
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  PawPrint,
  Heart,
  TrendingUp,
  BarChart3,
  Activity,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { useAnalytics } from '../../hooks/useAnalytics';
import { StatCard } from './StatCard';
import { MatchRequestsChart } from './MatchRequestsChart';
import { BreedsChart } from './BreedsChart';
import { DailyActivityChart } from './DailyActivityChart';

export function AnalyticsDashboard() {
  const {
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
    refetch,
  } = useAnalytics();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    try {
      // WHY: JSON.parse can throw if localStorage is corrupted; this prevents
      // the analytics dashboard from crashing the whole app when opened.
      const user = JSON.parse(userStr) as { role?: string };
      setIsAdmin(user.role === 'ADMIN');
    } catch (error) {
      console.error('Failed to parse user from localStorage in AnalyticsDashboard:', error);
      localStorage.removeItem('user');
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block mb-4">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
          <p className="text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user is admin - moved after all hooks
  if (!isAdmin) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this dashboard. Admin access required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Real-time platform statistics and insights
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={overview.totalUsers.toLocaleString()}
              icon={<Users className="w-6 h-6" />}
              color="blue"
              trend={{
                value: 12,
                direction: 'up',
              }}
            />
            <StatCard
              title="Total Pets"
              value={overview.totalPets.toLocaleString()}
              icon={<PawPrint className="w-6 h-6" />}
              color="green"
              trend={{
                value: 8,
                direction: 'up',
              }}
            />
            <StatCard
              title="Available for Breeding"
              value={overview.availableForBreeding.toLocaleString()}
              icon={<Heart className="w-6 h-6" />}
              color="purple"
            />
            <StatCard
              title="Pending Requests"
              value={overview.pendingRequests}
              icon={<TrendingUp className="w-6 h-6" />}
              color="orange"
            />
          </div>
        )}

        {/* Detailed Stats Grid */}
        {users && pets && matches && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* User Stats */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active (Last 30d)</span>
                  <span className="font-semibold text-gray-900">
                    {users.activeUsersLast30Days.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Breeders</span>
                  <span className="font-semibold text-gray-900">
                    {users.usersByRole.BREEDER.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Retention Rate</span>
                  <span className="font-semibold text-gray-900">
                    {users.userRetentionRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-600">New This Month</span>
                  <span className="font-semibold text-green-600">
                    +{users.newUsersThisMonth}
                  </span>
                </div>
              </div>
            </div>

            {/* Pet Stats */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pet Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dogs</span>
                  <span className="font-semibold text-gray-900">
                    {pets.petsBySpecies['Dog']?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Health Records</span>
                  <span className="font-semibold text-gray-900">
                    {pets.petsWithHealthRecords.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Genetic Tests</span>
                  <span className="font-semibold text-gray-900">
                    {pets.petsWithGeneticTests.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-600">New This Month</span>
                  <span className="font-semibold text-green-600">
                    +{pets.newPetsThisMonth}
                  </span>
                </div>
              </div>
            </div>

            {/* Match Stats */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {matches.successRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Score</span>
                  <span className="font-semibold text-gray-900">
                    {matches.averageMatchScore}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-gray-900">
                    {matches.completedMatches.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-orange-600">
                    {matches.pendingRequests}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="space-y-6">
          {/* Daily Activity Chart */}
          {dailyActivity && (
            <DailyActivityChart data={dailyActivity} height={350} />
          )}

          {/* Match Requests Chart */}
          {matchRequestsByDay && (
            <MatchRequestsChart data={matchRequestsByDay} height={350} />
          )}

          {/* Breeds Chart */}
          {breeds && breeds.topBreeds && (
            <BreedsChart data={breeds.topBreeds} height={350} />
          )}
        </div>
      </div>
    </div>
  );
}
