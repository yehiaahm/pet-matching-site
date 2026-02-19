/**
 * Role-Based Access Control System
 * Defines user roles, permissions, and access control logic
 */

// =============================================================================
// ROLE DEFINITIONS
// =============================================================================

export type UserRole = 'user' | 'premium' | 'admin';

export interface RoleDefinition {
  name: UserRole;
  displayName: string;
  description: string;
  level: number; // Higher number = higher privilege
  permissions: string[];
  color: string;
  icon: string;
}

export interface Permission {
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
}

// =============================================================================
// ROLE CONFIGURATION
// =============================================================================

export const ROLES: Record<UserRole, RoleDefinition> = {
  user: {
    name: 'user',
    displayName: 'User',
    description: 'Basic user with standard access',
    level: 1,
    permissions: [
      'view:dashboard',
      'view:profile',
      'edit:profile',
      'view:pets',
      'create:pets',
      'edit:own_pets',
      'delete:own_pets',
      'view:ai_matching',
      'create:match_requests',
      'view:own_matches',
      'send:messages',
      'view:notifications',
    ],
    color: '#3b82f6',
    icon: '👤'
  },
  premium: {
    name: 'premium',
    displayName: 'Premium',
    description: 'Premium user with enhanced features',
    level: 2,
    permissions: [
      // All user permissions
      'view:dashboard',
      'view:profile',
      'edit:profile',
      'view:pets',
      'create:pets',
      'edit:own_pets',
      'delete:own_pets',
      'view:ai_matching',
      'create:match_requests',
      'view:own_matches',
      'send:messages',
      'view:notifications',
      // Premium-specific permissions
      'unlimited:pets',
      'advanced:ai_matching',
      'priority:support',
      'export:data',
      'custom:themes',
      'analytics:basic',
      'file:large_uploads',
    ],
    color: '#f59e0b',
    icon: '⭐'
  },
  admin: {
    name: 'admin',
    displayName: 'Administrator',
    description: 'System administrator with full access',
    level: 3,
    permissions: [
      // All permissions (wildcard)
      '*',
    ],
    color: '#ef4444',
    icon: '👑'
  }
};

// =============================================================================
// PERMISSION DEFINITIONS
// =============================================================================

