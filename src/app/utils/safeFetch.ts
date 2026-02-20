/**
 * Safe Fetch Utility - Defensive API calls with proper error handling
 * Handles empty responses, JSON parsing errors, and rate limiting (429)
 */

interface SafeFetchOptions extends RequestInit {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

interface SafeFetchResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  rawText?: string;
  errorData?: any;
}

const isAbsoluteUrl = (url: string): boolean => /^https?:\/\//i.test(url);

const resolveRequestUrl = (url: string): string => {
  if (isAbsoluteUrl(url) || !url.startsWith('/api')) {
    return url;
  }

  if (import.meta.env.DEV) {
    return url;
  }

  const envApiBase = (import.meta.env.VITE_API_BASE as string | undefined)?.trim();

  if (!envApiBase) {
    return url;
  }

  try {
    const baseOrigin = new URL(envApiBase).origin;
    return `${baseOrigin}${url}`;
  } catch {
    return url;
  }
};

/**
 * Safe fetch wrapper that handles empty responses and JSON parsing errors
 * Also handles HTTP 429 (Too Many Requests) with appropriate messaging
 */
export async function safeFetch<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  const { timeout = 10000, retryCount = 0, retryDelay = 0, ...fetchOptions } = options;

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers = { ...options.headers } as Record<string, string>;

    const requestUrl = resolveRequestUrl(url);

    const response = await fetch(requestUrl, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Automatically send cookies
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle 429 (Too Many Requests) - Rate limited
    if (response.status === 429) {
      console.warn('⚠️ HTTP 429: Rate limit exceeded. Retry after a few minutes.');
      return {
        success: false,
        error: 'Too many requests. Please wait a moment and try again.',
        status: 429
      };
    }

    // Check response status
    if (!response.ok) {
      // Try to get error message from response body
      const responseText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let parsedError: any = undefined;

      try {
        parsedError = JSON.parse(responseText);
        
        // استخراج رسالة الخطأ المفصلة
        if (parsedError.message) {
          errorMessage = parsedError.message;
          
          // إذا كان هناك validation errors، نضيفها للرسالة
          if (parsedError.errors && Array.isArray(parsedError.errors) && parsedError.errors.length > 0) {
            const validationErrors = parsedError.errors
              .map((err: any) => `${err.field}: ${err.message}`)
              .join(', ');
            errorMessage = `${errorMessage} - ${validationErrors}`;
          }
        } else if (parsedError.error) {
          errorMessage = parsedError.error;
        }
      } catch (e) {
        // If JSON parsing fails, keep responseText available for debugging
        console.error('Error parsing error response:', e);
      }

      return {
        success: false,
        error: errorMessage,
        status: response.status,
        rawText: responseText,
        errorData: parsedError
      };
    }

    // Get response text first
    const responseText = await response.text();

    // Handle empty response
    if (!responseText || responseText.trim() === '') {
      return {
        success: false,
        error: 'Empty response from server',
        status: response.status,
        rawText: responseText
      };
    }

    // Parse JSON safely
    try {
      const data = JSON.parse(responseText);
      return {
        success: true,
        data,
        status: response.status
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response text:', responseText);
      return {
        success: false,
        error: 'Invalid JSON response from server',
        status: response.status,
        rawText: responseText
      };
    }

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timeout');
      return {
        success: false,
        error: 'Request timeout. Server is not responding.'
      };
    }

    console.error('Fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Helper for POST requests with JSON body
 */
export async function safePost<T = any>(
  url: string,
  data: any,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  return safeFetch<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: JSON.stringify(data),
    ...options
  });
}

/**
 * Helper for GET requests
 */
export async function safeGet<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  return safeFetch<T>(url, {
    method: 'GET',
    ...options
  });
}
