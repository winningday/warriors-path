# Tutor-Informed Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the four tutor-informed changes: quiet drills, victory-lap resurfacing, fatigue-aware rest advisor, and cloud sync with a tutor dashboard.

**Architecture:** Pure-function engine additions in `src/engine/` (SR victory laps, pacing math) with vitest coverage; presentation tweaks in existing views; a zero-dependency `node:http` server in `server/` storing one JSON file per sync key; a read-only TutorView in the SPA behind a `?tutor=<key>` URL check.

**Tech Stack:** React 18 + Vite 5, vitest, plain Node 18+ (`node:http`, `node:fs`), no new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-07-18-tutor-updates-design.md` (read it first; it holds rationale and constraints).

## Global Constraints

- No em-dash characters in any new code, comment, or doc content.
- No visible timers or urgency UX anywhere. Timing is internal only.
- Additive save migration only. `normalizeProfile` (src/engine/migration.js) whitelists fields on every load: every new profile field must be added there or it is silently dropped.
- New flavor/message text must be book-faithful Warrior Cats phrasing (see `src/data/flavor.js` for tone). No generic praise, no guilt, no numbers/clocks in rest messages.
- `SAVE_VERSION` becomes 15 (src/engine/sr.js). `package.json` version becomes `15.1.0`.
- Do not push to any remote. Commits stay local on branch `feature/tutor-updates` (a push to main auto-deploys the site).
- All engine code stays framework-free (importable in node without jsdom).
- Match existing code style: 2-space indent, single quotes, arrow exports, comment tone of neighboring files.

---

### Task 0: Branch + vitest infrastructure (run first, alone)

**Files:**
- Modify: `package.json` (add `test` script, vitest devDependency, version bump)
- Create: `src/engine/smoke.test.js` (temporary, deleted in Task F)

**Steps:**

- [ ] `git checkout -b feature/tutor-updates`
- [ ] `npm install --save-dev vitest` (pin whatever 1.x/2.x npm resolves)
- [ ] Add to package.json scripts: `"test": "vitest run"`, set `"version": "15.1.0"`
- [ ] Create `src/engine/smoke.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { factId } from './sr.js';

describe('smoke', () => {
  it('runs against real modules', () => {
    expect(factId('mult', 8, 7)).toBe('mult:7x8');
  });
});
```

- [ ] Run `npm test`. Expected: 1 passing test.
- [ ] Commit: `chore: add vitest test infra on feature/tutor-updates`

---

### Task A: Quiet drills

**Files:**
- Modify: `src/engine/generators.js` (genMult drill branch)
- Modify: `src/components/views/PatrolView.jsx` (conditional story render)
- Test: `src/engine/generators.test.js` (create)

**Interfaces:**
- Produces: drill problems (`kind: 'mult-drill'`) now have `story: null`. Word problems keep non-empty `story`. No signature changes.

**Steps:**

- [ ] Write failing tests in `src/engine/generators.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { generateProblem } from './generators.js';

const profile = { clan: 'ThunderClan', path: 'warrior', mentor: 'Lionheart', factsSR: {} };

const sample = (topic, n = 200) =>
  Array.from({ length: n }, () => generateProblem(topic, profile));

