# Warrior's Path

A math practice game for a 3rd grade girl who loves Warrior Cats. Built by
her dad. Iterated based on her direct feedback. Currently shipped, deployed,
and in active play.

## At-a-glance — where we are right now

> Any new Claude (laptop CLI, claude.ai web, or VPS) should read this section
> first. Three minutes of reading saves an hour of re-discovery.

- **Current version:** v15a shipped. v15b (mastery-gated topic progression)
  is the next planned feature.
- **Status:** live on the player's VPS (RackNerd) at her dad's IP, served on
  plain HTTP via Caddy on port 80 (no domain yet). GitHub Action auto-builds
  and rsyncs `dist/` on every push to `main`.
- **Architecture:** React + Vite SPA. 100% client-side. Storage in browser
  localStorage. Saves are JSON, versioned, exportable. NO backend, NO
  database — and we deliberately deferred adding one (see ROADMAP).
- **Repo layout:**
  - `src/App.jsx` — top-level component + view switch.
  - `src/data/` — game data (clans, ranks, prey, herbs, flavor pools, strategies).
  - `src/engine/` — SR, problem generators, rank logic, migration, utils.
  - `src/storage/` — `window.storage` / localStorage shim, container load/save.
  - `src/components/{views,art,shared}/` — React UI.
  - `warriors-path.jsx` at the repo root is a one-line re-export shim
    (preserves the claude.ai artifact import path). **Do not add code there.**
- **Documents you must read before changing anything:**
  - `DAUGHTER_NOTES.md` — canonical player feedback (what SHE wants).
  - `ROADMAP.md` — what's planned, deferred, rejected. Includes scoped plans
    for cloud saves, gamification, achievements, AI images, sound, etc.
  - `IMAGES.md` — full image inventory + visual style guide + ready-to-paste
    AI prompts for replacing SVGs with painted illustrations.
  - `SOUND.md` — opt-in audio plan (sources, processing pipeline,
    sensitivity-aware sound triggers).
  - `DEPLOY.md` — VPS setup, Caddyfile, GitHub Action secrets,
    no-domain-required Option A.
  - `src/README-DEV.md` — module-level architecture details.

## Project intent

This is a tool to help a real kid build math fluency without dread. It is
not a portfolio piece, not a generic edu-game, and not a place to add
features that sound cool. Every change should pass one test: **does this
make her want to play tomorrow?**

The math is the point. Everything else (lore, ranks, prey, ceremonies)
exists to make the math feel earned, not endured.

## The player

- 8 years old, 3rd grade, LAUSD curriculum.
- Reads Warrior Cats books and knows the lore deeply. She is a stricter
  lore-checker than any adult.
- Hates timers. Stress shuts her down. Never add timers, never imply timers,
  never use timer-adjacent UX (countdown bars, urgent colors, "hurry"
  language). Internal timing for the SR system is fine — she never sees it.
- Hyper-sensitive to sound and overstimulation. Audio defaults OFF, opt-in
  only. See SOUND.md.
- Aesthetic preference: dark, moody, gritty forest. Not cutesy. Not babyish.
  Charcoal hoodie, not pastel unicorn.
- Math weaknesses (entry state): multiplication facts not fluent, addition
  / subtraction shaky, currently learning perimeter and area, beginning
  fractions.
- Reading level: solid 3rd grade. Can handle the actual vocabulary from the
  books (ThunderClan, fresh-kill, mentor, apprentice, Gathering, etc.) and
  prefers it.

## The product owner

**Her notes are canonical.** When her feedback contradicts the code, the
code is wrong. When her feedback contradicts general game design instincts,
her feedback wins. She is the lore expert and the user. See
`DAUGHTER_NOTES.md` for the running list of feedback (✓ shipped, ○ open,
⚠ reversed).

The dad is the one talking to Claude in 99% of sessions. He's a competent
software engineer; he plays the role of producer + occasional implementer.
He values: small surgical changes, honest tradeoff explanations, no scope
creep, no fawning.

## Design principles

