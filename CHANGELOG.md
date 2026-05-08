# Changelog

All notable changes to Warrior's Path are recorded here. The format is loosely
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

For shipped vs planned features see [`ROADMAP.md`](./ROADMAP.md).
For player-feedback history see [`DAUGHTER_NOTES.md`](./DAUGHTER_NOTES.md).
For design philosophy see [`CLAUDE.md`](./CLAUDE.md).

---

## [Unreleased]

### Planned
- v15b — mastery-gated topic progression. Topics unlock by demonstrated
  competence (≥70% Tracking+ for unlock, ≥80% Trusted for mastery), not by
  rank or time spent.
- Achievements / gamification system. Field-guide collectibles. Story log.

---

## [v15.0.0-d] — 2026-05-08

### Changed
- **Per-kind adaptive SR thresholds.** The original 4s/7s SR gates were
  calibrated for memorized fluency drills (×, +). Compute-heavy problems
  (large add/sub, geometry, fractions, time-duration) cannot be answered
  in 4s by ANY 3rd grader, so under the old global gate they never promoted
  past Wild — the SR engine stopped doing useful work the moment the patrol
  topic wasn't pure facts. Each problem kind now has its own threshold;
  compute-heavy kinds (`speedPromotes:false`) promote on a 3-correct streak
  instead of speed.
- **Per-child personal-fast calibration.** Once a player has ≥20 correct
  samples for a kind, her own P25 of that distribution becomes the personal
  "fast" threshold. Each kid calibrates herself rather than fighting a
  fixed gate.
- `applySRResult` signature extended: `(entry, isCorrect, elapsedMs, kind,
  personalFastMs)`. Old call sites without `kind` fall back to the legacy
  4-second gate.

### Added
- `KIND_THRESHOLDS` map in `src/engine/sr.js` with `fast` / `ok` /
  `speedPromotes` for each problem kind: mult-drill, mult-word, add-small,
  sub-small, add-large, sub-large, geometry, fraction, time-clock,
  time-duration, time-future.
- `personalThreshold(profile, kind)` and `appendSample(kindSamples, kind, ms)`
  helpers in `src/engine/sr.js`.
- New `factId` formats so EVERY problem now produces a fact-tracked SR row:
  `sub:a-b` (small subtraction by pair), `sub:large` / `add:large` (coarse
  buckets for two-digit computation), `geo:perimeter:scale` /
  `geo:area:scale` (scale ∈ small|medium|large), `frac:half` / `frac:third`
  / `frac:quarter` / `frac:fifth`, `time:clock:grain` /
  `time:duration:grain` / `time:future:grain`.
- `parseFactId` extended to return structured `{ kind, ... }` for each new
  format (e.g. `parseFactId('frac:third') → { kind: 'frac', denom: 3,
  name: 'third' }`) so the parent dashboard can label every row.
- `kindSamples` field on the profile — per-kind ring buffer of the last 50
  correct-answer elapsed-ms values, used for personal-fast calibration.
- `pickGrain` now returns `{ name, values }` so time generators can thread
  the grain into the factId.

### Migration
- `SAVE_VERSION` bumped to 17. Migration is **additive** — old saves
  receive `kindSamples: {}` and lose nothing. Existing `factsSR` entries
  for `mult:*` and `add:*` keep working unchanged; the new id formats
  populate as the player completes problems.

---

## [v15.0.0-c] — 2026-05-08

### Fixed
- **Strategy hints no longer give the answer.** Previous "MENTOR'S STRATEGY"
  lines collapsed to the answer (e.g. ×2 said "${b} doubled is ${b * 2}",
  hard decompositions ended in `= 42` / `= 56` / etc., ×11 wrote the digit
  twice as the literal product). Rewrites teach the path without computing
  the destination — the player still has to walk it.
- **First-pass hints replaced with substantive procedural guidance.** Old
  hints like `Add the numbers.`, `Tens first, then ones.`, and
  `Subtract carefully — borrow if needed.` were too thin to teach. New hints
  walk the player through count-up-from / make-a-ten / column-with-borrow
  reasoning.

