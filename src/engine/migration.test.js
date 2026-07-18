import { describe, it, expect } from 'vitest';
import { normalizeProfile } from './migration.js';

describe('v15 migration', () => {
  it('preserves sessionLog', () => {
    const log = [{ date: 'Fri Jul 18 2026', rounds: [{ round: 1, medianMs: 4000, samples: 5, correct: 5, total: 5 }] }];
    expect(normalizeProfile({ prefix: 'Moss', sessionLog: log }).sessionLog).toEqual(log);
  });
  it('defaults sessionLog to empty array', () => {
    expect(normalizeProfile({ prefix: 'Moss' }).sessionLog).toEqual([]);
  });
  it('passes factsSR entries through untouched, promotedAt included', () => {
    const sr = { 'mult:7x8': { bucket: 'tracking', correctStreak: 1, seen: 2, lastSeenAt: 5, promotedAt: 5 } };
    expect(normalizeProfile({ prefix: 'Moss', factsSR: sr }).factsSR).toEqual(sr);
  });
  it('stamps _version 15', () => {
    expect(normalizeProfile({ prefix: 'Moss' })._version).toBe(15);
  });
  it('still normalizes an old v12-style save', () => {
    const p = normalizeProfile({ prefix: 'Spider', highestRank: 'Warrior', totalCorrect: 80 });
    expect(p.rank).toBe('Young Warrior');
    expect(p.rankFloor).toBeGreaterThanOrEqual(80);
  });
});