1. **Lore accuracy over convenience.** If a kit doesn't train in the books,
   kits don't train in the game. If StarClan is reverent in the books,
   StarClan is reverent here. Erin Hunter's team has built a world; we honor it.
2. **No timers, ever.** Pacing comes from streak, ceremonies, and progression,
   never from clocks.
3. **Effort > correctness for rewards.** Wrong answers are learning moments.
   Show the answer after two tries, no penalty, move on. The game tracks
   correctness internally for spaced repetition; the *child* is praised for
   showing up.
4. **Save data is sacred.** Never break a saved profile. Migration paths
   must be additive. Always provide export/import.
5. **Variety is mandatory.** Repeated flavor text breaks immersion. Every
   category needs a pool of 30+ lines minimum, drawn from book-faithful
   phrasing.
6. **Programmatic where possible, LLM where valuable.** Math problems are
   deterministic generators. Flavor is large pools with weighted random.
   LLM API would be reserved for adaptive hints, but the static strategy
   library shipped in v14 covers nearly all cases — LLM hints stay deferred.
7. **The next thing is always visible.** She should always know what she's
   working toward, whether that's the next prey, the next rank, or the
   next ceremony.
8. **Mastery-driven, not rank-driven.** (v15b principle.) Topic gating
   should follow demonstrated competence, not time spent. Don't unlock ×11
   just because she's a Warrior — unlock it because she's mastered ×5 and ×10.

## Lore canon (per the player)

These are non-negotiable corrections from her direct feedback. Most are
already implemented; this section is the canonical reference, not a TODO.

- **Clan** is always capitalized. ✓
- **Kits do not train.** They live in the nursery with their mother.
  Apprentices train, not kits. The game starts AT the apprentice ceremony. ✓
- **Naming convention:**
  - Birth (Kit): mother gives a name ending in `-kit` (e.g., Mosskit).
    The player picks the prefix in the nursery; the framing is "your mother
    considers names." ✓
  - Apprentice ceremony: leader changes the suffix to `-paw` (Mosspaw).
    Mentor is assigned. ✓
  - Warrior ceremony: leader gives a full warrior name. **The player
    chooses the suffix** (e.g., Mossheart, Mossfoot, Mossfire). Her words:
    "this is the canonical naming arc." ✓
  - Leader: suffix becomes `-star` (Mossstar) automatically. ✓
- **Patrol types:**
  - **Training Patrol** — apprentice spars with mentor, sheathed claws.
    Mentor lines: "try to scratch my shoulder", "pounce on my tail",
    "dodge my paw". Correct answer = successful move. **Topic: multiplication.**
  - **Hunting Patrol** — stalk and catch prey. Numbers must match story
    scale: small numbers (2–14) for a single patrol, larger numbers only in
    "over a moon" / "across many sunrises" framings. **Topic: add/sub.**
  - **Border Patrol** — walk the territory and refresh scent markers. NO
    PREY caught here. Reward = "the border is fresh," "your scent marks
    the edge," etc. **Topic: perimeter and area.**
  - **Herb Patrol** (NOT "Herb Gathering"): collect herbs with the medicine
    cat. HERBS caught, not prey. **Topic: fractions.**
- **StarClan is sacred, not creepy.** "StarClan walks with you" yes;
  "StarClan is watching" no. ✓
- **Prey commonality** (v14 weights match her v12 spec):
  - Common: mice, voles, squirrels.
  - Less common: thrushes, sparrows, blackbirds, starlings, robins, wrens,
    finches.
  - Rarer: rabbits.
  - Occasional: frogs.
  - **Hawks: REVERSED.** Originally she said hawks aren't prey ("predators
    of cats, cats fear hawks"). Later she revised to "we like hawks too,
    sometimes also hunt hawks." Hawks are now in the prey table at the
    lowest weight. If she ever flips back, the change is one weight in
    `src/data/prey.js`. Logged in DAUGHTER_NOTES as ⚠ to remember the history.