describe('quiet drills', () => {
  it('mult drills carry no story preamble', () => {
    const drills = sample('mult').filter((p) => p.kind === 'mult-drill');
    expect(drills.length).toBeGreaterThan(0);
    drills.forEach((p) => expect(p.story).toBeNull());
  });
  it('mult word problems keep their story', () => {
    const words = sample('mult').filter((p) => p.kind === 'mult-word');
    expect(words.length).toBeGreaterThan(0);
    words.forEach((p) => expect(typeof p.story).toBe('string'));
  });
  it('drills still carry question and answer', () => {
    const drills = sample('mult').filter((p) => p.kind === 'mult-drill');
    drills.forEach((p) => {
      expect(p.question).toMatch(/^\d+ × \d+$/);
      expect(p.answer).toBe(p.factA * p.factB);
    });
  });
});
```

- [ ] Run `npm test` and confirm the first test FAILS (story currently a string).
- [ ] In `genMult`, replace the drill branch's `story:` value (both the medicine-path pick and the mentor line) with `null`. Keep `hint` unchanged.
- [ ] In `PatrolView.jsx`, wrap the story `<div>` (the one rendering `{current.story}`) in `{current.story && (...)}` so nothing renders (not even the empty spacing block) when story is null.
- [ ] Run `npm test`. Expected: all pass.
- [ ] Run `npm run build`. Expected: clean build.
- [ ] Commit: `feat: quiet drills, no preamble text on flashcard-style problems`

---

### Task B: Victory-lap SR resurfacing

**Files:**
- Modify: `src/engine/sr.js`
- Modify: `src/engine/generators.js` (pickMultPair, pickAddPair switch to selectFact)
- Test: `src/engine/sr.test.js` (create)

**Interfaces:**
- Produces: `applySRResult(entry, isCorrect, elapsedMs, now = Date.now())` stamps `promotedAt: now` when the bucket rises, deletes it when the bucket falls. New export `selectFact(candidates, sr, opts = {})` with `opts = { rng = Math.random, now = Date.now() }`; exported constants `VICTORY_LAP_CHANCE = 0.2`, `VICTORY_LAP_WINDOW_MS = 15 * 60 * 1000`.
- Consumers: generators call `selectFact(all, sr)` where they called `selectByBuckets(all, sr)`.

**Steps:**

- [ ] Write failing tests in `src/engine/sr.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  applySRResult, selectFact, SR_BUCKET,
  VICTORY_LAP_CHANCE, VICTORY_LAP_WINDOW_MS,
} from './sr.js';

const entry = (over = {}) => ({ bucket: SR_BUCKET.WILD, correctStreak: 0, seen: 0, lastSeenAt: null, ...over });

describe('promotedAt stamping', () => {
  it('stamps promotedAt on fast correct (promotion)', () => {
    const next = applySRResult(entry(), true, 2000, 1000);
    expect(next.bucket).toBe(SR_BUCKET.TRACKING);
    expect(next.promotedAt).toBe(1000);
  });
  it('does not stamp on slow correct (no promotion)', () => {
    const next = applySRResult(entry(), true, 6000, 1000);
    expect(next.bucket).toBe(SR_BUCKET.WILD);
    expect(next.promotedAt).toBeUndefined();
  });
  it('clears promotedAt on a miss', () => {
    const next = applySRResult(entry({ bucket: SR_BUCKET.TRACKING, promotedAt: 500 }), false, 2000, 1000);
    expect(next.promotedAt).toBeUndefined();
  });
});

describe('selectFact victory laps', () => {
  const now = 1_000_000;
  const sr = {
    'mult:7x8': { bucket: 'tracking', correctStreak: 1, seen: 3, lastSeenAt: now - 60_000, promotedAt: now - 60_000 },
    'mult:2x3': { bucket: 'trusted', correctStreak: 5, seen: 9, lastSeenAt: now - 1000 },
  };
  const candidates = ['mult:7x8', 'mult:2x3', 'mult:9x9'];

  it('picks a recently promoted, not-reseen fact when rng favors the lap', () => {
    const rng = () => 0.05; // below VICTORY_LAP_CHANCE
    expect(selectFact(candidates, sr, { rng, now })).toBe('mult:7x8');
  });
  it('falls back to bucket selection when rng skips the lap', () => {
    const picks = new Set();
    for (let i = 0; i < 300; i++) {
      picks.add(selectFact(candidates, sr, { rng: Math.random, now }));
    }
    expect(picks.size).toBeGreaterThan(1);
  });
  it('ignores facts already reseen since promotion', () => {
    const reseen = { 'mult:7x8': { ...sr['mult:7x8'], lastSeenAt: now - 10 } };
    const rng = () => 0.05;
    const got = selectFact(['mult:7x8', 'mult:9x9'], reseen, { rng, now });
    expect(['mult:7x8', 'mult:9x9']).toContain(got); // falls through to buckets
    // deterministic check: no lap candidates means bucket path; with rng always 0.05
    // the wild bucket wins, and only mult:9x9 is wild.
    expect(got).toBe('mult:9x9');
  });
  it('ignores promotions older than the window', () => {
    const stale = { 'mult:7x8': { ...sr['mult:7x8'], promotedAt: now - VICTORY_LAP_WINDOW_MS - 1, lastSeenAt: now - VICTORY_LAP_WINDOW_MS - 2 } };
    const rng = () => 0.05;
    expect(selectFact(['mult:7x8', 'mult:9x9'], stale, { rng, now })).toBe('mult:9x9');
  });
});
```

Note on the fallback tests: `selectByBuckets` consumes rng too. Thread the injected rng through `selectByBuckets(candidates, sr, rng = Math.random)` so a constant 0.05 rng lands in the Wild bucket branch deterministically. Keep its existing export signature backward compatible.

- [ ] Run `npm test`, confirm new tests FAIL.
- [ ] Implement in `sr.js`:

```js
export const VICTORY_LAP_CHANCE = 0.2;
export const VICTORY_LAP_WINDOW_MS = 15 * 60 * 1000;

