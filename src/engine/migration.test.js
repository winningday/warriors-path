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

describe('modern rank preservation (no demotion on reload)', () => {
  it('keeps a v13+ warrior-path Warrior as Warrior', () => {
    const p = normalizeProfile({ _version: 15, prefix: 'Freckle', path: 'warrior', rank: 'Warrior', suffix: 'leap', totalCorrect: 200, rankFloor: 150 });
    expect(p.rank).toBe('Warrior');
  });
  it('keeps a v13+ Medicine Cat as Medicine Cat (no repeat name ceremony)', () => {
    const p = normalizeProfile({ _version: 14, prefix: 'Moss', path: 'medicine_cat', rank: 'Medicine Cat', suffix: 'leaf', totalCorrect: 80, rankFloor: 60 });
    expect(p.rank).toBe('Medicine Cat');
  });
  it('keeps a v13+ Senior Medicine Cat', () => {
    const p = normalizeProfile({ _version: 15, prefix: 'Moss', path: 'medicine_cat', rank: 'Senior Medicine Cat', suffix: 'leaf', totalCorrect: 250, rankFloor: 200 });
    expect(p.rank).toBe('Senior Medicine Cat');
  });
  it('keeps a v13+ Deputy and Leader', () => {
    expect(normalizeProfile({ _version: 15, prefix: 'Moss', path: 'warrior', rank: 'Deputy', suffix: 'heart', totalCorrect: 300, rankFloor: 280 }).rank).toBe('Deputy');
    expect(normalizeProfile({ _version: 15, prefix: 'Moss', path: 'warrior', rank: 'Leader', suffix: 'star', totalCorrect: 500, rankFloor: 420 }).rank).toBe('Leader');
  });
  it('is idempotent for a modern Medicine Cat profile', () => {
    const once = normalizeProfile({ _version: 15, prefix: 'Moss', path: 'medicine_cat', rank: 'Medicine Cat', suffix: 'leaf', totalCorrect: 80, rankFloor: 60 });
    expect(normalizeProfile(once)).toEqual(once);
  });
  it('still maps legacy labels when the save predates v13', () => {
    const p = normalizeProfile({ _version: 12, prefix: 'Spider', rank: 'Warrior', totalCorrect: 80 });
    expect(p.rank).toBe('Young Warrior');
  });
});

describe('sessionLog sanitization', () => {
  it('drops malformed sessionLog entries instead of crashing later', () => {
    const p = normalizeProfile({ prefix: 'Moss', sessionLog: [
      null,
      'junk',
      { date: 'Mon Jul 13 2026' },
      { date: 'Tue Jul 14 2026', rounds: 'nope' },
      { date: 'Wed Jul 15 2026', rounds: [{ round: 1, medianMs: 4000, samples: 5, correct: 4, total: 5 }, null] },
    ] });
    expect(p.sessionLog).toEqual([
      { date: 'Wed Jul 15 2026', rounds: [{ round: 1, medianMs: 4000, samples: 5, correct: 4, total: 5 }] },
    ]);
  });
});
