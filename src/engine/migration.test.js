import { describe, it, expect } from 'vitest';
import { normalizeProfile } from './migration.js';

describe('v20 migration', () => {
  it('preserves sessionLog', () => {
    const log = [{ date: 'Sat Jul 19 2026', rounds: [{ round: 1, topic: 'mult', medianMs: 4000, samples: 5, correct: 5, total: 5 }] }];
    expect(normalizeProfile({ prefix: 'Moss', sessionLog: log }).sessionLog).toEqual(log);
  });
  it('defaults sessionLog to empty array', () => {
    expect(normalizeProfile({ prefix: 'Moss' }).sessionLog).toEqual([]);
  });
  it('drops malformed sessionLog entries instead of crashing later', () => {
    const p = normalizeProfile({ prefix: 'Moss', sessionLog: [
      null, 'junk', { date: 'Mon Jul 13 2026' }, { date: 'Tue Jul 14 2026', rounds: 'nope' },
      { date: 'Wed Jul 15 2026', rounds: [{ round: 1, medianMs: 4000, samples: 5, correct: 4, total: 5 }, null] },
    ] });
    expect(p.sessionLog).toEqual([
      { date: 'Wed Jul 15 2026', rounds: [{ round: 1, medianMs: 4000, samples: 5, correct: 4, total: 5 }] },
    ]);
  });
  it('keeps promotedAt inside factsSR entries', () => {
    const sr = { 'mult:7x8': { bucket: 'tracking', correctStreak: 1, seen: 2, lastSeenAt: 5, promotedAt: 5 } };
    const out = normalizeProfile({ prefix: 'Moss', factsSR: sr }).factsSR;
    expect(out['mult:7x8'].promotedAt).toBe(5);
  });
  it('stamps _version 20', () => {
    expect(normalizeProfile({ prefix: 'Moss' })._version).toBe(20);
  });
  it('preserves medCatOpening when present', () => {
    expect(normalizeProfile({ prefix: 'Moss', medCatOpening: false }).medCatOpening).toBe(false);
    expect(normalizeProfile({ prefix: 'Moss', medCatOpening: true }).medCatOpening).toBe(true);
  });
});

describe('modern rank preservation (no demotion on reload)', () => {
  it('keeps a v13+ warrior-path Warrior as Warrior', () => {
    const p = normalizeProfile({ _version: 19, prefix: 'Freckle', path: 'warrior', rank: 'Warrior', suffix: 'leap', totalCorrect: 200, rankFloor: 150 });
    expect(p.rank).toBe('Warrior');
  });
  it('keeps a v13+ Medicine Cat (no repeat name ceremony)', () => {
    const p = normalizeProfile({ _version: 19, prefix: 'Moss', path: 'medicine_cat', rank: 'Medicine Cat', suffix: 'leaf', totalCorrect: 80, rankFloor: 60 });
    expect(p.rank).toBe('Medicine Cat');
  });
  it('keeps a v13+ Senior Medicine Cat', () => {
    const p = normalizeProfile({ _version: 19, prefix: 'Moss', path: 'medicine_cat', rank: 'Senior Medicine Cat', suffix: 'leaf', totalCorrect: 250, rankFloor: 200 });
    expect(p.rank).toBe('Senior Medicine Cat');
  });
  it('is idempotent for a modern Medicine Cat profile', () => {
    const once = normalizeProfile({ _version: 19, prefix: 'Moss', path: 'medicine_cat', rank: 'Medicine Cat', suffix: 'leaf', totalCorrect: 80, rankFloor: 60 });
    expect(normalizeProfile(once)).toEqual(once);
  });
  it('still maps a legacy no-version Warrior label to Young Warrior', () => {
    const p = normalizeProfile({ prefix: 'Spider', highestRank: 'Warrior', totalCorrect: 80 });
    expect(p.rank).toBe('Young Warrior');
    expect(p.rankFloor).toBeGreaterThanOrEqual(80);
  });
  it('legacy medicine saves with explicit Medicine Cat labels map correctly', () => {
    expect(normalizeProfile({ prefix: 'Moss', path: 'medicine_cat', rank: 'Medicine Cat' }).rank).toBe('Medicine Cat');
    expect(normalizeProfile({ prefix: 'Moss', path: 'medicine_cat', rank: 'Senior Medicine Cat' }).rank).toBe('Senior Medicine Cat');
  });
});
