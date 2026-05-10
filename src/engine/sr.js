// Spaced-repetition core. Per CLAUDE.md and v14 spec:
//   Wild     — new or recently missed; ~60% selection weight
//   Tracking — answered correctly once or twice; ~30%
//   Trusted  — 3+ in a row correct & fast; ~10% (review only)

export const SAVE_VERSION = 19;

// Bucketed elapsed-time histogram for the parent dashboard.
//
// v15.0.0-e — rebucketed. The previous 6 buckets (<2s / 2-4s / 4-7s / 7-10s /
// 10-20s / >20s) were calibrated for the old global 4s/7s SR gates and didn't
// stretch far enough to make sense for compute-heavy kinds where 30-60s
// answers are normal. The new 9-bucket array covers the realistic span from
// instant fluency (<1s) to long word-problem multi-step (>90s), with finer
// resolution at the fast end where the fluency story matters.
export const HISTOGRAM_BUCKETS = [
  'under1s', '1to2s', '2to3s', '3to5s',
  '5to10s', '10to20s', '20to45s', '45to90s', 'over90s',
];

// Inclusive lower bound, exclusive upper bound, for each bucket. Used by the
// dashboard to color buckets relative to a kind's fast/ok thresholds.
export const HISTOGRAM_BUCKET_RANGES = {
  under1s:  [0,      1000],
  '1to2s':  [1000,   2000],
  '2to3s':  [2000,   3000],
  '3to5s':  [3000,   5000],
  '5to10s': [5000,   10000],
  '10to20s':[10000,  20000],
  '20to45s':[20000,  45000],
  '45to90s':[45000,  90000],
  over90s:  [90000,  Infinity],
};

export const histogramBucketFor = (ms) => {
  if (ms < 1000)  return 'under1s';
  if (ms < 2000)  return '1to2s';
  if (ms < 3000)  return '2to3s';
  if (ms < 5000)  return '3to5s';
  if (ms < 10000) return '5to10s';
  if (ms < 20000) return '10to20s';
  if (ms < 45000) return '20to45s';
  if (ms < 90000) return '45to90s';
  return 'over90s';
};

// Compute a histogram from a flat array of elapsed-ms samples. Returns
// { [bucketKey]: count } with all bucket keys present (zero for empty buckets).
export const computeHistogram = (samples) => {
  const out = HISTOGRAM_BUCKETS.reduce((m, b) => { m[b] = 0; return m; }, {});
  if (!Array.isArray(samples)) return out;
  for (const ms of samples) {
    if (typeof ms !== 'number' || !isFinite(ms) || ms < 0) continue;
    out[histogramBucketFor(ms)] += 1;
  }
  return out;
};

export const SR_BUCKET = { WILD: 'wild', TRACKING: 'tracking', TRUSTED: 'trusted' };
export const SR_BUCKET_ORDER = [SR_BUCKET.WILD, SR_BUCKET.TRACKING, SR_BUCKET.TRUSTED];
export const SR_WEIGHTS = { [SR_BUCKET.WILD]: 60, [SR_BUCKET.TRACKING]: 30, [SR_BUCKET.TRUSTED]: 10 };

// Legacy global thresholds. KEEP — used as the fallback when a problem kind has
// no per-kind override (and as a safe default for older callers).
export const SR_FAST_MS = 4000;
export const SR_OK_MS = 7000;

