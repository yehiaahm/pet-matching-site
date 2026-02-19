import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthContext } from './AuthContext';

interface PremiumFeaturesContextType {
  featureAttempts: Record<string, number>;
  canUseFeature: (featureName: string) => boolean;
  recordFeatureAttempt: (featureName: string) => void;
  resetFeatureAttempts: () => void;
  getRemainingAttempts: (featureName: string) => number;
}

const PremiumFeaturesContext = createContext<PremiumFeaturesContextType | undefined>(undefined);

const PREMIUM_FEATURES = [
  'aiMatching',
  'gpsSearch',
  'advancedAnalytics',
  'unlimitedRequests',
  'featuredProfile',
  'customBranding',
  'vetIntegration',
  'prioritySupport',
  'petMatching', // مطابقة الحيوانات
];

const MAX_FREE_ATTEMPTS = 2; // مجاني 2 مرات فقط، المرة الثالثة يجب الاشتراك

export function PremiumFeaturesProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const [featureAttempts, setFeatureAttempts] = useState<Record<string, number>>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('premium-feature-attempts');
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever attempts change
  useEffect(() => {
    localStorage.setItem('premium-feature-attempts', JSON.stringify(featureAttempts));
  }, [featureAttempts]);

  const canUseFeature = (featureName: string): boolean => {
    // Not a premium feature, always allow
    if (!PREMIUM_FEATURES.includes(featureName)) {
      return true;
    }

    const userRole = user?.role?.toUpperCase?.() || '';
    const isAdmin = isAuthenticated && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN');
    if (isAdmin) {
      return true;
    }

    const attempts = featureAttempts[featureName] || 0;
    return attempts < MAX_FREE_ATTEMPTS;
  };

  const recordFeatureAttempt = (featureName: string): void => {
    if (!PREMIUM_FEATURES.includes(featureName)) {
      return;
    }

    const userRole = user?.role?.toUpperCase?.() || '';
    const isAdmin = isAuthenticated && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN');
    if (isAdmin) {
      return;
    }

    setFeatureAttempts((prev) => {
      const newAttempts = (prev[featureName] || 0) + 1;
      console.log(`Feature "${featureName}" used: ${newAttempts}/${MAX_FREE_ATTEMPTS} free attempts`);
      
      return {
        ...prev,
        [featureName]: newAttempts,
      };
    });
  };

  const getRemainingAttempts = (featureName: string): number => {
    if (!PREMIUM_FEATURES.includes(featureName)) {
      return Infinity;
    }

    const userRole = user?.role?.toUpperCase?.() || '';
    const isAdmin = isAuthenticated && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN');
    if (isAdmin) {
      return Infinity;
    }

    const attempts = featureAttempts[featureName] || 0;
    return Math.max(0, MAX_FREE_ATTEMPTS - attempts);
  };

  const resetFeatureAttempts = () => {
    setFeatureAttempts({});
    localStorage.removeItem('premium-feature-attempts');
  };

  return (
    <PremiumFeaturesContext.Provider value={{ featureAttempts, canUseFeature, recordFeatureAttempt, resetFeatureAttempts, getRemainingAttempts }}>
      {children}
    </PremiumFeaturesContext.Provider>
  );
}

export function usePremiumFeatures() {
  const context = useContext(PremiumFeaturesContext);
  if (!context) {
    throw new Error('usePremiumFeatures must be used within PremiumFeaturesProvider');
  }
  return context;
}
