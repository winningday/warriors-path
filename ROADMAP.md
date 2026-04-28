# Roadmap

Tracks proposed and deferred work. New ideas land at the top of their section.
Anything actively being built lives in a Git branch + commits, not here.

**Authority:**
- `DAUGHTER_NOTES.md` is canonical for what *she* wants. If a roadmap item
  conflicts with her notes, her notes win — update this file.
- `CLAUDE.md` is canonical for HOW we build things. If a roadmap item
  proposes an approach that violates a design principle there, fix the item.

**Status conventions:**
- ☐ open / not started
- ◐ scoped (we know what to build, not yet started)
- ◑ in progress
- ✓ shipped
- ✗ rejected (with a brief why)

---

## Shipped

- ✓ **v12 → v13** — full lore audit, naming-ceremony arc, save slots, slowed
  progression (60/150/280/420), 30+ flavor lines per pool. (Resolved most of
  v12 feedback in `DAUGHTER_NOTES.md`.)
- ✓ **v13.x** — Deputy/Leader as chance ceremonies; Apprentice ceremony with
  "ask the medicine cat" two-step; Leader ceremony with medicine-cat companion
  to Moonstone; per-Clan distinct accent palette; 10 geometry locations per
  Clan; hawks restored to prey table.
- ✓ **v14** — spaced-repetition (Wild/Tracking/Trusted), player-authored fact
  stories, prebuilt strategy hint library, SVG illustrations (rank-aware cat,
  prey/herb icons, Clan scenery panels).
- ✓ **v14.1** — Freckleleap migration bug fix (`totalCorrect`/`totalAttempted`
  now stay consistent; rank baseline lives in separate `rankFloor`).
- ✓ **v15a** — multi-file split: 2,975-line monolith → 33 modules under `src/`.
  Vite build pipeline. GitHub Action auto-deploys to VPS via rsync. Caddy
  serves on port 80 (no domain required). Site live on the VPS.