- **Clan descriptors** (final after v13):
  - ThunderClan: "Brave cats of the forest"
  - ShadowClan: "Cunning cats of the shadowed pines"
  - RiverClan: "Sleek cats of the river and reeds"
  - WindClan: "Swift cats of the open moor"
- **Per-Clan accent colors** (v13.x — readable on dark backgrounds, full
  6-digit hex, NEVER add alpha digits):
  - ThunderClan: `#e2c870` (warm amber-gold)
  - ShadowClan: `#a78bd9` (lifted violet)
  - RiverClan: `#4ba4d8` (river teal-blue)
  - WindClan: `#8fc28a` (moor green)
- **Locations for word problems** rotate per Clan; 10 locations per Clan
  in `src/data/clans.js`. Each tagged scale `small` / `medium` / `large`,
  selecting unit `tail-lengths` / `fox-lengths` / `tree-lengths`.

## Progression system

Linear path:
```
Kit → Apprentice → Young Warrior → Warrior → Deputy → Leader → (Elder, future)
```

Branch at apprentice ceremony:
```
Apprentice → Medicine Cat Apprentice → Medicine Cat → Senior Medicine Cat
            (cannot become Deputy or Leader)
```

### Rank thresholds + promotion mode (v14 / v15a, source: `src/data/ranks.js`)

