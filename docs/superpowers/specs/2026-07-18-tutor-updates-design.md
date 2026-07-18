# Tutor-Informed Updates: Design (2026-07-18)

Four changes requested by dad after the tutor watched play sessions. The tutor's
observations, in dad's words:

1. Text before a math question adds unnecessary cognitive load when the
   problem is a pure drill (flashcard-style).
2. Reward known answers: when she has just gotten a fact right (or just got
   better at it), let it come back soon. "Oh yes! I remember this!" is itself
   a reward, so repetition should not only target struggle.
3. Main goal right now: multiplication speed. Encourage speed growth across
   rounds, and learn when cognitive fatigue usually sets in so the game can
   suggest stopping one round early.
4. A quick, easy way to share progress data with the tutor: sync to the cloud
   so the tutor can view it.

Constraints from CLAUDE.md that shape everything below:

- No visible timers, ever. All timing stays internal. Rest suggestions must be
  gentle, in-lore, and never blocking or urgent.
- Save data is sacred: additive migrations only. `normalizeProfile` is a
  whitelist rebuild that runs on every load, so every new profile field MUST be
  added there or it will be silently stripped.
- Book-faithful flavor, no generic praise, no nagging.
- Cloud saves were deferred pending explicit request. Dad has now explicitly
  requested tutor-facing cloud sync, so a minimal backend is in scope. We build
  the smallest thing that shares data, not the full accounts system from
  ROADMAP (no passwords, no login view, no multi-device restore).

## Feature 1: Quiet drills

Today `genMult` emits `kind: 'mult-drill'` 70% of the time with a story line
("Your mentor drills you on counting strokes") rendered above the question.
That line carries no information and is exactly the load the tutor flagged.

Change:

- Drill problems (`mult-drill`) get `story: null`. Word problems keep their
  story because there the story IS the problem.
- `PatrolView` renders the story block only when `current.story` is truthy.
- The med-cat drill preamble (`MEDCAT_TRAINING_FLAVOR`) is likewise dropped for
  drills. Flavor still appears where it belongs: in the reward feedback after
  the answer, which is unchanged.
- Her player-authored fact stories (the "YOUR STORY" box) still show. That box
  is her own mnemonic, appears only on facts she struggled with, and removing
  it would undercut a shipped feature she uses. Logged as a deliberate
  exception to "no text before drills."

## Feature 2: Victory laps (reward known answers)

Today selection is bucket-weighted (Wild 60 / Tracking 30 / Trusted 10), which
systematically starves recently-improved facts of airtime.

Change, in `src/engine/sr.js`:

- `applySRResult` stamps `promotedAt` (ms timestamp) on the entry whenever the
  bucket moves UP. Demotion clears it.
- New export `selectFact(candidates, sr, opts)` used by the generators instead
  of raw `selectByBuckets`:
  - With probability `VICTORY_LAP_CHANCE = 0.2`, look for "victory lap"
    candidates: facts with `promotedAt` within `VICTORY_LAP_WINDOW_MS`
    (15 minutes) that have not been shown since the promotion
    (`lastSeenAt <= promotedAt`). Pick one at random.
  - Otherwise (or if none qualify), fall back to `selectByBuckets`.
- `opts` accepts `rng` and `now` for deterministic tests; defaults are
  `Math.random` and `Date.now`.
- Both `pickMultPair` and `pickAddPair` in `generators.js` switch to
  `selectFact`.

Because showing the fact updates `lastSeenAt`, a promoted fact gets at most one
victory lap per promotion. No schema migration needed beyond tolerating the
extra `promotedAt` key (factsSR entries are passed through as-is).

## Feature 3: Rest advisor (fatigue-aware pacing)

Goal: learn when her per-round speed usually stops improving and gently
suggest ending the session one round before that point. Never a timer, never a
lockout, never urgency. Just the mentor suggesting rest, at patrol END only.

Data capture:

- During a patrol, record `elapsedMs` for every FIRST-ATTEMPT answer on
  fact-tracked problems (correct or not, attempt pressure differs on retries)
  into `patrol.responseTimes`.
- On `finishPatrol`, compute the round's median response time and append
  `{ round, medianMs, correct, total, samples }` to today's entry in a new
  profile field `sessionLog`:
  `sessionLog = [{ date: 'Fri Jul 18 2026', rounds: [...] }, ...]`, capped at
  the most recent 30 dated entries. Added to `normalizeProfile` (defaults to
  `[]`, preserved on load).

New module `src/engine/pacing.js`, pure functions with injectable inputs:

- `median(numbers)`.
- `slowdownRound(rounds)`: given one day's round list, return the 1-based index
  of the first round whose median is more than `SLOWDOWN_FACTOR = 1.3` above
  the best (lowest) median of the earlier rounds that day, considering only
  rounds with `samples >= 3`. Returns null if none.
- `typicalFatigueRound(sessionLog)`: median of `slowdownRound` across past days
  that have one (needs at least 2 such days, else null).
- `restAdvice(sessionLog, today)`: called after a round completes. Returns
  `null` or `{ reason: 'slowdown' | 'schedule', message }`:
  - `'slowdown'` if today's just-finished round itself triggers
    `slowdownRound` (she has already slowed; suggest rest now).
  - `'schedule'` if `typicalFatigueRound` is known and the NEXT round would be
    that round (this is the "stop one round early" behavior).
  - Messages are drawn from a small pool of in-lore lines, e.g. "The sun dips
    below the trees. Even the swiftest hunters return to camp while their paws
    are still quick." No numbers, no clocks, no guilt.

