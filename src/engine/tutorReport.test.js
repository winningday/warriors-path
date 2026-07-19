import { describe, it, expect } from 'vitest';
import { tutorReport, factLabel } from './tutorReport.js';
import { typicalFatigueRound } from './pacing.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = new Date('2026-07-18T12:00:00').getTime();

const baseProfile = (over = {}) => ({
  prefix: 'Moss',
  totalCorrect: 0,
  totalAttempted: 0,
  factsSR: {},
  topicStats: {},
  sessionLog: [],
  ...over,
});

// Full v17+ factsSR entry with overridable fields.
const fact = (over = {}) => ({
  bucket: 'tracking',
  correctStreak: 1,
  seen: 2,
  lastSeenAt: NOW - HOUR,
  correctCount: 1,
  wrongCount: 1,
  totalElapsedMs: 9000,
  totalCorrectMs: 4000,
  firstSeenAt: NOW - DAY,
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
    expect(report.topics).toEqual({});
    expect(report.recentWins).toEqual([]);
    expect(report.slowestSolid).toEqual([]);
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

  it('marks untracked facts unseen with null avgCorrectMs', () => {
    const grid = tutorReport(baseProfile(), NOW).multGrid;
    expect(grid.every((c) =>
      c.bucket === 'unseen' && c.correctStreak === 0 && c.seen === 0
      && c.avgCorrectMs === null && c.wrongCount === 0
    )).toBe(true);
  });

  it('carries tracked SR data and computes avgCorrectMs = totalCorrectMs / correctCount', () => {
    const factsSR = {
      'mult:7x8': fact({ bucket: 'tracking', correctStreak: 2, seen: 5, correctCount: 4, wrongCount: 1, totalCorrectMs: 10000 }),
    };
    const grid = tutorReport(baseProfile({ factsSR }), NOW).multGrid;
    const tracked = grid.find((c) => c.id === 'mult:7x8');
    expect(tracked).toEqual({
      a: 7, b: 8, id: 'mult:7x8', bucket: 'tracking',
      correctStreak: 2, seen: 5, avgCorrectMs: 2500, wrongCount: 1,
    });
  });

  it('leaves avgCorrectMs null when correctCount is 0', () => {
    const factsSR = {
      'mult:6x6': fact({ bucket: 'wild', correctCount: 0, totalCorrectMs: 0, wrongCount: 3 }),
    };
    const grid = tutorReport(baseProfile({ factsSR }), NOW).multGrid;
    const cell = grid.find((c) => c.id === 'mult:6x6');
    expect(cell.avgCorrectMs).toBeNull();
    expect(cell.wrongCount).toBe(3);
  });
});

describe('tutorReport buckets', () => {
  it('mult counts sum to 66', () => {
    const factsSR = {
      'mult:7x8': fact({ bucket: 'tracking' }),
      'mult:2x2': fact({ bucket: 'trusted' }),
      'mult:9x9': fact({ bucket: 'wild' }),
      'add:3+9': fact({ bucket: 'wild' }),
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
      // Out of universe: written by subtraction word problems and large sums.
      'add:1+5': fact({ bucket: 'tracking' }),
      'add:2+12': fact({ bucket: 'trusted' }),
      // In universe (single-digit pairs 2..9).
      'add:3+4': fact({ bucket: 'tracking' }),
    };
    const { buckets } = tutorReport(baseProfile({ factsSR }), NOW);
    expect(buckets.add).toEqual({ unseen: 35, wild: 0, tracking: 1, trusted: 0 });
    const a = buckets.add;
    expect(a.unseen + a.wild + a.tracking + a.trusted).toBe(36);
  });

  it('add counts sum to 36 even when every out-of-universe id is tracked', () => {
    const factsSR = {
      'add:1+9': fact({ bucket: 'trusted' }),
      'add:4+10': fact({ bucket: 'wild' }),
      'add:6+7': fact({ bucket: 'wild' }),
    };
    const { buckets } = tutorReport(baseProfile({ factsSR }), NOW);
    expect(buckets.add).toEqual({ unseen: 35, wild: 1, tracking: 0, trusted: 0 });
  });

  it('sub counts by prefix with unseen fixed at 0', () => {
    const factsSR = {
      'sub:9-4': fact({ bucket: 'tracking' }),
      'sub:12-5': fact({ bucket: 'wild' }),
    };
    const { buckets } = tutorReport(baseProfile({ factsSR }), NOW);
    expect(buckets.sub).toEqual({ unseen: 0, wild: 1, tracking: 1, trusted: 0 });
  });
});

