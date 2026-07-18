// Spaced-repetition core. Per CLAUDE.md and v14 spec:
//   Wild     — new or recently missed; ~60% selection weight
//   Tracking — answered correctly once or twice; ~30%
//   Trusted  — 3+ in a row correct & fast; ~10% (review only)

export const SAVE_VERSION = 15;

export const SR_BUCKET = { WILD: 'wild', TRACKING: 'tracking', TRUSTED: 'trusted' };
export const SR_BUCKET_ORDER = [SR_BUCKET.WILD, SR_BUCKET.TRACKING, SR_BUCKET.TRUSTED];
export const SR_WEIGHTS = { [SR_BUCKET.WILD]: 60, [SR_BUCKET.TRACKING]: 30, [SR_BUCKET.TRUSTED]: 10 };
export const SR_FAST_MS = 4000;
export const SR_OK_MS = 7000;

// Stable identifier for a math fact. Drill-only — geometry and word problems aren't "facts"
// in the SR sense. Multiplication and addition are order-normalized so 7×8 == 8×7.
export const factId = (kind, a, b) => {
  if (kind === 'mult') {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    return `mult:${lo}x${hi}`;
  }
  if (kind === 'add') {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    return `add:${lo}+${hi}`;
  }
  if (kind === 'sub') return `sub:${a}-${b}`;
  if (kind === 'frac') return `frac:${a}/${b}`;
  return null;
};

export const ensureFact = (sr, id) => {
  if (!sr[id]) sr[id] = { bucket: SR_BUCKET.WILD, correctStreak: 0, seen: 0, lastSeenAt: null };
  return sr[id];
};

// Apply the result of an answer to one fact entry. Returns a NEW object (does not mutate input).
// A bucket promotion stamps promotedAt so selectFact can offer a "victory lap"; a miss clears it.
export const applySRResult = (entry, isCorrect, elapsedMs, now = Date.now()) => {
  const next = { ...entry };
  next.seen = (entry.seen || 0) + 1;
  next.lastSeenAt = now;
  if (!isCorrect) {
    next.correctStreak = 0;
    const idx = Math.max(0, SR_BUCKET_ORDER.indexOf(entry.bucket) - 1);
    next.bucket = SR_BUCKET_ORDER[idx];
    delete next.promotedAt;
    return next;
  }
  next.correctStreak = (entry.correctStreak || 0) + 1;
  if (elapsedMs < SR_FAST_MS) {
    const idx = Math.min(SR_BUCKET_ORDER.length - 1, SR_BUCKET_ORDER.indexOf(entry.bucket) + 1);
    next.bucket = SR_BUCKET_ORDER[idx];
    if (idx > SR_BUCKET_ORDER.indexOf(entry.bucket)) next.promotedAt = now;
  }
  return next;
};

const pickRandom = (arr, rng = Math.random) => arr[Math.floor(rng() * arr.length)];

// Pick a fact id from the candidate pool, weighted by bucket. Unknown facts default to Wild,
// so brand-new facts naturally float to the top. `rng` is injectable for tests.
export const selectByBuckets = (candidates, sr, rng = Math.random) => {
  const sumWeights = SR_BUCKET_ORDER.reduce((s, b) => s + SR_WEIGHTS[b], 0);
  let r = rng() * sumWeights;
  let chosenBucket = SR_BUCKET.WILD;
  for (const b of SR_BUCKET_ORDER) {
    r -= SR_WEIGHTS[b];
    if (r <= 0) { chosenBucket = b; break; }
  }
  const inBucket = candidates.filter((id) => (sr[id]?.bucket || SR_BUCKET.WILD) === chosenBucket);
  if (inBucket.length > 0) return pickRandom(inBucket, rng);
  for (const b of SR_BUCKET_ORDER) {
    const sub = candidates.filter((id) => (sr[id]?.bucket || SR_BUCKET.WILD) === b);
    if (sub.length > 0) return pickRandom(sub, rng);
  }
  return pickRandom(candidates, rng);
};

// Victory laps: shortly after a fact is promoted, give it one easy re-appearance
// so the win gets felt instead of the fact vanishing into a rarer bucket.
export const VICTORY_LAP_CHANCE = 0.2;
export const VICTORY_LAP_WINDOW_MS = 15 * 60 * 1000;

// Selection entry point for the generators. With probability VICTORY_LAP_CHANCE,
// resurface a fact promoted within the window and not yet reseen since the
// promotion; otherwise fall back to bucket-weighted selection. `opts` accepts
// { rng, now } for deterministic tests.
export const selectFact = (candidates, sr, opts = {}) => {
  const rng = opts.rng || Math.random;
  const now = opts.now ?? Date.now();
  if (rng() < VICTORY_LAP_CHANCE) {
    const laps = candidates.filter((id) => {
      const e = sr[id];
      return e && e.promotedAt
        && (now - e.promotedAt) <= VICTORY_LAP_WINDOW_MS
        && (!e.lastSeenAt || e.lastSeenAt <= e.promotedAt);
    });
    if (laps.length > 0) return laps[Math.floor(rng() * laps.length)];
  }
  return selectByBuckets(candidates, sr, rng);
};