export const PERMISSIONS: Record<string, Permission> = {
  // Dashboard and Profile
  'view:dashboard': {
    name: 'view:dashboard',
    displayName: 'View Dashboard',
    description: 'Access the main dashboard',
    resource: 'dashboard',
    action: 'view'
  },
  'view:profile': {
    name: 'view:profile',
    displayName: 'View Profile',
    description: 'View user profile information',
    resource: 'profile',
    action: 'view'
  },
  'edit:profile': {
    name: 'edit:profile',
    displayName: 'Edit Profile',
    description: 'Edit user profile information',
    resource: 'profile',
    action: 'edit'
  },

  // Pet Management
  'view:pets': {
    name: 'view:pets',
    displayName: 'View Pets',
    description: 'View pet listings',
    resource: 'pets',
    action: 'view'
  },
  'create:pets': {
    name: 'create:pets',
    displayName: 'Create Pets',
    description: 'Create new pet listings',
    resource: 'pets',
    action: 'create'
  },
  'edit:own_pets': {
    name: 'edit:own_pets',
    displayName: 'Edit Own Pets',
    description: 'Edit own pet listings',
    resource: 'pets',
    action: 'edit'
  },
  'delete:own_pets': {
    name: 'delete:own_pets',
    displayName: 'Delete Own Pets',
    description: 'Delete own pet listings',
    resource: 'pets',
    action: 'delete'
  },
  'edit:any_pets': {
    name: 'edit:any_pets',
    displayName: 'Edit Any Pets',
    description: 'Edit any pet listings',
    resource: 'pets',
    action: 'edit'
  },
  'delete:any_pets': {
    name: 'delete:any_pets',
    displayName: 'Delete Any Pets',
    description: 'Delete any pet listings',
    resource: 'pets',
    action: 'delete'
  },

  // AI Matching
  'view:ai_matching': {
    name: 'view:ai_matching',
    displayName: 'View AI Matching',
    description: 'Access AI matching features',
    resource: 'ai_matching',
    action: 'view'
  },
  'advanced:ai_matching': {
    name: 'advanced:ai_matching',
    displayName: 'Advanced AI Matching',
    description: 'Access advanced AI matching features',
    resource: 'ai_matching',
    action: 'advanced'
  },
  'create:match_requests': {
    name: 'create:match_requests',
    displayName: 'Create Match Requests',
    description: 'Create breeding match requests',
    resource: 'matches',
    action: 'create'
  },
  'view:own_matches': {
    name: 'view:own_matches',
    displayName: 'View Own Matches',
    description: 'View own match requests',
    resource: 'matches',
    action: 'view'
  },
  'view:all_matches': {
    name: 'view:all_matches',
    displayName: 'View All Matches',
    description: 'View all match requests',
    resource: 'matches',
    action: 'view'
  },
  'manage:matches': {
    name: 'manage:matches',
    displayName: 'Manage Matches',
    description: 'Manage all match requests',
    resource: 'matches',
    action: 'manage'
  },

  // Messaging
  'send:messages': {
    name: 'send:messages',
    displayName: 'Send Messages',
    description: 'Send messages to other users',
    resource: 'messages',
    action: 'send'
  },
  'view:messages': {
    name: 'view:messages',
    displayName: 'View Messages',
    description: 'View message history',
    resource: 'messages',
    action: 'view'
  },
  'moderate:messages': {
    name: 'moderate:messages',
    displayName: 'Moderate Messages',
    description: 'Moderate user messages',
    resource: 'messages',
    action: 'moderate'
  },

  // Notifications
  'view:notifications': {
    name: 'view:notifications',
    displayName: 'View Notifications',
    description: 'View user notifications',
    resource: 'notifications',
    action: 'view'
  },
  'manage:notifications': {
    name: 'manage:notifications',
    displayName: 'Manage Notifications',
    description: 'Manage system notifications',
    resource: 'notifications',
    action: 'manage'
  },

  // Premium Features
  'unlimited:pets': {
    name: 'unlimited:pets',
    displayName: 'Unlimited Pets',
    description: 'Create unlimited pet listings',
    resource: 'pets',
    action: 'unlimited'
  },
  'priority:support': {
    name: 'priority:support',
    displayName: 'Priority Support',
    description: 'Get priority customer support',
    resource: 'support',
    action: 'priority'
  },
  'export:data': {
    name: 'export:data',
    displayName: 'Export Data',
    description: 'Export user data',
    resource: 'data',
    action: 'export'
  },
  'custom:themes': {
    name: 'custom:themes',
    displayName: 'Custom Themes',
    description: 'Use custom themes',
    resource: 'themes',
    action: 'custom'
  },
  'analytics:basic': {
    name: 'analytics:basic',
    displayName: 'Basic Analytics',
    description: 'View basic analytics',
    resource: 'analytics',
    action: 'view'
  },
  'file:large_uploads': {
    name: 'file:large_uploads',
    displayName: 'Large File Uploads',
    description: 'Upload large files',
    resource: 'files',
    action: 'large'
  },

  // Admin Features
  'view:users': {
    name: 'view:users',
    displayName: 'View Users',
    description: 'View all users',
    resource: 'users',
    action: 'view'
  },
  'edit:users': {
    name: 'edit:users',
    displayName: 'Edit Users',
    description: 'Edit user accounts',
    resource: 'users',
    action: 'edit'
  },
  'delete:users': {
    name: 'delete:users',
    displayName: 'Delete Users',
    description: 'Delete user accounts',
    resource: 'users',
    action: 'delete'
  },
  'manage:roles': {
    name: 'manage:roles',
    displayName: 'Manage Roles',
    description: 'Manage user roles',
    resource: 'roles',
    action: 'manage'
  },
  'view:analytics': {
    name: 'view:analytics',
    displayName: 'View Analytics',
    description: 'View system analytics',
    resource: 'analytics',
    action: 'view'
  },
  'manage:system': {
    name: 'manage:system',
    displayName: 'Manage System',
    description: 'Manage system settings',
    resource: 'system',
    action: 'manage'
  },
  'view:logs': {
    name: 'view:logs',
    displayName: 'View Logs',
    description: 'View system logs',
    resource: 'logs',
    action: 'view'
  },
  'manage:content': {
    name: 'manage:content',
    displayName: 'Manage Content',
    description: 'Manage system content',
    resource: 'content',
    action: 'manage'
  },

  // Wildcard permission for admin
  '*': {
    name: '*',
    displayName: 'All Permissions',
    description: 'Access to all system features',
    resource: '*',
    action: '*'
  }
};

