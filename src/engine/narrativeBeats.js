// Narrative beats engine — Phase 5 (v15.0.0-h).
//
// Three responsibilities, kept in one module so the cadence rules are easy
// to scan side-by-side:
//
//   1. rollRandomEvent(profile)
//      Returns a random patrol event (~1/30 base rate). Deprioritizes
//      events the player has seen in `profile.eventsExperienced`.
//
//   2. isGatheringNight(now)
//      Returns true on the first Saturday of each calendar month. Stable
//      and deterministic — no stored flag, no countdown.
//
//   3. pickStarClanDream(profile, now)
//      Returns a StarClan dream pointed at the player's weakest topic
//      (by topicStats accuracy). Returns null if a dream was shown in
//      the last 7 days (tracked via profile.lastDreamAt).
//
//   4. pickGatheringContent(profile, now)
//      Picks a stable Gathering vignette per Gathering night via a
//      mulberry32 PRNG seeded on the date — same character sees the
//      same Gathering content all night, but different Gatherings rotate.
//
// CLAUDE.md anti-patterns honored:
//   - No timers visible. Cadence is calendar-based.
//   - Save data sacred — only additive reads, all defensive with ??/||.
//   - Reverent tone always for dreams (data file owns voice; engine is glue).

import {
  randomEvents,
  gatheringContent,
  starClanDreams,
  dreamsForTopic,
  GATHERING_TRINKET,
} from '../data/narrativeBeats.js';

// --- Constants ------------------------------------------------------------

// Base rate for random patrol events. 1-in-30 per patrol completion.
export const RANDOM_EVENT_RATE = 1 / 30;

// Minimum gap between StarClan dreams, in ms. 7 days — dreams should feel
// rare, not be background noise.
const DREAM_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const TOPICS = ['mult', 'add', 'geometry', 'fraction', 'time'];

// --- Tiny PRNG (mulberry32, same shape as patrolGate.js) ------------------

const hashSeed = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return h >>> 0;
};

