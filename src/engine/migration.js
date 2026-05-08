import { ranksFor, PATH_MEDICINE, PATH_WARRIOR } from '../data/ranks.js';
import { newSlotId } from './utils.js';
import { SAVE_VERSION, HISTOGRAM_BUCKETS } from './sr.js';

// Bring a single profile up to the current shape. Used for v12/v13/v14/v15→v16 migration and
// defensive normalization of imported saves.
//
// Migration philosophy:
//   - Preserve player-authored data EXACTLY: prefix, suffix, totalCorrect, totalAttempted,
//     prey counts, herb counts, streak, dateCreated, factsSR, factStories.
//   - Map old rank labels to current ladder.
//   - Use a separate `rankFloor` for progress-bar baseline so we never need to fabricate
//     correct answers (fixes the v13 bug where 32/35 displayed as "60 of 35").
//   - v16 added analytics fields (per-fact counters, topicStats, patrolHistory,
//     elapsedHistogram). All additive — old saves get zero defaults.

const emptyHistogram = () => HISTOGRAM_BUCKETS.reduce((m, b) => { m[b] = 0; return m; }, {});

const TOPICS = ['mult', 'add', 'geometry', 'fraction', 'time'];
const emptyTopicStats = () => TOPICS.reduce((m, t) => {
  m[t] = { attempted: 0, correct: 0, totalElapsedMs: 0, hintsShown: 0, strategiesShown: 0, reveals: 0 };
  return m;
}, {});

const normalizeFactsSR = (raw) => {
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  for (const [id, e] of Object.entries(raw)) {
    if (!e || typeof e !== 'object') continue;
    out[id] = {
      bucket: e.bucket || 'wild',
      correctStreak: e.correctStreak || 0,
      seen: e.seen || 0,
      lastSeenAt: e.lastSeenAt || null,
      // v16 additions — default to zero for older saves so the dashboard
      // shows "no data yet" rather than blowing up.
      correctCount: e.correctCount || 0,
      wrongCount: e.wrongCount || 0,
      totalElapsedMs: e.totalElapsedMs || 0,
      totalCorrectMs: e.totalCorrectMs || 0,
      firstSeenAt: e.firstSeenAt || null,
    };
  }
  return out;
};

const normalizeTopicStats = (raw) => {
  const base = emptyTopicStats();
  if (!raw || typeof raw !== 'object') return base;
  for (const t of TOPICS) {
    const e = raw[t];
    if (!e || typeof e !== 'object') continue;
    base[t] = {
      attempted: e.attempted || 0,
      correct: e.correct || 0,
      totalElapsedMs: e.totalElapsedMs || 0,
      hintsShown: e.hintsShown || 0,
      strategiesShown: e.strategiesShown || 0,
      reveals: e.reveals || 0,
    };
  }
  return base;
};

const normalizeHistogram = (raw) => {
  const base = emptyHistogram();
  if (!raw || typeof raw !== 'object') return base;
  for (const b of HISTOGRAM_BUCKETS) base[b] = raw[b] || 0;
  return base;
};

const normalizePatrolHistory = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e) => e && typeof e === 'object' && typeof e.startedAt === 'number')
    .map((e) => ({
      startedAt:       e.startedAt,
      endedAt:         e.endedAt || e.startedAt,
      durationMs:      e.durationMs || 0,
      topic:           e.topic || 'mult',
      patrolId:        e.patrolId || 'training',
      total:           e.total || 0,
      correct:         e.correct || 0,
      hintsShown:      e.hintsShown || 0,
      strategiesShown: e.strategiesShown || 0,
      reveals:         e.reveals || 0,
    }))
    .slice(-200); // bound storage
};

export const normalizeProfile = (raw) => {
  const oldHighRank = raw.highestRank || raw.rank || 'Apprentice';
  const isWarriorOrAbove =
    ['Warrior', 'Senior Warrior', 'Deputy', 'Leader', 'Young Warrior'].includes(oldHighRank);

  const path = raw.path === PATH_MEDICINE ? PATH_MEDICINE : PATH_WARRIOR;

  let rank = 'Apprentice';
  if (path === PATH_MEDICINE) {
    rank = isWarriorOrAbove ? 'Medicine Cat' : 'Medicine Cat Apprentice';
  } else if (oldHighRank === 'Warrior')             rank = 'Young Warrior';
  else if (oldHighRank === 'Senior Warrior')        rank = 'Warrior';
  else if (oldHighRank === 'Deputy')                rank = 'Deputy';
  else if (oldHighRank === 'Leader')                rank = 'Leader';
  else if (oldHighRank === 'Young Warrior')         rank = 'Young Warrior';
  else if (oldHighRank === 'Medicine Cat')          rank = 'Medicine Cat';
  else if (oldHighRank === 'Senior Medicine Cat')   rank = 'Senior Medicine Cat';
  else if (oldHighRank === 'Apprentice' || oldHighRank === 'Kit') rank = 'Apprentice';

  let suffix = raw.suffix && raw.suffix !== 'paw' && raw.suffix !== 'kit' ? raw.suffix : '';
  if (!suffix && rank !== 'Apprentice' && rank !== 'Medicine Cat Apprentice') {
    suffix = path === PATH_MEDICINE ? 'leaf' : 'foot';
  }

  const ladder = ranksFor(path);
  const minForRank = (ladder.find((r) => r.name === rank) || ladder[0]).min;
  const totalCorrect = raw.totalCorrect || 0;
  const rankFloor = Math.max(raw.rankFloor || 0, minForRank, totalCorrect);

  return {
    _version: SAVE_VERSION,
    id: raw.id || newSlotId(),
    prefix: raw.prefix || 'Moss',
    suffix,
    path,
    rank,
    clan: raw.clan || 'ThunderClan',
    furColor: raw.furColor || 'Grey',
    eyeColor: raw.eyeColor || 'Amber',
    mentor: raw.mentor || null,
    totalCorrect,
    totalAttempted: raw.totalAttempted || totalCorrect,
    rankFloor,
    preyCaught: raw.preyCaught || {},
    herbsCaught: raw.herbsCaught || {},
    streak: raw.streak || 0,
    bestStreak: Math.max(raw.bestStreak || 0, raw.streak || 0),
    lastPlayed: raw.lastPlayed || null,
    patrolsToday: raw.patrolsToday || 0,
    dateCreated: raw.dateCreated || new Date().toISOString(),
    factsSR: normalizeFactsSR(raw.factsSR),
    factStories: raw.factStories && typeof raw.factStories === 'object' ? raw.factStories : {},
    // v16 analytics. All additive — older saves migrate forward with zero counters.
    topicStats: normalizeTopicStats(raw.topicStats),
    patrolHistory: normalizePatrolHistory(raw.patrolHistory),
    elapsedHistogram: normalizeHistogram(raw.elapsedHistogram),
  };
};

// Backwards-compat alias — older code paths still reference this name.
export const normalizeToV13 = normalizeProfile;
