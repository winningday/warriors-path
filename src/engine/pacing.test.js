import { describe, it, expect } from 'vitest';
import {
  median, roundRecord, appendRound, slowdownRound,
  typicalFatigueRound, restAdvice,
} from './pacing.js';
import { REST_ADVICE } from '../data/flavor.js';

const r = (round, medianMs, samples = 5) => ({ round, medianMs, samples, correct: 4, total: 5 });

describe('median', () => {
  it('odd length', () => expect(median([5, 1, 3])).toBe(3));
  it('even length averages middles', () => expect(median([1, 2, 3, 4])).toBe(2.5));
  it('empty is null', () => expect(median([])).toBeNull());
});

describe('roundRecord', () => {
  it('computes the median of response times', () => {
    expect(roundRecord([5000, 3000, 4000], 4, 5)).toEqual({
      medianMs: 4000, samples: 3, correct: 4, total: 5,
    });
  });
  it('medianMs null when responseTimes empty', () => {
    expect(roundRecord([], 2, 5)).toEqual({ medianMs: null, samples: 0, correct: 2, total: 5 });
  });
});

describe('appendRound', () => {
  const record = { medianMs: 4000, samples: 5, correct: 5, total: 5 };

  it('starts a new dated entry with round 1', () => {
    const log = appendRound([], 'Fri Jul 18 2026', record);
    expect(log).toEqual([
      { date: 'Fri Jul 18 2026', rounds: [{ round: 1, ...record }] },
    ]);
  });

  it('appends to the existing entry with a 1-based round index', () => {
    const log1 = appendRound([], 'Fri Jul 18 2026', record);
    const log2 = appendRound(log1, 'Fri Jul 18 2026', { ...record, medianMs: 3500 });
    expect(log2).toHaveLength(1);
    expect(log2[0].rounds.map((x) => x.round)).toEqual([1, 2]);
    expect(log2[0].rounds[1].medianMs).toBe(3500);
  });

  it('does not mutate the input log', () => {
    const original = [{ date: 'Thu Jul 17 2026', rounds: [{ round: 1, ...record }] }];
    const snapshot = JSON.parse(JSON.stringify(original));
    appendRound(original, 'Thu Jul 17 2026', record);
    appendRound(original, 'Fri Jul 18 2026', record);
    expect(original).toEqual(snapshot);
  });

  it('caps at 30 dated entries, dropping the oldest', () => {
    let log = [];
    for (let i = 1; i <= 30; i++) {
      log = appendRound(log, `Day ${i}`, record);
    }
    expect(log).toHaveLength(30);
    const next = appendRound(log, 'Day 31', record);
    expect(next).toHaveLength(30);
    expect(next[0].date).toBe('Day 2');
    expect(next[29].date).toBe('Day 31');
  });
});

describe('slowdownRound', () => {
  it('null when speeds keep improving', () => {
    expect(slowdownRound([r(1, 5000), r(2, 4000), r(3, 3500)])).toBeNull();
  });
  it('finds first round 30% above best-so-far', () => {
    expect(slowdownRound([r(1, 4000), r(2, 3000), r(3, 4200)])).toBe(3);
  });
  it('ignores rounds with too few samples', () => {
    expect(slowdownRound([r(1, 4000), r(2, 3000), { ...r(3, 9000), samples: 1 }])).toBeNull();
  });
  it('needs a prior baseline round', () => {
    expect(slowdownRound([r(1, 9000)])).toBeNull();
  });
});

describe('typicalFatigueRound', () => {
  const day = (date, rounds) => ({ date, rounds });
  it('median of past slowdown rounds, excluding today', () => {
    const log = [
      day('Mon Jul 13 2026', [r(1, 4000), r(2, 3000), r(3, 4200)]), // slowdown at 3
      day('Tue Jul 14 2026', [r(1, 4000), r(2, 3000), r(3, 3100), r(4, 4200)]), // at 4
      day('Wed Jul 15 2026', [r(1, 4000), r(2, 5600)]), // at 2
      day('Fri Jul 18 2026', [r(1, 4000)]),
    ];
    expect(typicalFatigueRound(log, 'Fri Jul 18 2026')).toBe(3);
  });
  it('null with fewer than two informative past days', () => {
    const log = [day('Mon Jul 13 2026', [r(1, 4000), r(2, 4200)])];
    expect(typicalFatigueRound(log, 'Fri Jul 18 2026')).toBeNull();
  });
});

describe('restAdvice', () => {
  const history = [
    { date: 'Mon Jul 13 2026', rounds: [r(1, 4000), r(2, 3000), r(3, 4200)] },
    { date: 'Tue Jul 14 2026', rounds: [r(1, 4000), r(2, 5600)] },
  ];
  it('slowdown today wins', () => {
    const log = [...history, { date: 'Fri Jul 18 2026', rounds: [r(1, 3000), r(2, 4100)] }];
    const advice = restAdvice(log, 'Fri Jul 18 2026');
    expect(advice.reason).toBe('slowdown');
    expect(typeof advice.message).toBe('string');
  });
  it('schedule advice one round before the typical fatigue round', () => {
    // typical fatigue round from history = median(3, 2) = 2.5 -> rounds to 3? Use floor: 2.
    // Design decision: typicalFatigueRound rounds DOWN (conservative, rest earlier).
    const log = [...history, { date: 'Fri Jul 18 2026', rounds: [r(1, 3000)] }];
    const advice = restAdvice(log, 'Fri Jul 18 2026');
    expect(advice.reason).toBe('schedule');
  });
  it('null early in a fresh session with no history', () => {
    expect(restAdvice([{ date: 'Fri Jul 18 2026', rounds: [r(1, 3000)] }], 'Fri Jul 18 2026')).toBeNull();
  });
  it('message has no digits and no time words', () => {
    const log = [...history, { date: 'Fri Jul 18 2026', rounds: [r(1, 3000), r(2, 4100)] }];
    const advice = restAdvice(log, 'Fri Jul 18 2026');
    expect(advice.message).not.toMatch(/\d|minute|hour|clock|timer/i);
  });
  it('draws the message from REST_ADVICE via the injected rng', () => {
    const log = [...history, { date: 'Fri Jul 18 2026', rounds: [r(1, 3000), r(2, 4100)] }];
    expect(restAdvice(log, 'Fri Jul 18 2026', { rng: () => 0 }).message).toBe(REST_ADVICE[0]);
    expect(restAdvice(log, 'Fri Jul 18 2026', { rng: () => 0.999 }).message)
      .toBe(REST_ADVICE[REST_ADVICE.length - 1]);
  });
});

describe('REST_ADVICE pool', () => {
  it('has at least eight lines, no digits, no time words', () => {
    expect(REST_ADVICE.length).toBeGreaterThanOrEqual(8);
    REST_ADVICE.forEach((line) => {
      expect(typeof line).toBe('string');
      expect(line).not.toMatch(/\d|minute|hour|clock|timer/i);
    });
  });
});
