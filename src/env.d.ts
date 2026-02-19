/// <reference types="vite/client" />

interface ImportMetaEnv {
  // =============================================================================
  // API CONFIGURATION
  // =============================================================================
  
  readonly VITE_API_BASE: string;
  readonly VITE_AI_SERVICE_URL: string;
  readonly VITE_CHAT_SERVICE_URL: string;
  readonly VITE_FILE_UPLOAD_URL: string;

  // =============================================================================
  // EXTERNAL SERVICES
  // =============================================================================
  
  readonly VITE_PWNED_PASSWORDS_API_URL: string;
  readonly VITE_IMAGE_CDN_URL: string;
  readonly VITE_STRIPE_API_URL: string;
  readonly VITE_PAYMOB_API_URL: string;

  // =============================================================================
  // SOCIAL LOGIN CONFIGURATION
  // =============================================================================
  
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_CLIENT_SECRET: string;
  readonly VITE_FACEBOOK_APP_ID: string;
  readonly VITE_FACEBOOK_APP_SECRET: string;

  // =============================================================================
  // SECURITY CONFIGURATION
  // =============================================================================
  
  readonly VITE_JWT_SECRET: string;
  readonly VITE_JWT_EXPIRES_IN: string;
  readonly VITE_JWT_REFRESH_EXPIRES_IN: string;
  readonly VITE_ENCRYPTION_KEY: string;
  readonly VITE_PASSWORD_SALT: string;

  // =============================================================================
  // THIRD-PARTY API KEYS
  // =============================================================================
  
  readonly VITE_EMAIL_SERVICE_API_KEY: string;
  readonly VITE_EMAIL_FROM: string;
  readonly VITE_EMAIL_FROM_NAME: string;
  readonly VITE_TWILIO_ACCOUNT_SID: string;
  readonly VITE_TWILIO_AUTH_TOKEN: string;
  readonly VITE_TWILIO_PHONE_NUMBER: string;
  readonly VITE_AWS_ACCESS_KEY_ID: string;
  readonly VITE_AWS_SECRET_ACCESS_KEY: string;
  readonly VITE_AWS_REGION: string;
  readonly VITE_AWS_S3_BUCKET: string;
  readonly VITE_GOOGLE_ANALYTICS_ID: string;
  readonly VITE_SENTRY_DSN: string;

  // =============================================================================
  // APPLICATION CONFIGURATION
  // =============================================================================
  
  readonly VITE_NODE_ENV: 'development' | 'production' | 'test';
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;

  // =============================================================================
  // FEATURE FLAGS
  // =============================================================================
  
  readonly VITE_ENABLE_AI_MATCHING: boolean;
  readonly VITE_ENABLE_CHAT: boolean;
  readonly VITE_ENABLE_FILE_UPLOAD: boolean;
  readonly VITE_ENABLE_SOCIAL_LOGIN: boolean;
  readonly VITE_ENABLE_ANALYTICS: boolean;

  // =============================================================================
  // DEBUG CONFIGURATION
  // =============================================================================
  
  readonly VITE_DEBUG_MODE: boolean;
  readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';

  // =============================================================================
  // DEVELOPMENT CONFIGURATION
  // =============================================================================
  
  readonly VITE_DEV_SERVER_PORT: number;
  readonly VITE_DEV_SERVER_HOST: string;
  readonly VITE_USE_MOCK_SERVICES: boolean;
  readonly VITE_MOCK_API_DELAY: number;

  // =============================================================================
  // PRODUCTION CONFIGURATION
  // =============================================================================
  
  readonly VITE_PRODUCTION_API_URL: string;
  readonly VITE_PRODUCTION_AI_SERVICE_URL: string;
  readonly VITE_PRODUCTION_CHAT_SERVICE_URL: string;
  readonly VITE_CDN_URL: string;
  readonly VITE_ASSETS_URL: string;

  // =============================================================================
  // TESTING CONFIGURATION
  // =============================================================================
  
  readonly VITE_TEST_API_URL: string;
  readonly VITE_TEST_AI_SERVICE_URL: string;
  readonly VITE_TEST_CHAT_SERVICE_URL: string;
  readonly VITE_TEST_DATABASE_URL: string;

  // =============================================================================
  // MONITORING & LOGGING
  // =============================================================================
  
  readonly VITE_LOG_SERVICE_URL: string;
  readonly VITE_HEALTH_CHECK_URL: string;
  readonly VITE_STATUS_PAGE_URL: string;