// =============================================================================
// ROLE HIERARCHY
// =============================================================================

export const ROLE_HIERARCHY: UserRole[] = ['user', 'premium', 'admin'];

export const getRoleLevel = (role: UserRole): number => {
  return ROLES[role]?.level || 0;
};

export const isRoleHigher = (role1: UserRole, role2: UserRole): boolean => {
  return getRoleLevel(role1) > getRoleLevel(role2);
};

export const isRoleEqualOrHigher = (role1: UserRole, role2: UserRole): boolean => {
  return getRoleLevel(role1) >= getRoleLevel(role2);
};

// =============================================================================
// PERMISSION CHECKING
// =============================================================================

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const role = ROLES[userRole];
  if (!role) return false;

  // Admin has all permissions
  if (role.permissions.includes('*')) {
    return true;
  }

  return role.permissions.includes(permission);
};

export const hasAnyPermission = (userRole: UserRole, permissions: string[]): boolean => {
  const role = ROLES[userRole];
  if (!role) return false;

  // Admin has all permissions
  if (role.permissions.includes('*')) {
    return true;
  }

  return permissions.some(permission => role.permissions.includes(permission));
};

export const hasAllPermissions = (userRole: UserRole, permissions: string[]): boolean => {
  const role = ROLES[userRole];
  if (!role) return false;

  // Admin has all permissions
  if (role.permissions.includes('*')) {
    return true;
  }

  return permissions.every(permission => role.permissions.includes(permission));
};

export const canAccessResource = (userRole: UserRole, resource: string, action: string): boolean => {
  const permission = `${action}:${resource}`;
  return hasPermission(userRole, permission);
};

// =============================================================================
// ROLE VALIDATION
// =============================================================================

export const isValidRole = (role: string): role is UserRole => {
  return Object.keys(ROLES).includes(role);
};

export const validateRole = (role: string): UserRole | null => {
  return isValidRole(role) ? role : null;
};

// =============================================================================
// ROLE UTILITIES
// =============================================================================

export const getRoleDisplayName = (role: UserRole): string => {
  return ROLES[role]?.displayName || role;
};

export const getRoleColor = (role: UserRole): string => {
  return ROLES[role]?.color || '#6b7280';
};

export const getRoleIcon = (role: UserRole): string => {
  return ROLES[role]?.icon || '👤';
};

export const getRolePermissions = (role: UserRole): string[] => {
  return ROLES[role]?.permissions || [];
};

export const getRolesByLevel = (minLevel: number): UserRole[] => {
  return ROLE_HIERARCHY.filter(role => getRoleLevel(role) >= minLevel);
};

export const getAccessibleRoles = (userRole: UserRole): UserRole[] => {
  const userLevel = getRoleLevel(userRole);
  return ROLE_HIERARCHY.filter(role => getRoleLevel(role) <= userLevel);
};

// =============================================================================
// ROUTE PROTECTION CONFIGURATION
// =============================================================================

export interface RouteProtection {
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: string | string[];
  fallbackPath?: string;
  unauthorizedPath?: string;
}

export const ROUTE_PROTECTION: Record<string, RouteProtection> = {
  '/dashboard': {
    requiredRole: 'user',
    fallbackPath: '/login',
    unauthorizedPath: '/unauthorized'
  },
  '/ai': {
    requiredRole: 'user',
    requiredPermission: 'view:ai_matching',
    fallbackPath: '/login',
    unauthorizedPath: '/unauthorized'
  },
  '/premium': {
    requiredRole: 'premium',
    fallbackPath: '/login',
    unauthorizedPath: '/upgrade'
  },
  '/admin': {
    requiredRole: 'admin',
    fallbackPath: '/login',
    unauthorizedPath: '/unauthorized'
  },
  '/admin/users': {
    requiredRole: 'admin',
    requiredPermission: 'view:users',
    fallbackPath: '/login',
    unauthorizedPath: '/unauthorized'
  },
  '/admin/analytics': {
    requiredRole: 'admin',
    requiredPermission: 'view:analytics',
    fallbackPath: '/login',
    unauthorizedPath: '/unauthorized'
  },
  '/admin/settings': {
    requiredRole: 'admin',
    requiredPermission: 'manage:system',
    fallbackPath: '/login',
    unauthorizedPath: '/unauthorized'
  }
};

// =============================================================================
// EXPORTS
// =============================================================================
