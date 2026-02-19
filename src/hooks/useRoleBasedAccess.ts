/**
 * Role-Based Access Control Hooks
 * Custom hooks for checking user roles and permissions
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '../app/context/AuthContext';
import { 
  UserRole, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  canAccessResource,
  isRoleHigher,
  isRoleEqualOrHigher,
  getRoleLevel,
  getRoleDisplayName,
  getRoleColor,
  getRoleIcon,
  getRolePermissions,
  getAccessibleRoles
} from '../utils/roleBasedAccess';

// =============================================================================
// ROLE ACCESS HOOKS
// =============================================================================

/**
 * Hook for checking if current user has required role
 */
export function useRoleAccess(requiredRole?: UserRole | UserRole[]) {
  const { user, isAuthenticated } = useAuth();
  
  const hasAccess = useMemo(() => {
    if (!isAuthenticated || !user) {
      return { hasAccess: false, userRole: null };
    }

    if (!requiredRole) {
      return { hasAccess: true, userRole: user.role as UserRole };
    }

    const userRole = user.role?.toLowerCase() as UserRole;
    const requiredRoles = Array.isArray(requiredRole) 
      ? requiredRole
      : [requiredRole];

    // Check if user role is equal or higher than required role
    const access = requiredRoles.some(role => isRoleEqualOrHigher(userRole, role));

    return { hasAccess: access, userRole };
  }, [user, isAuthenticated, requiredRole]);

  return hasAccess;
}

/**
 * Hook for checking if current user has required permission
 */
export function usePermissionAccess(requiredPermission?: string | string[]) {
  const { user, isAuthenticated } = useAuth();
  
  const hasAccess = useMemo(() => {
    if (!isAuthenticated || !user) {
      return { hasAccess: false, userRole: null, permissions: [] };
    }

    const userRole = user.role?.toLowerCase() as UserRole;

    if (!requiredPermission) {
      return { 
        hasAccess: true, 
        userRole, 
        permissions: getRolePermissions(userRole)
      };
    }

    const requiredPermissions = Array.isArray(requiredPermission) 
      ? requiredPermission
      : [requiredPermission];

    const access = Array.isArray(requiredPermission)
      ? hasAnyPermission(userRole, requiredPermissions)
      : hasPermission(userRole, requiredPermission);

    return { 
      hasAccess: access, 
      userRole, 
      permissions: getRolePermissions(userRole)
    };
  }, [user, isAuthenticated, requiredPermission]);

  return hasAccess;
}

/**
 * Hook for checking if current user can access a specific resource
 */
export function useResourceAccess(resource: string, action: string) {
  const { user, isAuthenticated } = useAuth();
  
  const hasAccess = useMemo(() => {
    if (!isAuthenticated || !user) {
      return { hasAccess: false, userRole: null };
    }

    const userRole = user.role?.toLowerCase() as UserRole;
    const access = canAccessResource(userRole, resource, action);

    return { hasAccess: access, userRole };
  }, [user, isAuthenticated, resource, action]);

  return hasAccess;
}

/**
 * Hook for checking if current user is admin
 */
export function useIsAdmin() {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    if (!isAuthenticated || !user) {
      return false;
    }

    const userRole = user.role?.toLowerCase() as UserRole;
    return userRole === 'admin';
  }, [user, isAuthenticated]);
}

/**
 * Hook for checking if current user is premium or admin
 */
export function useIsPremium() {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    if (!isAuthenticated || !user) {
      return false;
    }

    const userRole = user.role?.toLowerCase() as UserRole;
    return userRole === 'premium' || userRole === 'admin';
  }, [user, isAuthenticated]);
}

/**
 * Hook for checking if current user is user or higher
 */
export function useIsUser() {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    if (!isAuthenticated || !user) {
      return false;
    }

    const userRole = user.role?.toLowerCase() as UserRole;
    return userRole === 'user' || userRole === 'premium' || userRole === 'admin';
  }, [user, isAuthenticated]);
}

// =============================================================================
// ROLE INFORMATION HOOKS
// =============================================================================

/**
 * Hook for getting current user's role information
 */
