// Tutor report builder. Turns a synced profile into the plain data object the
// read-only tutor dashboard renders. Pure functions only: no fetching, no
// mutation, tolerant of profiles missing factsSR or sessionLog.

import { SR_BUCKET } from './sr.js';
import { typicalFatigueRound as pacingTypicalFatigueRound } from './pacing.js';

export const RECENT_WIN_WINDOW_MS = 48 * 60 * 60 * 1000;
export const SPEED_DAYS_SHOWN = 7;

// Tracked fact universes (see CLAUDE.md): multiplication pairs 2..12 and
// addition single-digit pairs 2..9, both order-normalized so a <= b.
// Subtraction has no fixed enumerable universe, so its unseen count stays 0.
const MULT_RANGE = { lo: 2, hi: 12 };
const ADD_RANGE = { lo: 2, hi: 9 };

const enumeratePairIds = ({ lo, hi }, toId) => {
  const ids = [];
  for (let a = lo; a <= hi; a++) {
    for (let b = a; b <= hi; b++) ids.push(toId(a, b));
  }
  return ids;
};

// 66 mult ids and 36 add ids. genAdd's sub-small branch also writes add: ids
// outside this universe (e.g. add:1+5, add:2+12); those are deliberately not
// counted here so unseen never goes negative and counts always sum to the
// universe size.
const MULT_UNIVERSE_IDS = enumeratePairIds(MULT_RANGE, (a, b) => `mult:${a}x${b}`);
const ADD_UNIVERSE_IDS = enumeratePairIds(ADD_RANGE, (a, b) => `add:${a}+${b}`);

// Human label for a fact id, e.g. 'mult:7x8' -> '7 × 8'.
export const factLabel = (id) => {
  const body = id.slice(id.indexOf(':') + 1);
  if (id.startsWith('mult:')) return body.replace('x', ' × ');
  if (id.startsWith('add:')) return body.replace('+', ' + ');
  if (id.startsWith('sub:')) return body.replace('-', ' - ');
  if (id.startsWith('frac:')) return body.replace('/', ' / ');
  return body;
};

const buildMultGrid = (sr) => {
  const grid = [];
  for (let a = MULT_RANGE.lo; a <= MULT_RANGE.hi; a++) {
    for (let b = a; b <= MULT_RANGE.hi; b++) {
      const id = `mult:${a}x${b}`;
      const entry = sr[id];
      grid.push({
        a,
        b,
        id,
        bucket: entry ? entry.bucket : 'unseen',
        correctStreak: entry ? entry.correctStreak || 0 : 0,
        seen: entry ? entry.seen || 0 : 0,
      });
    }
  }
  return grid;
};

// Count buckets over a fixed universe of ids: every id is looked up directly
// (the same way the mult grid works), so out-of-universe ids can never
// inflate the counts and they always sum to the universe size.
const countUniverseBuckets = (sr, universeIds) => {
  const counts = { unseen: 0, wild: 0, tracking: 0, trusted: 0 };
  for (const id of universeIds) {
    const entry = sr[id];
    if (!entry) {
      counts.unseen += 1;
      continue;
    }
    const bucket = entry.bucket || SR_BUCKET.WILD;
    if (counts[bucket] !== undefined) counts[bucket] += 1;
  }
  return counts;
};

// Count buckets for a prefix with no enumerable universe (sub:); unseen stays 0.
const countPrefixBuckets = (sr, prefix) => {
  const counts = { unseen: 0, wild: 0, tracking: 0, trusted: 0 };
  for (const [id, entry] of Object.entries(sr)) {
    if (!id.startsWith(prefix)) continue;
    const bucket = entry.bucket || SR_BUCKET.WILD;
    if (counts[bucket] !== undefined) counts[bucket] += 1;
  }
  return counts;
};

const buildRecentWins = (sr, now) => Object.entries(sr)
  .filter(([, entry]) => {
    if (!entry.promotedAt) return false;
    const age = now - entry.promotedAt;
    return age >= 0 && age <= RECENT_WIN_WINDOW_MS;
  })
  .sort(([, x], [, y]) => y.promotedAt - x.promotedAt)
  .map(([id, entry]) => ({ id, label: factLabel(id), promotedAt: entry.promotedAt }));

// Multiplication rounds only, renumbered in mult order, so the table lines up
// with the typicalFatigueRound caption (which also counts mult rounds).
const buildSpeedByDay = (sessionLog) => sessionLog
  .slice(-SPEED_DAYS_SHOWN)
  .map((entry) => ({
    date: entry.date,
    rounds: (entry.rounds || [])
      .filter((r) => r.topic === 'mult')
      .map((r, i) => ({
        round: i + 1,
        medianMs: r.medianMs,
        samples: r.samples,
      })),
  }))
  .filter((entry) => entry.rounds.length > 0);

export const tutorReport = (profile, now = Date.now()) => {
  const sr = profile.factsSR || {};
  const sessionLog = Array.isArray(profile.sessionLog) ? profile.sessionLog : [];
  const attempted = profile.totalAttempted || 0;
  return {
    accuracy: attempted > 0 ? (profile.totalCorrect || 0) / attempted : null,
    multGrid: buildMultGrid(sr),
    buckets: {
      mult: countUniverseBuckets(sr, MULT_UNIVERSE_IDS),
      add: countUniverseBuckets(sr, ADD_UNIVERSE_IDS),
      sub: countPrefixBuckets(sr, 'sub:'),
    },
    recentWins: buildRecentWins(sr, now),
    speedByDay: buildSpeedByDay(sessionLog),
    typicalFatigueRound: pacingTypicalFatigueRound(sessionLog, new Date(now).toDateString()),
  };
};
