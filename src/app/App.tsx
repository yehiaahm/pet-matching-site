import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { PremiumFeaturesProvider } from './context/PremiumFeaturesContext';
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
import TermsPage from './pages/TermsPage';
import AboutPage from './pages/AboutPage';
import { AdvancedFeatures3D } from './components/AdvancedFeatures3D';
import { GPSAnalytics } from './components/GPSAnalytics';
import { AIRecommendations } from './components/AIRecommendations';
import { GPSMatching } from './components/GPSMatching';
import { AdminSupportDashboard } from './components/AdminSupportDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PetMatAIControlPanel } from './components/PetMatAIControlPanel';
import ProtectedRoute from './components/ProtectedRoute';
import SellerOnlyRoute from './components/SellerOnlyRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AIMatchingPage from './pages/AIMatchingPage';
import AIShoppingRecommendationsPage from './pages/AIShoppingRecommendationsPage';
import FeaturesShowcasePage from './pages/FeaturesShowcasePage';
import NotificationsCenter from './pages/NotificationsCenter';
import { AdminPaymentsPage } from './pages/AdminPaymentsPage';
import SubscriptionPaymentResultPage from './pages/SubscriptionPaymentResultPage';
import PaymentCheckoutPage from './pages/PaymentCheckoutPage';
import MarketplacePage from './pages/MarketplacePage';
import MarketplaceCartPage from './pages/MarketplaceCartPage';
import MarketplaceSellerPage from './pages/MarketplaceSellerPage';
import SuperAdminPanelPage from './pages/SuperAdminPanelPage';
import AdminSupportPage from './pages/AdminSupportPage';
import VetClinicsPage from './pages/VetClinicsPage';
import CommunitySupportPage from './pages/CommunitySupportPage';
import CommunitySupportChatPage from './pages/CommunitySupportChatPage';
import { SystemAlertBanner } from './components/SystemAlertBanner';
import { AIPopupChatbot } from './components/AIPopupChatbot';
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
import { pageVariants, containerVariants, itemVariants } from '../lib/animations';

export interface Pet {
  id: string;
  ownerId?: string;
  name: string;
  type: 'dog' | 'cat' | 'bird';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  image?: string; // للتوافق مع البيانات القديمة
  images?: string[]; // للتوافق مع API الجديد
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
  aiHealthRecommendation?: {
    needsVaccination: boolean;
    needsVetVisit: boolean;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    reasons: string[];
    suggestedActions: string[];
    generatedAt: string;
  };
  description: string;
  verified: boolean;
}

// Pet data will be fetched from API
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
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAdminSupport, setShowAdminSupport] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !onboardingState) {
      startOnboarding();
    }
  }, [isAuthenticated, onboardingState, startOnboarding]);

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
  };

  const handleFeatureSelect = (featureKey: string) => {
    switch (featureKey) {
      case 'ai':
      case 'recommendations':
        navigate('/ai');
        break;
      case 'gps':
        // GPS matching functionality
        break;
      case 'health':
        navigate('/health-records');
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
        toast.success('سيتم إرسال التنبيهات لك على بريدك الإلكتروني', {
          description: 'فعّل الإشعارات من إعدادات حسابك.',
        });
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
        toast.info('الميزة قريباً', {
          description: 'هذه الميزة قيد التطوير حالياً.',
        });
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
        <LoadingSpinner size="xl" text="جاري التحميل..." fullScreen />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PremiumFeaturesProvider>
        <LanguageProvider>
          <ThemeProvider>
            <SystemAlertBanner />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Auth Routes - Redirect to dashboard if already logged in */}
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <LoginPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <RegisterPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Routes - Require authentication */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfileVerificationPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai" 
                element={
                  <ProtectedRoute>
                    <AIMatchingPage />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/ai-shopping-recommendations"
                element={
                  <ProtectedRoute>
                    <AIShoppingRecommendationsPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/ai-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'moderator', 'super_admin']}>
                    <PetMatAIControlPanel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/payments" 
                element={
                  <ProtectedRoute>
                    <AdminPaymentsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <NotificationsCenter apiBase="/api/v1" userId={user?.id || 'guest'} />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/vet-clinics"
                element={
                  <ProtectedRoute>
                    <VetClinicsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/health-records"
                element={
                  <ProtectedRoute>
                    <HealthRecords />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gps-proximity"
                element={
                  <ProtectedRoute>
                    <GPSMatching />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community-support"
                element={
                  <ProtectedRoute>
                    <CommunitySupportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community-support/chat"
                element={
                  <ProtectedRoute>
                    <CommunitySupportChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <MarketplacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace/cart"
                element={
                  <ProtectedRoute>
                    <MarketplaceCartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace/seller"
                element={
                  <ProtectedRoute>
                    <SellerOnlyRoute>
                      <MarketplaceSellerPage />
                    </SellerOnlyRoute>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/subscription/success" 
                element={
                  <ProtectedRoute>
                    <SubscriptionPaymentResultPage mode="success" />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/subscription/cancel" 
                element={
                  <ProtectedRoute>
                    <SubscriptionPaymentResultPage mode="cancel" />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <PaymentCheckoutPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes - Require authentication */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/admin/support"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                    <AdminSupportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                    <SuperAdminPanelPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Public Showcase Routes */}
              <Route path="/showcase" element={<FeaturesShowcasePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/terms" element={<TermsPage />} />
              
              {/* Catch All - Redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <AIPopupChatbot />
          </ThemeProvider>
        </LanguageProvider>
      </PremiumFeaturesProvider>
    </ErrorBoundary>
  );
}
