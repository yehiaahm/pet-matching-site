# Defensive Fetch Patterns & Reusable Code Examples

## 🎯 Overview

This guide shows best practices for handling API calls in React to prevent "Unexpected end of JSON input" and other data-fetching errors.

---

## Pattern 1: Using safeFetch (Recommended)

### ✅ Complete Example

```typescript
// src/app/utils/safeFetch.ts (Already exists - USE THIS!)

interface SafeFetchResponse<T> {
  success: boolean;
  error: string | null;
  statusCode: number;
  data: T | null;
}

export const safeFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<SafeFetchResponse<T>> => {
  try {
    const response = await fetch(url, options);
    
    // 1️⃣ Check HTTP status first
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
        data: null
      };
    }

    // 2️⃣ Get response text (can be empty)
    const responseText = await response.text();
    
    // 3️⃣ Check if response is empty
    if (!responseText || responseText.trim() === '') {
      return {
        success: false,
        error: 'Empty response from server',
        statusCode: response.status,
        data: null
      };
    }

    // 4️⃣ Try to parse JSON safely
    try {
      const data = JSON.parse(responseText);
      return {
        success: true,
        error: null,
        statusCode: response.status,
        data
      };
    } catch (parseError) {
      console.error('[safeFetch] JSON parse error:', parseError);
      return {
        success: false,
        error: 'Invalid JSON in response',
        statusCode: response.status,
        data: null
      };
    }
  } catch (error) {
    console.error('[safeFetch] Network error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      statusCode: 0,
      data: null
    };
  }
};

// Helper functions (already exist in your codebase)
export const safeGet = <T,>(url: string) => safeFetch<T>(url, { method: 'GET' });

export const safePost = <T,>(url: string, body: any) => 
  safeFetch<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
```

### ✅ Usage in Components

```typescript
// src/app/components/Analytics.tsx

import { useEffect, useState } from 'react';
import { safeGet } from '../utils/safeFetch';

interface AnalyticsData {
  totalUsers: number;
  totalPets: number;
  activeMatches: number;
}

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      // ✅ Use safeGet - handles all error cases
      const response = await safeGet<AnalyticsData>('/api/v1/analytics/overview');

      if (!response.success) {
        setError(response.error);
        setAnalytics(null);
        return;
      }

      // ✅ response.data is guaranteed to be valid
      if (response.data) {
        setAnalytics(response.data);
      }

      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analytics) return <div>No data</div>;

  return (
    <div>
      <h2>Analytics</h2>
      <p>Users: {analytics.totalUsers}</p>
      <p>Pets: {analytics.totalPets}</p>
      <p>Matches: {analytics.activeMatches}</p>
    </div>
  );
}
```

---

## Pattern 2: Custom Hook for Data Fetching

### ✅ Reusable Hook

```typescript
// src/app/hooks/useFetch.ts

import { useEffect, useState } from 'react';
import { safeGet } from '../utils/safeFetch';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(url: string): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const response = await safeGet<T>(url);

    if (!response.success) {
      setError(response.error);
      setData(null);
    } else if (response.data) {
      setData(response.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}
```

### ✅ Usage in Component

```typescript
import { useFetch } from '../hooks/useFetch';

interface UserData {
  id: string;
  name: string;
  email: string;
}

export function UserProfile() {
  const { data: user, loading, error, refetch } = useFetch<UserData>('/api/v1/users/me');

  if (loading) return <div>Loading user...</div>;
  if (error) return <div>Error: {error} <button onClick={refetch}>Retry</button></div>;
  if (!user) return <div>No user data</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

---

## Pattern 3: POST Request with Validation

### ✅ Form Submission with Error Handling

```typescript
// src/app/components/LoginForm.tsx

import { useState } from 'react';
import { safePost } from '../utils/safeFetch';

interface LoginResponse {
  user: { id: string; name: string };
  accessToken: string;
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // ✅ Use safePost with type safety
    const response = await safePost<LoginResponse>('/api/v1/auth/login', {
      email,
      password
    });

    if (!response.success) {
      // ✅ response.error is always a string - never a JSON parse error
      setError(response.error);
      setLoading(false);
      return;
    }

