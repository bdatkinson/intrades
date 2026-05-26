import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../lib/api-client';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('should initialize with base URL', () => {
    const client = new ApiClient('https://api.example.com');
    expect(client.baseUrl).toBe('https://api.example.com');
  });

  it('should make GET requests', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      headers: new Headers({ 'Content-Type': 'application/json' })
    };
    
    vi.mocked(fetch).mockResolvedValue(mockResponse);
    
    const client = new ApiClient('https://api.example.com');
    await client.get('/users');
    
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('should handle JSON responses', async () => {
    const testData = { id: 1, name: 'Test' };
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve(testData),
      headers: new Headers({ 'Content-Type': 'application/json' })
    };
    
    vi.mocked(fetch).mockResolvedValue(mockResponse);
    
    const client = new ApiClient('https://api.example.com');
    const response = await client.get('/users');
    
    expect(response).toEqual(testData);
  });

  it('should throw on HTTP errors', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
      headers: new Headers({ 'Content-Type': 'application/json' })
    };
    
    vi.mocked(fetch).mockResolvedValue(mockResponse);
    
    const client = new ApiClient('https://api.example.com');
    await expect(client.get('/not-found')).rejects.toThrow();
  });

  it('should include auth header if token is set', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      headers: new Headers({ 'Content-Type': 'application/json' })
    };
    
    vi.mocked(fetch).mockResolvedValue(mockResponse);
    
    const client = new ApiClient('https://api.example.com');
    client.setAuthToken('test-token');
    await client.get('/users');
    
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      })
    );
  });

  it('should timeout if request takes too long', async () => {
    vi.mocked(fetch).mockImplementation((input, init) => {
      const signal = init?.signal;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true })
          } as Response);
        }, 200);

        if (signal) {
          if (signal.aborted) {
            clearTimeout(timeout);
            reject(new DOMException('The user aborted a request.', 'AbortError'));
          }
          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('The user aborted a request.', 'AbortError'));
          });
        }
      });
    });
    
    const client = new ApiClient('https://api.example.com', { timeout: 100 });
    await expect(client.get('/slow')).rejects.toThrow('Request timed out');
  });
});