// v17 — per-kind calibration. The original 4s/7s were calibrated for memorized
// fluency drills (×, +). Compute-heavy problems (large add/sub, geometry,
// fractions, time-duration) cannot be answered in 4 seconds by ANY 3rd grader,
// so under the old global gate they never promoted past Wild — the SR engine
// stopped doing useful work once the patrol topic was anything other than
// pure facts. The fix: each kind gets its own threshold, and "compute-heavy"
// kinds promote on streak alone (speedPromotes:false) instead of speed.
//
// `fast` is the personal-fast threshold for promotion, `ok` is the upper
// bound that still counts as "answered without struggle" (used for parent
// dashboard color coding). When ≥20 personal samples exist for a kind we
// switch to the player's own P25 (see personalThreshold) — these defaults
// are only the cold-start values.
export const KIND_THRESHOLDS = {
  'mult-drill':    { fast: 2000,  ok: 4000,  speedPromotes: true  },
  'mult-word':     { fast: 8000,  ok: 20000, speedPromotes: true  },
  'add-small':     { fast: 2000,  ok: 4000,  speedPromotes: true  },
  'sub-small':     { fast: 4000,  ok: 10000, speedPromotes: true  },
  'add-large':     { fast: 12000, ok: 30000, speedPromotes: false },
  'sub-large':     { fast: 15000, ok: 35000, speedPromotes: false },
  'geometry':      { fast: 20000, ok: 60000, speedPromotes: false },
  'fraction':      { fast: 15000, ok: 40000, speedPromotes: false },
  'time-clock':    { fast: 6000,  ok: 15000, speedPromotes: true  },
  'time-duration': { fast: 30000, ok: 60000, speedPromotes: false },
  'time-future':   { fast: 30000, ok: 60000, speedPromotes: false },
};

// How many recent samples to keep per kind for personal-threshold calibration.
export const KIND_SAMPLES_MAX = 50;

// Minimum samples before we trust the personal P25.
export const KIND_SAMPLES_MIN_FOR_PERSONAL = 20;

// P25 of an array of numbers. Math.floor(samples.length * 0.25) keeps it
// honest for small N — at exactly 20 samples we pick index 5, the 6th-fastest.
const p25 = (samples) => {
  if (!samples || samples.length === 0) return null;
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * 0.25);
  return sorted[idx];
};

// Resolve the personal-fast threshold for a kind. Returns:
//   - P25 of personal samples once we have ≥20
//   - else KIND_THRESHOLDS[kind].fast
//   - else SR_FAST_MS (4000) for unknown kinds
export const personalThreshold = (profile, kind) => {
  const samples = profile?.kindSamples?.[kind]?.samples;
  if (Array.isArray(samples) && samples.length >= KIND_SAMPLES_MIN_FOR_PERSONAL) {
    const p = p25(samples);
    if (p != null) return p;
  }
  return KIND_THRESHOLDS[kind]?.fast ?? SR_FAST_MS;
};

// Append a single elapsed-ms sample to the per-kind ring (last KIND_SAMPLES_MAX).
// Returns a NEW kindSamples object containing the updated entry. Only ever
// called on CORRECT answers (we want personal-fast to reflect "what does she
// do when she gets it right").
export const appendSample = (kindSamples, kind, ms) => {
  const existing = (kindSamples && kindSamples[kind]) || { samples: [], count: 0 };
  const samples = [...(existing.samples || []), ms].slice(-KIND_SAMPLES_MAX);
  return {
    ...(kindSamples || {}),
    [kind]: { samples, count: (existing.count || 0) + 1 },
  };
};

// Stable identifier for a math fact. v17 expands this so EVERY problem kind
// produces a fact id — the dashboard now reports per-fact for sub / geo /
// frac / time as well, not just mult / add. The shape varies by kind:
//
//   mult:   mult:LOxHI               (order-normalized)
//   add:    add:LO+HI                (order-normalized)
//   sub:    sub:start-give           (specific small-subtraction pair)
//   add-large / sub-large:           coarse buckets only — see callers
//   geo:    geo:perimeter:scale | geo:area:scale   (scale ∈ small|medium|large)
//   frac:   frac:half | frac:third | frac:quarter | frac:fifth
//   time:   time:clock:grain | time:duration:grain | time:future:grain
//             grain ∈ hour | half | quarter | five | any
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
  if (kind === 'frac') {
    // a is the denominator name OR the numeric denominator
    if (typeof a === 'string') return `frac:${a}`;
    const map = { 2: 'half', 3: 'third', 4: 'quarter', 5: 'fifth' };
    return `frac:${map[a] || a}`;
  }
  if (kind === 'geo') {
    // a = 'perimeter' | 'area', b = scale ('small' | 'medium' | 'large')
    return `geo:${a}:${b}`;
  }
  if (kind === 'time-clock' || kind === 'time-duration' || kind === 'time-future') {
    const sub = kind.split('-')[1]; // 'clock' | 'duration' | 'future'
    return `time:${sub}:${a}`; // a = grain name
  }
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