    // ✅ response.data is guaranteed to match LoginResponse type
    if (response.data) {
      const { user, accessToken } = response.data;
      console.log('Logged in as:', user.name);
      console.log('Token:', accessToken);
      // Store token, redirect, etc.
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## Pattern 4: Parallel Requests with Error Handling

### ✅ Fetch Multiple Resources

```typescript
// src/app/components/Dashboard.tsx

import { useEffect, useState } from 'react';
import { safeGet } from '../utils/safeFetch';

interface DashboardData {
  user: { id: string; name: string };
  analytics: { totalPets: number };
  matches: Array<{ id: string; petName: string }>;
}

export function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setErrors({});

      // ✅ Fetch all data in parallel
      const [userRes, analyticsRes, matchesRes] = await Promise.all([
        safeGet('/api/v1/users/me'),
        safeGet('/api/v1/analytics/overview'),
        safeGet('/api/v1/matches')
      ]);

      // ✅ Track errors individually
      const newErrors: Record<string, string> = {};
      const data: Partial<DashboardData> = {};

      if (!userRes.success) {
        newErrors.user = userRes.error;
      } else if (userRes.data) {
        data.user = userRes.data;
      }

      if (!analyticsRes.success) {
        newErrors.analytics = analyticsRes.error;
      } else if (analyticsRes.data) {
        data.analytics = analyticsRes.data;
      }

      if (!matchesRes.success) {
        newErrors.matches = matchesRes.error;
      } else if (matchesRes.data) {
        data.matches = matchesRes.data;
      }

      setErrors(newErrors);

      // ✅ Only set dashboard if we have at least some data
      if (Object.keys(data).length > 0) {
        setDashboard(data as DashboardData);
      }

      setLoading(false);
    };

    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      {errors.user && <div className="error">Failed to load user: {errors.user}</div>}
      {errors.analytics && <div className="error">Failed to load analytics: {errors.analytics}</div>}
      {errors.matches && <div className="error">Failed to load matches: {errors.matches}</div>}
      
      {dashboard?.user && <h1>Welcome, {dashboard.user.name}</h1>}
      {dashboard?.analytics && <p>Total Pets: {dashboard.analytics.totalPets}</p>}
      {dashboard?.matches && <p>Matches: {dashboard.matches.length}</p>}
    </div>
  );
}
```

---

## Pattern 5: Automatic Retry with Exponential Backoff

### ✅ Resilient API Calls

```typescript
// src/app/utils/safeFetchWithRetry.ts

interface SafeFetchResponse<T> {
  success: boolean;
  error: string | null;
  statusCode: number;
  data: T | null;
}

const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

export async function safeFetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries = 0
): Promise<SafeFetchResponse<T>> {
  try {
    const response = await fetch(url, options);

    // ✅ Don't retry on client errors (4xx)
    if (!response.ok && !RETRYABLE_STATUS_CODES.includes(response.status)) {
      const text = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}`,
        statusCode: response.status,
        data: null
      };
    }

    // ✅ Retry on server errors (5xx) and rate limits
    if (!response.ok && retries < MAX_RETRIES) {
      const delay = INITIAL_DELAY * Math.pow(2, retries); // Exponential backoff
      console.log(`Retrying in ${delay}ms... (attempt ${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeFetchWithRetry<T>(url, options, retries + 1);
    }

    const text = await response.text();
    
    if (!text) {
      return {
        success: false,
        error: 'Empty response',
        statusCode: response.status,
        data: null
      };
    }

    const data = JSON.parse(text);
    return {
      success: response.ok,
      error: response.ok ? null : 'Request failed',
      statusCode: response.status,
      data: response.ok ? data : null
    };
  } catch (error) {
    if (retries < MAX_RETRIES && error instanceof TypeError) {
      const delay = INITIAL_DELAY * Math.pow(2, retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeFetchWithRetry<T>(url, options, retries + 1);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      statusCode: 0,
      data: null
    };
  }
}
```

### ✅ Usage

```typescript
const response = await safeFetchWithRetry<UserData>(
  '/api/v1/users/me',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

---

## Pattern 6: Backend Response Validation

### ✅ TypeScript Type Guards

```typescript
// src/app/utils/validateResponse.ts

// ✅ Ensure response matches expected structure
export function validateResponse<T>(
  data: unknown,
  validator: (data: unknown) => boolean
): data is T {
  return validator(data);
}

// ✅ Usage example
interface UserResponse {
  id: string;
  name: string;
  email: string;
}

function isUserResponse(data: unknown): data is UserResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'email' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).name === 'string' &&
    typeof (data as any).email === 'string'
  );
}

// ✅ In component:
const response = await safeGet('/api/v1/users/me');

