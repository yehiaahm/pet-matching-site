import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../hooks/usePets';
import { EnhancedNavbar } from '../components/EnhancedNavbar';
import { PetCard } from '../components/PetCard';
import { PetDetailsDialog } from '../components/PetDetailsDialog';
import { MatchRequestDialog } from '../components/MatchRequestDialog';
import { AddPetDialog } from '../components/AddPetDialog';
import { EditPetDialog } from '../components/EditPetDialog';
import { UserProfileDialog } from '../components/UserProfileDialog';
import { SubscriptionDialog } from '../components/SubscriptionDialog';
import { CustomerSupportPage } from '../components/CustomerSupportPage';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search } from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptySearch } from '../components/ui/EmptyState';
import { Pet } from '../App';
import { toast } from 'sonner';
import { safeDelete } from '../utils/safeFetch';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { pets, loading, error, refetch } = usePets();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showPetDetails, setShowPetDetails] = useState(false);
  const [showMatchRequest, setShowMatchRequest] = useState(false);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showEditPet, setShowEditPet] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showCustomerSupport, setShowCustomerSupport] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentView, setCurrentView] = useState('browse');

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || pet.type === selectedType;
    const matchesGender = selectedGender === 'all' || pet.gender === selectedGender;
    return matchesSearch && matchesType && matchesGender;
  });

  const handleViewDetails = (pet: Pet) => {
    setSelectedPet(pet);
    setShowPetDetails(true);
  };

  const handleRequestMatch = (pet: Pet) => {
    setSelectedPet(pet);
    setShowMatchRequest(true);
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setShowEditPet(true);
  };

  const handleDeletePet = async (pet: Pet) => {
    const shouldDelete = window.confirm(`هل أنت متأكد من حذف ${pet.name}؟`);
    if (!shouldDelete) return;

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
    const response = await safeDelete(`/api/v1/pets/${pet.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.success) {
      toast.error(response.error || 'فشل حذف الحيوان');
      return;
    }

    toast.success('تم حذف الحيوان بنجاح');
    await refetch();
  };

  const handleSubmitMatchRequest = () => {
    toast.success('تم إرسال طلب التزاوج بنجاح', {
      description: 'سيتم إشعارك عند رد الطرف الآخر.',
    });
    setShowMatchRequest(false);
    setSelectedPet(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleViewChange = (view: string) => {
    if (view === 'features') {
      setCurrentView((prev) => (prev === 'features' ? 'browse' : 'features'));
      return;
    }
    setCurrentView(view);
  };

  const featureCards = [
    {
      key: 'ai',
      title: 'AI Matching',
      description: 'مطابقة ذكية للحيوانات باستخدام الذكاء الاصطناعي.',
      action: () => navigate('/ai'),
    },
    {
      key: 'gps',
      title: 'GPS Proximity',
      description: 'العثور على الحيوانات القريبة حسب الموقع.',
      action: () => navigate('/gps-proximity'),
    },
    {
      key: 'community',
      title: 'Community Support',
      description: 'التواصل والدعم المجتمعي بين المستخدمين.',
      action: () => navigate('/community-support'),
    },
    {
      key: 'clinics',
      title: 'Vet Clinics Booking',
      description: 'حجز العيادات البيطرية ومتابعة الزيارات.',
      action: () => navigate('/vet-clinics'),
    },
    {
      key: 'health',
      title: 'Health Records',
      description: 'إدارة السجل الصحي والتطعيمات.',
      action: () => navigate('/health-records'),
    },
    {
      key: 'chat',
      title: 'Community Chat',
      description: 'الدخول إلى شات دعم المجتمع مباشرة.',
      action: () => navigate('/community-support/chat'),
    },
    {
      key: 'ai-shopping',
      title: 'AI Shopping Recommendation',
      description: 'اقتراحات ذكية للمنتجات المناسبة لحيوانك (أكل، ألعاب، عناية، وصحة).',
      action: () => navigate('/ai-shopping-recommendations'),
    },
  ];

  const handleAdminSupport = () => {
    setShowCustomerSupport(true);
  };

  const handleAdminDashboard = () => {
    navigate('/admin');
  };

  const handleAIDashboard = () => {
    navigate('/ai-dashboard');
  };

  const handleMarketplace = () => {
    navigate('/marketplace');
  };

  const handleSuperAdminPanel = () => {
    navigate('/super-admin');
  };

  const handleAdminPayments = () => {
    navigate('/admin/payments');
  };

  const handleShowTerms = () => {
    navigate('/terms');
  };

  const handleShowAbout = () => {
    navigate('/about');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading pets: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navbar */}
      <EnhancedNavbar
        showMobileMenu={showMobileMenu}
        onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
        currentView={currentView}
        onViewChange={handleViewChange}
        onAddPet={() => setShowAddPet(true)}
        onProfile={() => setShowProfile(true)}
        onLogout={handleLogout}
        onHome={handleHome}
        onMarketplace={handleMarketplace}
        onSubscription={() => setShowSubscription(true)}
        onAdminSupport={handleAdminSupport}
        onAdminDashboard={handleAdminDashboard}
        onSuperAdminPanel={handleSuperAdminPanel}
        onAdminPayments={handleAdminPayments}
        onAIDashboard={handleAIDashboard}
        userRole={user?.role || 'USER'}
        userId={user?.id || 'guest'}
        onShowTerms={handleShowTerms}
        onShowAbout={handleShowAbout}
        userName={user?.email || 'User'}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً بك، {user?.email || 'User'}!
          </h1>
          <p className="text-gray-600">
            ابحث عن الشريك المثالي لحيوانك الأليف
          </p>
        </motion.div>

        {currentView === 'features' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2">المميزات المتاحة</h2>
            <p className="text-sm text-gray-600 mb-5">اضغط على أي ميزة لفتحها. اضغط زر المميزات مرة أخرى لإخفاء هذه القائمة.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {featureCards.map((feature) => (
                <div key={feature.key} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                  <Button size="sm" className="w-full" onClick={feature.action}>
                    فتح
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="ابحث عن حيوان أليف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأنواع</SelectItem>
                  <SelectItem value="dog">كلاب</SelectItem>
                  <SelectItem value="cat">قطط</SelectItem>
                  <SelectItem value="bird">طيور</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger>
                  <SelectValue placeholder="الجنس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Pet Grid */}
        {filteredPets.length === 0 ? (
          <EmptySearch />
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredPets.map((pet, index) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PetCard 
                  pet={pet} 
                  onViewDetails={handleViewDetails}
                  onRequestMatch={handleRequestMatch}
                  canManage={pet.ownerId === user?.id}
                  onEdit={handleEditPet}
                  onDelete={handleDeletePet}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {pets.length}
            </div>
            <div className="text-gray-600">إجمالي الحيوانات</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {pets.filter(p => p.type === 'cat').length}
            </div>
            <div className="text-gray-600">قطط متاحة</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.floor(pets.length * 0.6)}
            </div>
            <div className="text-gray-600">مطابقات</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {pets.filter(p => p.type === 'dog').length}
            </div>
            <div className="text-gray-600">كلاب متاحة</div>
          </div>
        </motion.div>
      </div>

      {/* Dialogs */}
      {selectedPet && (
        <>
          <PetDetailsDialog
            pet={selectedPet}
            open={showPetDetails}
            onClose={() => {
              setShowPetDetails(false);
              setSelectedPet(null);
            }}
            onRequestMatch={handleRequestMatch}
          />
          <MatchRequestDialog
            pet={selectedPet}
            open={showMatchRequest}
            onClose={() => {
              setShowMatchRequest(false);
              setSelectedPet(null);
            }}
            onSubmit={handleSubmitMatchRequest}
          />
        </>
      )}

      {showAddPet && (
        <AddPetDialog
          open={showAddPet}
          onClose={() => setShowAddPet(false)}
          onAdd={async (_pet) => {
            toast.success('تم إضافة الحيوان بنجاح!');
            await refetch();
            setShowAddPet(false);
          }}
        />
      )}

      <EditPetDialog
        open={showEditPet}
        onClose={() => {
          setShowEditPet(false);
          setSelectedPet(null);
        }}
        pet={selectedPet}
        onUpdated={async () => {
          await refetch();
        }}
      />

      {showProfile && (
        <UserProfileDialog
          open={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showSubscription && (
        <SubscriptionDialog
          open={showSubscription}
          onClose={() => setShowSubscription(false)}
        />
      )}

      {showCustomerSupport && (
        <CustomerSupportPage onClose={() => setShowCustomerSupport(false)} />
      )}
    </div>
  );
}
