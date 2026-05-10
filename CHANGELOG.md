# Changelog

All notable changes to Warrior's Path are recorded here. The format is loosely
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

For shipped vs planned features see [`ROADMAP.md`](./ROADMAP.md).
For player-feedback history see [`DAUGHTER_NOTES.md`](./DAUGHTER_NOTES.md).
For design philosophy see [`CLAUDE.md`](./CLAUDE.md).

---

## [Unreleased]

### Added — v15.0.0-h Phase 4 Field Guide
- **Hidden Field Guide (the elders' scroll).** Each topic the player MASTERS
  unlocks a one-page lore tidbit — a short story written in book-faithful
  voice that ties the math topic to a moment from the Warrior Cats books or
  a believable Clan tradition. Mastery = enough facts in that topic's SR
  pool in the Trusted bucket (5 for the big topics — mult / add / sub — and
  3 for the smaller id pools — geometry / fraction / time, tuned per
  id-pool size in src/engine/sr.js).
- **Six lore pages, one per topic.** Catalog in `src/data/fieldGuide.js`:
  - **Multiplication** — *How Lionheart Taught Firepaw to Count Strokes.*
    Lionheart drills the rhythm of strikes into a new apprentice; "the
    numbers live in your shoulders, not your head."
  - **Addition** — *The Day Goosefeather Counted the Returning Patrols.*
    The eccentric medicine cat lays a pebble for every cat who returns at
    sundown. *"A Clan that knows its number is a Clan that knows when one
    is missing."*
  - **Subtraction** — *Counting What Remains After the Long Cold.* The
    elders' leaf-bare tally of the prey pile, framed as the math of loss
    and the math of hope.
  - **Geometry** — *Why the Borders Are Walked Thrice.* Perimeter as the
    edge that must be refreshed; area as the cleared ground the apprentices
    practice on.
  - **Fractions** — *Yellowfang's Herb-Share, and the Rule of Equal Piles.*
    The medicine cat splits borage in halves, coltsfoot in thirds, marigold
    in quarters. *"A fraction is a promise of fairness."*
  - **Time** — *What the Elders Saw in the Twoleg Sun-Face.* A former
    kittypet explains the clock above the twoleg den; the elders teach the
    sun-face's marks to the apprentices alongside the real sun and moon.
- **FieldGuideView** — two-pane layout (sidebar of all 6 entries + selected
  page). Locked entries show their sealed state and a `N / threshold
  TRUSTED` progress count. Unlocked pages render the title in Cinzel,
  body in Crimson Text serif, with *italic* quotes preserved through a
  tiny in-file `*...*` parser. Topic glyphs are small inline-SVG ornaments
  matching the existing ⟡ aesthetic.
- **Den access.** New "⟡ FIELD GUIDE ⟡" button beneath the story
  flashcards button. Shows an unlock-count suffix `(X/6)` when at least
  one page is unlocked. Always visible — the player loves the books and
  the lore is the reward.
- **Engine is pure.** All unlock state is derived from `profile.factsSR`;
  no new persisted fields, no `SAVE_VERSION` bump (intentionally — parallel
  Phase 3 / Phase 5 agents may also add schema fields and we want one
  coordinated migration bump).

### Files
- `src/data/fieldGuide.js` (new) — catalog of 6 lore pages.
- `src/engine/fieldGuide.js` (new) — `isPageUnlocked`, `unlockProgress`,
  `unlockedPages`, `unlockedCount`, `fieldGuideEntries`.
- `src/components/views/FieldGuideView.jsx` (new) — two-pane sidebar + page.
- `src/App.jsx` — `fieldGuide` view route + `onOpenFieldGuide` prop on
  `DenView`.
- `src/components/views/DenView.jsx` — Field Guide button + unlock-count
  suffix.

### Added — v15.0.0-h Phase 3 achievements
- **Book-faithful "Honors" system.** Twenty named recognitions across
  five categories (Firsts, Mastery, Streaks, Collection, Milestones).
  Each Honor has a stable id, a player-facing description (no spoilers),
  and a one-line book-flavor lore flourish revealed only AFTER earn.
  Examples: *First Catch*, *Stalker of the Reeds*, *Master of the Tens*,
  *Half-a-Moon Watcher*, *Decorated Cat*, *Reader of the Twoleg Sun-Face*,
  *Through the Thorn-thicket*.
- **Earn-on-completion ceremony.** When a patrol finishes, the engine
  checks every achievement predicate against the just-updated profile.
  Any new earns appear as a small dashed-border ceremony block in the
  patrol-complete view (same one-shot pattern as the trinket-found and
  focus-bonus callouts). The id is stored in `profile.achievementsEarned`
  immediately so it never re-triggers.
- **HonorsView.** New view reachable from the Den via a "⟡ HONORS ⟡"
  button below the story-flashcards button. Lists every catalog entry
  grouped by category. Earned entries are full-color with their lore
  flourish; unearned entries are greyed out showing only the description
  (no lore spoiler). Header shows X / Y earned count.
- Predicate functions are pure and defensive — every field touched uses
  `?.` and `|| 0` / `|| []` fallbacks so missing fields from parallel
  feature branches don't break the check.

### Migration
- `achievementsEarned: string[]` added to the normalized profile shape.
  Additive — older saves get an empty array. **SAVE_VERSION is NOT
  bumped** in this phase (the next functional release will). Unknown
  ids in the array are tolerated — if an entry is removed from the
  catalog in a future release the player keeps the id, it just doesn't
  display.

### Files
- `src/data/achievements.js` (new) — catalog of 20 Honors with
  predicates, names, descriptions, lore lines, categories.
- `src/engine/achievements.js` (new) — `checkAchievements(profile)`,
  `markEarned(profile, ids)`, `allEarned(profile)`, `earnedCount`,
  `totalCount`.
- `src/components/views/HonorsView.jsx` (new) — grouped list view.
- `src/App.jsx` — view route + onOpenHonors prop + earn-check hook
  inside `finishPatrol` + clear of `_newlyEarned` on RETURN TO CAMP.
- `src/components/views/DenView.jsx` — HONORS button + count display.
- `src/components/views/CompleteView.jsx` — new-Honor ceremony block.
- `src/engine/migration.js` — `achievementsEarned` field normalization.

### Added — v15.0.0-g cat customization (Phase 2)
- **Equip trinkets to the cat's body.** Five wearable slots: `ear`,
  `mouth`, `back`, `leg`, `nose`. Player picks which collected trinket
  to display in each slot from a new **DecorateView** screen reachable
  via a "⟡ DECORATE YOUR CAT ⟡" button at the top of the Your Nest panel.
- The Den's cat portrait and the Decorate view's live preview both
  render the equipped overlays at slot-specific positions on the
  100×100 cat viewBox (with gentle per-slot rotation so trinkets feel
  placed, not floating).
- **Image-art support carries through.** A trinket with `imageSrc` set
  renders via SVG `<image>` on the cat (PNG/SVG/WebP all work the same
  way it did in Your Nest), so the daughter's Procreate art will appear
  on the cat the moment she drops in `public/trinkets/<id>.png`.
- Decorate view's picker UI is **one card per slot**, each card
  showing every owned trinket in that slot as a tappable chip
  (icon + short name + count). Tapping a chip equips it; tapping the
  already-equipped chip — or the inline "clear" link — unequips it.
- Empty slots show a friendly placeholder per slot
  (*"No ear trinkets in your collection yet."*).

### Migration
- `SAVE_VERSION` bumped to 19. **Additive only** — older saves get
  `equipped: { ear:null, mouth:null, back:null, leg:null, nose:null }`
  defaulted; nothing is lost.

### Files
- `src/components/views/DecorateView.jsx` (new) — picker UI
- `src/components/art/CatPortrait.jsx` — new `equipped` prop with slot
  overlay rendering (inline SVG or `<image>` per slot)
- `src/components/art/TrinketIcon.jsx` — exported the
  `TRINKET_ICONS` map so CatPortrait can render the same shapes inline
- `src/engine/migration.js`, `src/engine/sr.js` — v19 schema additions
  (`normalizeEquipped`)
- `src/components/views/DenView.jsx` — DECORATE button + threaded
  `equipped` through to CatPortrait
- `src/App.jsx` — `decorate` view route + `onEquip` handler



### Added — v15.0.0-f trinket art + slot architecture
- **SVG icon for every trinket.** New `TrinketIcon` component with 28
  hand-tuned SVG icons matching the existing CatPortrait/PreyIcon style
  (32×32 viewBox, soft fills with opacity layers, dark stroke for
  definition, accent-tinted highlights). Reusable atoms for feathers,
  stones, leaves, teeth, fur tufts, etc. — different fill colors give
  jay-blue / pigeon-grey / robin-red / barn-owl-cream variants from the
  same shape.
- **Image-art pipeline.** Each trinket entry has an optional `imageSrc`
  field — set it to `'/trinkets/<id>.png'` and the renderer uses the
  hand-drawn image instead of the SVG fallback. PNG / SVG / WebP all
  work. Files live in `public/trinkets/` (created with a README
  explaining the convention for the daughter's Procreate exports).
- **Slot architecture.** Each trinket has a `slot` field —
  `ear / mouth / back / leg / nose / general` — preparing for Phase 2
  cat customization where the player can pick one trinket per slot to
  display on her cat. Current trinkets categorized sensibly (feathers
  on the ear, teeth in the mouth, silks on the leg, stones in the
  general nest, etc.). No equip UI yet — that's Phase 2.
- Your Nest panel now shows each trinket's icon in a small framed box
  next to its name; trinket-found callout in the patrol-complete view
  shows the icon at 48px in a centered framed display.

### Added — v15.0.0-f gamification (pacing fix + first gift mechanic)
- **Hunting Patrol caps.** Max 1 per day AND 3 per ISO week (resets Monday).
  Once capped, the patrol greys out with kind, book-faithful mentor flavor —
  *"The fresh-kill pile is full. Your mentor sends you toward other paths
  today."* / *"You've hunted hard this moon — Hunting Patrol returns
  Monday."* Other patrols stay uncapped to encourage diversification toward
  the harder topics (multiplication / geometry / fractions / time) the
  player was avoiding.
- **Mentor's daily focus.** Each day the mentor names one topic — picked
  70% of the time from her **weakest topic by accuracy**, 30% from random
  rotation through the others. The focus topic gets **1.5× rank progress**
  (0.5 bonus per correct, accumulated in a separate `rankBonusCorrect`
  field so `totalCorrect` stays honest for stats). Stable per character per
  calendar day via a `mulberry32`-seeded PRNG keyed by `(profileId, date)`.
- **Trinkets.** Every patrol has a ~35% chance to return with a small
  keepsake from a per-patrol-type pool: feathers, stones, claw-marks,
  pressed leaves, moonstone shards, etc. — book-faithful items with
  one-line origin flavor. Trinkets accumulate in a new **Your Nest**
  panel on the Den view (count next to each, dotted dividers, dimmed
  origin lines).
- **Day/week pip indicator.** Each patrol button now shows `TODAY n/cap`
  and `THIS WEEK n/cap` when caps apply, plus current today-count when
  there's no cap. Visual feedback that the player should diversify.
- **Mentor's focus banner** at the top of the patrol section, with the
  bonus-rewards call-out and a one-line "your mentor wants you to focus
  on …" hint pointing at the patrol.
- **Focus-bonus and trinket-found call-outs** in the patrol-complete
  view — one-shot per patrol.

### Migration
- `SAVE_VERSION` bumped to 18. **Additive only** — older saves get
  `trinkets: {}` and `rankBonusCorrect: 0` defaulted; nothing is lost.

### Files
- `src/data/trinkets.js` (new) — per-patrol trinket pools + roll/lookup
- `src/engine/patrolGate.js` (new) — cap state, ISO-week math, mentor
  focus picker, focus opening lines
- `src/engine/migration.js`, `src/engine/sr.js` — v18 schema additions
- `src/App.jsx` — patrol-start cap guard; finishPatrol applies focus
  bonus, rolls trinket, threads `_focusBonus`/`_trinketFound` into the
  complete-view payload
- `src/components/views/DenView.jsx` — focus banner, day/week pips,
  capped state, Your Nest panel
- `src/components/views/CompleteView.jsx` — focus bonus + trinket call-outs

### Changed — speed histogram rebucketed + per-kind breakdown
- **New 9-bucket layout** replaces the legacy 6-bucket one (`<2s / 2–4s /
  4–7s / 7–10s / 10–20s / >20s`). Old buckets were calibrated for the
  global 4s/7s SR gate that v15.0.0-d retired; they didn't stretch far
  enough for compute-heavy kinds where 30–60s answers are normal. New
  buckets: `<1s / 1–2s / 2–3s / 3–5s / 5–10s / 10–20s / 20–45s /
  45–90s / >90s`. Tighter at the fast end (where fluency lives), wider
  at the slow end (where multi-step word problems live).
- **Per-kind breakdown.** Histogram now defaults to cumulative ("All")
  but can be filtered to any specific problem kind: Mult (drill / word),
  Add / Sub (small / large), Geometry, Fractions, Clock, Duration, Future
  time. The chip count next to each kind shows how many samples that
  kind has accumulated.
- **Calibration context.** When a specific kind is selected, the
  histogram is colored relative to that kind's `fast` / `ok` thresholds
  (green = fast band, neutral = ok band, muted = slow), and a summary
  line below counts how many samples fell in each band, plus whether
  this kind is `speedPromotes` (fast answers raise the SR bucket) or
  streak-promote-only.
- Histogram is now computed **on-the-fly from `kindSamples`** (the raw
  per-kind ms ring buffer added in v15.0.0-d) instead of read from the
  legacy `elapsedHistogram` aggregate field. The legacy field is no
  longer written to or read from; it stays on older saves as vestigial
  data and migration leaves it alone.

### Added — dashboard rework (parent-utility)
- **Hot list** at the top of the Keeper's Record. Top 5 weakest tracked
  facts across all topics, scored by `(1 - accuracy) × log(1 + tracked)`,
  filtered to facts with ≥3 real attempts. Each row shows recent stats
  ("1 of 4 right since tracking, avg 12s") plus a parent-actionable
  coaching note — a strategy from `lookupStrategy()` for mult/add facts,
  or a parser-derived generic note for sub/geo/frac/time. Renders
  topic-level callouts when a whole topic is below 60% accuracy.
- **Strengths** panel — top 5 most automatic facts (acc ≥ 90%, tracked ≥
  5), sorted by bucket and avg time. Folds a multiplication factor into
  a single row when she has 4+ strong items in the same family
  (e.g. "× 10 family — all instant").
- **Pacing flags** — explicit calibration warnings drawn from the last 5
  patrols of each type. Catches "too easy" (avg duration < 3 min, acc ≥
  85%), "too hard" (avg > 25 min, acc < 60%), and "leaning on hints" (>
  50% of attempts trigger a strategy or reveal).
- **7-day trend** — per-topic accuracy and avg time, this week vs last,
  with arrow + colored delta. Renders a "trends will appear after a
  week" placeholder when patrolHistory is too short.
- **Per-fact breakdown** extended from 2 tabs (mult / add) to 6
  (mult / add / sub / geo / frac / time). Empty tabs render a friendly
  "no data yet — she'll populate this with her next patrol" placeholder.
- **Developer calibration panel** at the bottom of the dashboard.
  Per-kind P25 / P50 / P75 from `profile.kindSamples` (added by the
  parallel SR engine PR), rendered alongside the baked-in fast/ok
  thresholds with annotations like "calibrated OK", "fast threshold may
  be too tight", "fast threshold may be too generous", or "(collecting —
  using baked-in default)" while sample count < 20.

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
