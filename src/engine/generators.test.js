import { describe, it, expect } from 'vitest';
import { generateProblem, generatePatrolProblems } from './generators.js';

const profile = { clan: 'ThunderClan', path: 'warrior', mentor: 'Lionheart', factsSR: {} };

const sample = (topic, n = 200) =>
  Array.from({ length: n }, () => generateProblem(topic, profile));

describe('quiet drills', () => {
  it('mult drills carry no story preamble', () => {
    const drills = sample('mult').filter((p) => p.kind === 'mult-drill');
    expect(drills.length).toBeGreaterThan(0);
    drills.forEach((p) => expect(p.story).toBeNull());
  });
  it('mult word problems keep their story', () => {
    const words = sample('mult').filter((p) => p.kind === 'mult-word');
    expect(words.length).toBeGreaterThan(0);
    words.forEach((p) => expect(typeof p.story).toBe('string'));
  });
  it('drills still carry question and answer', () => {
    const drills = sample('mult').filter((p) => p.kind === 'mult-drill');
    drills.forEach((p) => {
      expect(p.question).toMatch(/^\d+ × \d+$/);
      expect(p.answer).toBe(p.factA * p.factB);
    });
  });
});

describe('generatePatrolProblems', () => {
  it('returns the requested number of problems', () => {
    const profile = { clan: 'ThunderClan', path: 'warrior', mentor: 'Lionheart', factsSR: {} };
    expect(generatePatrolProblems('mult', profile, 5)).toHaveLength(5);
  });

  it('never repeats the same fact within one patrol, even with a lap-eligible fact', () => {
    const now = Date.now();
    const profile = {
      clan: 'ThunderClan', path: 'warrior', mentor: 'Lionheart',
      factsSR: {
        'mult:7x8': { bucket: 'tracking', correctStreak: 1, seen: 3, lastSeenAt: now - 60000, promotedAt: now - 60000 },
      },
    };
    for (let trial = 0; trial < 300; trial++) {
      const problems = generatePatrolProblems('mult', profile, 5);
      const ids = problems.map((p) => p.factId).filter(Boolean);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('generatePatrolProblems pathological SR state', () => {
  it('never duplicates even when one wild fact dominates selection', () => {
    const now = Date.now();
    const factsSR = {};
    for (let a = 2; a <= 12; a++) for (let b = a; b <= 12; b++) {
      factsSR[`mult:${Math.min(a, b)}x${Math.max(a, b)}`] =
        { bucket: 'trusted', correctStreak: 5, seen: 10, lastSeenAt: now - 60000 };
    }
    factsSR['mult:7x8'] = { bucket: 'wild', correctStreak: 0, seen: 9, lastSeenAt: now - 60000 };
    const profile = { clan: 'ThunderClan', path: 'warrior', mentor: 'Lionheart', factsSR };
    for (let trial = 0; trial < 500; trial++) {
      const problems = generatePatrolProblems('mult', profile, 5);
      const ids = problems.map((p) => p.factId).filter(Boolean);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('coarse large-number ids are not deduped away', () => {
  it('hunting patrols can contain two large-number problems', () => {
    const profile = { clan: 'ThunderClan', path: 'warrior', mentor: 'Lionheart', factsSR: {} };
    let sawRepeatLarge = false;
    for (let trial = 0; trial < 400 && !sawRepeatLarge; trial++) {
      const ids = generatePatrolProblems('add', profile, 5).map((p) => p.factId);
      const larges = ids.filter((id) => id === 'add:large' || id === 'sub:large');
      const counts = larges.reduce((m, id) => { m[id] = (m[id] || 0) + 1; return m; }, {});
      if (Object.values(counts).some((n) => n >= 2)) sawRepeatLarge = true;
    }
    expect(sawRepeatLarge).toBe(true);
  });

  it('specific add and sub facts still never repeat', () => {
    const profile = { clan: 'ThunderClan', path: 'warrior', mentor: 'Lionheart', factsSR: {} };
    for (let trial = 0; trial < 300; trial++) {
      const ids = generatePatrolProblems('add', profile, 5)
        .map((p) => p.factId)
        .filter((id) => id && id !== 'add:large' && id !== 'sub:large');
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