### Added
- **Hidden parent dashboard** (the "Keeper's Record"). Discreet ornament at
  the bottom of the Den view opens a stats screen the daughter doesn't
  notice. Sections: lifetime overview, by-topic accuracy + avg time, speed
  histogram (correct-answer time buckets to validate the 4s/7s SR
  thresholds), per-fact breakdown (sortable by hardest / slowest / most
  seen / recent / fact), recent patrols (last 20 with hints / strategies /
  reveals per patrol).
- Per-fact analytics now persisted in `factsSR`: `correctCount`,
  `wrongCount`, `totalElapsedMs`, `totalCorrectMs`, `firstSeenAt`.
- `topicStats` keyed by topic — covers geometry / fractions / time
  (non-SR-tracked topics) so the dashboard reports them too.
- `patrolHistory` (rolling last 200) — start/end timestamps, duration,
  topic, score, hint / strategy / reveal counts per patrol.
- `elapsedHistogram` — bucketed correct-answer times across all problems
  for threshold calibration.
- `bestStreak` field tracks the all-time best daily streak.

### Changed
- `SAVE_VERSION` bumped to 16. Migration is **additive** — old saves
  receive zero-value defaults for the new analytics fields and lose no
  data.

---

## [v15.0.0-b] — 2026-04-28