- ✓ **v15.0.0-b — Vigil patrol (time)** — fifth patrol covering 3rd-grade time.
  Three problem kinds: clock reading (analog `ClockFace` SVG, the "twoleg
  sun-face"), duration math ("vigil began at 9:35, ended at 11:00 — how
  long?"), and time addition ("Gathering at 6:30 + 1:35 journey — when?").
  Difficulty grain (hour / half / quarter / 5-min / any) ramps lightly with
  `totalCorrect`. Reward = "VIGIL HELD" (no item caught, like Border).
  HH:MM input via two number boxes. SAVE_VERSION 15; non-destructive
  migration (no profile schema change).

---

## Next up

### ◐ v15b — Mastery-gated topic progression

The single most important pending feature. Right now SR runs over the WHOLE
multiplication table from day one — she sees 11×12 the same day she sees 2×3.
Mastery gating fixes this without using rank as the gate (rank rises from
volume of work; mastery should rise from demonstrated competence).

**Mechanics:**
- Define "topics" (bands of facts): add-within-10, add-within-20, ×2, ×5, ×10,
  ×3, ×4, sub-within-20, 2-digit add no-regroup, ×6/7/8/9, 2-digit add with
  regroup, 3-digit add, ×11/12, division, 3-digit sub, fractions, time, data.
- A topic is **unlocked for drilling** when ≥70% of its facts reach Tracking+.
- A topic is **mastered** when ≥80% reach Trusted. Mastered topics keep
  appearing rarely (~10%) for safety/spaced-review.
- If the player is repeatedly missing one fact, narrow the active pool to its
  neighborhood for a few patrols — don't unlock new topics on top of struggle.
- Rank ceremonies stay narrative — they don't gate content. A Warrior can still
  be drilling ×3s if that's what she needs.

**LAUSD CCSS-3 alignment:** add division (3.OA.6), 2-step word problems
(3.OA.8), equivalent fractions (3.NF.3), elapsed time (3.MD.1), bar graphs
(3.MD.3) as topic unlocks.

**Scope:** topic definitions in `src/data/topics.js`; mastery gating in
`src/engine/mastery.js`; problem generators get a `selectFromUnlockedTopics`
wrapper. ~3 hours.

---

## Backlog — features

### ☐ Cloud saves (server-side persistence with SQL)

She wants her progress to survive iPad crashes, Safari storage eviction, and
device switching. Discussed in detail; deferred for now per her dad's "let's
just play it" preference.

**Plan if/when we build it:**
- SQLite (single file at `/srv/warriors-path-data/saves.db`) — NOT Postgres.
- ~150-line Node API behind Caddy reverse-proxy at `/api/*`.
- Two tables: `users(id, username, password_hash)` + `saves(user_id, slot_id, profile_json, updated_at)`.
- Game gets a "Sign In" option above "BEGIN A NEW JOURNEY".
- Storage shim becomes 3-mode: local-only, online-sync, queue-and-replay-on-reconnect.
- Daily VPS cron: `sqlite3 saves.db ".backup ..."` + `rsync` to dad's Mac.
- Password resets via SSH-only `reset-password.js` script (dad is the password reset mechanism).
- Estimated 3.5 hours to ship correctly.

**Don't build before:** the manual export ritual fails her at least once.

### ☐ Tamper-evident saves

HMAC-signed save files so editing the JSON breaks the load with a friendly
"this save looks tampered with" message. Rejected for now (✗ "she's the
co-architect, the trust is the whole point") but logging here in case the
calculus changes — e.g. if she ever has a friend playing on her account who
might mess with the file.

### ☐ Auto-export on patrol completion

Silently overwrite a single `warriors-path-autosave.json` in Downloads after
every patrol. Combined with iPad's "Save downloads to iCloud Drive" setting,
this gives near-cloud-save behavior without a server. Rejected for now (✗
"file pile concern") but the *single-file overwrite* version doesn't have
that problem — worth revisiting if cloud saves stay deferred and an iPad
incident happens.

### ☐ Server-hosted read-only saves

Static `saves/` folder on the VPS that the game can `fetch` from. No backend.
Manual `scp` to push, but the game can pull on any device. Rejected for now (✗
"manual scp doesn't solve the problem") — keeping for completeness.

---

## Backlog — gamification & rewards

Right now the only gamification is rank progression (which is volume-based,
i.e. "show up and grind"). The dad and daughter want more variety in what
counts as an achievement and what she gets for it. **Achievements should
celebrate effort and mastery, not just clock time.**

### ☐ Achievement system — mastery-driven

Award badges for things that are intrinsically meaningful:

- **First Catch** — first prey ever caught
- **Hunter of the Sycamore** / etc — first prey caught at each location
- **Rare Hunt** — caught a hawk (the rarest prey)
- **Full Stalker** — caught at least one of every common prey type
- **Boundary Walker** — completed N border patrols
- **Herb-Wise** — gathered every herb in the book at least once
- **Sharp as a Claw** — answered a Trusted-bucket fact in <2 seconds
- **The Long Memory** — has 10+ stories saved in flashcards
- **Comeback** — promoted a fact from Wild back to Trusted after a miss
- **Topic Mastery** — mastered an entire topic (e.g. "all of ×5")
- **Ceremony of the Owl Tree** / etc — narrative milestones tied to rank ceremonies
- **Mossheart's Streak** — 7-day streak (mild recognition; still per CLAUDE.md
  "no streak loss as punishment")

Each badge: an SVG icon, a name, a one-line "earned by" description, and the
date earned. Stored in `profile.achievements`. Surfaced in a new "Trophy
Room" or "Honors" view in the den.

### ☐ Collectible variety — "Catch every species"

Track per-species hunting record (already partly done — `preyCaught` is a
counted dictionary). Surface this as a visible "field guide" view: list each
prey species with the count, illustrated with the existing PreyIcon SVGs.
Locked entries shown as silhouettes ("you have not yet hunted ___"). Same
treatment for herbs (medicine cats path). Same for locations on Border Patrol.

### ☐ Story log / Memorable Moments

A timeline of in-game events — ceremonies, first catches, story flashcards
authored, topic masteries earned. Browsable in the den. This becomes its own
reward — "look at how far I've come." Stored in `profile.eventLog`.

### ☐ Weekly summary / Patrol Journal

At the start of each play session, a 3-second view: "Last time you played, you
caught X prey, mastered Y, your mentor noticed Z." Reinforces continuity and
makes returning feel like resumption, not restart.

### ☐ Reward sequencing for hard-fought wins

When she finally promotes a fact she'd been struggling with for many sessions
to Trusted, treat it as a real moment — distinct flavor text, a small SVG
animation, maybe an achievement. Mining the SR data for "she just did
something hard" and celebrating it is the most powerful gamification we can do.

---

## Backlog — visuals

### ☐ Step 2: AI-generated illustrations to replace SVGs

**See `IMAGES.md` for the full image inventory, visual style guide, and
ready-to-paste AI prompts (Midjourney/Nano-Banana/SD-compatible).** Dad runs
the prompts; integration into `src/components/art/` is a small follow-up
task once the WebP files exist.

The current SVGs are deliberately simple — they ship today, scale forever, and
match the moody aesthetic. Next visual layer: AI-generated images. Plan:

- Prey portraits (~13 images) — realistic moody forest creatures, dark
  background, accent-colored highlights.
- Per-Clan landscape headers (~4 images) replacing the abstract `ClanScenery`
  SVGs — closer to Warrior Cats book cover art.
- Per-rank cat portraits (~7 images) showing the same cat aging and growing
  through ranks. Important: she should be able to *see herself* in the
  illustration, so the cat's pelt + eye colors must match her chosen profile.
  Implies generating a small set per pelt × eye combination, OR procedural
  recoloring of a few base illustrations. Procedural is cheaper.
- Ceremony scene illustrations — the Highrock at moonhigh (apprentice/warrior
  ceremony), the Moonstone cave (leader ceremony).

**Constraints:**
- Match the existing dark/moody/charcoal palette. Not cute. Not pastel.
- All images committed to the repo, no external CDN dependencies — keeps the
  build self-contained and the iPad fast.
- Use WebP with PNG fallback. Lazy-load below-the-fold.
- Bake in alt text per image (a 3rd-grader-readable description) for both
  accessibility and lore continuity.

**Estimated:** 1-2 sessions with an image model + a half-day of integration.

### ☐ Step 3: Hand-drawn art to replace AI images

Long-term goal: actual commissioned (or family-drawn) art. AI images are a
stepping stone, not a destination. When art is ready, swap in place — the
filename API stays stable, only the bytes change.

### ☐ CSS animations & subtle motion

Per CLAUDE.md priority list, after illustrations:
- Soft fade-in on prey-caught moment.
- Gentle scale-pulse on rank-up.
- Tail-flick animation on the cat portrait when idle in the den.
- All disabled if `prefers-reduced-motion` is set, **and** OFF by default per
  her overstimulation sensitivity. Toggle in a small settings panel.

### ☐ Optional, opt-in sound

**See `SOUND.md` for the full plan** — sound triggers, where to find CC0
recordings, audio processing pipeline (ffmpeg one-liners), wiring into the
game, and what NOT to do.

Per CLAUDE.md: soft purr on level-up, paw-step on patrol start. Default OFF.
Toggle in settings. Never auto-play. Five sounds first, expand only if she
wants them.

---

## Backlog — technical / quality of life

### ☐ Topic-pool selector in the den (cheating-but-not-really)

A "what would I like to practice?" mode where she can voluntarily focus on
addition, multiplication, geometry, or fractions for the next patrol. Doesn't
bypass mastery gating — just changes the topic mix. Lets her self-direct
when she wants to.

### ☐ Per-Clan accent verification with daughter

Post-v12 note in `DAUGHTER_NOTES.md` is closed by the v13.x palette change,
but cross-check with her: ThunderClan amber-gold, ShadowClan lifted violet,
RiverClan teal, WindClan moor-green. If anything reads wrong, adjust.

### ☐ Settings view in the den

One small panel for: animations on/off, sound on/off, font-size scale (some
kids want bigger). Persists in `profile.settings`.

### ☐ Better mentor "voice" / consistency

Right now mentor lines come from a single pool. Could vary by mentor name
(book-faithful) and by Clan culture. Tigerclaw's drills feel different from
Lionheart's. Low priority but a flavor win.

### ☐ Search/filter in flashcards view

Once she has 30+ stored stories, browsing them needs filtering by bucket,
recency, or text search. Today's view is just a sorted list.

### ☐ Bug-report shortcut for HER

A "this feels wrong" button somewhere in the UI that pre-fills a note in
`DAUGHTER_NOTES.md`-format she can hand to dad. Removes friction — right
now feedback only happens when she remembers to bring it up.

---

## Things rejected (logged so we don't re-propose them)

- ✗ **Timers / countdown bars / urgency UX** — explicitly forbidden by
  CLAUDE.md. Stress shuts her down.
- ✗ **Streak loss as punishment** — would break her trust in the game.
- ✗ **Notifications / nag mechanics** — anti-pattern.
- ✗ **Generic "Great job!" praise** — book-faithful flavor only.
- ✗ **In-app purchases / monetization** — not that kind of project.
- ✗ **Real-time multiplayer** — no.
- ✗ **`deploy.sh` script** — superseded by GitHub Action; would duplicate
  effort and add another credential surface (laptop SSH key in deploy code).

---

## How to update this file

When we discuss a future improvement and decide to defer it: add it to the
appropriate Backlog section as `☐` with a short rationale. When we start work:
flip to `◑`. When it ships: move to the **Shipped** section with a one-line
note of what shipped.

Don't delete rejected items — leave them in **Things rejected** with the
reason. Future-us will be grateful.