// applySRResult gains (entry, isCorrect, elapsedMs, now = Date.now()):
//   - use `now` for lastSeenAt (replaces Date.now() inline)
//   - on promotion (bucket index increased): next.promotedAt = now
//   - on miss: delete next.promotedAt
// selectByBuckets(candidates, sr, rng = Math.random): replace Math.random calls with rng.
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
```

Also update the internal `pickRandom` uses inside `selectByBuckets` to use the passed rng.

- [ ] In `generators.js`, change `selectByBuckets(all, sr || {})` to `selectFact(all, sr || {})` in BOTH `pickMultPair` and `pickAddPair`, importing `selectFact` instead of (or alongside) `selectByBuckets`.
- [ ] `applySRResult` call site in `src/App.jsx` stays valid (the new `now` param has a default). Do not edit App.jsx in this task (Task I owns it).
- [ ] Run `npm test`. Expected: all pass.
- [ ] Commit: `feat: victory-lap resurfacing of recently promoted facts`

---

### Task C: Rest advisor (pacing engine)

**Files:**
- Create: `src/engine/pacing.js`
- Test: `src/engine/pacing.test.js`
- Modify: `src/data/flavor.js` (append REST_ADVICE pool)

**Interfaces:**
- Produces:
  - `median(nums)` -> number (null on empty)
  - `roundRecord(responseTimes, correct, total)` -> `{ medianMs, samples, correct, total }` (medianMs null when no samples)
  - `appendRound(sessionLog, dateString, record)` -> new sessionLog array (immutable, caps at 30 dated entries, appends `round` index 1-based)
  - `slowdownRound(rounds, { factor = 1.3, minSamples = 3 } = {})` -> 1-based round index or null
  - `typicalFatigueRound(sessionLog, todayDate)` -> integer or null (needs >= 2 past days with a slowdown; excludes today)
  - `restAdvice(sessionLog, todayDate, { rng = Math.random } = {})` -> `{ reason: 'slowdown' | 'schedule', message }` or null
  - `REST_ADVICE` flavor pool lives in `src/data/flavor.js` (8+ lines, in-lore, no clocks/numbers/guilt)
- Consumes: nothing outside `src/data/flavor.js`.

**sessionLog shape (also documented in the spec):**

```js
// profile.sessionLog = [
//   { date: 'Fri Jul 18 2026', rounds: [
//     { round: 1, medianMs: 4200, samples: 5, correct: 5, total: 5 },
//   ] },
// ]
```

**Steps:**

- [ ] Write failing tests in `src/engine/pacing.test.js` covering at minimum:

```js
import { describe, it, expect } from 'vitest';
import {
  median, roundRecord, appendRound, slowdownRound,
  typicalFatigueRound, restAdvice,
} from './pacing.js';