describe('tutorReport topics', () => {
  it('summarizes attempted, correct, accuracy, and avgMs per topic', () => {
    const topicStats = {
      mult: { attempted: 40, correct: 30, totalElapsedMs: 120000, hintsShown: 2, strategiesShown: 1, reveals: 0 },
      geometry: { attempted: 0, correct: 0, totalElapsedMs: 0, hintsShown: 0, strategiesShown: 0, reveals: 0 },
    };
    const { topics } = tutorReport(baseProfile({ topicStats }), NOW);
    expect(topics.mult).toEqual({ attempted: 40, correct: 30, accuracy: 0.75, avgMs: 3000 });
    expect(topics.geometry).toEqual({ attempted: 0, correct: 0, accuracy: null, avgMs: null });
  });
});

describe('tutorReport recentWins', () => {
  it('includes wins within 48h, excludes older, sorted newest first, with readable labels', () => {
    const factsSR = {
      'mult:7x8': fact({ promotedAt: NOW - 2 * HOUR }),
      'mult:3x4': fact({ bucket: 'trusted', promotedAt: NOW - 3 * DAY }),
      'add:3+9': fact({ promotedAt: NOW - 3 * HOUR }),
      'sub:12-5': fact({ promotedAt: NOW - HOUR }),
      'mult:2x5': fact({ bucket: 'wild' }),
    };
    const wins = tutorReport(baseProfile({ factsSR }), NOW).recentWins;
    expect(wins.map((w) => w.id)).toEqual(['sub:12-5', 'mult:7x8', 'add:3+9']);
    expect(wins[0]).toEqual({ id: 'sub:12-5', label: 'subtraction 12-5', promotedAt: NOW - HOUR });
    expect(wins[1].label).toBe('7 × 8');
    expect(wins[2].label).toBe('3 + 9');
  });
});

describe('factLabel', () => {
  it('produces readable labels for every fact kind', () => {
    expect(factLabel('mult:7x8')).toBe('7 × 8');
    expect(factLabel('add:3+9')).toBe('3 + 9');
    expect(factLabel('sub:12-5')).toBe('subtraction 12-5');
    expect(factLabel('frac:third')).toBe('fractions: thirds');
    expect(factLabel('geo:perimeter:medium')).toBe('perimeter (medium)');
    expect(factLabel('time:clock:quarter')).toBe('clock time (quarter hours)');
  });
});

describe('tutorReport slowestSolid', () => {
  it('lists mult facts with correctCount >= 2 and bucket not wild, slowest first', () => {
    const factsSR = {
      'mult:7x8': fact({ bucket: 'tracking', correctCount: 3, totalCorrectMs: 21000 }), // avg 7000
      'mult:6x7': fact({ bucket: 'trusted', correctCount: 2, totalCorrectMs: 10000 }),  // avg 5000
      'mult:9x9': fact({ bucket: 'tracking', correctCount: 4, totalCorrectMs: 36000 }), // avg 9000
      // Filtered out: only one correct.
      'mult:8x8': fact({ bucket: 'tracking', correctCount: 1, totalCorrectMs: 30000 }),
      // Filtered out: wild bucket.
      'mult:6x8': fact({ bucket: 'wild', correctCount: 5, totalCorrectMs: 60000 }),
      // Filtered out: not multiplication.
      'add:3+4': fact({ bucket: 'tracking', correctCount: 2, totalCorrectMs: 40000 }),
    };
    const { slowestSolid } = tutorReport(baseProfile({ factsSR }), NOW);
    expect(slowestSolid).toEqual([
      { id: 'mult:9x9', label: '9 × 9', avgCorrectMs: 9000 },
      { id: 'mult:7x8', label: '7 × 8', avgCorrectMs: 7000 },
      { id: 'mult:6x7', label: '6 × 7', avgCorrectMs: 5000 },
    ]);
  });

  it('caps at 5 entries', () => {
    const factsSR = {};
    for (let n = 2; n <= 9; n++) {
      factsSR[`mult:${n}x12`] = fact({ bucket: 'tracking', correctCount: 2, totalCorrectMs: n * 2000 });
    }
    const { slowestSolid } = tutorReport(baseProfile({ factsSR }), NOW);
    expect(slowestSolid).toHaveLength(5);
    expect(slowestSolid[0].avgCorrectMs).toBe(9000);
    expect(slowestSolid[4].avgCorrectMs).toBe(5000);
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
