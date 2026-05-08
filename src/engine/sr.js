// Spaced-repetition core. Per CLAUDE.md and v14 spec:
//   Wild     — new or recently missed; ~60% selection weight
//   Tracking — answered correctly once or twice; ~30%
//   Trusted  — 3+ in a row correct & fast; ~10% (review only)

export const SAVE_VERSION = 16;

// Bucketed elapsed-time histogram for the parent dashboard. Lets us see whether
// the SR_FAST_MS / SR_OK_MS thresholds are well-calibrated for this player.
export const HISTOGRAM_BUCKETS = ['under2s', '2to4s', '4to7s', '7to10s', '10to20s', 'over20s'];
export const histogramBucketFor = (ms) => {
  if (ms < 2000) return 'under2s';
  if (ms < 4000) return '2to4s';
  if (ms < 7000) return '4to7s';
  if (ms < 10000) return '7to10s';
  if (ms < 20000) return '10to20s';
  return 'over20s';
};

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
  if (!sr[id]) sr[id] = {
    bucket: SR_BUCKET.WILD,
    correctStreak: 0,
    seen: 0,
    lastSeenAt: null,
    correctCount: 0,
    wrongCount: 0,
    totalElapsedMs: 0,
    totalCorrectMs: 0,
    firstSeenAt: null,
  };
  return sr[id];
};

// Apply the result of an answer to one fact entry. Returns a NEW object (does not mutate input).
export const applySRResult = (entry, isCorrect, elapsedMs) => {
  const now = Date.now();
  const next = { ...entry };
  next.seen = (entry.seen || 0) + 1;
  next.lastSeenAt = now;
  next.firstSeenAt = entry.firstSeenAt || now;
  next.totalElapsedMs = (entry.totalElapsedMs || 0) + (elapsedMs || 0);
  if (!isCorrect) {
    next.correctStreak = 0;
    next.wrongCount = (entry.wrongCount || 0) + 1;
    const idx = Math.max(0, SR_BUCKET_ORDER.indexOf(entry.bucket) - 1);
    next.bucket = SR_BUCKET_ORDER[idx];
    return next;
  }
  next.correctStreak = (entry.correctStreak || 0) + 1;
  next.correctCount = (entry.correctCount || 0) + 1;
  next.totalCorrectMs = (entry.totalCorrectMs || 0) + (elapsedMs || 0);
  if (elapsedMs < SR_FAST_MS) {
    const idx = Math.min(SR_BUCKET_ORDER.length - 1, SR_BUCKET_ORDER.indexOf(entry.bucket) + 1);
    next.bucket = SR_BUCKET_ORDER[idx];
  }
  return next;
};

// Map an SR fact id back to (kind, a, b). Inverse of factId().
export const parseFactId = (id) => {
  const m1 = id.match(/^mult:(\d+)x(\d+)$/);
  if (m1) return { kind: 'mult', a: parseInt(m1[1], 10), b: parseInt(m1[2], 10) };
  const m2 = id.match(/^add:(\d+)\+(\d+)$/);
  if (m2) return { kind: 'add', a: parseInt(m2[1], 10), b: parseInt(m2[2], 10) };
  return null;
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