const r = (round, medianMs, samples = 5) => ({ round, medianMs, samples, correct: 4, total: 5 });

describe('median', () => {
  it('odd length', () => expect(median([5, 1, 3])).toBe(3));
  it('even length averages middles', () => expect(median([1, 2, 3, 4])).toBe(2.5));
  it('empty is null', () => expect(median([])).toBeNull());
});

describe('slowdownRound', () => {
  it('null when speeds keep improving', () => {
    expect(slowdownRound([r(1, 5000), r(2, 4000), r(3, 3500)])).toBeNull();
  });
  it('finds first round 30% above best-so-far', () => {
    expect(slowdownRound([r(1, 4000), r(2, 3000), r(3, 4200)])).toBe(3);
  });
  it('ignores rounds with too few samples', () => {
    expect(slowdownRound([r(1, 4000), r(2, 3000), { ...r(3, 9000), samples: 1 }])).toBeNull();
  });
  it('needs a prior baseline round', () => {
    expect(slowdownRound([r(1, 9000)])).toBeNull();
  });
});

describe('typicalFatigueRound', () => {
  const day = (date, rounds) => ({ date, rounds });
  it('median of past slowdown rounds, excluding today', () => {
    const log = [
      day('Mon Jul 13 2026', [r(1, 4000), r(2, 3000), r(3, 4200)]), // slowdown at 3
      day('Tue Jul 14 2026', [r(1, 4000), r(2, 3000), r(3, 3100), r(4, 4200)]), // at 4
      day('Wed Jul 15 2026', [r(1, 4000), r(2, 5600)]), // at 2
      day('Fri Jul 18 2026', [r(1, 4000)]),
    ];
    expect(typicalFatigueRound(log, 'Fri Jul 18 2026')).toBe(3);
  });
  it('null with fewer than two informative past days', () => {
    const log = [day('Mon Jul 13 2026', [r(1, 4000), r(2, 4200)])];
    expect(typicalFatigueRound(log, 'Fri Jul 18 2026')).toBeNull();
  });
});

describe('restAdvice', () => {
  const history = [
    { date: 'Mon Jul 13 2026', rounds: [r(1, 4000), r(2, 3000), r(3, 4200)] },
    { date: 'Tue Jul 14 2026', rounds: [r(1, 4000), r(2, 5600)] },
  ];
  it('slowdown today wins', () => {
    const log = [...history, { date: 'Fri Jul 18 2026', rounds: [r(1, 3000), r(2, 4100)] }];
    const advice = restAdvice(log, 'Fri Jul 18 2026');
    expect(advice.reason).toBe('slowdown');
    expect(typeof advice.message).toBe('string');
  });
  it('schedule advice one round before the typical fatigue round', () => {
    // typical fatigue round from history = median(3, 2) = 2.5 -> rounds to 3? Use floor: 2.
    // Design decision: typicalFatigueRound rounds DOWN (conservative, rest earlier).
    const log = [...history, { date: 'Fri Jul 18 2026', rounds: [r(1, 3000)] }];
    const advice = restAdvice(log, 'Fri Jul 18 2026');
    expect(advice.reason).toBe('schedule');
  });
  it('null early in a fresh session with no history', () => {
    expect(restAdvice([{ date: 'Fri Jul 18 2026', rounds: [r(1, 3000)] }], 'Fri Jul 18 2026')).toBeNull();
  });
  it('message has no digits and no time words', () => {
    const log = [...history, { date: 'Fri Jul 18 2026', rounds: [r(1, 3000), r(2, 4100)] }];
    const advice = restAdvice(log, 'Fri Jul 18 2026');
    expect(advice.message).not.toMatch(/\d|minute|hour|clock|timer/i);
  });
});
```

Also test `appendRound` (appends with 1-based round index, immutability, 30-entry cap dropping oldest) and `roundRecord` (median computed, null-safe on empty times).

- [ ] Run `npm test`, confirm FAIL (module missing).
- [ ] Implement `src/engine/pacing.js` as pure functions. Rules locked by tests:
  - `slowdownRound`: walk rounds in order; track best (lowest) medianMs seen so far among rounds with `samples >= minSamples` and non-null medianMs; the first later qualifying round with `medianMs > factor * bestSoFar` is the slowdown round. A slowdown needs at least one prior qualifying baseline round.
  - `typicalFatigueRound`: `Math.floor(median(...))` of past days' slowdown rounds, excluding the entry whose `date === todayDate`; null unless >= 2 past days have a slowdown.
  - `restAdvice(sessionLog, todayDate, { rng })`: find today's entry; if `slowdownRound(today.rounds)` equals today's LAST round index, return reason `'slowdown'`. Else if `typicalFatigueRound` is T and `today.rounds.length + 1 >= T`, return `'schedule'` (the next round would hit the typical fatigue point, so suggest resting one round early). Else null. Message: `pick from REST_ADVICE` using rng.
- [ ] Add `REST_ADVICE` to `src/data/flavor.js` (export const, 8+ lines). Tone examples (write your own set, matching book voice): "The sun dips below the trees. The swiftest hunters return to camp while their paws are still quick." / "Your mentor nods toward the den. Rest is part of training too." No digits, no urgency.
- [ ] Run `npm test`. Expected: all pass.
- [ ] Commit: `feat: pacing engine, learns the usual slowdown round and advises rest`

---

### Task D: Sync server + client + deploy docs

**Files:**
- Create: `server/server.js`, `server/README.md`
- Create: `src/storage/sync.js`
- Test: `server/server.test.js`, `src/storage/sync.test.js`
- Modify: `vite.config.js` (dev proxy `/api` -> `http://localhost:8787`)
- Modify: `DEPLOY.md` (new section: sync service + Caddy handle block + systemd unit)

