// Tutor report builder. Turns a synced profile into the plain data object the
// read-only tutor dashboard renders. Pure functions only: no fetching, no
// mutation, tolerant of profiles missing factsSR, topicStats, or sessionLog.
//
// Built against the v17+ data model: factsSR entries carry per-fact counters
// (correctCount, wrongCount, totalElapsedMs, totalCorrectMs, firstSeenAt and
// optionally promotedAt), profiles carry topicStats keyed by
// mult / add / geometry / fraction / time, and sessionLog rounds carry topic.

import { SR_BUCKET, parseFactId } from './sr.js';
import { typicalFatigueRound as pacingTypicalFatigueRound } from './pacing.js';

export const RECENT_WIN_WINDOW_MS = 48 * 60 * 60 * 1000;
export const SPEED_DAYS_SHOWN = 7;
export const SLOWEST_SOLID_MAX = 5;

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

// 66 mult ids and 36 add ids. Subtraction word problems and large sums also
// write add: ids outside this universe (e.g. add:1+5, add:2+12); those are
// deliberately not counted here so unseen never goes negative and counts
// always sum to the universe size.
const MULT_UNIVERSE_IDS = enumeratePairIds(MULT_RANGE, (a, b) => `mult:${a}x${b}`);
const ADD_UNIVERSE_IDS = enumeratePairIds(ADD_RANGE, (a, b) => `add:${a}+${b}`);

const FRAC_PLURAL = { half: 'halves', third: 'thirds', quarter: 'quarters', fifth: 'fifths' };
const TIME_GRAIN = {
  hour: 'whole hours',
  half: 'half hours',
  quarter: 'quarter hours',
  five: 'five minutes',
  any: 'to the minute',
};

// Human label for a fact id, adult-plain. Uses parseFactId so every v17 id
// shape gets a readable name:
//   mult:7x8             -> '7 × 8'
//   add:3+9              -> '3 + 9'
//   sub:12-5             -> 'subtraction 12-5'
//   frac:third           -> 'fractions: thirds'
//   geo:perimeter:medium -> 'perimeter (medium)'
//   time:clock:quarter   -> 'clock time (quarter hours)'
export const factLabel = (id) => {
  const parsed = parseFactId(id);
  if (!parsed) return id.slice(id.indexOf(':') + 1);
  if (parsed.kind === 'mult') return `${parsed.a} × ${parsed.b}`;
  if (parsed.kind === 'add') {
    return parsed.bucket === 'large' ? 'addition (large numbers)' : `${parsed.a} + ${parsed.b}`;
  }
  if (parsed.kind === 'sub') {
    return parsed.bucket === 'large' ? 'subtraction (large numbers)' : `subtraction ${parsed.a}-${parsed.b}`;
  }
  if (parsed.kind === 'frac') return `fractions: ${FRAC_PLURAL[parsed.name] || parsed.name}`;
  if (parsed.kind === 'geo') return `${parsed.op} (${parsed.scale})`;
  if (parsed.kind === 'time-clock') return `clock time (${TIME_GRAIN[parsed.grain] || parsed.grain})`;
  if (parsed.kind === 'time-duration') return `elapsed time (${TIME_GRAIN[parsed.grain] || parsed.grain})`;
  if (parsed.kind === 'time-future') return `time addition (${TIME_GRAIN[parsed.grain] || parsed.grain})`;
  return id.slice(id.indexOf(':') + 1);
};

// Average correct-answer time for one factsSR entry; null until the fact has
// been answered correctly at least once.
const avgCorrectMs = (entry) => {
  const count = entry.correctCount || 0;
  if (count === 0) return null;
  return (entry.totalCorrectMs || 0) / count;
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
        avgCorrectMs: entry ? avgCorrectMs(entry) : null,
        wrongCount: entry ? entry.wrongCount || 0 : 0,
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

// Per-topic rollup from profile.topicStats (mult / add / geometry / fraction /
// time). Accuracy and avgMs are null until the topic has been attempted.
const buildTopics = (topicStats) => {
  const out = {};
  for (const [topic, stats] of Object.entries(topicStats)) {
    if (!stats || typeof stats !== 'object') continue;
    const attempted = stats.attempted || 0;
    out[topic] = {
      attempted,
      correct: stats.correct || 0,
      accuracy: attempted > 0 ? (stats.correct || 0) / attempted : null,
      avgMs: attempted > 0 ? (stats.totalElapsedMs || 0) / attempted : null,
    };
  }
  return out;
};

const buildRecentWins = (sr, now) => Object.entries(sr)
  .filter(([, entry]) => {
    if (!entry.promotedAt) return false;
    const age = now - entry.promotedAt;
    return age >= 0 && age <= RECENT_WIN_WINDOW_MS;
  })
  .sort(([, x], [, y]) => y.promotedAt - x.promotedAt)
  .map(([id, entry]) => ({ id, label: factLabel(id), promotedAt: entry.promotedAt }));

// Multiplication facts she reliably gets RIGHT but slowly: correct at least
// twice, out of the Wild bucket, ranked slowest first. This answers the
// tutor's "which ones is she taking a long time on" without mixing in facts
// she is still simply missing.
const buildSlowestSolid = (sr) => Object.entries(sr)
  .filter(([id, entry]) =>
    id.startsWith('mult:')
    && (entry.correctCount || 0) >= 2
    && entry.bucket !== SR_BUCKET.WILD)
  .map(([id, entry]) => ({ id, label: factLabel(id), avgCorrectMs: avgCorrectMs(entry) }))
  .sort((x, y) => y.avgCorrectMs - x.avgCorrectMs)
  .slice(0, SLOWEST_SOLID_MAX);

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
  const topicStats = profile.topicStats && typeof profile.topicStats === 'object' ? profile.topicStats : {};
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
    topics: buildTopics(topicStats),
    recentWins: buildRecentWins(sr, now),
    slowestSolid: buildSlowestSolid(sr),
    speedByDay: buildSpeedByDay(sessionLog),
    typicalFatigueRound: pacingTypicalFatigueRound(sessionLog, new Date(now).toDateString()),
  };
};
