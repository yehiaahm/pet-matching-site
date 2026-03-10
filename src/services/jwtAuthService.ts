import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

/* =========================
   Types
========================= */

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

/* =========================
   JWTAuthService
========================= */

class JWTAuthService {
  private static instance: JWTAuthService;

  private baseURL: string;
  private accessToken: string | null = null;
  private refreshPromise: Promise<AuthTokens> | null = null;
  private isRefreshing = false;
  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;

  private storageKey = "petmat_auth";

  constructor() {

    /* =========================
       API Base URL logic
    ========================= */

    const apiBase =
      import.meta.env.VITE_API_BASE ||
      import.meta.env.VITE_API_URL ||
      (typeof window !== "undefined"
        ? "https://pet-matching-site-production.up.railway.app"
        : "http://localhost:5000");

    this.baseURL = apiBase.replace(/\/$/, "");

    console.log("🔐 JWTAuthService baseURL:", this.baseURL);

    this.initializeFromStorage();
  }

  static getInstance(): JWTAuthService {
    if (!JWTAuthService.instance) {
      JWTAuthService.instance = new JWTAuthService();
    }
    return JWTAuthService.instance;
  }

  /* =========================
     Storage Handling
  ========================= */

  private initializeFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);

      if (!stored) return;

      const data = JSON.parse(stored);

      this.accessToken = data.accessToken;

      if (this.accessToken && data.expiresAt) {
        const timeUntilExpiry = data.expiresAt - Date.now();

        if (timeUntilExpiry > 0) {
          this.scheduleRefresh(timeUntilExpiry - 30000);
        }
      }

    } catch (error) {
      console.error("Failed to initialize auth:", error);
      this.clearAuthData();
    }
  }

  private storeAuthData(tokens: AuthTokens): void {
    try {

      const expiresAt = Date.now() + tokens.expiresIn * 1000;

      const data = {
        accessToken: tokens.accessToken,
        expiresAt
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));

      this.accessToken = tokens.accessToken;

      this.scheduleRefresh(tokens.expiresIn * 1000 - 30000);

    } catch (error) {
      console.error("Failed storing auth data", error);
    }
  }

  private clearAuthData(): void {

    localStorage.removeItem(this.storageKey);

    this.accessToken = null;

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  /* =========================
     Token Refresh
  ========================= */

  private scheduleRefresh(delay: number) {

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    if (delay > 0) {
      this.refreshTimeout = setTimeout(() => {

        this.refreshToken().catch((err) => {
          console.error("Auto refresh failed:", err);
          this.logout();
        });

      }, delay);
    }
  }

  /* =========================
     Axios Client
  ========================= */

  private createAuthenticatedClient(): AxiosInstance {

    const client = axios.create({
      baseURL: this.baseURL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    /* Request Interceptor */

    client.interceptors.request.use((config) => {

      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }

      return config;

    });

    /* Response Interceptor */

    client.interceptors.response.use(

      (response) => response,

      async (error) => {

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {

          originalRequest._retry = true;

          try {

            const tokens = await this.refreshToken();

            originalRequest.headers.Authorization =
              `Bearer ${tokens.accessToken}`;

            return client(originalRequest);

          } catch (refreshError) {

            this.logout();
            return Promise.reject(refreshError);

          }
        }

        return Promise.reject(error);

      }
    );

    return client;
  }

  /* =========================
     Auth API
  ========================= */

  async register(data: RegisterData) {

    const client = this.createAuthenticatedClient();

    const response = await client.post("/api/auth/register", data);

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
  }

  async login(credentials: LoginCredentials) {

    const client = this.createAuthenticatedClient();

    const response = await client.post("/api/auth/login", credentials);

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
  }

  async refreshToken(): Promise<AuthTokens> {

    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    this.refreshPromise = this.performRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<AuthTokens> {

    const client = this.createAuthenticatedClient();

    const response = await client.post("/api/auth/refresh");

    const tokens: AuthTokens = {
      accessToken: response.data.accessToken,
      expiresIn: response.data.expiresIn,
      csrfToken: response.data.csrfToken
    };

    this.storeAuthData(tokens);

    return tokens;
  }

  async logout(): Promise<void> {

    try {

      const client = this.createAuthenticatedClient();

      await client.post("/api/auth/logout");

    } catch (error) {

      console.error("Logout failed:", error);

    } finally {

      this.clearAuthData();

      window.location.href = "/auth";

    }
  }

  async logoutAll(): Promise<void> {

    try {

      const client = this.createAuthenticatedClient();

      await client.post("/api/auth/logout-all");

    } finally {

      this.clearAuthData();

      window.location.href = "/auth";

    }
  }

  async getCurrentUser(): Promise<User> {

    const client = this.createAuthenticatedClient();

    const response = await client.get("/api/auth/me");

    return response.data.user;
  }

  async getActiveSessions(): Promise<SessionInfo[]> {

    const client = this.createAuthenticatedClient();

    const response = await client.get("/api/auth/sessions");

    return response.data.sessions;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async authenticatedRequest<T>(config: AxiosRequestConfig): Promise<T> {

    const client = this.createAuthenticatedClient();

    const response: AxiosResponse<T> = await client(config);

    return response.data;
  }

  setupTokenValidation() {

    setInterval(async () => {

      if (!this.accessToken) return;

      try {

        await this.getCurrentUser();

      } catch {

        this.logout();

      }

    }, 5 * 60 * 1000);
  }

  cleanup() {

    if (this.refreshTimeout) {

      clearTimeout(this.refreshTimeout);

      this.refreshTimeout = null;

    }
  }
}

/* =========================
   Export
========================= */

export const jwtAuthService = JWTAuthService.getInstance();

export type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  SessionInfo
};

export default jwtAuthService;