**Interfaces:**
- Produces (server): `POST /api/sync` JSON `{ key, profile }` -> `{ ok: true }`; `GET /api/tutor/<key>` -> `{ updatedAt, profile }` or 404 `{ error }`. Key regex `^[a-z0-9][a-z0-9-]{7,63}$`. 1 MB body cap (413 over). 400 on bad JSON/key. Env: `PORT` (8787), `DATA_DIR`. Exports `createServer({ dataDir })` returning a `node:http` server (so tests can listen on port 0), plus a `if (import.meta.url === ...)` main guard to start listening.
- Produces (client `src/storage/sync.js`):
  - `newSyncKey(profile, rng = Math.random)` -> e.g. `moss-x7k2p9q4w1` (lowercased prefix + 10 base36 chars, always matches the server regex; strip non a-z0-9 from prefix, fall back to `cat`)
  - `syncProfile(key, profile, fetchFn = fetch)` -> Promise<boolean> (true on ok response; NEVER throws; false on any error; no-op false when key falsy)
  - `tutorLink(key, origin)` -> `${origin}/?tutor=${key}`
- Consumes: nothing from other tasks.

**Steps:**

- [ ] Write failing server tests in `server/server.test.js` (vitest, real HTTP against `createServer` listening on an ephemeral port, `DATA_DIR` in a temp dir via `fs.mkdtempSync(path.join(os.tmpdir(), 'wp-sync-'))`):
  - round trip: POST `/api/sync` with `{ key: 'moss-abcdefgh', profile: { prefix: 'Moss' } }` -> 200 `{ ok: true }`; GET `/api/tutor/moss-abcdefgh` -> 200, `profile.prefix === 'Moss'`, `updatedAt` is ISO string.
  - overwrite: second POST replaces the first (GET returns the newer profile).
  - bad key (`'UPPER!!'`, `'ab'`) -> 400; GET unknown key -> 404.
  - non-JSON body -> 400. Body over 1 MB -> 413.
  - GET `/api/tutor/../etc/passwd`-style key -> 400 (regex rejects, no path traversal).
  - CORS: responses carry `Access-Control-Allow-Origin: *`; OPTIONS preflight returns 204 with allow headers.
