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

## [v15.1] - 2026-07-18

Tutor-informed update. Save version bumps to 15 (additive migration; old
saves load unchanged and gain `sessionLog: []`).

### Added
- **Quiet drills.** Flashcard-style multiplication drills no longer show a
  story line above the question (the tutor flagged the preamble as needless
  cognitive load). Word problems keep their stories; her own "YOUR STORY"
  mnemonics still appear. The bare fact is centered on the card.
- **Victory laps.** When a fact gets promoted to a stronger bucket, it has a
  chance to come back within the next fifteen minutes of play, so a fresh win
  gets felt again ("I remember this!"). At most once per promotion, never
  twice in the same patrol.
- **Rest advisor.** The game records per-round response-time medians for
  multiplication patrols (internal only, never shown to the player), learns
  which round her speed usually stops improving, and offers one gentle in-lore
  rest suggestion per day, one round before that point, on the patrol-complete
  screen. Nothing is ever locked, counted down, or urgent.
- **Mentor sharing (cloud sync).** A "share progress with a mentor" panel in
  the den mints a per-character tutor link. After each patrol the profile
  syncs to a tiny zero-dependency Node server on the VPS (`server/`,
  `/api/sync`, JSON-file storage behind Caddy). The link renders a read-only
  tutor dashboard (`?tutor=<key>`): mastery grid for the full times table,
  accuracy, streak, recent wins, per-session speed by round, and the learned
  fatigue round. Deploy steps in DEPLOY.md; the game works unchanged when the
  server is absent or offline.

### Fixed
- The final problem of a patrol no longer loses its spaced-repetition update
  to a stale-state race (long-standing; also protected her typed fact
  stories).
- Saves with current-ladder ranks no longer demote on reload; a Medicine Cat
  save no longer re-triggers the name ceremony after every launch.
- The story prompt appearing on a patrol's last problem no longer risks a
  blank screen.

### Developer
- vitest test suite (82 tests) covering the SR engine, pacing, migration,
  report building, sync server, and generators. `npm test`.

---

## [v15a-relicense-polyform] — 2026-04-25

### Changed — License (legally significant)

This release re-licenses the project from MIT to **PolyForm Noncommercial
1.0.0**.

#### Timeline of license events

| Commit | Date | License at that commit |
|---|---|---|
| `fc9f74b` and earlier | through April 2026 | No explicit LICENSE file. Default copyright applied — all rights reserved by the author. |
| `425a6be` | 2026-04-25 | LICENSE file added. **MIT License.** |
| `30c0df1` | 2026-04-25 | License section in README aligned to MIT. **MIT License.** |
| `56ec244` | 2026-04-25 | LICENSE file replaced. **PolyForm Noncommercial 1.0.0.** |

The MIT-licensed window between `425a6be` and `30c0df1` was approximately
one hour. At the moment of the switch to PolyForm Noncommercial:

- Stars: **0**
- Forks: **0**
- No issues had been opened
- No pull requests had been opened
- The repository's audience consisted of the maintainer

#### Effect of the re-license

- All commits from `56ec244` onward are governed by the PolyForm
  Noncommercial 1.0.0 license. New code, new documentation, new assets,
  and any future contributions inherit those terms.
- Any party who downloaded the repository during the brief MIT window
  retains MIT-license rights only for the snapshot they downloaded — not
  for any subsequent commit, contribution, or release. They cannot use
  this changelog or any commit after `56ec244` under MIT terms.
- The historical commits are preserved unchanged. The project has not been
  rewritten, force-pushed, or otherwise modified to obscure the past
  license. This is the same pattern followed by Elasticsearch, MongoDB,
  Redis, and HashiCorp during their re-license events: keep the history,
  document the change.

#### Rationale

This is a father-daughter project that may extend over multiple years.
The maintainer chose PolyForm Noncommercial to:

1. Allow other parents, classrooms, and noncommercial communities to fork,
   modify, and self-host the project freely.
2. Disallow commercial use without a separate negotiated license.
3. Preserve the option of a future relationship with the rights holders of
   the source material (Erin Hunter / Working Partners / HarperCollins) by
   ensuring the project's noncommercial code base hasn't been already
   commercialized by a third party.

For commercial licensing inquiries, contact the maintainer via a GitHub
issue at https://github.com/winningday/warriors-path/issues.

### Added
- `LICENSE` — full PolyForm Noncommercial 1.0.0 license text, plus retained
  third-party-IP NOTICE for the Warrior Cats book series, plus new
  commercial-licensing-contact NOTICE.
- `CHANGELOG.md` — this file.
- License announcement block at the top of `README.md` linking to commits
  and to this changelog.
- Git tag `v15a-relicense-polyform` anchoring the re-license commit.

### Changed
- `README.md` — License section rewritten in plain English to enumerate
  what's permitted and prohibited under PolyForm Noncommercial. License
  shield updated.
- `package.json` — `license` field changed to `"SEE LICENSE IN LICENSE"`
  (the npm-recognized way to point at a non-SPDX license file).

---

## [v15a] — 2026-04-25

### Added
- Multi-file project structure under `src/` (33 modules across data, engine,
  storage, components/views, components/art, components/shared).
- Vite + React build pipeline (`npm run dev`, `npm run build`,
  `npm run preview`). Production bundle: ~226 KB raw, ~70 KB gzipped.
- GitHub Action at `.github/workflows/deploy.yml` for auto-deploy to VPS
  via rsync on push to `main`.
- Comprehensive documentation: `CLAUDE.md` (architecture + agent rules),
  `ROADMAP.md` (planned + deferred work), `IMAGES.md` (visual style guide
  + AI prompts), `SOUND.md` (opt-in audio plan), `DEPLOY.md` (VPS setup),
  `src/README-DEV.md`.

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
