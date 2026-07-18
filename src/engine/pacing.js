// Pacing engine: learns when per-round speed usually stops improving and
// suggests rest, gently and in-lore. Pure functions only; timing stays
// internal and the player never sees a number or a clock.
//
// sessionLog shape on the profile:
//   [{ date: 'Fri Jul 18 2026', rounds: [
//     { round: 1, topic: 'mult', medianMs: 4200, samples: 5, correct: 5, total: 5 },
//   ] }, ...]
//
// Fatigue is judged on multiplication rounds only. Mixing topics poisons the
// baseline (single-digit addition is inherently faster than multiplication,
// so a healthy mult round after a hunting patrol would read as a slowdown).

import { REST_ADVICE } from '../data/flavor.js';

export const SLOWDOWN_FACTOR = 1.3;
export const SESSION_LOG_CAP = 30;

const multRounds = (rounds) => (rounds || []).filter((r) => r.topic === 'mult');

export const median = (nums) => {
  if (!nums || nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Summarize one finished round of first-attempt response times.
export const roundRecord = (responseTimes, correct, total, topic) => ({
  topic: topic || null,
  medianMs: median(responseTimes),
  samples: responseTimes.length,
  correct,
  total,
});

// Append a round record to the dated entry for `dateString`, creating the
// entry if needed. Immutable; keeps at most the newest SESSION_LOG_CAP days.
export const appendRound = (sessionLog, dateString, record) => {
  const log = sessionLog || [];
  const cap = (list) => (list.length > SESSION_LOG_CAP ? list.slice(list.length - SESSION_LOG_CAP) : list);
  const idx = log.findIndex((e) => e.date === dateString);
  if (idx >= 0) {
    const entry = log[idx];
    const next = { ...entry, rounds: [...entry.rounds, { round: entry.rounds.length + 1, ...record }] };
    return cap(log.map((e, i) => (i === idx ? next : e)));
  }
  return cap([...log, { date: dateString, rounds: [{ round: 1, ...record }] }]);
};

// First round (1-based) whose median sits more than `factor` above the best
// median seen earlier that day. Only rounds with enough samples count, and a
// slowdown needs at least one prior qualifying round as a baseline.
export const slowdownRound = (rounds, { factor = SLOWDOWN_FACTOR, minSamples = 3 } = {}) => {
  let best = null;
  for (let i = 0; i < rounds.length; i++) {
    const { medianMs, samples } = rounds[i];
    if (medianMs == null || samples < minSamples) continue;
    if (best !== null && medianMs > factor * best) return i + 1;
    if (best === null || medianMs < best) best = medianMs;
  }
  return null;
};

// Median slowdown round across past days (today excluded), rounded DOWN so
// the advice errs on the side of resting earlier. Needs at least two
// informative past days, else null.
export const typicalFatigueRound = (sessionLog, todayDate) => {
  const past = (sessionLog || [])
    .filter((e) => e.date !== todayDate)
    .map((e) => slowdownRound(multRounds(e.rounds)))
    .filter((n) => n !== null);
  if (past.length < 2) return null;
  return Math.floor(median(past));
};

// Called after a round completes. Returns { reason, message } or null.
// 'slowdown': the just-finished round itself slowed; suggest rest now.
// 'schedule': the NEXT round would hit the typical fatigue point, so
// suggest stopping one round early. Never blocking, never urgent.
export const restAdvice = (sessionLog, todayDate, { rng = Math.random } = {}) => {
  const today = (sessionLog || []).find((e) => e.date === todayDate);
  if (!today || today.rounds.length === 0) return null;
  // Advice follows a multiplication round only; other patrols end quietly.
  const last = today.rounds[today.rounds.length - 1];
  if (!last || last.topic !== 'mult') return null;
  const todayMult = multRounds(today.rounds);
  const message = () => REST_ADVICE[Math.floor(rng() * REST_ADVICE.length)];
  if (slowdownRound(todayMult) === todayMult.length) {
    return { reason: 'slowdown', message: message() };
  }
  const typical = typicalFatigueRound(sessionLog, todayDate);
  // Strict equality: advise exactly one round before the typical fatigue
  // round, and stay quiet if she chooses to keep playing past it.
  if (typical !== null && todayMult.length + 1 === typical) {
    return { reason: 'schedule', message: message() };
  }
  return null;
};
