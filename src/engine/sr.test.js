import { describe, it, expect } from 'vitest';
import {
  applySRResult, selectFact, SR_BUCKET,
  VICTORY_LAP_CHANCE, VICTORY_LAP_WINDOW_MS,
} from './sr.js';

const entry = (over = {}) => ({ bucket: SR_BUCKET.WILD, correctStreak: 0, seen: 0, lastSeenAt: null, ...over });

describe('promotedAt stamping', () => {
  it('stamps promotedAt on fast correct (promotion)', () => {
    const next = applySRResult(entry(), true, 2000, 1000);
    expect(next.bucket).toBe(SR_BUCKET.TRACKING);
    expect(next.promotedAt).toBe(1000);
  });
  it('does not stamp on slow correct (no promotion)', () => {
    const next = applySRResult(entry(), true, 6000, 1000);
    expect(next.bucket).toBe(SR_BUCKET.WILD);
    expect(next.promotedAt).toBeUndefined();
  });
  it('clears promotedAt on a miss', () => {
    const next = applySRResult(entry({ bucket: SR_BUCKET.TRACKING, promotedAt: 500 }), false, 2000, 1000);
    expect(next.promotedAt).toBeUndefined();
  });
});

describe('selectFact victory laps', () => {
  const now = 1_000_000;
  const sr = {
    'mult:7x8': { bucket: 'tracking', correctStreak: 1, seen: 3, lastSeenAt: now - 60_000, promotedAt: now - 60_000 },
    'mult:2x3': { bucket: 'trusted', correctStreak: 5, seen: 9, lastSeenAt: now - 1000 },
  };
  const candidates = ['mult:7x8', 'mult:2x3', 'mult:9x9'];

  it('picks a recently promoted, not-reseen fact when rng favors the lap', () => {
    const rng = () => 0.05; // below VICTORY_LAP_CHANCE
    expect(selectFact(candidates, sr, { rng, now })).toBe('mult:7x8');
  });
  it('falls back to bucket selection when rng skips the lap', () => {
    const picks = new Set();
    for (let i = 0; i < 300; i++) {
      picks.add(selectFact(candidates, sr, { rng: Math.random, now }));
    }
    expect(picks.size).toBeGreaterThan(1);
  });
  it('ignores facts already reseen since promotion', () => {
    const reseen = { 'mult:7x8': { ...sr['mult:7x8'], lastSeenAt: now - 10 } };
    const rng = () => 0.05;
    const got = selectFact(['mult:7x8', 'mult:9x9'], reseen, { rng, now });
    expect(['mult:7x8', 'mult:9x9']).toContain(got); // falls through to buckets
    // deterministic check: no lap candidates means bucket path; with rng always 0.05
    // the wild bucket wins, and only mult:9x9 is wild.
    expect(got).toBe('mult:9x9');
  });
  it('ignores promotions older than the window', () => {
    const stale = { 'mult:7x8': { ...sr['mult:7x8'], promotedAt: now - VICTORY_LAP_WINDOW_MS - 1, lastSeenAt: now - VICTORY_LAP_WINDOW_MS - 2 } };
    const rng = () => 0.05;
    expect(selectFact(['mult:7x8', 'mult:9x9'], stale, { rng, now })).toBe('mult:9x9');
  });
});