| Rank | Min correct | Mode |
|---|---|---|
| Apprentice | 0 | auto |
| Young Warrior | 60 | auto — name ceremony, player picks suffix |
| Warrior | 150 | auto |
| Deputy | 280 | **chance** (12% per patrol once eligible — leader's choice) |
| Leader | 420 | **chance** (12% per patrol once eligible — previous leader has gone to StarClan) |
| Medicine Cat Apprentice | 0 | auto |
| Medicine Cat | 60 | auto — name ceremony, player picks suffix |
| Senior Medicine Cat | 200 | auto |

`rankFloor` field on the profile is the progress-bar baseline ONLY. It exists
so older saves whose rank was earned under v12/v13's lower thresholds don't
display as "below your own rank." `totalCorrect` is always the player's real
count and is what gets displayed in the CORRECT card.

### Ceremonies (in `src/components/views/`)

- `ApprenticeCeremony.jsx` — two-step: (1) "what is in your heart?", (2) if
  medicine cat path, walk to the medicine cat den and ASK her. 70% of new
  characters find the medicine cat with an opening; the other 30% are
  redirected to the warrior path with a kind decline.
- `NameCeremony.jsx` — warrior or medicine cat name ceremony. Full leader
  speech, vows, suffix picker (24 warrior + 14 medicine suffixes, plus
  custom-text option).
- `DeputyCeremony.jsx` — vow exchange under the Highrock at moonhigh:
  *"do you accept the duty of deputy — to serve {Clan}, to protect every cat
  from kit to elder, and to stand at my side for as long as you live?"*
- `LeaderCeremony.jsx` — Moonstone, accompanied by the medicine cat (she's
  done it before; she guides the new leader's first communion with StarClan).
  Suffix becomes `-star` automatically; old suffix preserved on
  `_oldSuffix` for the "you are no longer X" line.

## Multi-character / save slots

Per her request: she wants to play one character as a warrior, another as a
medicine cat. Multi-slot save container (v13). Slot list view, switch-character
button in den, per-slot delete with confirm. Storage key:
`warriors-path-saves` (v13+). Legacy key `apprentice-profile` still
read on first-load and migrated automatically.

## Spaced repetition (v14, source: `src/engine/sr.js`)

Per-fact Leitner-style buckets. **Internal naming:**
- `wild` — new or recently missed; ~60% selection weight.
- `tracking` — answered correctly once or twice; ~30%.
- `trusted` — 3+ correct in a row & fast; ~10% (review only).

(Earlier CLAUDE.md drafts used "New / Learning / Mastered" — those names
don't exist in code. Use the v14 names: Wild / Tracking / Trusted.)

Promotion rules per correct answer:
- elapsed < 4s → promote one bucket.
- elapsed 4–7s → stay in bucket; correctStreak still increments.
- elapsed > 7s → stay in bucket; still counts as correct.
- wrong → demote one bucket; reset correctStreak.

Tracked facts: multiplication 2×2 through 12×12 (order-normalized so 7×8 ==
8×7), addition single-digit pairs (2..9), and subtraction word problems mapped
back to the matching addition fact. Geometry, fraction, and large-number word
problems are NOT tracked as SR facts (they're computation drills, not facts).

Storage on profile: `factsSR[id] = { bucket, correctStreak, seen, lastSeenAt }`.

## Player-authored fact stories (v14)

After a correct answer on a fact she'd been struggling with (in Wild bucket
or with seen ≥ 2 + correctStreak ≤ 1), the mentor offers her a 200-character
text box: *"Tell yourself a little story so you'll remember 7 × 8."* Her
story is whispered as a "YOUR STORY" preamble before that fact appears
again. Browseable / editable in the "story flashcards" view in the den.

Storage on profile: `factStories[id] = "her sentence"`.

## Strategy hint library (v14)

Static prebuilt hints. Surfaces automatically as "MENTOR'S STRATEGY" after
the second miss on any factable problem.

- ×2 double, ×4 double-double, ×5 half-of-×10, ×9 finger trick, ×10 add zero,
  ×11 single-digit twice (write the digit twice).
- Decomposition for 6×6, 6×7, 6×8, 6×9, 7×7, 7×8, 7×9, 8×8, 8×9, 9×9, 11×11,
  12×12.
- Addition strategies: doubles/near-doubles, adding 9, adding 10, make-a-ten.

LLM-augmented hints are deferred — the static library covers nearly all 3rd
grade math facts. Source: `src/data/strategies.js`.

## Visuals — current state and direction

### What ships today (v14)

Inline SVG, in `src/components/art/`:
- `CatPortrait.jsx` — rank-aware silhouette. Apprentice/kit-like = smaller +
  scaled. Medicine cats wear a leaf collar. Deputy gets a shoulder stripe in
  the Clan accent. Leader gets a small star above the head.
- `PreyIcon.jsx` — 13 species (mouse, vole, squirrel, sparrow, thrush,
  blackbird, starling, robin, wren, finch, rabbit, frog, hawk).
- `HerbIcon.jsx` — generic herb sprig.
- `ClanScenery.jsx` — 4 abstract banners (deep forest, pine silhouettes,
  river+reeds, open moor) drawn at the top of the den.

### Direction (priority order, all in ROADMAP)

1. ✓ **SVG illustrations** — shipped v14.
2. ☐ **AI-generated illustrations** — see IMAGES.md for the inventory and
   ready-to-paste prompts. Dad runs the prompts, then we wire WebPs into
   the existing art components (a small task, ~1 hour).
3. ☐ **CSS animations** — soft fade on prey-caught, scale-pulse on rank-up,
   tail-flick idle. Default off; honor `prefers-reduced-motion`.
4. ☐ **Per-rank cat illustrations** that visibly grow/change — the v15c
   payoff once AI images exist.
5. ☐ **Scenery backgrounds per Clan AND per patrol type** (forest for
   ThunderClan training, marshes for ShadowClan, etc.).
6. ☐ **Hand-drawn/commissioned art** as the final layer, replacing AI images.
7. ☐ **Sound** — opt-in only, default OFF. See SOUND.md for plan.

## Anti-patterns (do not do these)

- ❌ Adding a timer of any kind, even a "soft" one. Internal SR timing is
  fine; the player must never see a clock.
- ❌ Streak loss or punishment for missed days.
- ❌ "Buy gems" or any monetization-style mechanics.
- ❌ Notifications/reminders that nag.
- ❌ Generic praise ("Great job!"). Use book-faithful phrasing only.
- ❌ Repeating the same flavor line within 10 problems (every pool is 30+).
- ❌ Adding features she didn't ask for to inflate scope.
- ❌ Breaking save compatibility without an explicit migration.
- ❌ Sound on wrong answers (would feel scolding).
- ❌ Adding a backend, database, or auth without explicit user request. (Cloud
  saves are scoped on ROADMAP and INTENTIONALLY deferred.)
- ❌ Re-proposing items in ROADMAP's "Things rejected" section.

## Technical

- **Stack:** React 18 + Vite 5. Single-page application, 100% client-side.
- **Build:** `npm run dev` (HMR on `localhost:5173`), `npm run build`
  (produces `dist/`, ~228KB total static), `npm run preview` (serve dist
  locally to spot-check).
- **Persistent storage:** `window.storage` API (Anthropic artifact runtime)
  with localStorage fallback for local dev and VPS deployment. The shim is
  `src/storage/storage.js`. **Keep both branches working** — the daughter's
  artifact-version still runs inside claude.ai if she ever opens it.
- **Save format:** JSON, versioned (`_version: 14`), with migration via
  `src/engine/migration.js`. Migration is non-destructive: the legacy key
  is left in place, never overwritten.
- **External services:** none at runtime. No backend, no API calls.
- **External fonts:** Google Fonts (`Cinzel`, `Crimson Text`) via the
  `FontLoader` component. Loaded at runtime; degrades gracefully to Georgia
  / serif if blocked.

## How to make changes

1. Read `DAUGHTER_NOTES.md` first. Always.
2. Cross-check against this file's lore canon.
3. Read `ROADMAP.md` to see what's planned, deferred, or rejected. Don't
   re-propose rejected items unless the user has changed their mind.
4. For visual work, read `IMAGES.md` (inventory + style guide + AI prompts).
   For audio work, read `SOUND.md`. For deployment work, read `DEPLOY.md`.
5. Implement the minimum-viable change. No feature creep.
6. Preserve save compatibility. If you must change schema, write a migration
   in `src/engine/migration.js`.
7. Test by running `npm run build` — Vite catches missing imports / typos
   that parsing alone won't.
8. When work ships:
   - Update `ROADMAP.md`: move the item to **Shipped** with a one-line
     note of what landed.
   - Update `DAUGHTER_NOTES.md` items from `○` to `✓` with a short note.
   - Bump `package.json` version (e.g. `15.0.0-a` → `15.0.0-b`).

## Repo + deploy layout

- Source of truth: `src/` (multi-file as of v15a). Layout details in
  `src/README-DEV.md`.
- `warriors-path.jsx` at the repo root is a one-line re-export shim.
  **Do not add new code there.** Its only purpose is to keep
  `import WarriorsPath from './warriors-path.jsx'` (the artifact path)
  working.
- `dist/` is regenerated by `npm run build`; in `.gitignore`.
- Save files (`*-save.json`) are personal data and `.gitignore`d. They live
  only on the player's machine + (optionally) on the VPS at
  `/srv/warriors-path-saves/`. **Never commit a save file.**
- Deploy: GitHub Action at `.github/workflows/deploy.yml` runs on every
  push to `main`: checkout → `npm ci && npm run build` → rsync `dist/` to
  the VPS via a deploy SSH key locked to a single rsync command.

## Document map (which file owns what)

| Document | Owner of |
|---|---|
| `CLAUDE.md` (this file) | HOW we work, design principles, lore canon, anti-patterns, current architecture, Claude Code agent rules. |
| `DAUGHTER_NOTES.md` | WHAT the daughter wants. Canonical player feedback log. Update items from `○` → `✓` when shipped. |
| `ROADMAP.md` | Future work, deferred features, scoped plans (cloud saves, gamification, mastery, etc.), and rejected items with reasons. |
| `IMAGES.md` | Image inventory, visual style guide, AI prompts for replacing SVGs. Dad runs the prompts; integration is a small follow-up task. |
| `SOUND.md` | Opt-in audio plan, sound triggers, where to find CC0 recordings, ffmpeg processing pipeline. |
| `DEPLOY.md` | VPS setup (RackNerd), Caddy config (with no-domain Option A), GitHub Action secrets, manual deploy fallback. |
| `src/README-DEV.md` | Module-level architecture and developer commands. |
| `package.json` | Build scripts and dependencies. |
| `vite.config.js` | Vite build config. |
| `Freckleleap-WindClan-save.json` | Player's actual saved character. **Personal data — never commit.** Already in `.gitignore` (`*-save.json`). |
| `sample-save.example.json` | Whitelisted example save for tests. |

## When running Claude Code ON THE VPS

If a Claude Code instance is launched on the VPS itself (e.g. for ops tasks
like pulling, building, restarting Caddy), follow these rules. THEY ARE NOT
NEGOTIABLE.

### What you may do

- `cd /srv/warriors-path-src/` if a checkout exists, and run:
  - `git fetch origin && git pull --ff-only origin main`
  - `npm ci` and `npm run build`
  - `rsync -av --delete dist/ /srv/warriors-path/` (build output only)
- Read Caddy logs via `journalctl -u caddy -n 100` to diagnose serving issues.
- Read `git log`, `git status`, etc. for context.
- Run `caddy validate --config /etc/caddy/Caddyfile` to check syntax.

### What you must NEVER do

- **Never run as root.** If the prompt says you're `root`, stop and explain
  the user must `sudo -iu warriors` first.
- **Never `rm -rf` outside `/srv/warriors-path/`** — and even there, prefer
  `rsync --delete` over `rm`. Specifically:
  - **Never touch `/srv/warriors-path-saves/`.** Those are the player's files.
  - **Never read `/srv/warriors-path-saves/*.json`.** They are private data.
    If the user asks for help debugging a save, the user can paste it into
    the conversation themselves.
  - Never touch `/home/`, `/etc/`, `/var/`, `/root/`, `/opt/`, `/usr/`, or
    any other system directory.
- **Never edit `/etc/caddy/Caddyfile`** without showing the user the diff
  and getting explicit confirmation. The current working config is the
  Option A `:80 { … }` block from DEPLOY.md.
- **Never run `apt-get`, `npm install -g`, `systemctl`, `useradd`,
  `passwd`, or anything else that mutates the OS** without explicit user
  confirmation per command.
- **Never `git push --force` to `main`.** Never push directly to `main` at
  all — open a PR.
- **Never disable hooks (`--no-verify`), CI, or signing.**
- **Never write secrets to disk.** No `.env` files, no API keys, no SSH
  keys committed. The deploy SSH key already exists on the VPS at
  `/home/warriors/.ssh/deploy` and is GitHub's secret — leave it alone.

### When the user asks you to "deploy" on the VPS

If the GitHub Action is configured (it is, as of v15a), simply running `git
push` from the dad's laptop is the deploy. The Action handles build + rsync.

If the user asks for a manual deploy (e.g. CI is down):

```bash
# As the `warriors` user, in /srv/warriors-path-src/ (clone first if missing)
git pull --ff-only origin main
npm ci
npm run build
rsync -av --delete dist/ /srv/warriors-path/
```

No Caddy restart is needed — Caddy serves files from disk and picks up
changes immediately. If the iPad shows a stale version, force-quit the
home-screen icon and reopen.

### When the user reports the site is broken

Diagnostic ladder, in order:
1. `systemctl status caddy` — is the webserver up?
2. `ls -la /srv/warriors-path/` — is `index.html` there?
3. `sudo -u caddy ls /srv/warriors-path/` — can the caddy user read it?
   (Most common breakage: directory mode `750` instead of `755`.)
4. `curl -I http://127.0.0.1/` — does Caddy locally return 200?
5. `journalctl -u caddy -n 100` — recent error logs.
6. If the build is broken, check out the previous commit and rebuild.
   Don't try to "fix forward" without showing the user the diagnosis first.

### When the user asks you to set up cloud saves / a backend

This is **scoped on ROADMAP** but explicitly deferred. Don't build it
without an explicit "yes, build cloud saves now" from the user. If asked
to scope it, point at the ROADMAP entry — it has the full plan
(SQLite, ~150-line Node API behind Caddy reverse-proxy, two tables, login
view, sync-on-patrol, daily backup cron). Estimated 3.5 hours.
