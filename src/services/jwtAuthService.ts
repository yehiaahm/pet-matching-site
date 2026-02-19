import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  csrfToken?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface SessionInfo {
  sessionId: string;
  createdAt: string;
  lastUsed: string;
  family: string;
}

class JWTAuthService {
  private static instance: JWTAuthService;
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshPromise: Promise<AuthTokens> | null = null;
  private isRefreshing = false;
  private refreshTimeout: NodeJS.Timeout | null = null;
  private storageKey = 'petmat_auth';

  constructor() {
    this.baseURL = (typeof window !== 'undefined' && process.env.REACT_APP_API_URL) || 
                  (typeof window !== 'undefined' && (window as any).location?.origin) ||
                  'http://localhost:5000';
    // Remove trailing slash for consistency
    if (this.baseURL.endsWith('/')) {
      this.baseURL = this.baseURL.slice(0, -1);
    }
    this.initializeFromStorage();
  }

  static getInstance(): JWTAuthService {
    if (!JWTAuthService.instance) {
      JWTAuthService.instance = new JWTAuthService();
    }
    return JWTAuthService.instance;
  }

  /**
   * Initialize auth state from localStorage
   */
  private initializeFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.accessToken = data.accessToken;
        
        // Set up automatic refresh if we have a token
        if (this.accessToken && data.expiresAt) {
          const timeUntilExpiry = data.expiresAt - Date.now();
          if (timeUntilExpiry > 0) {
            this.scheduleRefresh(timeUntilExpiry - 30000); // Refresh 30 seconds before expiry
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth from storage:', error);
      this.clearAuthData();
    }
  }

  /**
   * Store auth data in localStorage
   */
  private storeAuthData(tokens: AuthTokens): void {
    try {
      const expiresAt = Date.now() + (tokens.expiresIn * 1000);
      const data = {
        accessToken: tokens.accessToken,
        expiresAt,
        user: tokens as any // Will be set by login/register methods
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      this.accessToken = tokens.accessToken;
      
      // Schedule automatic refresh
      this.scheduleRefresh(tokens.expiresIn * 1000 - 30000); // 30 seconds before expiry
    } catch (error) {
      console.error('Failed to store auth data:', error);
    }
  }

  /**
   * Clear auth data from storage
   */
  private clearAuthData(): void {
    try {
      localStorage.removeItem(this.storageKey);
      this.accessToken = null;
      
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = null;
      }
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleRefresh(delay: number): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    
    if (delay > 0) {
      this.refreshTimeout = setTimeout(() => {
        this.refreshToken().catch(error => {
          console.error('Automatic refresh failed:', error);
          // Force logout on refresh failure
          this.logout();
        });
      }, delay);
    }
  }

  /**
   * Create axios instance with auth interceptors
   */
  private createAuthenticatedClient(): typeof axios {
    const client = axios.create({
      baseURL: this.baseURL,
      withCredentials: true, // Important for HttpOnly cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add access token
    client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        
        // Add CSRF token for non-get requests
        if (config.method?.toLowerCase() !== 'get') {
          const csrfToken = this.getCSRFToken();
          if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
          }
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If we get a 401 and haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newTokens = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, force logout
            this.logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return client;
  }

  /**
   * Get CSRF token from cookie
   */
  private getCSRFToken(): string | null {
    const name = 'csrf_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (const cookie of cookieArray) {
      const trimmedCookie = cookie.trim();
      if (trimmedCookie.startsWith(name)) {
        return trimmedCookie.substring(name.length);
      }
    }
    
    return null;
  }

  /**
   * User registration
   */
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const client = this.createAuthenticatedClient();
      const response: AxiosResponse<{ success: boolean; user: User; accessToken: string; expiresIn: number; csrfToken: string }> = await client.post('/api/auth/register', data);
      
      if (response.data.success) {
        const tokens: AuthTokens = {
          accessToken: response.data.accessToken,
          expiresIn: response.data.expiresIn,
          csrfToken: response.data.csrfToken
        };
        
        this.storeAuthData(tokens);
        
        return {
          user: response.data.user,
          tokens
        };
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * User login
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const client = this.createAuthenticatedClient();
      const response: AxiosResponse<{ success: boolean; user: User; accessToken: string; expiresIn: number; csrfToken: string }> = await client.post('/api/auth/login', credentials);
      
      if (response.data.success) {
        const tokens: AuthTokens = {
          accessToken: response.data.accessToken,
          expiresIn: response.data.expiresIn,
          csrfToken: response.data.csrfToken
        };
        
        this.storeAuthData(tokens);
        
        return {
          user: response.data.user,
          tokens
        };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthTokens> {
    // Prevent multiple refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const tokens = await this.refreshPromise;
      return tokens;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performRefresh(): Promise<AuthTokens> {
    try {
      const client = this.createAuthenticatedClient();
      const response: AxiosResponse<{ success: boolean; accessToken: string; expiresIn: number; csrfToken: string }> = await client.post('/api/auth/refresh');
      
      if (response.data.success) {
        const tokens: AuthTokens = {
          accessToken: response.data.accessToken,
          expiresIn: response.data.expiresIn,
          csrfToken: response.data.csrfToken
        };
        
        this.storeAuthData(tokens);
        return tokens;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    try {
      const client = this.createAuthenticatedClient();
      await client.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuthData();
      // Redirect to login page or handle logout state
      window.location.href = '/auth';
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    try {
      const client = this.createAuthenticatedClient();
      await client.post('/api/auth/logout-all');
    } catch (error) {
      console.error('Logout all API call failed:', error);
    } finally {
      this.clearAuthData();
      window.location.href = '/auth';
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    try {
      const client = this.createAuthenticatedClient();
      const response: AxiosResponse<{ success: boolean; user: User }> = await client.get('/api/auth/me');
      
      if (response.data.success) {
        return response.data.user;
      } else {
        throw new Error('Failed to get user info');
      }
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(): Promise<SessionInfo[]> {
    try {
      const client = this.createAuthenticatedClient();
      const response: AxiosResponse<{ success: boolean; sessions: SessionInfo[] }> = await client.get('/api/auth/sessions');
      
      if (response.data.success) {
        return response.data.sessions;
      } else {
        throw new Error('Failed to get sessions');
      }
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: any): void {
    if (error.response?.status === 401) {
      this.clearAuthData();
      // Redirect to login
      window.location.href = '/auth';
    }
  }

  /**
   * Make authenticated API request
   */
  async authenticatedRequest<T>(config: AxiosRequestConfig): Promise<T> {
    const client = this.createAuthenticatedClient();
    const response: AxiosResponse<T> = await client(config);
    return response.data;
  }

  /**
   * Setup periodic token validation
   */
  setupTokenValidation(): void {
    // Validate token every 5 minutes
    setInterval(async () => {
      if (this.accessToken) {
        try {
          await this.getCurrentUser();
        } catch (error) {
          console.error('Token validation failed:', error);
          this.logout();
        }
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }
}

// Export singleton instance
export const jwtAuthService = JWTAuthService.getInstance();

// Export types
export type { User, AuthTokens, LoginCredentials, RegisterData, SessionInfo };
export default jwtAuthService;
