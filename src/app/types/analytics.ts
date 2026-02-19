/**
 * Analytics Types and Interfaces
 * TypeScript interfaces for analytics data
 */

// Overview Statistics
export interface OverviewStats {
  totalUsers: number;
  totalBreeders: number;
  totalAdmins: number;
  activeUsers: number;
  totalPets: number;
  activePets: number;
  availableForBreeding: number;
  totalBreedingRequests: number;
  completedMatches: number;
  pendingRequests: number;
}

// User Statistics
export interface UserStats {
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  usersByRole: {
    USER: number;
    BREEDER: number;
    ADMIN: number;
  };
  activeUsersLast30Days: number;
  activeUsersLast7Days: number;
  userRetentionRate: number;
  averageSessionDuration: string;
  totalLogins: number;
}

// Pet Statistics
export interface PetStats {
  totalPets: number;
  newPetsThisMonth: number;
  petsBySpecies: {
    [key: string]: number;
  };
  breedingStatusDistribution: {
    AVAILABLE: number;
    NOT_AVAILABLE: number;
    RETIRED: number;
  };
  averagePetAge: number;
  petsWithHealthRecords: number;
  petsWithGeneticTests: number;
  petsWithCertifications: number;
}

// Breed Statistics
export interface BreedStat {
  breed: string;
  count: number;
  requests: number;
}

export interface BreedStats {
  topBreeds: BreedStat[];
}

// Match Statistics
export interface MatchStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  completedMatches: number;
  cancelledMatches: number;
  averageRequestDuration: string;
  successRate: number;
  averageMatchScore: number;
}

// Daily Activity Data
export interface DailyActivityData {
  date: string;
  newUsers: number;
  newPets: number;
  activeUsers: number;
  matchRequests: number;
  completedMatches: number;
}

// Match Requests by Day
export interface MatchRequestsByDay {
  date: string;
  requests: number;
  completed: number;
  pending: number;
}

// Revenue Statistics
export interface RevenueStats {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  averageTransactionValue: number;
  totalTransactions: number;
  premiumMembers: number;
  freeMembers: number;
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

// Chart Data Points
export interface ChartDataPoint {
  [key: string]: string | number;
}

// Stat Card Props
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}
