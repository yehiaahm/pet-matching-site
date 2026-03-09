/**
 * Authentication Service
 * Handles all authentication API calls with JWT tokens
 */

import { safePost, safeGet } from '../utils/safeFetch';
import { API_BASE_URL } from '../../lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface LegacyAuthPayload {
  user?: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string | null;
    role?: string;
  };
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  private normalizeUser(user: LegacyAuthPayload['user']) {
    if (!user?.id || !user?.email) {
      return null;
    }

    const fullName = (user.name || '').trim();
    const nameParts = fullName ? fullName.split(/\s+/) : [];
    const derivedFirstName = nameParts[0] || '';
    const derivedLastName = nameParts.slice(1).join(' ');

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || derivedFirstName || 'User',
      lastName: user.lastName || derivedLastName || 'Member',
      phone: user.phone ?? null,
      role: user.role || 'user'
    };
  }

  private normalizeAuthResponse(raw: any): AuthResponse | null {
    const source = raw?.data ?? raw;
    const user = this.normalizeUser(source?.user || raw?.user);
    const accessToken = source?.accessToken || source?.token || raw?.accessToken || raw?.token;
    const refreshToken = source?.refreshToken || raw?.refreshToken || '';

    if (!user || !accessToken) {
      return null;
    }

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
    try {
      const normalizedCredentials: LoginCredentials = {
        ...credentials,
        email: credentials.email.trim().toLowerCase(),
      };

      console.log('🔐 AuthService: Attempting login for:', normalizedCredentials.email);
      
      const response = await safePost<{ data: AuthResponse }>(
        `${API_BASE_URL}/auth/login`,
        normalizedCredentials
      );

      if (response.success && response.data) {
        const normalizedData = this.normalizeAuthResponse(response.data);

        if (normalizedData) {
          console.log('✅ AuthService: Login successful');
          return {
            success: true,
            data: normalizedData
          };
        }

        console.error('❌ AuthService: Login response missing required auth fields:', response.data);
        return {
          success: false,
          error: 'Invalid login response format'
        };
      } else {
        console.error('❌ AuthService: Login failed:', response.error);
        return {
          success: false,
          error: response.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('❌ AuthService: Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<{ success: boolean; data?: AuthResponse; error?: string; validationErrors?: ValidationError[] }> {
    try {
      const normalizedCredentials: RegisterCredentials = {
        ...credentials,
        email: credentials.email.trim().toLowerCase(),
      };

      console.log('📝 AuthService: Attempting registration for:', normalizedCredentials.email);
      console.log('🔍 AuthService: Registration data being sent:', {
        email: normalizedCredentials.email,
        firstName: normalizedCredentials.firstName,
        lastName: normalizedCredentials.lastName,
        phone: normalizedCredentials.phone || 'none',
        passwordLength: normalizedCredentials.password?.length,
        API_BASE_URL: API_BASE_URL
      });
      
      const response = await safePost<{ data: AuthResponse }>(
        `${API_BASE_URL}/auth/register`,
        normalizedCredentials
      );

      if (response.success && response.data) {
        const normalizedData = this.normalizeAuthResponse(response.data);

        if (normalizedData) {
          console.log('✅ AuthService: Registration successful');
          return {
            success: true,
            data: normalizedData
          };
        }

        console.error('❌ AuthService: Registration response missing required auth fields:', response.data);
        return {
          success: false,
          error: 'Invalid registration response format'
        };
      } else {
        console.error('❌ AuthService: Registration failed:', response.error);
        console.error('📋 Full error details:', response.errorData);
        
        // استخراج تفاصيل الأخطاء
        let detailedError = response.error || 'Registration failed';
        
        // إذا كان هناك errorData فيه errors array
        if (response.errorData?.errors && Array.isArray(response.errorData.errors)) {
          const validationErrors = response.errorData.errors;
          console.error('🔍 Validation errors:', validationErrors);
          
          // إرجاع الأخطاء بشكل مفصل
          return {
            success: false,
            error: detailedError,
            validationErrors: validationErrors // نضيف الأخطاء المفصلة
          };
        }
        
        return {
          success: false,
          error: detailedError,
          validationErrors: undefined
        };
      }
    } catch (error) {
      console.error('❌ AuthService: Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        validationErrors: undefined
      };
    }
  }

  /**
   * Logout user (invalidate tokens on server)
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.log('🔓 AuthService: No token found, clearing local storage');
        this.clearTokens();
        return { success: true };
      }

      console.log('🔓 AuthService: Attempting logout');
      
      const response = await safePost(
        `${API_BASE_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Clear tokens regardless of server response
      this.clearTokens();
      
      if (response.success) {
        console.log('✅ AuthService: Logout successful');
        return { success: true };
      } else {
        console.warn('⚠️ AuthService: Logout request failed but tokens cleared locally');
        return { success: true }; // Still return success since tokens are cleared
      }
    } catch (error) {
      console.error('❌ AuthService: Logout error:', error);
      // Clear tokens even on error
      this.clearTokens();
      return { success: true }; // Still return success since tokens are cleared
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.error('❌ AuthService: No refresh token found');
        return { success: false, error: 'No refresh token available' };
      }

      console.log('🔄 AuthService: Attempting token refresh');
      
      const response = await safePost<{ data: AuthResponse }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      if (response.success && response.data) {
        const normalizedData = this.normalizeAuthResponse(response.data);

        if (!normalizedData) {
          console.error('❌ AuthService: Refresh response missing required auth fields:', response.data);
          this.clearTokens();
          return {
            success: false,
            error: 'Invalid token refresh response format'
          };
        }

        console.log('✅ AuthService: Token refresh successful');
        // Update tokens in localStorage
        localStorage.setItem('accessToken', normalizedData.accessToken);
        localStorage.setItem('refreshToken', normalizedData.refreshToken);
        
        return {
          success: true,
          data: normalizedData
        };
      } else {
        console.error('❌ AuthService: Token refresh failed:', response.error);
        this.clearTokens();
        return {
          success: false,
          error: response.error || 'Token refresh failed'
        };
      }
    } catch (error) {
      console.error('❌ AuthService: Token refresh error:', error);
      this.clearTokens();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Verify current token validity
   */
  async verifyToken(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return { success: false, error: 'No access token found' };
      }

      const response = await safeGet(
        `${API_BASE_URL}/auth/verify`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        // Try to refresh token if verification fails
        const refreshResult = await this.refreshToken();
        if (refreshResult.success) {
          // Retry verification with new token
          const newToken = localStorage.getItem('accessToken');
          const retryResponse = await safeGet(
            `${API_BASE_URL}/auth/verify`,
            {
              headers: {
                Authorization: `Bearer ${newToken}`
              }
            }
          );
          return { success: retryResponse.success, data: retryResponse.data };
        }
        return { success: false, error: 'Token verification failed' };
      }
    } catch (error) {
      console.error('❌ AuthService: Token verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await safePost(
        `${API_BASE_URL}/auth/forgot-password`,
        { email }
      );

      if (response.success) {
        console.log('✅ AuthService: Password reset email sent');
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to send password reset email'
        };
      }
    } catch (error) {
      console.error('❌ AuthService: Password reset request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await safePost(
        `${API_BASE_URL}/auth/reset-password`,
        { token, newPassword }
      );

      if (response.success) {
        console.log('✅ AuthService: Password reset successful');
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to reset password'
        };
      }
    } catch (error) {
      console.error('❌ AuthService: Password reset confirmation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Change password (for authenticated users)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await safePost(
        `${API_BASE_URL}/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.success) {
        console.log('✅ AuthService: Password change successful');
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to change password'
        };
      }
    } catch (error) {
      console.error('❌ AuthService: Password change error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await safeGet(
        `${API_BASE_URL}/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to get profile'
        };
      }
    } catch (error) {
      console.error('❌ AuthService: Get profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Clear all tokens from localStorage
   */
  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('🧹 AuthService: Tokens cleared from localStorage');
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      // Simple JWT token validation (check expiration)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (error) {
      console.error('❌ AuthService: Invalid token format');
      return false;
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
