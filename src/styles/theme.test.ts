import { describe, it, expect } from 'vitest';
import { theme } from './theme';

describe('Theme', () => {
  it('should have correct industrial brutalism colors', () => {
    expect(theme.colors).toEqual({
      background: '#09090b',   // zinc-950
      surface: '#18181b',      // zinc-900
      border: '#3f3f46',       // zinc-700
      text: '#f4f4f5',         // zinc-100
      muted: '#71717a',        // zinc-500
    });
  });

  it('should have correct typography', () => {
    expect(theme.typography.fontFamily).toBe(`'IBM Plex Mono', monospace`);
    expect(theme.typography.lineHeight).toBe(1.5);
  });
});
