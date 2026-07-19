import { describe, it, expect } from 'vitest';
import {
  applySRResult, selectFact, selectByBuckets, SR_BUCKET,
  VICTORY_LAP_CHANCE, VICTORY_LAP_WINDOW_MS,
} from './sr.js';

const entry = (over = {}) => ({
  bucket: SR_BUCKET.WILD, correctStreak: 0, seen: 0, lastSeenAt: null,
  correctCount: 0, wrongCount: 0, totalElapsedMs: 0, totalCorrectMs: 0, firstSeenAt: null,
  ...over,
});

describe('promotedAt stamping (v17 signature)', () => {
  it('stamps promotedAt on a speed promotion', () => {
    const next = applySRResult(entry(), true, 1500, 'mult-drill', 2000, 1000);
    expect(next.bucket).toBe(SR_BUCKET.TRACKING);
    expect(next.promotedAt).toBe(1000);
  });
  it('does not stamp on a correct answer that does not promote', () => {
    const next = applySRResult(entry(), true, 3000, 'mult-drill', 2000, 1000);
    expect(next.bucket).toBe(SR_BUCKET.WILD);
    expect(next.promotedAt).toBeUndefined();
  });
  it('stamps on a streak promotion for compute-heavy kinds', () => {
    const next = applySRResult(entry({ correctStreak: 2 }), true, 30000, 'geometry', 20000, 1000);
    expect(next.bucket).toBe(SR_BUCKET.TRACKING);
    expect(next.promotedAt).toBe(1000);
  });
  it('does not stamp when already Trusted (no bucket rise)', () => {
    const next = applySRResult(entry({ bucket: SR_BUCKET.TRUSTED }), true, 1000, 'mult-drill', 2000, 1000);
    expect(next.bucket).toBe(SR_BUCKET.TRUSTED);
    expect(next.promotedAt).toBeUndefined();
  });
  it('clears promotedAt on a miss', () => {
    const next = applySRResult(entry({ bucket: SR_BUCKET.TRACKING, promotedAt: 500 }), false, 2000, 'mult-drill', 2000, 1000);
    expect(next.promotedAt).toBeUndefined();
  });
  it('legacy 3-arg call still works and stamps with the internal clock', () => {
    const next = applySRResult(entry(), true, 2000);
    expect(next.bucket).toBe(SR_BUCKET.TRACKING);
    expect(typeof next.promotedAt).toBe('number');
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
    const rng = () => 0.05;
    expect(selectFact(candidates, sr, { rng, now })).toBe('mult:7x8');
  });
  it('falls back to bucket selection when the lap roll misses', () => {
    const picks = new Set();
    for (let i = 0; i < 300; i++) picks.add(selectFact(candidates, sr, { now }));
    expect(picks.size).toBeGreaterThan(1);
  });
  it('ignores facts already reseen since promotion', () => {
    const reseen = { 'mult:7x8': { ...sr['mult:7x8'], lastSeenAt: now - 10 } };
    const rng = () => 0.05;
    expect(selectFact(['mult:7x8', 'mult:9x9'], reseen, { rng, now })).toBe('mult:9x9');
  });
  it('ignores promotions older than the window', () => {
    const stale = { 'mult:7x8': { ...sr['mult:7x8'], promotedAt: now - VICTORY_LAP_WINDOW_MS - 1, lastSeenAt: now - VICTORY_LAP_WINDOW_MS - 2 } };
    const rng = () => 0.05;
    expect(selectFact(['mult:7x8', 'mult:9x9'], stale, { rng, now })).toBe('mult:9x9');
  });
  it('exposes the tuning constants', () => {
    expect(VICTORY_LAP_CHANCE).toBeGreaterThan(0);
    expect(VICTORY_LAP_CHANCE).toBeLessThan(1);
    expect(VICTORY_LAP_WINDOW_MS).toBe(15 * 60 * 1000);
  });
  it('selectByBuckets honors an injected rng deterministically', () => {
    const rng = () => 0.05;
    expect(selectByBuckets(['mult:7x8', 'mult:9x9'], { 'mult:7x8': { bucket: 'trusted' } }, rng)).toBe('mult:9x9');
  });
});