Surfacing: `CompleteView` shows the advice line under the score when present.
The RETURN TO CAMP button is unchanged; nothing is disabled. If she keeps
playing anyway, the game says nothing further that day (advice shows at most
once per day, tracked in component state passed from App, not persisted).

## Feature 4: Cloud sync + tutor view

Smallest useful backend, per ROADMAP's philosophy but scoped to tutor sharing:

Server (`server/server.js`, plain `node:http`, zero dependencies, ~150 lines):

- `POST /api/sync` body `{ key, profile }`. Key must match
  `^[a-z0-9][a-z0-9-]{7,63}$`. Stores
  `DATA_DIR/<key>.json` as `{ updatedAt, profile }` (atomic tmp+rename write).
  1 MB body cap. Returns `{ ok: true }`.
- `GET /api/tutor/<key>` returns the stored document or 404.
- JSON file per key, no database. One kid, tiny payloads; SQLite stays on
  ROADMAP for real cloud saves.
- CORS: permissive (`Access-Control-Allow-Origin: *`); the key is the
  capability. Keys are generated client-side with ~40 bits of randomness and
  never listed by the server (no enumeration endpoint).
- Config via env: `PORT` (default 8787), `DATA_DIR` (default
  `/srv/warriors-path-data`).
- Deploy: systemd unit + Caddy `handle /api/*` reverse-proxy block documented
  in DEPLOY.md. Dad deploys; nothing in this repo auto-deploys the server.

Client (`src/storage/sync.js`):

- Container-level (not per-slot) sync settings: `container.sync =
  { enabled: true, key }`. Container is not run through `normalizeProfile`, so
  the field survives loads; `loadSavesContainer` untouched.
- `newSyncKey(profile)` generates a readable key like `moss-7k2p9xq4w1`.
- `syncProfile(key, profile)`: fire-and-forget `fetch('/api/sync', ...)`,
  same-origin, swallow all errors (offline, artifact runtime, dev without
  server). Called from `finishPatrol` after persist, and when sharing is first
  enabled.
- Den gets a small "SHARE WITH A MENTOR" section in the existing Keeper of the
  Scroll area: enable/disable, and when enabled shows the tutor link
  (`<origin>/?tutor=<key>`) with a copy button.

Tutor dashboard (`src/components/views/TutorView.jsx`):

- App.jsx checks `location.search` for `?tutor=<key>` on load, before storage,
  and renders TutorView exclusively (tutor's browser has no saves).
- Fetches `/api/tutor/<key>`, then shows, dark-theme consistent with the game
  but adult-plain in wording:
  - Header: cat name, Clan, rank, last-updated time.
  - Totals: correct/attempted, accuracy, current streak, patrols today.
  - Multiplication mastery grid: 2..12 by 2..12 cells colored by SR bucket
    (Wild/Tracking/Trusted, with a legend), tooltip-ish cell text showing
    streak and seen count.
  - Speed by round: per-day round medians from `sessionLog` as a simple table
    (last 7 days), plus the current `typicalFatigueRound` if known.
  - Recently promoted facts (promotedAt within 48h): the "wins" list.
  - Addition/subtraction fact summary counts by bucket.
- Read-only. No controls that mutate anything.

Dev ergonomics: `vite.config.js` gets a dev-server proxy for `/api` to
`localhost:8787` so `npm run dev` + `node server/server.js` work together.

## Versioning and migration

- `SAVE_VERSION` bumps 14 -> 15. Additive only: `sessionLog` on profiles
  (default `[]`), optional `promotedAt` inside factsSR entries, optional
  `sync` on the container. `normalizeProfile` preserves `sessionLog` and keeps
  passing factsSR entries through untouched. No legacy-key changes.
- package.json version: 15.0.0-a -> 15.1.0.

## Testing

Vitest (new devDependency; `npm test` script). Node environment, no jsdom
needed for engine/server tests.

- `src/engine/sr.test.js`: promotion stamps promotedAt, demotion clears it,
  victory-lap selection honors window/lastSeenAt/rng, fallback path.
- `src/engine/pacing.test.js`: median, slowdownRound edge cases (too few
  samples, monotone improvement, spike then recovery), typicalFatigueRound,
  restAdvice reasons and one-per-day gating logic contract.
- `src/engine/generators.test.js`: drills carry story null, word problems
  carry story text.
- `src/engine/migration.test.js`: sessionLog preserved, defaults applied, old
  saves still normalize.
- `server/server.test.js`: sync then read round-trip, bad key rejected, 404 on
  unknown, body cap, atomicity (tmp files cleaned).

UI changes (PatrolView conditional, CompleteView advice line, Den panel,
TutorView) are verified by build + QA agent review + a manual dev-server pass;
no component test harness is being introduced in this change.

## Out of scope

- Accounts, passwords, multi-device save restore (ROADMAP cloud saves stays).
- Mastery-gated topics (v15b) remains the next feature; nothing here blocks it.
- Any change to how wrong answers are treated, ceremonies, ranks, or rewards.
