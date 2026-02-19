/**
 * Lazy Loading Configuration
 * Centralized lazy loading setup for all pages
 */

import { lazy, Suspense } from 'react';

// =============================================================================
// LAZY LOADED COMPONENTS
// =============================================================================

// Landing page - First impression, critical
const LandingPage = lazy(() => import('../app/pages/LandingPage'));

// Authentication pages - Critical for user access
const AuthPage = lazy(() => import('../app/pages/AuthPage'));
const ProfileVerificationPage = lazy(() => import('../app/pages/ProfileVerificationPage'));

// Dashboard - Main user interface
const Dashboard = lazy(() => import('../app/pages/Dashboard'));

// Feature pages - Important for user experience
const AIMatchingPage = lazy(() => import('../app/pages/AIMatchingPage'));
const FeaturesShowcasePage = lazy(() => import('../app/pages/FeaturesShowcasePage'));
const NotificationsCenter = lazy(() => import('../app/pages/NotificationsCenter'));

// Admin pages - Low priority
const AdminSupportDashboard = lazy(() => import('../app/components/AdminSupportDashboard'));

// =============================================================================
// LOADING COMPONENTS
// =============================================================================

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading page...</p>
    </div>
  </div>
);

export const ComponentLoader = ({ componentName }: { componentName: string }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-600 text-sm">Loading {componentName}...</p>
    </div>
  </div>
);

// =============================================================================
// LAZY LOADED ROUTE COMPONENTS
// =============================================================================

export const LazyRoute = ({ 
  component, 
  fallback 
}: { 
  component: React.LazyExoticComponent<any>;
  fallback?: React.ReactNode;
}) => {
  const Component = component;
  return (
    <Suspense fallback={fallback || <PageLoader />}>
      <Component />
    </Suspense>
  );
};

export const LazyPage = ({ 
  component, 
  fallback 
}: { 
  component: React.LazyExoticComponent<any>;
  fallback?: React.ReactNode;
}) => {
  const Component = component;
  return (
    <Suspense fallback={fallback || <PageLoader />}>
      <Component />
    </Suspense>
  );
};

// Export the actual lazy components for use in routing
export { LandingPage, AuthPage, ProfileVerificationPage, Dashboard, AIMatchingPage, FeaturesShowcasePage, NotificationsCenter, AdminSupportDashboard };

// =============================================================================
// PRELOADING STRATEGY
// =============================================================================

export const preloadComponent = (component: React.LazyExoticComponent<any>) => {
  // This would typically be used in a router or app initialization
  // For now, we'll just return the component
  return component;
};

// =============================================================================
// BATCH PRELOADING
// =============================================================================

export const preloadCriticalPages = () => {
  // Preload critical pages for better performance
  const preloadPromises = [
    import('../app/pages/LandingPage'),
    import('../app/pages/AuthPage'),
    import('../app/pages/Dashboard'),
  ];

  return Promise.all(preloadPromises);
};

// =============================================================================
// EXPORTS
// =============================================================================

export {
  PageLoader,
  ComponentLoader,
  LazyRoute,
  LazyPage,
  preloadComponent,
  preloadCriticalPages
};