### Added
- **Vigil patrol** — fifth patrol covering 3rd-grade time. Three problem
  kinds: clock reading (analog `ClockFace` SVG framed as the "twoleg
  sun-face" elders learned to read), duration ("vigil began at 9:35,
  ended at 11:00 — how long?"), and time addition ("Gathering at 6:30,
  journey takes 1:35 — when do you set off?"). Difficulty grain
  (hour / half / quarter / 5-min / any) ramps lightly with totalCorrect.
  Reward = "VIGIL HELD" (no item caught, like Border).
- `VIGIL_FLAVOR` pool (32 lines) of silent night-watch lines.
- `ClockFace` component in `src/components/art/`. Weathered dark face,
  brass-colored hands tinted by Clan accent.
- HH:MM input via two number boxes in `PatrolView` for time problems.

### Changed
- `SAVE_VERSION` bumped to 15. Migration is non-destructive — no profile
  schema change (vigils tracked per-patrol like borders/training, not on
  the profile).

---

## [v15a] — 2026-04-25

### Added
- `LICENSE` — full **PolyForm Noncommercial 1.0.0** license text, plus a
  third-party-IP NOTICE for the Warrior Cats book series (Erin Hunter /
  Working Partners / HarperCollins), plus a commercial-licensing-contact
  NOTICE. The project is source-available for personal, educational, and
  noncommercial use; commercial use requires a separate license from the
  copyright holder.
- `package.json` — `license` field set to `"SEE LICENSE IN LICENSE"` (the
  npm-recognized way to point at a non-SPDX license file), plus
  `description`, `repository`, `homepage`, and `bugs` metadata.
- README License section rewritten in plain English to enumerate what's
  permitted and prohibited under PolyForm Noncommercial.
- Multi-file project structure under `src/` (33 modules across data, engine,
  storage, components/views, components/art, components/shared).
- Vite + React build pipeline (`npm run dev`, `npm run build`,
  `npm run preview`). Production bundle: ~226 KB raw, ~70 KB gzipped.
- GitHub Action at `.github/workflows/deploy.yml` for auto-deploy to VPS
  via rsync on push to `main`.
- Comprehensive documentation: `CLAUDE.md` (architecture + agent rules),
  `ROADMAP.md` (planned + deferred work), `IMAGES.md` (visual style guide
  + AI prompts), `SOUND.md` (opt-in audio plan), `DEPLOY.md` (VPS setup),
  `src/README-DEV.md`, this `CHANGELOG.md`.

### Changed
- `warriors-path.jsx` reduced from a 2,975-line monolith to a 19-line
  re-export shim (preserves the claude.ai artifact import path for backward
  compatibility).
- Migration logic now preserves real `totalCorrect` and stores rank-bar
  baseline in a separate `rankFloor` field. Fixes the v14.0 bug where the
  Freckleleap save displayed "60 of 35" instead of "32 of 35."

### Fixed
- Per-Clan accent palette: removed an alpha digit that had been added to
  WindClan's color, causing it to render as ghosted/transparent text.
  Lightened ShadowClan's deep violet so it reads against the dark
  background.

---

## [v14] — 2026-04-25

### Added
- Spaced-repetition system. Per-fact buckets: Wild (60% weight) / Tracking
  (30%) / Trusted (10%). Promotion on fast correct (<4s), demotion on miss.
- Player-authored fact stories. After a correct answer on a hard fact, the
  mentor invites the player to write a 200-character memory aid; that story
  is whispered before the fact reappears. Browseable / editable in a "story
  flashcards" view.
- Static strategy hint library covering ×2, ×4, ×5, ×9, ×10, ×11 patterns
  plus decomposition for 6×6, 6×7, 6×8, 6×9, 7×7, 7×8, 7×9, 8×8, 8×9, 9×9,
  11×11, 12×12. Surfaces automatically as "MENTOR'S STRATEGY" after the
  second miss. Addition strategies (doubles/near-doubles, +9, +10,
  make-a-ten) included.
- SVG illustrations: rank-aware cat portrait (smaller for kit/apprentice,
  shoulder stripe for deputy, star above head for leader, leaf collar for
  medicine cats). 13 prey-species icons. Generic herb icon. Per-Clan
  scenery banners.

---

## [v13.x] — 2026-04-25

### Changed
- Deputy and Leader promotions are now chance-gated (12% per patrol once
  eligible) rather than auto-promotion at threshold, matching book canon
  ("the leader names her deputy when the moment is right" /
  "the previous leader has gone to StarClan").
- Apprentice ceremony is now a two-step flow: choose path intent, then if
  medicine cat is chosen, walk to the medicine cat den to ask. The medicine
  cat accepts (70%) or kindly declines depending on her current apprentice
  status.
- Leader ceremony reframed: the medicine cat accompanies the new leader to
  the Moonstone for her first communion with StarClan, per book canon.
- Geometry locations expanded to 10 per Clan (was 10 ThunderClan, 7 others).
- Hawks restored to prey table at lowest weight after direct player feedback
  ("we like hawks too, sometimes also hunt hawks") — reversing earlier
  removal.

---

## [v13] — 2026-04-25

### Added
- Multi-slot save system. Slot list view, switch-character button in den,
  per-slot delete with confirm.
- Naming-ceremony arc per book canon: kit name from mother, apprentice
  ceremony assigns mentor and -paw suffix, warrior ceremony with
  player-chosen suffix (24 warrior + 14 medicine-cat suffix options + custom).
- Medicine cat path with its own rank ladder (Med Apprentice → Medicine Cat
  → Senior Medicine Cat). Cannot become Deputy or Leader.
- Border Patrol no longer catches prey. Reward = scent refreshed.
- Herb Patrol with 16-herb book-faithful list. Herbs tracked separately
  from prey.
- Flavor pools of 30+ lines each: PRAISE, PREY_FLAVOR, HERB_FLAVOR,
  BORDER_FLAVOR, TRAINING_FLAVOR, REVEAL_LINES.
- Slow progression: Apprentice → Young Warrior at 60 correct (was 30),
  Warrior at 150, Deputy at 280, Leader at 420.
- Migration function from v12 saves to v13 schema.

### Changed
- All Clan references capitalized.
- Patrol renamed: Herb Gathering → Herb Patrol.
- Clan descriptors rewritten per direct feedback (ShadowClan: "shadowed
  pines", WindClan: "swift cats of the open moor", etc.).
- StarClan phrasing softened ("walks with you" / "lights your path", never
  "is watching").
- Promotion language changed: "Promotion" → "Ceremony" everywhere.

### Removed
- "Two patrols return with prey" word problem framing (only one patrol
  returns at a time).
- "Fresh-kill pile depleted" word problem framing (cats hunt and eat
  promptly; pile doesn't deplete over days).

---

## [v12 patch] — earlier 2026

### Added
- Save export/import to JSON file. Profiles can be backed up to and restored
  from the player's filesystem.

---

## [v1 — v12] — 2026

Rapid father-daughter iteration. Game progresses Kit → Apprentice → Warrior.
The player earned Warrior on day 2. Single-file React artifact running inside
the claude.ai artifact runtime. Initial feedback collected in
`DAUGHTER_NOTES.md` triggered the v13 lore audit.
