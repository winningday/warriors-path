import { describe, it, expect } from 'vitest';
import { factId } from './sr.js';

describe('smoke', () => {
  it('runs against real modules', () => {
    expect(factId('mult', 8, 7)).toBe('mult:7x8');
  });
});