- [ ] Run `npm test`, confirm FAIL.
- [ ] Implement `server/server.js` (~150 lines, `node:http` + `node:fs/promises` + `node:path` + `node:crypto` only). Atomic write: write `<key>.json.tmp` then `rename`. Never serve or list the data directory. JSON responses only.
- [ ] Write failing client tests in `src/storage/sync.test.js`:
  - `newSyncKey({ prefix: 'Moss' })` matches `^[a-z0-9][a-z0-9-]{7,63}$`; two calls differ; weird prefix (`'Ötzi!'`) still yields a valid key.
  - `syncProfile` posts to `/api/sync` with JSON body containing key and profile (assert via injected fake fetch), returns true on `{ ok: true }` 200.
  - `syncProfile` returns false (does not throw) when fetch rejects, and false when key is empty.
  - `tutorLink('abc-12345678', 'https://example.com')` -> `'https://example.com/?tutor=abc-12345678'`.
- [ ] Implement `src/storage/sync.js`. No imports from React or other app modules.
- [ ] Add the vite dev proxy in `vite.config.js`:

```js
server: { proxy: { '/api': 'http://localhost:8787' } },
```

- [ ] Update `DEPLOY.md`: new "Tutor sync service" section: run `node server/server.js` under systemd as the `warriors` user (unit file inline), `DATA_DIR=/srv/warriors-path-data` (create, `chmod 700`, owned by `warriors`), Caddy addition inside the existing `:80` block:

```
handle /api/* {
  reverse_proxy 127.0.0.1:8787
}
```

  Note explicitly: deploying the sync service is a manual step by dad; the GitHub Action only ships static files.
- [ ] Create `server/README.md`: what it is, endpoints, how to run locally (`node server/server.js` + `npm run dev`), storage layout, privacy note (key is the capability; keep the tutor link private).
- [ ] Run `npm test` and `npm run build`. Expected: green.
- [ ] Commit: `feat: tutor sync server, client sync module, deploy docs`

---

### Task E: Tutor dashboard view

**Files:**
- Create: `src/components/views/TutorView.jsx`
- Create: `src/engine/tutorReport.js`
- Test: `src/engine/tutorReport.test.js`

**Interfaces:**
- Consumes: fetched document `{ updatedAt, profile }` from `GET /api/tutor/<key>` (Task D shapes it; profile fields per `src/App.jsx` newProfile + `sessionLog` from Task C + `factsSR` entries `{ bucket, correctStreak, seen, lastSeenAt, promotedAt? }`).
- Produces:
  - `tutorReport(profile, now = Date.now())` in `src/engine/tutorReport.js` -> plain object the view renders:

```js
{
  accuracy: 0.87,            // totalCorrect / totalAttempted, null when 0 attempts
  multGrid: [{ a: 2, b: 2, id: 'mult:2x2', bucket: 'wild'|'tracking'|'trusted'|'unseen', correctStreak, seen }...],
  buckets: { mult: { unseen, wild, tracking, trusted }, add: {...}, sub: {...} },
  recentWins: [{ id, label: '7 × 8', promotedAt }...],   // promotedAt within 48h, newest first
  speedByDay: [{ date, rounds: [{ round, medianMs, samples }] }...],  // last 7 dated entries
  typicalFatigueRound: 3 | null,
}
```

  - `TutorView({ tutorKey })` React component: fetches `/api/tutor/${tutorKey}` on mount; states: loading, error ("No data found for this link yet..."), loaded. Read-only, no mutations.
- The view reuses `styles` from `src/components/shared/styles.js` and the dark palette; wording is adult-plain English (the tutor is not playing the game), but keep the theme.

**Steps:**

