import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { PremiumFeaturesProvider } from './context/PremiumFeaturesContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { useOnboarding } from './context/OnboardingContext';
import { usePets } from './hooks/usePets';
import { LandingPage } from './components/LandingPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { PetCard } from './components/PetCard';
import { PetDetailsDialog } from './components/PetDetailsDialog';
import { AddPetDialog } from './components/AddPetDialog';
import { UserProfileDialog } from './components/UserProfileDialog';
import { MatchRequestDialog } from './components/MatchRequestDialog';
import { VetServicesDialog } from './components/VetServicesDialog';
import { SubscriptionDialog } from './components/SubscriptionDialog';
import { MessagesDialog } from './components/MessagesDialog';
import { AdvancedFeatures3D } from './components/AdvancedFeatures3D';
import { GPSAnalytics } from './components/GPSAnalytics';
import { GPSMatching } from './components/GPSMatching';
import { AdminSupportDashboard } from './components/AdminSupportDashboard';
import AIMatchingPage from './pages/AIMatchingPage';
import FeaturesShowcasePage from './pages/FeaturesShowcasePage';
import NotificationsCenter from './pages/NotificationsCenter';
import { ErrorBoundary } from './components/ErrorBoundary';
import ProfileVerificationPage from './pages/ProfileVerificationPage';
import BreedingRequests from './components/BreedingRequests';
import HealthRecords from './components/HealthRecords';
import FeatureRibbon from './components/FeatureRibbon';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { ThemeToggle } from './components/ui/ThemeSwitcher';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { EmptySearch } from './components/ui/EmptyState';
import { SkeletonGrid } from './components/ui/Skeleton';
import { toast, Toaster } from 'sonner';
import { pageVariants, containerVariants, itemVariants } from '../lib/animations';

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

export default function App() {
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
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAdminSupport, setShowAdminSupport] = useState(false);
  const [currentView, setCurrentView] = useState<'browse' | 'requests' | 'health' | 'gps-matching'>('browse');

  useEffect(() => {
    if (!onboardingState) {
      startOnboarding();
    }
  }, [onboardingState, startOnboarding]);

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

  const handleSubmitMatchRequest = () => {
    toast.success('تم إرسال طلب التزاوج بنجاح', {
      description: 'سيتم إشعارك عند رد الطرف الآخر.',
    });
    setShowMatchRequest(false);
    setSelectedPet(null);
    setCurrentView('requests');
  };

  const handleFeatureSelect = (featureKey: string) => {
    switch (featureKey) {
      case 'ai':
      case 'recommendations':
        navigate('/ai');
        break;
      case 'gps':
        setCurrentView('gps-matching');
        break;
      case 'health':
        setCurrentView('health');
        break;
      case 'community':
        setShowMessages(true);
        break;
      case 'requests':
      case 'scheduling':
        setCurrentView('requests');
        break;
      case 'analytics':
      case 'quality':
        setShowAnalytics(true);
        break;
      case 'alerts':
        toast.success('Notifications enabled');
        break;
      case 'verification':
        navigate('/profile');
        break;
      case 'security':
        navigate('/profile');
        break;
      case 'contracts':
      case 'subscription':
        setShowSubscription(true);
        break;
      default:
        toast.info('Feature coming soon');
        break;
    }
  };

  const Dashboard = () => (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <Toaster position="top-center" richColors />

      {showOnboarding && <OnboardingFlow />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdvancedFeatures3D onFeatureSelect={handleFeatureSelect} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <FeatureRibbon
            onRequests={() => setCurrentView('requests')}
            onHealth={() => setCurrentView('health')}
            onGpsMatching={() => setCurrentView('gps-matching')}
            onVets={() => setShowVetServices(true)}
            onProfile={() => setShowProfile(true)}
            onAddPet={() => setShowAddPet(true)}
            onSubscription={() => setShowSubscription(true)}
            onMessages={() => setShowMessages(true)}
          />
        </motion.div>

        <div className="space-y-6">
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <Input
                  placeholder="Search for a pet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-primary/50"
                />
              </div>
            </div>
          </motion.div>

          {petsLoading ? (
            <SkeletonGrid count={6} />
          ) : filteredPets.length === 0 ? (
            <EmptySearch onReset={() => setSearchQuery('')} />
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredPets.map((pet, index) => (
                <motion.div
                  key={pet.id}
                  variants={itemVariants}
                  custom={index}
                >
                  <PetCard
                    pet={pet}
                    onViewDetails={setSelectedPet}
                    onRequestMatch={handleRequestMatch}
                    onSubscriptionNeeded={() => setShowSubscription(true)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {selectedPet && !showMatchRequest && (
        <PetDetailsDialog
          pet={selectedPet}
          open={!!selectedPet}
          onClose={() => setSelectedPet(null)}
          onRequestMatch={handleRequestMatch}
        />
      )}

      {selectedPet && showMatchRequest && (
        <MatchRequestDialog
          pet={selectedPet}
          open={showMatchRequest}
          onClose={() => {
            setShowMatchRequest(false);
            setSelectedPet(null);
          }}
          onSubmit={handleSubmitMatchRequest}
        />
      )}

      <AddPetDialog open={showAddPet} onClose={() => setShowAddPet(false)} onAdd={() => { refetchPets(); setShowAddPet(false); }} />
      <UserProfileDialog open={showProfile} onClose={() => setShowProfile(false)} />
      <VetServicesDialog open={showVetServices} onClose={() => setShowVetServices(false)} />
      <SubscriptionDialog open={showSubscription} onClose={() => setShowSubscription(false)} />
      <MessagesDialog open={showMessages} onClose={() => setShowMessages(false)} />
      {showAnalytics && <GPSAnalytics open={showAnalytics} onClose={() => setShowAnalytics(false)} />}
      {showAdminSupport && <AdminSupportDashboard onClose={() => setShowAdminSupport(false)} />}
    </motion.div>
  );

  return (
    <ErrorBoundary>
      <PremiumFeaturesProvider>
        <LanguageProvider>
          <ThemeProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai" element={<AIMatchingPage />} />
              <Route path="/showcase" element={<FeaturesShowcasePage />} />
              <Route path="/notifications" element={<NotificationsCenter apiBase="/api/v1" userId="guest" />} />
              <Route path="/profile" element={<ProfileVerificationPage />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </ThemeProvider>
        </LanguageProvider>
      </PremiumFeaturesProvider>
    </ErrorBoundary>
  );
}