// Apply the result of an answer to one fact entry. Returns a NEW object (does
// not mutate input).
//
// v17 signature: applySRResult(entry, isCorrect, elapsedMs, kind, personalFastMs)
//
//   - kind is the problem kind (e.g. 'mult-drill', 'time-duration'). Used to
//     look up speedPromotes and (cold-start only) the default fast threshold.
//   - personalFastMs is the resolved threshold from personalThreshold(profile, kind),
//     passed in by the caller so this module stays pure.
//
// Promotion logic:
//   - If correct AND speedPromotes for kind AND elapsedMs < personalFastMs:
//       promote one bucket
//   - If correct AND NOT speedPromotes for kind AND post-streak ≥ 3 AND
//       streak is a multiple of 3: promote one bucket (streak-based)
//   - Demote on wrong unchanged.
//
// Old (pre-v17) callers can still pass (entry, isCorrect, elapsedMs) — kind
// defaults so behavior collapses to the legacy SR_FAST_MS gate.
export const applySRResult = (entry, isCorrect, elapsedMs, kind, personalFastMs) => {
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

  const cfg = (kind && KIND_THRESHOLDS[kind]) || null;
  const speedPromotes = cfg ? cfg.speedPromotes : true;
  const fastGate = personalFastMs ?? cfg?.fast ?? SR_FAST_MS;

  let shouldPromote = false;
  if (speedPromotes) {
    shouldPromote = elapsedMs < fastGate;
  } else {
    // Compute-heavy kinds: promote on demonstrated streak rather than speed.
    // Every 3rd correct earns the next bucket — Wild → Tracking at streak 3,
    // Tracking → Trusted at streak 6 (which can take many sessions, that's fine).
    shouldPromote = next.correctStreak >= 3 && next.correctStreak % 3 === 0;
  }
  if (shouldPromote) {
    const idx = Math.min(SR_BUCKET_ORDER.length - 1, SR_BUCKET_ORDER.indexOf(entry.bucket) + 1);
    next.bucket = SR_BUCKET_ORDER[idx];
  }
  return next;
};

// Map an SR fact id back to a structured form. Inverse of factId(). Returned
// shape varies by kind so the dashboard can label each row appropriately:
//
//   mult:7x8         → { kind: 'mult', a: 7, b: 8 }
//   add:3+4          → { kind: 'add',  a: 3, b: 4 }
//   sub:12-5         → { kind: 'sub',  a: 12, b: 5 }
//   sub:large        → { kind: 'sub',  bucket: 'large' }
//   add:large        → { kind: 'add',  bucket: 'large' }
//   frac:third       → { kind: 'frac', denom: 3, name: 'third' }
//   geo:perimeter:medium → { kind: 'geo', op: 'perimeter', scale: 'medium' }
//   time:clock:quarter   → { kind: 'time-clock', grain: 'quarter' }
const FRAC_DENOM = { half: 2, third: 3, quarter: 4, fifth: 5 };

export const parseFactId = (id) => {
  if (!id) return null;
  const m1 = id.match(/^mult:(\d+)x(\d+)$/);
  if (m1) return { kind: 'mult', a: parseInt(m1[1], 10), b: parseInt(m1[2], 10) };

  if (id === 'add:large') return { kind: 'add', bucket: 'large' };
  const m2 = id.match(/^add:(\d+)\+(\d+)$/);
  if (m2) return { kind: 'add', a: parseInt(m2[1], 10), b: parseInt(m2[2], 10) };

  if (id === 'sub:large') return { kind: 'sub', bucket: 'large' };
  const m3 = id.match(/^sub:(\d+)-(\d+)$/);
  if (m3) return { kind: 'sub', a: parseInt(m3[1], 10), b: parseInt(m3[2], 10) };

  const m4 = id.match(/^frac:(half|third|quarter|fifth)$/);
  if (m4) return { kind: 'frac', denom: FRAC_DENOM[m4[1]], name: m4[1] };

  const m5 = id.match(/^geo:(perimeter|area):(small|medium|large)$/);
  if (m5) return { kind: 'geo', op: m5[1], scale: m5[2] };

  const m6 = id.match(/^time:(clock|duration|future):(hour|half|quarter|five|any)$/);
  if (m6) return { kind: `time-${m6[1]}`, grain: m6[2] };

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
