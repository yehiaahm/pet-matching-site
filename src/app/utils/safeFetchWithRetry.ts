/**
 * Enhanced Safe Fetch with Retry Mechanism
 * Handles API calls with automatic retries and exponential backoff
 */

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
}

interface SafeFetchOptions extends RequestInit {
  retryConfig?: RetryConfig;
  timeout?: number;
}

interface SafeFetchResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  rawText?: string;
  errorData?: any;
  retryCount?: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error: any) => {
    // Retry on network errors and 5xx server errors
    if (!error.status) return true; // Network error
    return error.status >= 500 || error.status === 429;
  }
};

/**
 * Sleep function for delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Enhanced safe fetch with retry mechanism
 */
export async function safeFetchWithRetry<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  const {
    retryConfig = DEFAULT_RETRY_CONFIG,
    timeout = 10000,
    ...fetchOptions
  } = options;

  const { maxRetries = 3, retryDelay = 1000, retryCondition } = retryConfig;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle 429 (Too Many Requests) - Rate limited
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay * Math.pow(2, attempt);
        
        console.warn(`⚠️ HTTP 429: Rate limit exceeded. Retrying after ${delay}ms...`);
        
        if (attempt < maxRetries) {
          await sleep(delay);
          continue;
        }
        
        return {
          success: false,
          error: 'Too many requests. Please wait a moment and try again.',
          status: 429,
          retryCount: attempt
        };
      }

      // Check response status
      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let parsedError: any = undefined;

        try {
          parsedError = JSON.parse(responseText);
          if (parsedError.message) {
            errorMessage = parsedError.message;
          } else if (parsedError.error) {
            errorMessage = parsedError.error;
          }
        } catch (e) {
          // If JSON parsing fails, keep responseText available for debugging
        }

        const error = {
          success: false,
          error: errorMessage,
          status: response.status,
          rawText: responseText,
          errorData: parsedError
        };

        // Check if we should retry this error
        if (attempt < maxRetries && retryCondition?.(error)) {
          const delay = retryDelay * Math.pow(2, attempt);
          console.warn(`⚠️ Attempt ${attempt + 1} failed. Retrying after ${delay}ms...`, error);
          await sleep(delay);
          continue;
        }

        return {
          ...error,
          retryCount: attempt
        };
      }

      // Handle successful response
      const responseText = await response.text();
      
      // Check for empty response
      if (!responseText || responseText.trim() === '') {
        return {
          success: false,
          error: 'Empty response from server',
          status: response.status,
          rawText: responseText,
          retryCount: attempt
        };
      }

      // Parse JSON response
      try {
        const data = JSON.parse(responseText);
        return {
          success: true,
          data,
          status: response.status,
          retryCount: attempt
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', responseText);
        return {
          success: false,
          error: 'Invalid JSON response from server',
          status: response.status,
          rawText: responseText,
          retryCount: attempt
        };
      }

    } catch (error) {
      lastError = error;
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Request timeout');
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt);
          console.warn(`⚠️ Timeout on attempt ${attempt + 1}. Retrying after ${delay}ms...`);
          await sleep(delay);
          continue;
        }
        return {
          success: false,
          error: 'Request timeout. Server is not responding.',
          retryCount: attempt
        };
      }

      console.error(`Fetch error on attempt ${attempt + 1}:`, error);
      
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt);
        console.warn(`⚠️ Network error on attempt ${attempt + 1}. Retrying after ${delay}ms...`);
        await sleep(delay);
        continue;
      }
    }
  }

  // All retries failed
  return {
    success: false,
    error: lastError instanceof Error ? lastError.message : 'Network error after multiple retries',
    retryCount: maxRetries
  };
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T>(url: string, options?: SafeFetchOptions) => 
    safeFetchWithRetry<T>(url, { ...options, method: 'GET' }),
    
  post: <T>(url: string, data?: any, options?: SafeFetchOptions) => 
    safeFetchWithRetry<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: <T>(url: string, data?: any, options?: SafeFetchOptions) => 
    safeFetchWithRetry<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: <T>(url: string, options?: SafeFetchOptions) => 
    safeFetchWithRetry<T>(url, { ...options, method: 'DELETE' }),
};

export default safeFetchWithRetry;