const mulberry32 = (seed) => {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

// --- 1. Random patrol events ---------------------------------------------
//
// Per patrol completion. The first roll decides whether ANY event fires.
// If yes, a second roll picks an event, weighted slightly against events
// the player has experienced recently. We never *exclude* a seen event —
// some are nice to revisit. We just deprioritize.

// Returns a random event or null.
export const rollRandomEvent = (profile, opts = {}) => {
  const rate = typeof opts.rate === 'number' ? opts.rate : RANDOM_EVENT_RATE;
  const rng = typeof opts.rng === 'function' ? opts.rng : Math.random;
  if (rng() >= rate) return null;
  if (!randomEvents || randomEvents.length === 0) return null;

  const seen = new Set(
    Array.isArray(profile?.eventsExperienced)
      ? profile.eventsExperienced.filter((id) => typeof id === 'string')
      : []
  );

  // Weight each event: 1.0 if unseen, 0.35 if seen. Sum, draw, walk.
  const weighted = randomEvents.map((e) => ({
    event: e,
    weight: seen.has(e.id) ? 0.35 : 1.0,
  }));
  const total = weighted.reduce((s, w) => s + w.weight, 0);
  if (total <= 0) return randomEvents[0] ?? null;

  let r = rng() * total;
  for (const w of weighted) {
    r -= w.weight;
    if (r <= 0) return w.event;
  }
  return weighted[weighted.length - 1].event;
};

// --- 2. Gathering night ---------------------------------------------------
//
// Cadence: the first Saturday of each calendar month. Reasoning:
//   - The Warrior Cats books call the full-moon truce "the Gathering."
//   - Every ~28-30 days is the right rhythm. Picking "first Saturday"
//     gives a predictable cadence (parents and kid can know when it's
//     coming) without ever showing a countdown to the player.
//   - Saturday so it lands on a weekend when she's likely to play.
//
// We don't track a stored flag — the date math is the source of truth.
// The DenView shows the banner iff isGatheringNight(now) AND the player
// hasn't already attended today (profile.lastGatheringAt < startOfToday).

export const isGatheringNight = (now = Date.now()) => {
  const d = new Date(now);
  const dom = d.getDate();
  const dow = d.getDay(); // 0=Sun, 6=Sat
  return dow === 6 && dom >= 1 && dom <= 7;
};

// Has the player already attended this Gathering today? Used to dismiss
// the banner after they complete the Gathering vignette.
export const hasAttendedGatheringToday = (profile, now = Date.now()) => {
  const last = typeof profile?.lastGatheringAt === 'number' ? profile.lastGatheringAt : null;
  if (!last) return false;
  const sameDay = new Date(last).toDateString() === new Date(now).toDateString();
  return sameDay;
};

// Pick a stable Gathering vignette for THIS Gathering night. Seeded on the
// date (YYYY-MM) so each Gathering rotates predictably, and on the profile
// id so two characters in the same save can encounter different vignettes.
export const pickGatheringContent = (profile, now = Date.now()) => {
  if (!gatheringContent || gatheringContent.length === 0) return null;
  const d = new Date(now);
  const yyyymm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const id = profile?.id || 'no-id';
  const rng = mulberry32(hashSeed(`${id}|gathering|${yyyymm}`));
  const idx = Math.floor(rng() * gatheringContent.length);
  return gatheringContent[idx];
};

// Lookup helper for the Gathering token (trinket awarded for attending).
export const gatheringTrinket = () => GATHERING_TRINKET;

// --- 3. StarClan dream ----------------------------------------------------
//
// Picks a dream when:
//   (a) at least DREAM_COOLDOWN_MS has passed since the last one, AND
//   (b) we have a topic to hint at (i.e., topicStats has some data, or
//       falls back to a random dream so first-week players still see one
//       eventually).
//
// Whether the player has actually *had* a dream tonight is decided by
// (last dream older than cooldown) AND a soft daily roll, so dreams don't
// fire EVERY night after the cooldown — they ARRIVE.

// Score weakness by topic accuracy. Higher = weaker.
const weaknessScore = (profile, topic) => {
  const ts = profile?.topicStats?.[topic];
  if (!ts || !ts.attempted || ts.attempted < 3) return 0.6; // unknown — moderate priority
  const acc = ts.correct / ts.attempted;
  return Math.max(0, 1 - acc);
};

const weakestTopic = (profile) => {
  let best = TOPICS[0];
  let bestScore = -Infinity;
  for (const t of TOPICS) {
    const s = weaknessScore(profile, t);
    if (s > bestScore) { bestScore = s; best = t; }
  }
  return best;
};

// Cooldown gate. Returns true if it's been long enough since the last dream.
const dreamCooldownPassed = (profile, now = Date.now()) => {
  const last = typeof profile?.lastDreamAt === 'number' ? profile.lastDreamAt : null;
  if (!last) return true;
  return (now - last) >= DREAM_COOLDOWN_MS;
};

// Returns a dream or null. Stable per day per character — if it's a "dream
// day," the same character will see the same dream until they dismiss it
// (which sets lastDreamAt to now and clears the gate).
export const pickStarClanDream = (profile, now = Date.now()) => {
  if (!dreamCooldownPassed(profile, now)) return null;
  if (!starClanDreams || starClanDreams.length === 0) return null;

  // Soft daily roll. ~50% chance per day past the cooldown — keeps dreams
  // from feeling like "every Tuesday." Seeded so the answer is stable for
  // today (and a refresh of the Den shows the same outcome).
  const id = profile?.id || 'no-id';
  const dayKey = new Date(now).toDateString();
  const rng = mulberry32(hashSeed(`${id}|dream|${dayKey}`));
  if (rng() >= 0.5) return null;

  // Pick the dream pool by weakest topic. If no dreams exist for that
  // topic (defensive — shouldn't happen, but the catalog could change),
  // fall back to all dreams.
  const topic = weakestTopic(profile);
  const pool = dreamsForTopic(topic);
  const usePool = (pool && pool.length > 0) ? pool : starClanDreams;
  const idx = Math.floor(rng() * usePool.length);
  return usePool[idx];
};

// Hard reset: mark a dream as seen (sets lastDreamAt to `now`). Returned as
// a partial profile patch so callers can spread it into updateActive().
export const markDreamSeen = (now = Date.now()) => ({ lastDreamAt: now });

// Hard reset: mark a Gathering as attended.
export const markGatheringAttended = (now = Date.now()) => ({ lastGatheringAt: now });

// Append an event id to the eventsExperienced list (de-duplicated, capped
// at 50 most-recent). Returns the new array.
export const recordEventExperienced = (profile, eventId) => {
  if (typeof eventId !== 'string') return profile?.eventsExperienced || [];
  const current = Array.isArray(profile?.eventsExperienced) ? profile.eventsExperienced : [];
  // Move-to-front semantics so the most-recent ids sit at the end.
  const filtered = current.filter((id) => id !== eventId);
  filtered.push(eventId);
  return filtered.slice(-50);
};
