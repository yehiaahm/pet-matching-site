export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE || '/api/v1';
};

export const getAiServiceUrl = (): string => {
  return import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';
};

export const getChatServiceUrl = (): string => {
  return import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:3001';
};

export const getFileUploadUrl = (): string => {
  return import.meta.env.VITE_FILE_UPLOAD_URL || '/api/v1/upload';
};

export const isDevelopment = (): boolean => {
  return import.meta.env.VITE_NODE_ENV === 'development';
};

export const isProduction = (): boolean => {
  return import.meta.env.VITE_NODE_ENV === 'production';
};

export const isTest = (): boolean => {
  return import.meta.env.VITE_NODE_ENV === 'test';
};

export const getEnvironmentApiUrl = (): string => {
  if (isProduction()) {
    return import.meta.env.VITE_PRODUCTION_API_URL || getApiBaseUrl();
  }
  if (isTest()) {
    return import.meta.env.VITE_TEST_API_URL || getApiBaseUrl();
  }
  return getApiBaseUrl();
};

export const getEnvironmentAiServiceUrl = (): string => {
  if (isProduction()) {
    return import.meta.env.VITE_PRODUCTION_AI_SERVICE_URL || getAiServiceUrl();
  }
  if (isTest()) {
    return import.meta.env.VITE_TEST_AI_SERVICE_URL || getAiServiceUrl();
  }
  return getAiServiceUrl();
};

export const getEnvironmentChatServiceUrl = (): string => {
  if (isProduction()) {
    return import.meta.env.VITE_PRODUCTION_CHAT_SERVICE_URL || getChatServiceUrl();
  }
  if (isTest()) {
    return import.meta.env.VITE_TEST_CHAT_SERVICE_URL || getChatServiceUrl();
  }
  return getChatServiceUrl();
};
