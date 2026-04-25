// Spaced-repetition core. Per CLAUDE.md and v14 spec:
//   Wild     — new or recently missed; ~60% selection weight
//   Tracking — answered correctly once or twice; ~30%
//   Trusted  — 3+ in a row correct & fast; ~10% (review only)

export const SAVE_VERSION = 14;

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
export const applySRResult = (entry, isCorrect, elapsedMs) => {
  const next = { ...entry };
  next.seen = (entry.seen || 0) + 1;
  next.lastSeenAt = Date.now();
  if (!isCorrect) {
    next.correctStreak = 0;
    const idx = Math.max(0, SR_BUCKET_ORDER.indexOf(entry.bucket) - 1);
    next.bucket = SR_BUCKET_ORDER[idx];
    return next;
  }
  next.correctStreak = (entry.correctStreak || 0) + 1;
  if (elapsedMs < SR_FAST_MS) {
    const idx = Math.min(SR_BUCKET_ORDER.length - 1, SR_BUCKET_ORDER.indexOf(entry.bucket) + 1);
    next.bucket = SR_BUCKET_ORDER[idx];
  }
  return next;
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Pick a fact id from the candidate pool, weighted by bucket. Unknown facts default to Wild,
// so brand-new facts naturally float to the top.
export const selectByBuckets = (candidates, sr) => {
  const sumWeights = SR_BUCKET_ORDER.reduce((s, b) => s + SR_WEIGHTS[b], 0);
  let r = Math.random() * sumWeights;
  let chosenBucket = SR_BUCKET.WILD;
  for (const b of SR_BUCKET_ORDER) {
    r -= SR_WEIGHTS[b];
    if (r <= 0) { chosenBucket = b; break; }
  }
  const inBucket = candidates.filter((id) => (sr[id]?.bucket || SR_BUCKET.WILD) === chosenBucket);
  if (inBucket.length > 0) return pickRandom(inBucket);
  for (const b of SR_BUCKET_ORDER) {
    const sub = candidates.filter((id) => (sr[id]?.bucket || SR_BUCKET.WILD) === b);
    if (sub.length > 0) return pickRandom(sub);
  }
  return pickRandom(candidates);
};