- [ ] Write failing tests in `src/engine/tutorReport.test.js`:
  - accuracy math and null-when-zero-attempts.
  - multGrid covers exactly the 66 normalized pairs (2..12, a <= b) and marks untracked facts `'unseen'`.
  - recentWins includes a fact promoted 1h ago, excludes 3 days ago, sorted newest first, labels use the ×-symbol form from the id.
  - buckets counts add up (mult: unseen + wild + tracking + trusted === 66).
  - speedByDay returns at most the last 7 entries of sessionLog, mapped to `{ date, rounds }` with medianMs/samples only.
  - typicalFatigueRound delegates to pacing (`typicalFatigueRound(sessionLog, todayDate)` with today = `new Date(now).toDateString()`).
- [ ] Run `npm test`, confirm FAIL.
- [ ] Implement `src/engine/tutorReport.js` (pure; may import from `./sr.js` and `./pacing.js`).
- [ ] Implement `src/components/views/TutorView.jsx`:
  - Sections in order: header (name via `getFullName`, Clan, rank, "updated <local date string>"), stat row (reuse `StatCard`: ACCURACY, CORRECT, STREAK), multiplication grid (11x11 CSS grid of cells colored by bucket: unseen `#1a2419`, wild `#7a4a3a`, tracking `#8a7a3a`, trusted `#3a6a4a`; cell shows `a×b`; legend underneath), RECENT WINS list, SPEED BY SESSION table (date rows, per-round medians rendered as seconds with one decimal, e.g. `4.2s`, and the note "Times are internal only; the player never sees them."), and typical-fatigue line when known ("Speed usually stops improving around round N; the game suggests rest one round earlier.").
  - No timers, no auto-refresh. A "refresh" text button re-fetches.
- [ ] Run `npm run build`. Expected: clean (view not yet routed; that is Task I).
- [ ] Commit: `feat: read-only tutor dashboard view and report builder`

---

### Task F: Migration + save-shape updates

**Files:**
- Modify: `src/engine/sr.js` (SAVE_VERSION 14 -> 15) [coordinate: tiny change, done here]
- Modify: `src/engine/migration.js` (preserve sessionLog)
- Test: `src/engine/migration.test.js` (create)
- Delete: `src/engine/smoke.test.js`

**Interfaces:**
- Produces: `normalizeProfile` output gains `sessionLog: raw.sessionLog when array else []`. factsSR entries continue to pass through untouched (promotedAt survives by existing behavior; add a test proving it).

**Steps:**

- [ ] Write failing tests in `src/engine/migration.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { normalizeProfile } from './migration.js';

describe('v15 migration', () => {
  it('preserves sessionLog', () => {
    const log = [{ date: 'Fri Jul 18 2026', rounds: [{ round: 1, medianMs: 4000, samples: 5, correct: 5, total: 5 }] }];
    expect(normalizeProfile({ prefix: 'Moss', sessionLog: log }).sessionLog).toEqual(log);
  });
  it('defaults sessionLog to empty array', () => {
    expect(normalizeProfile({ prefix: 'Moss' }).sessionLog).toEqual([]);
  });
  it('passes factsSR entries through untouched, promotedAt included', () => {
    const sr = { 'mult:7x8': { bucket: 'tracking', correctStreak: 1, seen: 2, lastSeenAt: 5, promotedAt: 5 } };
    expect(normalizeProfile({ prefix: 'Moss', factsSR: sr }).factsSR).toEqual(sr);
  });
  it('stamps _version 15', () => {
    expect(normalizeProfile({ prefix: 'Moss' })._version).toBe(15);
  });
  it('still normalizes an old v12-style save', () => {
    const p = normalizeProfile({ prefix: 'Spider', highestRank: 'Warrior', totalCorrect: 80 });
    expect(p.rank).toBe('Young Warrior');
    expect(p.rankFloor).toBeGreaterThanOrEqual(80);
  });
});
```

- [ ] Run `npm test`, confirm FAIL.
- [ ] Set `SAVE_VERSION = 15` in sr.js; add `sessionLog: Array.isArray(raw.sessionLog) ? raw.sessionLog : []` to normalizeProfile's returned object.
- [ ] Delete `src/engine/smoke.test.js`.
- [ ] Run `npm test`. Expected: all pass.
- [ ] Commit: `feat: save version 15, sessionLog preserved through migration`

