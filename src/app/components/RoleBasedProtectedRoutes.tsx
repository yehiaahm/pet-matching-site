/**
 * Role-Based Protected Routes
 * Enhanced route protection with role-based access control
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole, hasPermission, hasAnyPermission, canAccessResource, ROUTE_PROTECTION } from '../../utils/roleBasedAccess';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, AlertTriangle, Crown, Star, Shield } from 'lucide-react';

// =============================================================================
// PROTECTED ROUTE COMPONENTS
// =============================================================================

interface BaseProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
  showLoading?: boolean;
}

interface RoleBasedRouteProps extends BaseProtectedRouteProps {
  requiredRole: UserRole | UserRole[];
  unauthorizedPath?: string;
}

interface PermissionBasedRouteProps extends BaseProtectedRouteProps {
  requiredPermission: string | string[];
  unauthorizedPath?: string;
}

interface AdminRouteProps extends BaseProtectedRouteProps {
  redirectTo?: string;
}

interface PremiumRouteProps extends BaseProtectedRouteProps {
  redirectTo?: string;
  upgradePath?: string;
}

// =============================================================================
// BASE PROTECTED ROUTE
// =============================================================================

export function BaseProtectedRoute({ 
  children, 
  redirectTo = '/login', 
  fallback,
  showLoading = true
}: BaseProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    if (!showLoading) {
      return null;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <LoadingSpinner size="xl" text="Verifying authentication..." />
          <p className="text-sm text-muted-foreground">
            Please wait while we secure your session
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🚫 BaseProtectedRoute: User not authenticated, redirecting to', redirectTo);
    
    // Store the attempted location for redirect after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    return <Navigate to={redirectTo} replace state={{ from: window.location.pathname }} />;
  }

  // Allow access if authenticated
  console.log('✅ BaseProtectedRoute: Access granted', { 
    userRole: user?.role, 
    path: window.location.pathname 
  });
  
  return <>{children}</>;
}

// =============================================================================
// ROLE-BASED PROTECTED ROUTE
// =============================================================================

export function RoleBasedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/login',
  unauthorizedPath = '/unauthorized',
  fallback,
  showLoading = true
}: RoleBasedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    if (!showLoading) {
      return null;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <LoadingSpinner size="xl" text="Verifying permissions..." />
          <p className="text-sm text-muted-foreground">
            Please wait while we check your access permissions
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🚫 RoleBasedRoute: User not authenticated, redirecting to', redirectTo);
    
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    return <Navigate to={redirectTo} replace state={{ from: window.location.pathname }} />;
  }

  // Check role-based access
  if (user && requiredRole) {
    const userRole = user.role?.toLowerCase() as UserRole;
    const requiredRoles = Array.isArray(requiredRole) 
      ? requiredRole as UserRole[]
      : [requiredRole];

    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      console.log('🚫 RoleBasedRoute: User role insufficient', { 
        userRole, 
        requiredRoles 
      });

      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
          <div className="max-w-md w-full mx-4">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <Lock className="h-4 w-4" />
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-red-900">
                      Access Denied
                    </h3>
                    <p className="text-sm text-red-700">
                      You don't have permission to access this page.
                      {userRole && (
                        <> Your role: <strong>{userRole}</strong></>
                      )}
                    </p>
                    <p className="text-xs text-red-600">
                      Required roles: {requiredRoles.join(', ')}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => window.history.back()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }
  }

  // Allow access if authenticated and authorized
  console.log('✅ RoleBasedRoute: Access granted', { 
    userRole: user?.role, 
    requiredRole,
    path: window.location.pathname 
  });
  
  return <>{children}</>;
}

// =============================================================================
// PERMISSION-BASED PROTECTED ROUTE
// =============================================================================

export function PermissionBasedRoute({ 
  children, 
  requiredPermission,
  redirectTo = '/login',
  unauthorizedPath = '/unauthorized',
  fallback,
  showLoading = true
}: PermissionBasedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    if (!showLoading) {
      return null;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <LoadingSpinner size="xl" text="Verifying permissions..." />
          <p className="text-sm text-muted-foreground">
            Please wait while we check your access permissions
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🚫 PermissionBasedRoute: User not authenticated, redirecting to', redirectTo);
    
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    return <Navigate to={redirectTo} replace state={{ from: window.location.pathname }} />;
  }

  // Check permission-based access
  if (user && requiredPermission) {
    const userRole = user.role?.toLowerCase() as UserRole;
    const requiredPermissions = Array.isArray(requiredPermission) 
      ? requiredPermission
      : [requiredPermission];

    const hasRequiredPermission = Array.isArray(requiredPermission)
      ? hasAnyPermission(userRole, requiredPermissions)
      : hasPermission(userRole, requiredPermission);

    if (!hasRequiredPermission) {
      console.log('🚫 PermissionBasedRoute: User permissions insufficient', { 
        userRole, 
        requiredPermissions 
      });

      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-yellow-50">
          <div className="max-w-md w-full mx-4">
            <Alert variant="destructive" className="border-orange-200 bg-orange-50">
              <Shield className="h-4 w-4" />
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-orange-900">
                      Insufficient Permissions
                    </h3>
                    <p className="text-sm text-orange-700">
                      You don't have the required permissions for this action.
                      {userRole && (
                        <> Your role: <strong>{userRole}</strong></>
                      )}
                    </p>
                    <p className="text-xs text-orange-600">
                      Required permissions: {Array.isArray(requiredPermissions) ? requiredPermissions.join(', ') : requiredPermissions}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => window.history.back()}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }
  }

  // Allow access if authenticated and authorized
  console.log('✅ PermissionBasedRoute: Access granted', { 
    userRole: user?.role, 
    requiredPermission,
    path: window.location.pathname 
  });
  
  return <>{children}</>;
}

// =============================================================================
// ADMIN ROUTE
// =============================================================================

export function AdminRoute({ 
  children, 
  redirectTo = '/login',
  fallback,
  showLoading = true
}: AdminRouteProps) {
  return (
    <RoleBasedRoute 
      requiredRole="admin" 
      redirectTo={redirectTo}
      unauthorizedPath="/unauthorized"
      fallback={fallback}
      showLoading={showLoading}
    >
      {children}
    </RoleBasedRoute>
  );
}

// =============================================================================
// PREMIUM ROUTE
// =============================================================================

export function PremiumRoute({ 
  children, 
  redirectTo = '/login',
  upgradePath = '/upgrade',
  fallback,
  showLoading = true
}: PremiumRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    if (!showLoading) {
      return null;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-yellow-50">
        <div className="text-center space-y-4">
          <LoadingSpinner size="xl" text="Verifying subscription..." />
          <p className="text-sm text-muted-foreground">
            Please wait while we check your subscription status
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🚫 PremiumRoute: User not authenticated, redirecting to', redirectTo);
    
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    return <Navigate to={redirectTo} replace state={{ from: window.location.pathname }} />;
  }

  // Check if user has premium access
  if (user) {
    const userRole = user.role?.toLowerCase() as UserRole;
    const hasPremiumAccess = userRole === 'premium' || userRole === 'admin';

    if (!hasPremiumAccess) {
      console.log('🚫 PremiumRoute: User does not have premium access', { 
        userRole 
      });

      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-yellow-50">
          <div className="max-w-md w-full mx-4">
            <Alert className="border-amber-200 bg-amber-50">
              <Star className="h-4 w-4 text-amber-600" />
              <Crown className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-amber-900">
                      Premium Feature
                    </h3>
                    <p className="text-sm text-amber-700">
                      This feature requires a premium subscription.
                      {userRole && (
                        <> Your current plan: <strong>{userRole}</strong></>
                      )}
                    </p>
                    <p className="text-xs text-amber-600">
                      Upgrade to premium to unlock this feature and more!
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-amber-100 rounded-lg p-3">
                      <h4 className="font-semibold text-amber-900 mb-2">Premium Benefits:</h4>
                      <ul className="text-xs text-amber-700 space-y-1">
                        <li>• Unlimited pet listings</li>
                        <li>• Advanced AI matching</li>
                        <li>• Priority customer support</li>
                        <li>• Data export and analytics</li>
                        <li>• Custom themes and features</li>
                      </ul>
                    </div>

                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Go Back
                      </button>
                      <button
                        onClick={() => window.location.href = upgradePath}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Upgrade to Premium
                      </button>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }
  }

  // Allow access if authenticated and authorized
  console.log('✅ PremiumRoute: Access granted', { 
    userRole: user?.role, 
    path: window.location.pathname 
  });
  
  return <>{children}</>;
}

// =============================================================================
// HIGHER-ORDER COMPONENTS
// =============================================================================

export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RoleBasedRouteProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <RoleBasedRoute {...options}>
      <Component {...props} />
    </RoleBasedRoute>
  );

  WrappedComponent.displayName = `withRoleProtection(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export function withPermissionProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<PermissionBasedRouteProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <PermissionBasedRoute {...options}>
      <Component {...props} />
    </PermissionBasedRoute>
  );

  WrappedComponent.displayName = `withPermissionProtection(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export function withAdminProtection<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AdminRouteProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <AdminRoute {...options}>
      <Component {...props} />
    </AdminRoute>
  );

  WrappedComponent.displayName = `withAdminProtection(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export function withPremiumProtection<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<PremiumRouteProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <PremiumRoute {...options}>
      <Component {...props} />
    </PremiumRoute>
  );

  WrappedComponent.displayName = `withPremiumProtection(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

// Maintain backward compatibility with existing ProtectedRoute
export function ProtectedRoute({ 
  children, 
  redirectTo = '/login', 
  requiredRole,
  requiredPermission,
  fallback,
  showLoading = true
}: RoleBasedRouteProps & PermissionBasedRouteProps) {
  // If requiredRole is specified, use RoleBasedRoute
  if (requiredRole) {
    return (
      <RoleBasedRoute 
        requiredRole={requiredRole}
        redirectTo={redirectTo}
        fallback={fallback}
        showLoading={showLoading}
      >
        {children}
      </RoleBasedRoute>
    );
  }

  // If requiredPermission is specified, use PermissionBasedRoute
  if (requiredPermission) {
    return (
      <PermissionBasedRoute 
        requiredPermission={requiredPermission}
        redirectTo={redirectTo}
        fallback={fallback}
        showLoading={showLoading}
      >
        {children}
      </PermissionBasedRoute>
    );
  }

  // Otherwise, use BaseProtectedRoute
  return (
    <BaseProtectedRoute 
      redirectTo={redirectTo}
      fallback={fallback}
      showLoading={showLoading}
    >
      {children}
    </BaseProtectedRoute>
  );
}

export default ProtectedRoute;