  // =============================================================================
  // RATE LIMITING & SECURITY
  // =============================================================================
  
  readonly VITE_RATE_LIMIT_REQUESTS: number;
  readonly VITE_RATE_LIMIT_WINDOW: number;
  readonly VITE_CORS_ORIGIN: string;
  readonly VITE_CORS_ALLOWED_METHODS: string;
  readonly VITE_CORS_ALLOWED_HEADERS: string;

  // =============================================================================
  // LOCALIZATION & INTERNATIONALIZATION
  // =============================================================================
  
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly VITE_SUPPORTED_LANGUAGES: string;
  readonly VITE_DEFAULT_CURRENCY: string;
  readonly VITE_SUPPORTED_CURRENCIES: string;

  // =============================================================================
  // NOTIFICATION CONFIGURATION
  // =============================================================================
  
  readonly VITE_PUSH_NOTIFICATION_PUBLIC_KEY: string;
  readonly VITE_PUSH_NOTIFICATION_PRIVATE_KEY: string;
  readonly VITE_PUSH_NOTIFICATION_EMAIL: string;
  readonly VITE_NOTIFICATION_QUEUE_URL: string;
  readonly VITE_NOTIFICATION_WORKER_URL: string;

  // =============================================================================
  // CACHE CONFIGURATION
  // =============================================================================
  
  readonly VITE_REDIS_URL: string;
  readonly VITE_REDIS_CACHE_TTL: number;
  readonly VITE_BROWSER_CACHE_TTL: number;
  readonly VITE_SERVICE_WORKER_CACHE_TTL: number;

  // =============================================================================
  // WEBHOOK CONFIGURATION
  // =============================================================================
  
  readonly VITE_WEBHOOK_SECRET: string;
  readonly VITE_WEBHOOK_URL: string;

  // =============================================================================
  // BACKUP & ARCHIVAL
  // =============================================================================
  
  readonly VITE_BACKUP_SERVICE_URL: string;
  readonly VITE_BACKUP_ENCRYPTION_KEY: string;

  // =============================================================================
  // LEGAL & COMPLIANCE
  // =============================================================================
  
  readonly VITE_PRIVACY_POLICY_URL: string;
  readonly VITE_TERMS_OF_SERVICE_URL: string;
  readonly VITE_GDPR_COMPLIANCE: boolean;
  readonly VITE_DATA_RETENTION_DAYS: number;

  // =============================================================================
  // PERFORMANCE & OPTIMIZATION
  // =============================================================================
  
  readonly VITE_PERFORMANCE_MONITORING: boolean;
  readonly VITE_PERFORMANCE_SAMPLE_RATE: number;
  readonly VITE_BUNDLE_ANALYZER: boolean;
  readonly VITE_SOURCE_MAP: boolean;

  // =============================================================================
  // EXPERIMENTAL FEATURES
  // =============================================================================
  
  readonly VITE_ENABLE_EXPERIMENTAL_FEATURES: boolean;
  readonly VITE_ENABLE_BETA_FEATURES: boolean;
  readonly VITE_ENABLE_DEBUG_TOOLS: boolean;

  // =============================================================================
  // INFRASTRUCTURE CONFIGURATION
  // =============================================================================
  
  readonly INFRA_API_BASE_URL: string;
  readonly INFRA_AI_SERVICE_URL: string;
  readonly INFRA_CHAT_SERVICE_URL: string;
  readonly INFRA_DATABASE_URL: string;
  readonly INFRA_REDIS_URL: string;
  readonly INFRA_STORAGE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// =============================================================================
// ENVIRONMENT VARIABLE UTILITIES
// =============================================================================

/**
 * Get API base URL with fallback
 */
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE || '/api/v1';
};

/**
 * Get AI service URL with fallback
 */
export const getAiServiceUrl = (): string => {
  return import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';
};

/**
 * Get chat service URL with fallback
 */
export const getChatServiceUrl = (): string => {
  return import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:3001';
};

/**
 * Get file upload URL with fallback
 */
export const getFileUploadUrl = (): string => {
  return import.meta.env.VITE_FILE_UPLOAD_URL || '/api/v1/upload';
};

/**
 * Check if environment is development
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.VITE_NODE_ENV === 'development';
};

/**
 * Check if environment is production
 */
export const isProduction = (): boolean => {
  return import.meta.env.VITE_NODE_ENV === 'production';
};

/**
 * Check if environment is test
 */
