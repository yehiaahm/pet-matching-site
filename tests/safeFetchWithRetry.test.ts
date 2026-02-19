import { describe, it, expect, vi } from 'vitest';
import { safeFetchWithRetry, api } from '../utils/safeFetchWithRetry';

// Mock fetch
global.fetch = vi.fn();

describe('safeFetchWithRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful response', async () => {
    const mockResponse = { data: 'test data' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    } as Response);

    const result = await safeFetchWithRetry('http://test.com/api');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse);
    expect(result.retryCount).toBe(0);
  });

  it('should retry on network error', async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ data: 'success' })),
      } as Response);

    const result = await safeFetchWithRetry('http://test.com/api', {
      retryConfig: { maxRetries: 2, retryDelay: 100 }
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ data: 'success' });
    expect(result.retryCount).toBe(1);
  });

  it('should handle rate limiting (429)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: () => Promise.resolve('Rate limit exceeded'),
    } as Response);

    const result = await safeFetchWithRetry('http://test.com/api', {
      retryConfig: { maxRetries: 2, retryDelay: 100 }
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Too many requests. Please wait a moment and try again.');
    expect(result.status).toBe(429);
  });

  it('should respect maxRetries limit', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Persistent network error'));

    const result = await safeFetchWithRetry('http://test.com/api', {
      retryConfig: { maxRetries: 2, retryDelay: 100 }
    });

    expect(result.success).toBe(false);
    expect(result.retryCount).toBe(2);
    expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
});

describe('api convenience methods', () => {
  it('should make GET request', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
    } as Response);

    await api.get('http://test.com/api');

    expect(fetch).toHaveBeenCalledWith('http://test.com/api', {
      method: 'GET',
      signal: expect.any(AbortSignal)
    });
  });

  it('should make POST request with data', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
    } as Response);

    const postData = { name: 'test' };
    await api.post('http://test.com/api', postData);

    expect(fetch).toHaveBeenCalledWith('http://test.com/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
      signal: expect.any(AbortSignal)
    });
  });
});
