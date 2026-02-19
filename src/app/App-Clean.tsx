import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useOnboarding } from './context/OnboardingContext';
import { usePets } from './hooks/usePets';
import { AuthPage } from './components/AuthPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OnboardingFlow } from './components/OnboardingFlow';
import { PetCard } from './components/PetCard';
import { PetDetailsDialog } from './components/PetDetailsDialog';
import { AddPetDialog } from './components/AddPetDialog';
import { UserProfileDialog } from './components/UserProfileDialog';
import { MatchRequestDialog } from './components/MatchRequestDialog';
import { VetServicesDialog } from './components/VetServicesDialog';
import { GPSAnalytics } from './components/GPSAnalytics';
import { AIRecommendations } from './components/AIRecommendations';
import { GPSMatching } from './components/GPSMatching';
import BreedingRequests from './components/BreedingRequests';
import HealthRecords from './components/HealthRecords';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Search, Plus, User, Bell, Heart, Shield, Info, Stethoscope, LogOut, BarChart3, MessageSquare, FileText, MapPin, Menu } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  image: string;
  owner: {
    name: string;
    phone: string;
    address: string;
    rating: number;
    verified: boolean;
  };
  vaccinations: {
    name: string;
    date: string;
    nextDue?: string;
  }[];
  healthCheck: {
    date: string;
    veterinarian: string;
  };
  description: string;
  verified: boolean;
}

export default function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { showOnboarding, startOnboarding, onboardingState } = useOnboarding();
  const { pets, loading: petsLoading, error: petsError, refetch: refetchPets } = usePets();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dog' | 'cat' | 'bird'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMatchRequest, setShowMatchRequest] = useState(false);
  const [showVetServices, setShowVetServices] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentView, setCurrentView] = useState<'browse' | 'requests' | 'health' | 'gps-matching'>('browse');

  // Start onboarding for new users
  useEffect(() => {
    if (isAuthenticated && !onboardingState) {
      startOnboarding();
    }
  }, [isAuthenticated, onboardingState, startOnboarding]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleLogout = () => {
    console.log('🚪 App.tsx: handleLogout called');
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || pet.type === typeFilter;
    const matchesGender = genderFilter === 'all' || pet.gender === genderFilter;
    return matchesSearch && matchesType && matchesGender;
  });

  const handleRequestMatch = (pet: Pet) => {
    setSelectedPet(pet);
    setShowMatchRequest(true);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Toaster position="top-center" richColors />
        
        {/* Onboarding Modal - يظهر للمستخدمين الجدد */}
        {showOnboarding && <OnboardingFlow />}
        
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-green-500 p-2 rounded-xl">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    PetMate
                  </h1>
                  <p className="text-sm text-gray-600">Safe & Trusted Pet Breeding Platform</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setCurrentView('browse')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'browse' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Browse Pets
                </button>
                <button
                  onClick={() => setCurrentView('requests')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'requests' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Requests
                </button>
                <button
                  onClick={() => setCurrentView('health')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'health' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Health Records
                </button>
                <button
                  onClick={() => setCurrentView('gps-matching')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'gps-matching' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  GPS Matching
                </button>
              </nav>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowAnalytics(true)}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                
                <Button
                  onClick={() => setShowProfile(true)}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                >
                  <User className="w-4 h-4 mr-2" />
                  {user?.firstName}
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>

                {/* Mobile Menu */}
                <Button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {showMobileMenu && (
              <div className="md:hidden mt-4 py-4 border-t">
                <nav className="flex flex-col gap-2">
                  <button
                    onClick={() => { setCurrentView('browse'); setShowMobileMenu(false); }}
                    className={`px-4 py-2 rounded-lg font-medium text-left transition-colors ${
                      currentView === 'browse' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Browse Pets
                  </button>
                  <button
                    onClick={() => { setCurrentView('requests'); setShowMobileMenu(false); }}
                    className={`px-4 py-2 rounded-lg font-medium text-left transition-colors ${
                      currentView === 'requests' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Requests
                  </button>
                  <button
                    onClick={() => { setCurrentView('health'); setShowMobileMenu(false); }}
                    className={`px-4 py-2 rounded-lg font-medium text-left transition-colors ${
                      currentView === 'health' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Health Records
                  </button>
                  <button
                    onClick={() => { setCurrentView('gps-matching'); setShowMobileMenu(false); }}
                    className={`px-4 py-2 rounded-lg font-medium text-left transition-colors ${
                      currentView === 'gps-matching' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    GPS Matching
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={() => { setShowAnalytics(true); setShowMobileMenu(false); }}
                    className="px-4 py-2 rounded-lg font-medium text-left text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => { setShowProfile(true); setShowMobileMenu(false); }}
                    className="px-4 py-2 rounded-lg font-medium text-left text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                    className="px-4 py-2 rounded-lg font-medium text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Browse Pets View */}
          {currentView === 'browse' && (
            <div>
              {/* Search and Filters */}
              <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name or breed..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={(value: 'all' | 'dog' | 'cat' | 'bird') => setTypeFilter(value)}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Pet Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="dog">Dogs</SelectItem>
                      <SelectItem value="cat">Cats</SelectItem>
                      <SelectItem value="bird">Birds</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={genderFilter} onValueChange={(value: 'all' | 'male' | 'female') => setGenderFilter(value)}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setShowAddPet(true)}
                    className="w-full md:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pet
                  </Button>
                </div>
              </div>

              {/* Pet Grid */}
              {petsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading pets...</span>
                </div>
              ) : petsError ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">Error loading pets: {petsError}</p>
                  <Button onClick={refetchPets}>Try Again</Button>
                </div>
              ) : filteredPets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No pets found matching your criteria.</p>
                  <Button onClick={() => { setSearchQuery(''); setTypeFilter('all'); setGenderFilter('all'); }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPets.map((pet) => (
                    <PetCard key={pet.id} pet={pet} onViewDetails={setSelectedPet} onRequestMatch={handleRequestMatch} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Breeding Requests View */}
          {currentView === 'requests' && <BreedingRequests />}

          {/* Health Records View */}
          {currentView === 'health' && <HealthRecords />}

          {/* GPS Matching View */}
          {currentView === 'gps-matching' && <GPSMatching />}
        </main>

        {/* Dialogs */}
        {selectedPet && (
          <PetDetailsDialog pet={selectedPet} open={!!selectedPet} onClose={() => setSelectedPet(null)} onRequestMatch={handleRequestMatch} />
        )}
        <AddPetDialog open={showAddPet} onClose={() => setShowAddPet(false)} onAdd={(p) => { refetchPets(); setShowAddPet(false); }} />
        <UserProfileDialog open={showProfile} onClose={() => setShowProfile(false)} />
        <VetServicesDialog open={showVetServices} onClose={() => setShowVetServices(false)} />
        {showAnalytics && <GPSAnalytics open={showAnalytics} onClose={() => setShowAnalytics(false)} />}
      </div>
    </ProtectedRoute>
  );
}
