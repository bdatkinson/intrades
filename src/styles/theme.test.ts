import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { theme } from './theme';

describe('Theme', () => {
  it('should have correct colors', () => {
    expect(theme.colors).toEqual({
      primary: '#005f73',
      secondary: '#0a9396',
      accent: '#94d2bd',
      background: '#e9d8a6',
      text: '#001219',
    });
  });

  it('should have correct typography', () => {
    expect(theme.typography.fontFamily).toBe(`'IBM Plex Mono', monospace`);
    expect(theme.typography.lineHeight).toBe(1.6);
    expect(theme.typography.sizes).toEqual({
      small: '0.875rem',
      base: '1rem',
      large: '1.25rem',
    });
  });

  it('should have correct spacing', () => {
    expect(theme.spacing).toEqual({
      small: '0.5rem',
      base: '1rem',
      large: '2rem',
    });
  });
});