if (response.success && response.data) {
  if (validateResponse<UserResponse>(response.data, isUserResponse)) {
    // ✅ response.data is guaranteed to be UserResponse
    console.log(response.data.email);
  } else {
    console.error('Invalid response structure');
  }
}
```

---

## Pattern 7: Error Boundaries + Fetch Errors

### ✅ Catch Fetch Errors in React

```typescript
// src/app/components/ErrorBoundary.tsx

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // ✅ Catch JSON parse errors and other errors
    console.error('Caught error:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ✅ Usage
export function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
      <Analytics />
    </ErrorBoundary>
  );
}
```

---

## Pattern 8: Interceptor Pattern (Advanced)

### ✅ Middleware for All Requests

```typescript
// src/app/utils/apiClient.ts

type RequestInterceptor = (url: string, options: RequestInit) => Promise<void>;
type ResponseInterceptor = <T>(response: SafeFetchResponse<T>) => void;

class ApiClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  async fetch<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<SafeFetchResponse<T>> {
    // ✅ Run request interceptors (add auth, logging, etc.)
    for (const interceptor of this.requestInterceptors) {
      await interceptor(url, options);
    }

    // ✅ Make request (same as safeFetch)
    const response = await safeFetch<T>(url, options);

    // ✅ Run response interceptors (logging, error handling, etc.)
    for (const interceptor of this.responseInterceptors) {
      interceptor(response);
    }

    return response;
  }
}

const apiClient = new ApiClient();

// ✅ Add auth interceptor
apiClient.addRequestInterceptor(async (url, options) => {
  const token = localStorage.getItem('token');
  if (token) {
    options.headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`
    };
  }
});

// ✅ Add error logging interceptor
apiClient.addResponseInterceptor((response) => {
  if (!response.success) {
    console.error(`API Error [${response.statusCode}]: ${response.error}`);
  }
});

export default apiClient;
```

### ✅ Usage

```typescript
const response = await apiClient.fetch<UserData>('/api/v1/users/me');
// Auth header automatically added
// Errors automatically logged
```

---

## Comparison Table

| Pattern | When to Use | Pros | Cons |
|---------|-----------|------|------|
| **safeFetch** | Simple API calls | Easy, explicit | Must handle errors manually |
| **useFetch Hook** | Data loading in components | Reusable, clean | Less control over timing |
| **Form POST** | Form submissions | Type-safe, clear | Verbose for simple calls |
| **Parallel Requests** | Multiple data sources | Efficient, parallel | Complex error handling |
| **Retry Logic** | Unreliable networks | Resilient, automatic | May retry non-idempotent ops |
| **Validation** | Untrusted responses | Type-safe, runtime checks | Extra code/complexity |
| **Error Boundary** | Catch UI errors | Prevents white screen | Can't catch async errors |
| **Interceptors** | Global concerns | DRY, centralized | More complex setup |

---

## Common Pitfalls to Avoid

| Pitfall | Problem | Solution |
|---------|---------|----------|
| `JSON.parse()` without try-catch | Unhandled exception | Use safeFetch |
| Assuming `response.ok` | 4xx/5xx might have no body | Use safeFetch |
| Not checking for empty responses | `JSON.parse("")` fails | Use safeFetch |
| Hardcoded URLs | Works locally, fails in production | Use relative paths |
| Direct `response.json()` | No error handling | Use safeFetch |
| No auth headers | 401 errors | Add interceptors or headers |
| Not validating response structure | Type errors later | Add validators |
| No error UI | User doesn't know what failed | Show error messages |

---

## Testing These Patterns

```typescript
// src/app/__tests__/safeFetch.test.ts

import { safeFetch, safeGet, safePost } from '../utils/safeFetch';

describe('safeFetch', () => {
  // ✅ Test valid response
  it('should parse valid JSON', async () => {
    const mockResponse = { success: true, data: { id: '1' } };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      })
    );

    const result = await safeFetch('/api/test');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse);
  });

  // ✅ Test empty response
  it('should handle empty response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('')
      })
    );

    const result = await safeFetch('/api/test');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Empty');
  });

  // ✅ Test invalid JSON
  it('should handle invalid JSON', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('{invalid json}')
      })
    );

    const result = await safeFetch('/api/test');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid JSON');
  });

  // ✅ Test network error
  it('should handle network errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    const result = await safeFetch('/api/test');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });
});
```

---

## Summary

✅ **Use safeFetch** for all API calls - it handles:
- Empty responses
- Invalid JSON
- Network errors
- HTTP errors
- Type safety

✅ **Use useFetch hook** for simple data loading in components

✅ **Add validation** for untrusted responses

✅ **Use relative paths** for all API URLs

✅ **Add error UI** to show users what went wrong

✅ **Test edge cases** - empty responses, malformed JSON, network errors

The "Unexpected end of JSON input" error is completely preventable with these patterns.
