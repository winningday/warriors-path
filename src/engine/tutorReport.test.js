import { describe, it, expect } from 'vitest';
import { tutorReport } from './tutorReport.js';
import { typicalFatigueRound } from './pacing.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = new Date('2026-07-18T12:00:00').getTime();

const baseProfile = (over = {}) => ({
  prefix: 'Moss',
  totalCorrect: 0,
  totalAttempted: 0,
  factsSR: {},
  sessionLog: [],
  ...over,
});

// Round record helper matching the sessionLog shape from pacing.js.
const r = (round, medianMs) => ({ round, topic: 'mult', medianMs, samples: 5, correct: 5, total: 5 });

describe('tutorReport accuracy', () => {
  it('computes totalCorrect / totalAttempted', () => {
    const report = tutorReport(baseProfile({ totalCorrect: 87, totalAttempted: 100 }), NOW);
    expect(report.accuracy).toBe(0.87);
  });

  it('is null when zero attempts', () => {
    expect(tutorReport(baseProfile(), NOW).accuracy).toBeNull();
  });

  it('tolerates a profile with missing fields', () => {
    const report = tutorReport({ prefix: 'Moss' }, NOW);
    expect(report.accuracy).toBeNull();
    expect(report.multGrid).toHaveLength(66);
    expect(report.recentWins).toEqual([]);
    expect(report.speedByDay).toEqual([]);
    expect(report.typicalFatigueRound).toBeNull();
  });
});

describe('tutorReport multGrid', () => {
  it('covers exactly the 66 normalized pairs 2..12 with a <= b', () => {
    const grid = tutorReport(baseProfile(), NOW).multGrid;
    expect(grid).toHaveLength(66);
    const ids = new Set(grid.map((c) => c.id));
    expect(ids.size).toBe(66);
    for (const cell of grid) {
      expect(cell.a).toBeGreaterThanOrEqual(2);
      expect(cell.b).toBeGreaterThanOrEqual(cell.a);
      expect(cell.b).toBeLessThanOrEqual(12);
      expect(cell.id).toBe(`mult:${cell.a}x${cell.b}`);
    }
  });

  it('marks untracked facts unseen and carries tracked SR data', () => {
    const factsSR = {
      'mult:7x8': { bucket: 'tracking', correctStreak: 2, seen: 5, lastSeenAt: NOW - HOUR },
    };
    const grid = tutorReport(baseProfile({ factsSR }), NOW).multGrid;
    const tracked = grid.find((c) => c.id === 'mult:7x8');
    expect(tracked).toEqual({ a: 7, b: 8, id: 'mult:7x8', bucket: 'tracking', correctStreak: 2, seen: 5 });
    const others = grid.filter((c) => c.id !== 'mult:7x8');
    expect(others.every((c) => c.bucket === 'unseen' && c.correctStreak === 0 && c.seen === 0)).toBe(true);
  });
});

describe('tutorReport recentWins', () => {
  it('includes wins within 48h, excludes older, sorted newest first, with × labels', () => {
    const factsSR = {
      'mult:7x8': { bucket: 'tracking', correctStreak: 1, seen: 3, lastSeenAt: NOW - HOUR, promotedAt: NOW - HOUR },
      'mult:3x4': { bucket: 'trusted', correctStreak: 4, seen: 9, lastSeenAt: NOW - 3 * DAY, promotedAt: NOW - 3 * DAY },
      'add:3+9': { bucket: 'tracking', correctStreak: 1, seen: 2, lastSeenAt: NOW - 2 * HOUR, promotedAt: NOW - 2 * HOUR },
      'mult:2x5': { bucket: 'wild', correctStreak: 0, seen: 4, lastSeenAt: NOW - HOUR },
    };
    const wins = tutorReport(baseProfile({ factsSR }), NOW).recentWins;
    expect(wins.map((w) => w.id)).toEqual(['mult:7x8', 'add:3+9']);
    expect(wins[0]).toEqual({ id: 'mult:7x8', label: '7 × 8', promotedAt: NOW - HOUR });
  });
});

