// Patrol gating + Mentor's daily focus.
//
// Two responsibilities split for testability:
//   1. patrolStatus(profile, patrolId, now) — daily/weekly cap state per patrol
//   2. mentorFocus(profile, now)            — today's focus topic + reasoning
//
// CLAUDE.md anti-patterns honored:
//   - No timers visible to the player (caps reset on calendar day / ISO week).
//   - No streak loss or punishment.
//   - Save data sacred — derives from existing patrolHistory, no new fields.
//
// The cap design is per CLAUDE.md's "the next thing is always visible":
// when a patrol is capped, the Den shows kind mentor flavor and points
// the player to other patrols. It's never silent or arbitrary.

import { PATROLS } from '../data/ranks.js';

// --- Date helpers ---------------------------------------------------------

const dayKey = (ts) => new Date(ts).toDateString();
const todayKey = (now = Date.now()) => new Date(now).toDateString();

// ISO week starts Monday. Returns the timestamp of 00:00:00 local on the
// most recent Monday (inclusive of today). Used to count weekly patrols.
export const isoWeekStart = (now = Date.now()) => {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();              // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const offset = (day + 6) % 7;        // days since Monday
  d.setDate(d.getDate() - offset);
  return d.getTime();
};

// --- Cap configuration ----------------------------------------------------
//
// Per the dad's spec for v15.0.0-f: Hunting Patrol = max 1/day AND 3/week.
// Other patrols are uncapped — the goal is to push variety AWAY from the
// easy topic, not punish exploration.

export const PATROL_CAPS = {
  hunting: { perDay: 1, perWeek: 3 },
};

// --- Cap state ------------------------------------------------------------

// Returns { perDay, perWeek, todayCount, weekCount, capped, reason }.
// capped is true when EITHER the daily or the weekly cap is reached.
// reason is one of 'daily' | 'weekly' | null.
export const patrolStatus = (profile, patrolId, now = Date.now()) => {
  const cap = PATROL_CAPS[patrolId];
  const history = profile?.patrolHistory || [];
  const today = todayKey(now);
  const weekStart = isoWeekStart(now);
  let todayCount = 0;
  let weekCount = 0;
  for (const p of history) {
    if (p.patrolId !== patrolId) continue;
    if (typeof p.startedAt !== 'number') continue;
    if (dayKey(p.startedAt) === today) todayCount += 1;
    if (p.startedAt >= weekStart) weekCount += 1;
  }
  if (!cap) {
    return { perDay: null, perWeek: null, todayCount, weekCount, capped: false, reason: null };
  }
  let reason = null;
  if (cap.perWeek != null && weekCount >= cap.perWeek)      reason = 'weekly';
  else if (cap.perDay  != null && todayCount >= cap.perDay) reason = 'daily';
  return { ...cap, todayCount, weekCount, capped: reason !== null, reason };
};

// Mentor-flavor lines for a capped patrol. Pulled at random to keep variety.
// Daily and weekly use distinct phrasing so the player can tell the
// difference. Lines are book-faithful — no scolding, no urgency.
export const CAP_FLAVOR = {
  hunting: {
    daily: [
      'The fresh-kill pile is full from your hunt. Your mentor sends you toward other paths today.',
      "You've hunted well today, warrior. The Clan eats — try a different patrol.",
      "Your mentor pads up with a fond glance. 'Save some prey for the others. Try elsewhere today.'",
      'The elders praise your morning catch. There is no need to hunt more before sunrise.',
    ],
    weekly: [
      "You've hunted hard this moon, warrior. The pile is high. Hunting Patrol returns Monday.",
      "Your mentor's voice is warm. 'You've fed us well this week. Let the prey rest until the next moon's dawn.'",
      'The Clan thanks you. Hunting Patrol rests until next Monday — try other patrols in the meantime.',
    ],
  },
};

