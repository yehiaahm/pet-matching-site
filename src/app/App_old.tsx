import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { PremiumFeaturesProvider } from './context/PremiumFeaturesContext';
import { useOnboarding } from './context/OnboardingContext';
import { usePets } from './hooks/usePets';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OnboardingFlow } from './components/OnboardingFlow';
import { PetCard } from './components/PetCard';
import { PetDetailsDialog } from './components/PetDetailsDialog';
import { AddPetDialog } from './components/AddPetDialog';
import { UserProfileDialog } from './components/UserProfileDialog';
import { MatchRequestDialog } from './components/MatchRequestDialog';
import { VetServicesDialog } from './components/VetServicesDialog';
import { SubscriptionDialog } from './components/SubscriptionDialog';
import { MessagesDialog } from './components/MessagesDialog';
import { EnhancedNavbar } from './components/EnhancedNavbar';
import AIMatchingPage from './pages/AIMatchingPage';
import FeaturesShowcasePage from './pages/FeaturesShowcasePage';
import NotificationsCenter from './pages/NotificationsCenter';
import { ErrorBoundary } from './components/ErrorBoundary';
import ProfileVerificationPage from './pages/ProfileVerificationPage';
import BreedingRequests from './components/BreedingRequests';
import HealthRecords from './components/HealthRecords';
import FeatureRibbon from './components/FeatureRibbon';
import VerificationBadgeComponent from './components/VerificationBadge';
import InstantAlerts from './components/InstantAlerts';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { ThemeToggle } from './components/ui/ThemeSwitcher';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { EmptySearch } from './components/ui/EmptyState';
import { SkeletonGrid } from './components/ui/Skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Search, Plus, User, Bell, Heart, Shield, Info, Stethoscope, LogOut, BarChart3, MessageSquare, FileText, MapPin, Menu, Sparkles } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  image?: string;
  images?: string[];
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

const mockPets: Pet[] = [];

export default function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { showOnboarding, startOnboarding, onboardingState } = useOnboarding();
  const { pets, loading: petsLoading, error: petsError, refetch: refetchPets } = usePets();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dog' | 'cat' | 'bird'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMatchRequest, setShowMatchRequest] = useState(false);
  const [showVetServices, setShowVetServices] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    if (isAuthenticated && showOnboarding) {
      startOnboarding();
    }
  }, [isAuthenticated, showOnboarding, startOnboarding]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pet.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || pet.type === typeFilter;
    const matchesGender = genderFilter === 'all' || pet.gender === genderFilter;
    return matchesSearch && matchesType && matchesGender;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PremiumFeaturesProvider>
        <LanguageProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-gray-50">
                      <main className="container mx-auto px-4 py-8">
                        <div className="mb-8">
                          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pet Dashboard</h1>
                          <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex-1">
                              <Input
                                placeholder="Search pets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                              <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Pet Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Pets</SelectItem>
                                <SelectItem value="dog">Dogs</SelectItem>
                                <SelectItem value="cat">Cats</SelectItem>
                                <SelectItem value="bird">Birds</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={genderFilter} onValueChange={(value: any) => setGenderFilter(value)}>
                              <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Genders</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {petsLoading ? (
                          <SkeletonGrid />
                        ) : filteredPets.length === 0 ? (
                          <EmptySearch />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPets.map((pet) => (
                              <PetCard
                                key={pet.id}
                                pet={pet}
                                onClick={() => setSelectedPet(pet)}
                              />
                            ))}
                          </div>
                        )}
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/ai" element={
                  <ProtectedRoute>
                    <AIMatchingPage />
                  </ProtectedRoute>
                } />
                <Route path="/showcase" element={
                  <ProtectedRoute>
                    <FeaturesShowcasePage />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <NotificationsCenter />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfileVerificationPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              {selectedPet && (
                <PetDetailsDialog
                  pet={selectedPet}
                  isOpen={!!selectedPet}
                  onClose={() => setSelectedPet(null)}
                />
              )}

              {showAddPet && (
                <AddPetDialog
                  isOpen={showAddPet}
                  onClose={() => setShowAddPet(false)}
                />
              )}

              {showProfile && (
                <UserProfileDialog
                  isOpen={showProfile}
                  onClose={() => setShowProfile(false)}
                />
              )}

              {showMatchRequest && (
                <MatchRequestDialog
                  isOpen={showMatchRequest}
                  onClose={() => setShowMatchRequest(false)}
                />
              )}

              {showVetServices && (
                <VetServicesDialog
                  isOpen={showVetServices}
                  onClose={() => setShowVetServices(false)}
                />
              )}

              {showSubscription && (
                <SubscriptionDialog
                  isOpen={showSubscription}
                  onClose={() => setShowSubscription(false)}
                />
              )}

              {showMessages && (
                <MessagesDialog
                  isOpen={showMessages}
                  onClose={() => setShowMessages(false)}
                />
              )}

              <Toaster />
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </PremiumFeaturesProvider>
    </ErrorBoundary>
  );
}