export const isTest = (): boolean => {
  return import.meta.env.VITE_NODE_ENV === 'test';
};

/**
 * Get environment-specific API URL
 */
export const getEnvironmentApiUrl = (): string => {
  if (isProduction()) {
    return import.meta.env.VITE_PRODUCTION_API_URL || getApiBaseUrl();
  }
  if (isTest()) {
    return import.meta.env.VITE_TEST_API_URL || getApiBaseUrl();
  }
  return getApiBaseUrl();
};

/**
 * Get environment-specific AI service URL
 */
export const getEnvironmentAiServiceUrl = (): string => {
  if (isProduction()) {
    return import.meta.env.VITE_PRODUCTION_AI_SERVICE_URL || getAiServiceUrl();
  }
  if (isTest()) {
    return import.meta.env.VITE_TEST_AI_SERVICE_URL || getAiServiceUrl();
  }
  return getAiServiceUrl();
};

/**
 * Get environment-specific chat service URL
 */
export const getEnvironmentChatServiceUrl = (): string => {
  if (isProduction()) {
    return import.meta.env.VITE_PRODUCTION_CHAT_SERVICE_URL || getChatServiceUrl();
  }
  if (isTest()) {
    return import.meta.env.VITE_TEST_CHAT_SERVICE_URL || getChatServiceUrl();
  }
  return getChatServiceUrl();
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: string): boolean => {
  const featureFlag = `VITE_ENABLE_${feature.toUpperCase()}`;
  return import.meta.env[featureFlag] === 'true';
};

/**
 * Get JWT configuration
 */
export const getJwtConfig = () => ({
  secret: import.meta.env.VITE_JWT_SECRET || 'default-secret',
  expiresIn: import.meta.env.VITE_JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: import.meta.env.VITE_JWT_REFRESH_EXPIRES_IN || '30d',
});

/**
 * Get encryption configuration
 */
export const getEncryptionConfig = () => ({
  key: import.meta.env.VITE_ENCRYPTION_KEY || 'default-encryption-key',
  salt: import.meta.env.VITE_PASSWORD_SALT || 'default-salt',
});

/**
 * Get rate limiting configuration
 */
export const getRateLimitConfig = () => ({
  requests: Number(import.meta.env.VITE_RATE_LIMIT_REQUESTS) || 100,
  windowMs: Number(import.meta.env.VITE_RATE_LIMIT_WINDOW) || 900000, // 15 minutes
});

/**
 * Get CORS configuration
 */
export const getCorsConfig = () => ({
  origin: import.meta.env.VITE_CORS_ORIGIN || '*',
  methods: import.meta.env.VITE_CORS_ALLOWED_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: import.meta.env.VITE_CORS_ALLOWED_HEADERS?.split(',') || ['Content-Type', 'Authorization'],
});

/**
 * Get localization configuration
 */
export const getLocalizationConfig = () => ({
  defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',
  supportedLanguages: import.meta.env.VITE_SUPPORTED_LANGUAGES?.split(',') || ['en', 'ar'],
  defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY || 'USD',
  supportedCurrencies: import.meta.env.VITE_SUPPORTED_CURRENCIES?.split(',') || ['USD', 'EUR', 'GBP'],
});

/**
 * Get debug configuration
 */
export const getDebugConfig = () => ({
  enabled: import.meta.env.VITE_DEBUG_MODE === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  mockServices: import.meta.env.VITE_USE_MOCK_SERVICES === 'true',
  mockApiDelay: Number(import.meta.env.VITE_MOCK_API_DELAY) || 1000,
});

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for valid environment
 */
export const isValidEnvironment = (env: string): env is 'development' | 'production' | 'test' => {
  return ['development', 'production', 'test'].includes(env);
};

/**
 * Type guard for valid log level
 */
export const isValidLogLevel = (level: string): level is 'debug' | 'info' | 'warn' | 'error' => {
  return ['debug', 'info', 'warn', 'error'].includes(level);
};

/**
 * Type guard for valid currency
 */
export const isValidCurrency = (currency: string): boolean => {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'EGP'];
  return validCurrencies.includes(currency.toUpperCase());
};

/**
 * Type guard for valid language
 */
export const isValidLanguage = (language: string): boolean => {
  const validLanguages = ['en', 'ar', 'fr', 'de', 'es', 'it', 'pt'];
  return validLanguages.includes(language.toLowerCase());
};

// =============================================================================
// EXPORTS
// =============================================================================

export type { ImportMetaEnv, ImportMeta };
