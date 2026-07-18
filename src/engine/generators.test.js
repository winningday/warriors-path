import { describe, it, expect } from 'vitest';
import { generateProblem } from './generators.js';

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
