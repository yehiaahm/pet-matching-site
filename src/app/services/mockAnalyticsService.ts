/**
 * Mock Analytics Service
 * Provides realistic analytics data for the pet breeding platform
 */

export interface OverviewStats {
  totalUsers: number;
  totalPets: number;
  availableForBreeding: number;
  pendingRequests: number;
  activeUsersLast30Days: number;
  newUsersThisMonth: number;
  newPetsThisMonth: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsersLast30Days: number;
  usersByRole: {
    BREEDER: number;
    PET_OWNER: number;
    ADMIN: number;
  };
  userRetentionRate: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
}

export interface PetStats {
  totalPets: number;
  petsBySpecies: {
    Dog: number;
    Cat: number;
    Bird: number;
  };
  petsWithHealthRecords: number;
  petsWithGeneticTests: number;
  verifiedPets: number;
  newPetsThisMonth: number;
  averageAge: number;
}

export interface BreedStats {
  totalBreeds: number;
  topBreeds: Array<{
    breed: string;
    count: number;
    percentage: number;
  }>;
  breedDistribution: Record<string, number>;
}

export interface MatchStats {
  totalMatches: number;
  completedMatches: number;
  pendingRequests: number;
  successRate: number;
  averageMatchScore: number;
  matchesByMonth: Array<{
    month: string;
    matches: number;
  }>;
}

export interface DailyActivityData {
  date: string;
  users: number;
  pets: number;
  matches: number;
  requests: number;
}

export interface MatchRequestsByDay {
  date: string;
  requests: number;
  accepted: number;
  rejected: number;
}

export interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueBySource: {
    breedingFees: number;
    healthChecks: number;
    geneticTests: number;
    premiumFeatures: number;
  };
  revenueGrowth: number;
}

class MockAnalyticsService {
  private generateOverviewStats(): OverviewStats {
    return {
      totalUsers: 2847,
      totalPets: 1856,
      availableForBreeding: 1243,
      pendingRequests: 89,
      activeUsersLast30Days: 1823,
      newUsersThisMonth: 342,
      newPetsThisMonth: 198
    };
  }

  private generateUserStats(): UserStats {
    return {
      totalUsers: 2847,
      activeUsersLast30Days: 1823,
      usersByRole: {
        BREEDER: 1247,
        PET_OWNER: 1587,
        ADMIN: 13
      },
      userRetentionRate: 87.3,
      newUsersThisMonth: 342,
      userGrowthRate: 12.5
    };
  }

  private generatePetStats(): PetStats {
    return {
      totalPets: 1856,
      petsBySpecies: {
        Dog: 1124,
        Cat: 587,
        Bird: 145
      },
      petsWithHealthRecords: 1654,
      petsWithGeneticTests: 892,
      verifiedPets: 1723,
      newPetsThisMonth: 198,
      averageAge: 3.2
    };
  }

  private generateBreedStats(): BreedStats {
    const topBreeds = [
      { breed: 'Golden Retriever', count: 234, percentage: 12.6 },
      { breed: 'German Shepherd', count: 198, percentage: 10.7 },
      { breed: 'Labrador', count: 187, percentage: 10.1 },
      { breed: 'Persian', count: 156, percentage: 8.4 },
      { breed: 'Siamese', count: 134, percentage: 7.2 },
      { breed: 'Bulldog', count: 98, percentage: 5.3 },
      { breed: 'Maine Coon', count: 87, percentage: 4.7 },
      { breed: 'Poodle', count: 76, percentage: 4.1 },
      { breed: 'African Grey Parrot', count: 65, percentage: 3.5 },
      { breed: 'British Shorthair', count: 54, percentage: 2.9 }
    ];

    return {
      totalBreeds: 47,
      topBreeds,
      breedDistribution: topBreeds.reduce((acc, breed) => {
        acc[breed.breed] = breed.count;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  private generateMatchStats(): MatchStats {
    const matchesByMonth = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    for (let i = 0; i < 6; i++) {
      matchesByMonth.push({
        month: months[i],
        matches: Math.floor(120 + Math.random() * 80)
      });
    }

    return {
      totalMatches: 3421,
      completedMatches: 2897,
      pendingRequests: 89,
      successRate: 84.7,
      averageMatchScore: 76.3,
      matchesByMonth
    };
  }

  private generateDailyActivity(days: number = 30): DailyActivityData[] {
    const data: DailyActivityData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(45 + Math.random() * 35),
        pets: Math.floor(8 + Math.random() * 12),
        matches: Math.floor(3 + Math.random() * 8),
        requests: Math.floor(2 + Math.random() * 6)
      });
    }

    return data;
  }

  private generateMatchRequestsByDay(days: number = 30): MatchRequestsByDay[] {
    const data: MatchRequestsByDay[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const total = Math.floor(2 + Math.random() * 8);
      const accepted = Math.floor(total * 0.75);
      const rejected = Math.floor(total * 0.15);
      
      data.push({
        date: date.toISOString().split('T')[0],
        requests: total,
        accepted,
        rejected
      });
    }

    return data;
  }

  private generateRevenueStats(): RevenueStats {
    return {
      totalRevenue: 284750,
      monthlyRevenue: 42350,
      revenueBySource: {
        breedingFees: 156200,
        healthChecks: 78400,
        geneticTests: 34200,
        premiumFeatures: 15950
      },
      revenueGrowth: 18.3
    };
  }

  async fetchAllAnalytics(): Promise<{
    overview: OverviewStats;
    users: UserStats;
    pets: PetStats;
    breeds: BreedStats;
    matches: MatchStats;
    dailyActivity: DailyActivityData[];
    matchRequestsByDay: MatchRequestsByDay[];
    revenue: RevenueStats;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

    return {
      overview: this.generateOverviewStats(),
      users: this.generateUserStats(),
      pets: this.generatePetStats(),
      breeds: this.generateBreedStats(),
      matches: this.generateMatchStats(),
      dailyActivity: this.generateDailyActivity(30),
      matchRequestsByDay: this.generateMatchRequestsByDay(30),
      revenue: this.generateRevenueStats()
    };
  }

  async fetchOverview(): Promise<OverviewStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.generateOverviewStats();
  }

  async fetchUsers(): Promise<UserStats> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.generateUserStats();
  }

  async fetchPets(): Promise<PetStats> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.generatePetStats();
  }

  async fetchBreeds(): Promise<BreedStats> {
    await new Promise(resolve => setTimeout(resolve, 350));
    return this.generateBreedStats();
  }

  async fetchMatches(): Promise<MatchStats> {
    await new Promise(resolve => setTimeout(resolve, 450));
    return this.generateMatchStats();
  }

  async fetchDailyActivity(days: number = 30): Promise<DailyActivityData[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.generateDailyActivity(days);
  }

  async fetchMatchRequestsByDay(days: number = 30): Promise<MatchRequestsByDay[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.generateMatchRequestsByDay(days);
  }

  async fetchRevenue(): Promise<RevenueStats> {
    await new Promise(resolve => setTimeout(resolve, 350));
    return this.generateRevenueStats();
  }
}

export const mockAnalyticsService = new MockAnalyticsService();
