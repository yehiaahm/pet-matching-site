import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { safeGet } from '../utils/safeFetch';
import { authService } from '../services/authService';
import { initSocket } from '../../lib/socket';
import type { User } from '../../types';
import { API_BASE_URL } from '../../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { API_BASE_URL };

const LOGIN_ACTIVITY_STORAGE_KEY = 'petmat_login_activity';

export function AuthProvider({ children }: { children: ReactNode }) {
  const MAX_TIMEOUT_MS = 2147483647;
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTimeout, setRefreshTimeout] = useState<number | null>(null);

  // Clear refresh timeout
  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      setRefreshTimeout(null);
    }
  }, [refreshTimeout]);

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback((token: string) => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        console.log('ℹ️ AuthContext: No refresh token available, skipping scheduled refresh');
        return;
      }

      // Parse JWT payload to get expiration time
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      if (!Number.isFinite(expirationTime) || timeUntilExpiration <= 0) {
        console.warn('⚠️ AuthContext: Token is invalid or already expired, skipping refresh schedule');
        return;
      }

      // Schedule refresh 5 minutes before expiration
      const refreshTime = Math.max(timeUntilExpiration - 5 * 60 * 1000, 60 * 1000); // At least 1 minute

      console.log(`🔄 AuthContext: Scheduling token refresh in ${Math.round(refreshTime / 1000)} seconds`);

      const timeoutDelay = Math.min(refreshTime, MAX_TIMEOUT_MS);

      const timeout = setTimeout(async () => {
        if (refreshTime > MAX_TIMEOUT_MS) {
          console.log('⏳ AuthContext: Refresh schedule exceeds max timeout, rescheduling remaining duration');
          scheduleTokenRefresh(token);
          return;
        }

        const latestRefreshToken = localStorage.getItem('refreshToken');
        if (!latestRefreshToken) {
          console.log('ℹ️ AuthContext: Refresh token was removed, skipping scheduled refresh');
          return;
        }

        console.log('🔄 AuthContext: Executing scheduled token refresh');
        const success = await refreshToken();
        if (!success) {
          console.warn('⚠️ AuthContext: Scheduled token refresh failed, logging out');
          logout();
        }
      }, timeoutDelay);

      setRefreshTimeout(timeout);
    } catch (error) {
      console.error('❌ AuthContext: Error parsing token for refresh schedule:', error);
    }
  }, [MAX_TIMEOUT_MS]);

  const logout = useCallback(() => {
    console.log('🚪 AuthContext: Logging out user');
    
    // Clear refresh timeout
    clearRefreshTimeout();
    
    // Clear auth state
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    
    // Disconnect socket
    disconnectSocket();
    
    console.log('✅ AuthContext: User logged out');
  }, [clearRefreshTimeout]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 AuthContext: Attempting token refresh');
      const result = await authService.refreshToken();
      
      if (result.success && result.data) {
        console.log('✅ AuthContext: Token refresh successful');
        
        // Ensure user object has all required fields
        const partialUser = result.data.user as any;
        if (!partialUser || !partialUser.id) {
          console.error('❌ AuthContext: Invalid user object received:', partialUser);
          logout();
          return false;
        }
        
        const completeUser: User = {
          id: partialUser.id,
          email: partialUser.email,
          firstName: partialUser.firstName,
          lastName: partialUser.lastName,
          phone: partialUser.phone,
          verification: partialUser.verification || {
            isVerified: false,
            badge: 'Unverified'
          },
          createdAt: partialUser.createdAt || new Date().toISOString(),
          updatedAt: partialUser.updatedAt || new Date().toISOString(),
          isActive: partialUser.isActive ?? true,
          role: (partialUser.role || 'user') as 'user' | 'admin' | 'moderator' | 'super_admin'
        };
        
        setUser(completeUser);
        setToken(result.data.accessToken);
        
        // Update localStorage
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        // Schedule next refresh
        scheduleTokenRefresh(result.data.accessToken);
        
        return true;
      } else {
        console.warn('⚠️ AuthContext: Token refresh failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ AuthContext: Token refresh error:', error);
      return false;
    }
  }, [scheduleTokenRefresh]);

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      // Check if token is expired
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        
        if (currentTime >= expirationTime) {
          console.log('⏰ AuthContext: Token expired, attempting refresh');
          const refreshSuccess = await refreshToken();
          if (!refreshSuccess) {
            logout();
            setIsLoading(false);
            return;
          }
        } else {
          console.log('✅ AuthContext: Token valid, scheduling refresh');
          scheduleTokenRefresh(storedToken);
        }
      } catch (parseError) {
        console.error('❌ AuthContext: Error parsing token:', parseError);
        logout();
        setIsLoading(false);
        return;
      }

      // If we have stored user data in localStorage, use it as fallback
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as any;
          const completeUser: User = {
            id: parsedUser.id,
            email: parsedUser.email,
            firstName: parsedUser.firstName,
            lastName: parsedUser.lastName,
            phone: parsedUser.phone,
            verification: parsedUser.verification || {
              isVerified: false,
              badge: 'Unverified'
            },
            createdAt: parsedUser.createdAt || new Date().toISOString(),
            updatedAt: parsedUser.updatedAt || new Date().toISOString(),
            isActive: parsedUser.isActive ?? true,
            role: (parsedUser.role || 'user') as 'user' | 'admin' | 'moderator' | 'super_admin'
          };
          
          setUser(completeUser);
          setToken(storedToken);
          scheduleTokenRefresh(storedToken);
          console.log('✅ AuthContext: Using stored user data from localStorage');
          setIsLoading(false);
          return;
        } catch (e) {
          console.error('❌ AuthContext: Error parsing stored user:', e);
        }
      }

      // Try to verify token by fetching user profile
      const response = await safeGet(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (response.success && response.data?.user) {
        // Ensure user object has all required fields
        const partialUser = response.data.user as any;
        const completeUser: User = {
          id: partialUser.id,
          email: partialUser.email,
          firstName: partialUser.firstName,
          lastName: partialUser.lastName,
          phone: partialUser.phone,
          verification: partialUser.verification || {
            isVerified: false,
            badge: 'Unverified'
          },
          createdAt: partialUser.createdAt || new Date().toISOString(),
          updatedAt: partialUser.updatedAt || new Date().toISOString(),
          isActive: partialUser.isActive ?? true,
          role: (partialUser.role || 'user') as 'user' | 'admin' | 'moderator' | 'super_admin'
        };
        
        setUser(completeUser);
        setToken(storedToken);
        // Sync user data in localStorage
        localStorage.setItem('user', JSON.stringify(completeUser));
        console.log('✅ AuthContext: Token verified, user restored');
      } else {
        console.warn('⚠️ AuthContext: Token verification failed:', response.error);
        // Try refresh one more time
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          logout();
        }
      }
    } catch (error) {
      console.error('❌ AuthContext: Error during auth check:', error);
      
      // If we have stored data but network fails, we might still trust it for offline mode
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as any;
          const completeUser: User = {
            id: parsedUser.id,
            email: parsedUser.email,
            firstName: parsedUser.firstName,
            lastName: parsedUser.lastName,
            phone: parsedUser.phone,
            verification: parsedUser.verification || {
              isVerified: false,
              badge: 'Unverified'
            },
            createdAt: parsedUser.createdAt || new Date().toISOString(),
            updatedAt: parsedUser.updatedAt || new Date().toISOString(),
            isActive: parsedUser.isActive ?? true,
            role: (parsedUser.role || 'user') as 'user' | 'admin' | 'moderator' | 'super_admin'
          };
          
          setUser(completeUser);
          setToken(storedToken);
          scheduleTokenRefresh(storedToken);
          console.log('✅ AuthContext: Using stored data due to network error');
        } catch (e) {
          logout();
        }
      } else {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout, refreshToken, scheduleTokenRefresh]);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRefreshTimeout();
    };
  }, [clearRefreshTimeout]);

  const login = useCallback((userData: User, authToken: string, authRefreshToken?: string) => {
    console.log('🔐 AuthContext: Logging in user:', userData.email);

    setUser(userData);
    setToken(authToken);

    localStorage.setItem('accessToken', authToken);
    localStorage.setItem('user', JSON.stringify(userData));

    try {
      const existingRaw = localStorage.getItem(LOGIN_ACTIVITY_STORAGE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const activityList = Array.isArray(existing) ? existing : [];

      const activityEntry = {
        id: `login-${Date.now()}-${userData.id}`,
        email: userData.email,
        role: userData.role || 'user',
        time: new Date().toISOString(),
      };

      localStorage.setItem(
        LOGIN_ACTIVITY_STORAGE_KEY,
        JSON.stringify([activityEntry, ...activityList].slice(0, 1000))
      );
    } catch (error) {
      console.warn('⚠️ AuthContext: Failed to persist login activity', error);
    }
    
    // Store refresh token if provided
    if (authRefreshToken) {
      localStorage.setItem('refreshToken', authRefreshToken);
      console.log('💾 AuthContext: Refresh token stored');
    }

    // Schedule token refresh
    scheduleTokenRefresh(authToken);

    // Initialize Socket connection for real-time notifications
    console.log('📡 AuthContext: Initializing socket connection for user:', userData.id);
    initSocket(API_BASE_URL, userData.id);

    console.log('✅ AuthContext: Login successful');
  }, [scheduleTokenRefresh]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    checkAuth,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to disconnect socket
function disconnectSocket() {
  // This would be imported from the socket service
  // For now, just log the action
  console.log('🔌 AuthContext: Disconnecting socket');
}