describe('tutorReport buckets', () => {
  it('mult counts sum to 66', () => {
    const factsSR = {
      'mult:7x8': { bucket: 'tracking', correctStreak: 2, seen: 5, lastSeenAt: 1 },
      'mult:2x2': { bucket: 'trusted', correctStreak: 4, seen: 8, lastSeenAt: 1 },
      'mult:9x9': { bucket: 'wild', correctStreak: 0, seen: 3, lastSeenAt: 1 },
      'add:3+9': { bucket: 'wild', correctStreak: 0, seen: 1, lastSeenAt: 1 },
    };
    const { buckets } = tutorReport(baseProfile({ factsSR }), NOW);
    const m = buckets.mult;
    expect(m.unseen + m.wild + m.tracking + m.trusted).toBe(66);
    expect(m).toEqual({ unseen: 63, wild: 1, tracking: 1, trusted: 1 });
    expect(buckets.add.wild).toBe(1);
    expect(buckets.sub).toEqual({ unseen: 0, wild: 0, tracking: 0, trusted: 0 });
  });

  it('add counts cover only the 36-pair universe and ignore out-of-universe ids', () => {
    const factsSR = {
      // Out of universe: created by subtraction word problems (genAdd sub-small).
      'add:1+5': { bucket: 'tracking', correctStreak: 1, seen: 2, lastSeenAt: 1 },
      'add:2+12': { bucket: 'trusted', correctStreak: 4, seen: 6, lastSeenAt: 1 },
      // In universe (single-digit pairs 2..9).
      'add:3+4': { bucket: 'tracking', correctStreak: 1, seen: 2, lastSeenAt: 1 },
    };
    const { buckets } = tutorReport(baseProfile({ factsSR }), NOW);
    expect(buckets.add).toEqual({ unseen: 35, wild: 0, tracking: 1, trusted: 0 });
    const a = buckets.add;
    expect(a.unseen + a.wild + a.tracking + a.trusted).toBe(36);
  });

  it('add counts sum to 36 even when every out-of-universe id is tracked', () => {
    const factsSR = {
      'add:1+9': { bucket: 'trusted', correctStreak: 5, seen: 9, lastSeenAt: 1 },
      'add:4+10': { bucket: 'wild', correctStreak: 0, seen: 1, lastSeenAt: 1 },
      'add:6+7': { bucket: 'wild', correctStreak: 0, seen: 1, lastSeenAt: 1 },
    };
    const { buckets } = tutorReport(baseProfile({ factsSR }), NOW);
    expect(buckets.add).toEqual({ unseen: 35, wild: 1, tracking: 0, trusted: 0 });
  });

  it('sub counts keep the no-universe behavior (unseen stays 0)', () => {
    const factsSR = {
      'sub:9-4': { bucket: 'tracking', correctStreak: 1, seen: 2, lastSeenAt: 1 },
      'sub:12-5': { bucket: 'wild', correctStreak: 0, seen: 1, lastSeenAt: 1 },
    };
    const { buckets } = tutorReport(baseProfile({ factsSR }), NOW);
    expect(buckets.sub).toEqual({ unseen: 0, wild: 1, tracking: 1, trusted: 0 });
  });
});

describe('tutorReport speedByDay', () => {
  it('caps at the last 7 sessionLog entries and maps rounds to round/medianMs/samples', () => {
    const sessionLog = Array.from({ length: 9 }, (_, i) => ({
      date: `Day ${i + 1}`,
      rounds: [r(1, 4000 + i)],
    }));
    const { speedByDay } = tutorReport(baseProfile({ sessionLog }), NOW);
    expect(speedByDay).toHaveLength(7);
    expect(speedByDay[0].date).toBe('Day 3');
    expect(speedByDay[6].date).toBe('Day 9');
    expect(speedByDay[0].rounds).toEqual([{ round: 1, medianMs: 4002, samples: 5 }]);
  });
});

describe('tutorReport typicalFatigueRound', () => {
  it('delegates to pacing with today derived from now', () => {
    const today = new Date(NOW).toDateString();
    const sessionLog = [
      { date: 'Thu Jul 16 2026', rounds: [r(1, 4000), r(2, 3000), r(3, 5000)] },
      { date: 'Fri Jul 17 2026', rounds: [r(1, 4000), r(2, 3000), r(3, 2900), r(4, 2800), r(5, 6000)] },
      { date: today, rounds: [r(1, 4000), r(2, 6000)] },
    ];
    const report = tutorReport(baseProfile({ sessionLog }), NOW);
    // Past days slow down at rounds 3 and 5; today's round-2 slowdown must be
    // excluded, so the median is 4, not 3.
    expect(report.typicalFatigueRound).toBe(4);
    expect(report.typicalFatigueRound).toBe(typicalFatigueRound(sessionLog, today));
  });
});

describe('tutorReport speedByDay mult filtering', () => {
  it('drops non-mult rounds and renumbers in mult order', () => {
    const sessionLog = [{
      date: 'Sat Jul 18 2026',
      rounds: [
        { round: 1, topic: 'add', medianMs: 2500, samples: 5, correct: 5, total: 5 },
        { round: 2, topic: 'mult', medianMs: 4000, samples: 5, correct: 5, total: 5 },
        { round: 3, topic: 'geometry', medianMs: null, samples: 0, correct: 4, total: 5 },
        { round: 4, topic: 'mult', medianMs: 3600, samples: 5, correct: 5, total: 5 },
      ],
    }];
    const { speedByDay } = tutorReport(baseProfile({ sessionLog }), NOW);
    expect(speedByDay).toEqual([{
      date: 'Sat Jul 18 2026',
      rounds: [
        { round: 1, medianMs: 4000, samples: 5 },
        { round: 2, medianMs: 3600, samples: 5 },
      ],
    }]);
  });

  it('omits days with no mult rounds', () => {
    const sessionLog = [{
      date: 'Sat Jul 18 2026',
      rounds: [{ round: 1, topic: 'add', medianMs: 2500, samples: 5, correct: 5, total: 5 }],
    }];
    expect(tutorReport(baseProfile({ sessionLog }), NOW).speedByDay).toEqual([]);
  });
});
