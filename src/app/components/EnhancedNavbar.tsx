import { motion } from 'framer-motion';
import { X, Menu, Sparkles, Home, User, Plus, LogOut, Headphones, Shield, Crown, Wallet, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useLanguage } from '../context/LanguageContext';
import { NotificationBell } from './NotificationBell';

interface EnhancedNavbarProps {
  showMobileMenu?: boolean;
  onToggleMobileMenu?: () => void;
  currentView?: string;
  onViewChange?: (view: string) => void;
  onAddPet?: () => void;
  onProfile?: () => void;
  onLogout?: () => void;
  onHome?: () => void;
  onMarketplace?: () => void;
  onSubscription?: () => void;
  onAdminSupport?: () => void;
  onAdminDashboard?: () => void;
  onAIDashboard?: () => void;
  onSuperAdminPanel?: () => void;
  onAdminPayments?: () => void;
  userRole?: string;
  userId?: string;
  onShowTerms?: () => void;
  onShowAbout?: () => void;
  userName?: string;
}

export function EnhancedNavbar(props: EnhancedNavbarProps) {
  const { language } = useLanguage();

  const showMobileMenu = props.showMobileMenu ?? false;
  const onToggleMobileMenu = props.onToggleMobileMenu;
  const currentView = props.currentView ?? 'browse';
  const onViewChange = props.onViewChange ?? (() => {});
  const onAddPet = props.onAddPet ?? (() => {});
  const onProfile = props.onProfile ?? (() => {});
  const onLogout = props.onLogout ?? (() => {});
  const onHome = props.onHome ?? (() => {});
  const onMarketplace = props.onMarketplace ?? (() => {});
  const onSubscription = props.onSubscription ?? (() => {});
  const onAdminSupport = props.onAdminSupport ?? (() => {});
  const onAdminDashboard = props.onAdminDashboard ?? (() => {});
  const onAIDashboard = props.onAIDashboard ?? (() => {});
  const onSuperAdminPanel = props.onSuperAdminPanel ?? (() => {});
  const onAdminPayments = props.onAdminPayments ?? (() => {});
  const userRole = props.userRole ?? 'USER';
  const userId = props.userId ?? 'guest';
  const normalizedRole = String(userRole).trim().toUpperCase().replace(/[\s-]+/g, '_');
  const isSuperAdmin = normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'SUPERADMIN';

  const [isOpen, setIsOpen] = useState(showMobileMenu);

  useEffect(() => {
    setIsOpen(showMobileMenu);
  }, [showMobileMenu]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
    onToggleMobileMenu?.();
  };

  const closeMenu = () => {
    setIsOpen(false);
    if (showMobileMenu) {
      onToggleMobileMenu?.();
    }
  };

  return (
    <motion.header
      className="sticky top-0 z-40 bg-white border-b border-gray-200"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-end gap-2">
        <NotificationBell apiBase="/api/v1" userId={userId} />

        <Button variant="default" size="sm" onClick={onAddPet} className="gap-2">
          <Plus className="w-4 h-4" />
          {language === 'ar' ? 'إضافة حيوان' : 'Add Pet'}
        </Button>

        <Button
          variant={currentView === 'features' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('features')}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {language === 'ar' ? 'المزايا' : 'Features'}
        </Button>

        <Button variant="outline" size="sm" onClick={onMarketplace} className="gap-2">
          <ShoppingBag className="w-4 h-4" />
          {language === 'ar' ? 'المتجر' : 'Marketplace'}
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="menu">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
            <Button
              variant={currentView === 'browse' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                onViewChange('browse');
                onHome();
                closeMenu();
              }}
            >
              <Home className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                onAddPet();
                closeMenu();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إضافة حيوان' : 'Add Pet'}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                onProfile();
                closeMenu();
              }}
            >
              <User className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                onSubscription();
                closeMenu();
              }}
            >
              <Crown className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'الترقية' : 'Upgrade'}
            </Button>

            {isSuperAdmin && (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onAIDashboard();
                  closeMenu();
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'لوحة الذكاء الاصطناعي' : 'AI Dashboard'}
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                onAdminSupport();
                closeMenu();
              }}
            >
              <Headphones className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'دعم العملاء' : 'Customer Support'}
            </Button>

            {isSuperAdmin && (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onAdminDashboard();
                  closeMenu();
                }}
              >
                <Shield className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'لوحة المشرف' : 'Admin Panel'}
              </Button>
            )}

            {isSuperAdmin && (
              <Button
                variant="ghost"
                className="w-full justify-start text-indigo-600 hover:text-indigo-700"
                onClick={() => {
                  onSuperAdminPanel();
                  closeMenu();
                }}
              >
                <Shield className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'لوحة السوبر أدمن' : 'Super Admin Panel'}
              </Button>
            )}

            {isSuperAdmin && (
              <Button
                variant="ghost"
                className="w-full justify-start text-purple-600 hover:text-purple-700"
                onClick={() => {
                  onAdminPayments();
                  closeMenu();
                }}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'مراجعة الدفع' : 'Payment Review'}
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={() => {
                onLogout();
                closeMenu();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </div>
        </div>
      )}
    </motion.header>
  );
}
