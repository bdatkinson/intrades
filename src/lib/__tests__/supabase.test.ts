import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create a spy for createClient before mocking
const mockCreateClient = vi.fn(() => ({
  from: vi.fn(),
  auth: vi.fn(),
  storage: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

describe('supabase', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    mockCreateClient.mockClear();
  });

  it('exports a supabase named const', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

    const mod = await import('../supabase');
    expect(mod.supabase).toBeDefined();
  });

  it('calls createClient with URL and anon key from env', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

    await import('../supabase');

    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'test-anon-key',
    );
  });

  it('throws when VITE_SUPABASE_URL is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

    await expect(import('../supabase')).rejects.toThrow('VITE_SUPABASE_URL');
  });

  it('throws when VITE_SUPABASE_ANON_KEY is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    await expect(import('../supabase')).rejects.toThrow('VITE_SUPABASE_ANON_KEY');
  });
});