export function useRoleInfo() {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    if (!isAuthenticated || !user) {
      return {
        role: null,
        displayName: 'Guest',
        color: '#6b7280',
        icon: '👤',
        level: 0,
        permissions: []
      };
    }

    const userRole = user.role?.toLowerCase() as UserRole;

    return {
      role: userRole,
      displayName: getRoleDisplayName(userRole),
      color: getRoleColor(userRole),
      icon: getRoleIcon(userRole),
      level: getRoleLevel(userRole),
      permissions: getRolePermissions(userRole)
    };
  }, [user, isAuthenticated]);
}

/**
 * Hook for getting accessible roles for current user
 */
export function useAccessibleRoles() {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    if (!isAuthenticated || !user) {
      return [];
    }

    const userRole = user.role?.toLowerCase() as UserRole;
    return getAccessibleRoles(userRole);
  }, [user, isAuthenticated]);
}

/**
 * Hook for checking role hierarchy
 */
export function useRoleHierarchy() {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    if (!isAuthenticated || !user) {
      return {
        currentRole: null,
        canUpgradeTo: [],
        canManage: [],
        isHighestRole: false
      };
    }

    const userRole = user.role?.toLowerCase() as UserRole;
    const userLevel = getRoleLevel(userRole);

    return {
      currentRole: userRole,
      canUpgradeTo: ['user', 'premium', 'admin'].filter(role => getRoleLevel(role as UserRole) > userLevel),
      canManage: ['user', 'premium', 'admin'].filter(role => getRoleLevel(role as UserRole) < userLevel),
      isHighestRole: userLevel === 3 // admin level
    };
  }, [user, isAuthenticated]);
}

// =============================================================================
// PERMISSION CHECKING HOOKS
// =============================================================================

/**
 * Hook for checking multiple permissions at once
 */
export function usePermissions(permissions: string[]) {
  const { user, isAuthenticated } = useAuth();
  
  const results = useMemo(() => {
    if (!isAuthenticated || !user) {
      return permissions.map(permission => ({
        permission,
        hasAccess: false
      }));
    }

    const userRole = user.role?.toLowerCase() as UserRole;
    
    return permissions.map(permission => ({
      permission,
      hasAccess: hasPermission(userRole, permission)
    }));
  }, [user, isAuthenticated, permissions]);

  return results;
}

/**
 * Hook for checking if user has all required permissions
 */
export function useAllPermissions(requiredPermissions: string[]) {
  const { user, isAuthenticated } = useAuth();
  
  const hasAllAccess = useMemo(() => {
    if (!isAuthenticated || !user) {
      return { hasAllAccess: false, missingPermissions: requiredPermissions };
    }

    const userRole = user.role?.toLowerCase() as UserRole;
    const hasAccess = hasAllPermissions(userRole, requiredPermissions);
    
    const missingPermissions = requiredPermissions.filter(permission => 
      !hasPermission(userRole, permission)
    );

    return { hasAllAccess: hasAccess, missingPermissions };
  }, [user, isAuthenticated, requiredPermissions]);

  return hasAllAccess;
}

/**
 * Hook for checking if user has any of the required permissions
 */
export function useAnyPermissions(requiredPermissions: string[]) {
  const { user, isAuthenticated } = useAuth();
  
  const hasAnyAccess = useMemo(() => {
    if (!isAuthenticated || !user) {
      return { hasAnyAccess: false, availablePermissions: [] };
    }

    const userRole = user.role?.toLowerCase() as UserRole;
    const hasAccess = hasAnyPermission(userRole, requiredPermissions);
    
    const availablePermissions = requiredPermissions.filter(permission => 
      hasPermission(userRole, permission)
    );

    return { hasAnyAccess: hasAccess, availablePermissions };
  }, [user, isAuthenticated, requiredPermissions]);

  return hasAnyAccess;
}

// =============================================================================
// FEATURE ACCESS HOOKS
// =============================================================================

/**
 * Hook for checking if user can access specific features
 */