export const pickCapFlavor = (patrolId, reason) => {
  const lines = CAP_FLAVOR[patrolId]?.[reason];
  if (!lines || lines.length === 0) return null;
  return lines[Math.floor(Math.random() * lines.length)];
};

// --- Mentor's daily focus -------------------------------------------------
//
// Picks one topic per day, stable across the same calendar day for the same
// character. 70% weighted-toward-weakest, 30% noise. The 70/30 split gives
// the system enough determinism to keep pushing weak topics, with enough
// surprise that she doesn't see the same topic over and over when she's
// weak in only one area.

const TOPICS = ['mult', 'add', 'geometry', 'fraction', 'time'];

// Stable per-day per-character seed. djb2 hash, mod-stable across machines.
const hashSeed = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return h >>> 0;
};

// Mulberry32: a fast, deterministic PRNG. We use it for the daily focus
// so picking can be reproduced for tests. Returns [0,1).
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

// Score how "weak" a topic is. Higher = weaker. Uses topicStats accuracy
// when available; falls back to a sensible default for topics with no
// data. Topics with very few attempts are treated as moderately weak so
// the focus picker nudges her into them rather than ignoring them.
const weaknessScore = (profile, topic) => {
  const ts = profile?.topicStats?.[topic];
  if (!ts || !ts.attempted || ts.attempted < 3) return 0.6; // unknown, prioritize gently
  const acc = ts.correct / ts.attempted;
  return Math.max(0, 1 - acc);
};

// Pick the weakest topic. Ties broken by alphabetical order (stable).
const weakestTopic = (profile) => {
  let best = TOPICS[0];
  let bestScore = -Infinity;
  for (const t of TOPICS) {
    const s = weaknessScore(profile, t);
    if (s > bestScore) { bestScore = s; best = t; }
  }
  return best;
};

// Returns { topic, reason, weakest }.
//   topic   = today's mentor focus
//   reason  = 'weakest' | 'rotation' (which branch was taken)
//   weakest = the weakest topic regardless of branch (informational)
export const mentorFocus = (profile, now = Date.now()) => {
  const id = profile?.id || 'no-id';
  const day = todayKey(now);
  const rng = mulberry32(hashSeed(`${id}|${day}`));
  const weakest = weakestTopic(profile);
  const r = rng();
  if (r < 0.7) {
    return { topic: weakest, reason: 'weakest', weakest };
  }
  // Rotation noise: pick a non-weakest topic at random for the day.
  const others = TOPICS.filter((t) => t !== weakest);
  const idx = Math.floor(rng() * others.length);
  return { topic: others[idx], reason: 'rotation', weakest };
};

// Map a focus topic back to its patrol metadata (for the badge in the Den).
export const patrolForTopic = (topic) => PATROLS.find((p) => p.topic === topic);

// Mentor opening lines shown when starting a focus-topic patrol. Random pick.
export const FOCUS_OPENING_LINES = [
  "Your mentor watches you stretch in the dawn light. \"Today,\" she says, \"we work on what's hardest.\"",
  "Your mentor greets you with a serious glance. \"The leader has asked the apprentices to focus their training. Show me.\"",
  "There is a glint in your mentor's eye. They want something specific today.",
  "Your mentor pads up. \"The Clan needs sharper claws on this skill. Focus here.\"",
  "Your mentor settles in front of you. \"Today, we sharpen what's been dull. Begin.\"",
];

export const pickFocusOpening = () => FOCUS_OPENING_LINES[Math.floor(Math.random() * FOCUS_OPENING_LINES.length)];

// Bonus rank credit applied per correct answer on a focus-topic patrol.
// 0.5 → effective 1.5x rank progress (each correct = +1 to totalCorrect AND +0.5
// to rankBonusCorrect). totalCorrect stays honest for stats; rankBonusCorrect
// pushes ladder progression only.
export const FOCUS_RANK_BONUS_PER_CORRECT = 0.5;
