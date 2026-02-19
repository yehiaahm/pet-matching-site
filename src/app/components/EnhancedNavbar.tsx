import { motion } from 'framer-motion';
import { Menu, X, Sparkles, Home, MessageSquare, FileText, User, Plus, LogOut, Headphones, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { useLanguage } from '../context/LanguageContext';

interface EnhancedNavbarProps {
  showMobileMenu?: boolean;
  onToggleMobileMenu?: () => void;
  currentView?: string;
  onViewChange?: (view: string) => void;
  onAddPet?: () => void;
  onProfile?: () => void;
  onLogout?: () => void;
  onHome?: () => void;
  onShowFeatures?: () => void;
  onSubscription?: () => void;
  onAdminSupport?: () => void;
  onAdminDashboard?: () => void;
  onAIDashboard?: () => void;
  userRole?: string;
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
  const onShowFeatures = props.onShowFeatures ?? (() => {});
  const onAdminSupport = props.onAdminSupport ?? (() => {});
  const onAdminDashboard = props.onAdminDashboard ?? (() => {});
  const userRole = props.userRole ?? 'USER';

  const [isOpen, setIsOpen] = useState(showMobileMenu);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
    onToggleMobileMenu?.();
  };

  return (
    <motion.header
      className="sticky top-0 z-40 bg-white border-b border-gray-200"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onShowFeatures} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {language === 'ar' ? 'المميزات' : 'Features'}
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="menu">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
            <Button
              variant={currentView === 'browse' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                onHome();
                setIsOpen(false);
              }}
            >
              <Home className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Button>

            <Button
              variant={currentView === 'requests' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                onViewChange('requests');
                setIsOpen(false);
              }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'الطلبات' : 'Requests'}
            </Button>

            <Button
              variant={currentView === 'health' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                onViewChange('health');
                setIsOpen(false);
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'السجلات الصحية' : 'Health'}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                onAddPet();
                setIsOpen(false);
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
                setIsOpen(false);
              }}
            >
              <User className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </Button>

            {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onAdminSupport();
                  setIsOpen(false);
                }}
              >
                <Headphones className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'الدعم' : 'Support'}
              </Button>
            )}

            {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onAdminDashboard();
                  setIsOpen(false);
                }}
              >
                <Shield className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'لوحة المشرف' : 'Admin Panel'}
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={() => {
                onLogout();
                setIsOpen(false);
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