export function useFeatureAccess() {
  const { user, isAuthenticated } = useAuth();
  
  const features = useMemo(() => {
    if (!isAuthenticated || !user) {
      return {
        canViewDashboard: false,
        canCreatePets: false,
        canEditOwnPets: false,
        canDeleteOwnPets: false,
        canViewAIMatching: false,
        canCreateMatchRequests: false,
        canSendMessages: false,
        canViewNotifications: false,
        canUnlimitedPets: false,
        canAdvancedAIMatching: false,
        canPrioritySupport: false,
        canExportData: false,
        canCustomThemes: false,
        canBasicAnalytics: false,
        canLargeFileUploads: false,
        canViewUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        canManageRoles: false,
        canViewSystemAnalytics: false,
        canManageSystem: false,
        canViewLogs: false,
        canManageContent: false
      };
    }

    const userRole = user.role?.toLowerCase() as UserRole;

    return {
      canViewDashboard: hasPermission(userRole, 'view:dashboard'),
      canCreatePets: hasPermission(userRole, 'create:pets'),
      canEditOwnPets: hasPermission(userRole, 'edit:own_pets'),
      canDeleteOwnPets: hasPermission(userRole, 'delete:own_pets'),
      canViewAIMatching: hasPermission(userRole, 'view:ai_matching'),
      canCreateMatchRequests: hasPermission(userRole, 'create:match_requests'),
      canSendMessages: hasPermission(userRole, 'send:messages'),
      canViewNotifications: hasPermission(userRole, 'view:notifications'),
      canUnlimitedPets: hasPermission(userRole, 'unlimited:pets'),
      canAdvancedAIMatching: hasPermission(userRole, 'advanced:ai_matching'),
      canPrioritySupport: hasPermission(userRole, 'priority:support'),
      canExportData: hasPermission(userRole, 'export:data'),
      canCustomThemes: hasPermission(userRole, 'custom:themes'),
      canBasicAnalytics: hasPermission(userRole, 'analytics:basic'),
      canLargeFileUploads: hasPermission(userRole, 'file:large_uploads'),
      canViewUsers: hasPermission(userRole, 'view:users'),
      canEditUsers: hasPermission(userRole, 'edit:users'),
      canDeleteUsers: hasPermission(userRole, 'delete:users'),
      canManageRoles: hasPermission(userRole, 'manage:roles'),
      canViewSystemAnalytics: hasPermission(userRole, 'view:analytics'),
      canManageSystem: hasPermission(userRole, 'manage:system'),
      canViewLogs: hasPermission(userRole, 'view:logs'),
      canManageContent: hasPermission(userRole, 'manage:content')
    };
  }, [user, isAuthenticated]);

  return features;
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook for getting redirect path based on user role
 */
export function useRedirectPath() {
  const { user, isAuthenticated } = useAuth();
  
  const getRedirectPath = useCallback((fallbackPath = '/dashboard') => {
    if (!isAuthenticated || !user) {
      return '/login';
    }

    const userRole = user.role?.toLowerCase() as UserRole;
    
    // Redirect based on role hierarchy
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'premium':
        return '/premium/dashboard';
      case 'user':
        return '/dashboard';
      default:
        return fallbackPath;
    }
  }, [user, isAuthenticated]);

  return { getRedirectPath };
}

/**
 * Hook for checking if user can upgrade their role
 */
export function useCanUpgrade() {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    if (!isAuthenticated || !user) {
      return { canUpgrade: false, nextRole: null };
    }

    const userRole = user.role?.toLowerCase() as UserRole;
    const userLevel = getRoleLevel(userRole);

    // Check if there's a higher role available
    const higherRoles = ['user', 'premium', 'admin'].filter(role => 
      getRoleLevel(role as UserRole) > userLevel
    );

    if (higherRoles.length === 0) {
      return { canUpgrade: false, nextRole: null };
    }

    return { 
      canUpgrade: true, 
      nextRole: higherRoles[0] as UserRole 
    };
  }, [user, isAuthenticated]);
}

// =============================================================================
// COMBINED HOOKS
// =============================================================================

/**
 * Comprehensive hook for all role-based access checks
 */
export function useRoleBasedAccess() {
  const { user, isAuthenticated } = useAuth();
  const roleInfo = useRoleInfo();
  const featureAccess = useFeatureAccess();
  const canUpgrade = useCanUpgrade();
  const redirectPath = useRedirectPath();

  return {
    // User info
    user,
    isAuthenticated,
    roleInfo,
    
    // Feature access
    featureAccess,
    
    // Upgrade info
    canUpgrade,
    
    // Redirect utilities
    redirectPath,
    
    // Quick checks
    isAdmin: useIsAdmin(),
    isPremium: useIsPremium(),
    isUser: useIsUser(),
  };
}