---

### Task I: Integration (main session only, after A-F merge)

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/views/CompleteView.jsx` (advice line prop)
- Modify: `src/components/views/DenView.jsx` (share panel props + UI)
- Modify: `src/main.jsx` only if the tutor route needs it (it should not; App handles it)

**Wiring list:**

1. Tutor route: at the top of `WarriorsPath()`, `const tutorKey = new URLSearchParams(window.location.search).get('tutor')`; if present and it matches `^[a-z0-9][a-z0-9-]{7,63}$`, `return <TutorView tutorKey={tutorKey} />` before any storage loading.
2. Response-time capture: patrol state gains `responseTimes: []`. In `onSubmit`, when `patrol.attempts === 0` and the problem has a `factId`, push `elapsedMs` (for both correct and wrong first attempts) into the patrol object being set.
3. `finishPatrol` additions, inside the `updateActive` mutator:
   - `const record = roundRecord(patrolRef.responseTimes, correct, patrolRef.problems.length)`
   - `next.sessionLog = appendRound(p.sessionLog || [], today, record)`
4. Rest advice: after the mutator returns `updated`, compute `const advice = adviceShownToday ? null : restAdvice(updated.sessionLog, today)`; store in state `restNote`; pass `restNote` into CompleteView; set `adviceShownToday` true when non-null. `adviceShownToday` is plain component state.
5. CompleteView renders `restNote.message` (italic, muted, under the score block) when present. No button changes.
6. Sync push: in `finishPatrol` after persist, `if (container?.sync?.enabled && container.sync.key) syncProfile(container.sync.key, updatedProfile)` fire-and-forget (not awaited).
7. Den share panel (Keeper of the Scroll section): "share with a mentor" toggle button. Enabling: generate `newSyncKey(profile)`, persist `container.sync = { enabled: true, key }`, immediately `syncProfile`. Enabled state shows the tutor link text (`tutorLink(key, window.location.origin)`), a copy button (`navigator.clipboard.writeText`, fallback: select-on-tap text input), and "stop sharing" (sets `enabled: false`, keeps key so re-enabling restores the same link).
8. SAVE_VERSION import in App.jsx already exists for new profiles; new profiles created in CharacterCreation get `sessionLog: []`.

**Steps:**

- [ ] Implement wiring 1-8.
- [ ] `npm test` green, `npm run build` green.
- [ ] Manual pass: `node server/server.js` + `npm run dev`; play a training patrol; verify quiet drills, no story preamble; enable sharing in den; complete a patrol; open the tutor link in a private window; dashboard renders live data.
- [ ] Commit: `feat: wire pacing, rest advice, sync, and tutor route into the app`

---

### Task Q: QA loop (main session orchestrates)

- [ ] Dispatch parallel QA agents (fresh eyes, no implementation context) over: engine correctness, App.jsx wiring, server security/robustness, UI/UX + lore constraints, save-compat. Each returns findings with file:line and a concrete failure scenario.
- [ ] Verify each finding (reproduce or refute), fix confirmed bugs test-first where the bug is in tested code.
- [ ] Loop: re-dispatch QA on the diff until a round returns zero confirmed bugs.
- [ ] Final gate: `npm test`, `npm run build`, manual dev-server smoke.

### Task Z: Docs + release bookkeeping

- [ ] ROADMAP.md: move tutor-sync out of backlog into Shipped (note the accounts version stays deferred); add shipped notes for quiet drills, victory laps, rest advisor.
- [ ] CHANGELOG.md: v15.1 entry (four features, save v15).
- [ ] CLAUDE.md: update At-a-glance (version, sync service exists), architecture bullet (server/), SR section (promotedAt, victory laps), add sessionLog to the save-shape notes, note the tutor route.
- [ ] DAUGHTER_NOTES.md: do NOT log these as her items (they are tutor/dad requests); no change unless she reacts later.
- [ ] Commit: `docs: roadmap, changelog, CLAUDE.md for v15.1 tutor update`
