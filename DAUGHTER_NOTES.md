# Daughter's Notes

This is the canonical source of feedback from the actual user. **Her notes win over any other interpretation.** When in doubt, ask her.

Each entry is dated. Closed entries (✓) have been addressed in code; open entries (○) are pending. Do not delete entries; mark them addressed and move on. Her track record matters.

---

## v12 feedback (initial play sessions, ~2 days in)

### Lore corrections

- ✓ "Clan" should always be capitalized — *(v13)*
- ✓ Phrase: "Keep the border scent fresh" (or similar) is the right framing for Border Patrol — *(v13: Border Patrol now this exact subtitle)*
- ✓ Kits do not train. Only apprentices train. Currently the game lets a kit-rank player do training patrols, which is wrong. — *(v13: game starts AT apprentice ceremony, kits never play)*
- ✓ The patrol is called **Herb Patrol**, not "Herb Gathering" — *(v13)*
- ✓ WindClan does not "run the moor." Better: "swift cats of the open moor" or similar — *(v13: now "Swift cats of the open moor")*
- ✓ ShadowClan: change description. Try "cunning cats of the shadowed pines" or "cats of the secret pines" — *(v13: "Cunning cats of the shadowed pines")*
- ✓ RiverClan: change description. Current "sleek swimmers of the reeds" is okay-ish but could be sharper — *(v13: "Sleek cats of the river and reeds")*
- ✓ "StarClan is watching" sounds creepy. In the books that phrasing is ominous. Use "StarClan walks with you," "StarClan lights your path," etc. — *(v13: all ominous phrasings replaced; "walks with you" / "lights your path" used in praise pool and ceremonies)*

### Naming ceremony bugs

- ✓ At naming ceremony, button should say "ENTER THE FOREST" — *(v13: still correct, verified)*
- ✓ Naming ceremony arc — *(v13: full canonical arc shipped — mother names kit, leader gives -paw at apprentice ceremony with mentor assigned, leader gives full warrior name with PLAYER PICKING the suffix at warrior ceremony)*
- ✓ Bug where -paw was appended even at kit rank — *(v13: rank-aware getFullName covers Kit/Apprentice/Leader/Warrior cases distinctly)*

### Promotion language

- ✓ Don't say "Promotion." Say **Ceremony**. — *(v13: all rank-up banners and views now say "Ceremony" — Apprentice/Warrior/Medicine Cat/Deputy/Leader Ceremony)*

### Flavor text problems

- ✓ "The Clan grows stronger" appears every time prey is caught. Repetitive. Need a pool of 30+ varied lines. — *(v13: 32-line PREY_FLAVOR pool, plus 34 PRAISE, 32 BORDER, 32 HERB, 32 TRAINING, 32 REVEAL)*
- ✓ "Your mentor would be proud" implies the mentor isn't watching, or is dead. Wrong tone. — *(v13: line removed; replaced with "Your mentor flicks her tail in approval" / "Your mentor watches and nods" etc.)*
- ✓ All subtraction word problems use the same phrasing. Need variety. — *(v13: 4 "carry/share" templates for small subtraction; "moon-scale" framings for large numbers)*
- ✓ Fraction problems all use "Leafpool... queens..." — *(v13: medicine cat varies by Clan, herb varies, recipient varies (queens/elders/apprentices/sick warrior/wounded patrol/kits/deputy/medicine cat den), 4 sentence templates)*

### Math problem realism

- ✓ "Two patrols return with prey, count them all" — wrong. — *(v13: removed; small adds now framed as one patrol's catch + a patrol-mate's catch, or morning/afternoon catches)*
- ✓ "Fresh-kill pile had X, some was eaten, how many remain" — — *(v13: removed; subtraction now framed as carrying/sharing within a single trip, or moon-scale Clan accounting)*
- ✓ Numbers in word problems should match story scale — *(v13: small numbers for single patrols (2-14), large numbers only behind "over a moon" / "across many sunrises" framings)*

### Patrol mechanic problems

- ✓ **Border Patrol should NOT catch prey.** — *(v13: Border Patrol reward is "SCENT REFRESHED" with 32 dedicated flavor lines, no prey added)*
- ✓ **Herb Patrol should catch HERBS, not prey.** — *(v13: 16-herb list with purposes; herbsCaught tracked separately from preyCaught; HERB STORES summary on completion)*
- ✓ Training Patrol mentor sparring language — *(v13: 32 TRAINING_FLAVOR lines, all sheathed-claw sparring — "you scratch her shoulder", "you pounce on her tail", etc.)*
- ✓ Hunting Patrol: bird variety, more squirrels, frog rare, hawks — *(v14: 13-prey table — mouse/vole/squirrel weighted heaviest; sparrow/thrush/blackbird/starling/robin/wren/finch all present; rabbit uncommon, frog rare, hawk rare; brand-new apprentices catch only mouse/sparrow/vole until 8 correct)*
- ⚠ Hawks are predators of cats, not prey. — *(REVERSED per direct feedback v13.x: hawks restored to prey table at lowest weight per "we like hawks, sometimes also hunt hawks". Logged in case you change your mind again.)*

### Locations

- ✓ Sandy Hollow rotation — *(v13: 10 ThunderClan locations rotating; v13.x expanded to 10 per Clan including ShadowClan/RiverClan/WindClan)*
- ✓ Unit scale — tail/fox/tree-lengths — *(v13: each location tagged small/medium/large; units chosen accordingly)*

### Progression system (her spec)

- ✓ Full path Kit → Apprentice → Young Warrior → Warrior → Deputy → Leader — *(v13)*
- ✓ Medicine Cat path with mentor request — *(v13: two-step apprentice ceremony — choose intent, then walk to medicine cat den to ask. 70% chance she has an opening.)*
- ✓ Medicine cats cannot become Deputy or Leader — *(v13: medicine path has its own ladder ending at Senior Medicine Cat)*
- ✓ Player chooses warrior suffix — *(v13: 24 warrior suffixes + 14 medicine-cat suffixes, plus custom-text option)*
- ✓ Leader suffix becomes `-star` — *(v13: automatic at leader ceremony)*
- ✓ Becoming a warrior should NOT happen in 2 days — *(v13: thresholds raised to Young Warrior at 60, Warrior at 150, Deputy at 280, Leader at 420; Deputy and Leader are also chance-gated per patrol)*
- ✓ First catches should be smaller — *(v14: PREY_EARLY pool while totalCorrect < 8 — only mouse/sparrow/vole)*
- ☐ Elder rank — not yet implemented (logged on ROADMAP)

### Save system

- ✓ Save slots so she can play warrior + medicine cat as separate cats — *(v13: multi-slot save container, slot list view, switch-character button in den, per-slot delete)*
- ✓ Don't lose progress when game updates — *(v13: full migration function from v12; v14 migration added rankFloor for legacy progress-bar correctness)*

### Repetition / adaptive learning

- ✓ Adaptive — repeat hard ones more, easy ones less — *(v14: spaced repetition with Wild/Tracking/Trusted buckets, weighted ~60/30/10. Promotion on fast correct, demotion on miss. Per-fact tracking.)*
- ✓ Tips and tricks for hard ones — *(v14: prebuilt strategy library — ×2 double, ×4 double-double, ×5 half-of-×10, ×9 finger trick, ×10 add zero, ×11 single-digit twice; decomposition for 6×6, 6×7, 6×8, 6×9, 7×7, 7×8, 7×9, 8×8, 8×9, 9×9, 11×11, 12×12; addition strategies (doubles/near-doubles, +9, +10, make-a-ten). Surfaces automatically after second miss as "MENTOR'S STRATEGY".)*
- ✓ Player-authored memory aids — *(v14: BONUS — after correct on a hard fact she can write a 200-char story; mentor whispers it before that fact reappears. Browseable/editable in "story flashcards" view.)*

### Visuals

- ◐ Almost entirely text → SVGs shipped — *(v14: rank-aware cat portrait that grows/changes; per-Clan scenery panels; per-species prey icons; herb icon. Animations + AI-generated images + commissioned art are next; tracked on ROADMAP.)*

---

## Post-v12 feedback (2026-04-25)

### Clan visual identity

- ○ Each Clan should have its own **font color** when selected/displayed (text only, not background). Right now every Clan uses the same coloring, and WindClan's yellow text "gives me ThunderClan vibes." Pick a distinct accent color per Clan that matches the Clan's identity (e.g., ThunderClan = warm amber/gold, WindClan = something airy/pale that is NOT yellow, ShadowClan = dark purple or deep green, RiverClan = blue/teal). Verify final palette with her.

---

## v15.0.0-h feedback (2026-05-13) — crash + missed patrol

- ✓ **"It asks her to fill in a story, and if she presses skip, the page crashes."** Happened twice, always near the end of a patrol, sometimes with no wrong answers. — *(v15.0.0-i: race in the skip/save handlers — they cleared the story-prompt overlay before `finishPatrol` had switched the view, so the patrol view briefly re-rendered with an out-of-bounds problem index and crashed. Now the handlers await `finishPatrol` before clearing, plus a defensive null-check in the patrol render.)*
- ✓ **"She did the mentor's focus, but it didn't count it as a patrol."** — *(v15.0.0-i: same underlying bug. The crash happened mid-`finishPatrol`, so `patrolHistory`, `patrolsToday`, and the mentor's-focus 1.5× rank bonus never got persisted. Fix above resolves both symptoms.)*

---

## v15.0.0-b feedback (2026-04-28) — time

She mentioned she's currently learning time at school: subtracting and adding times like 6:30 minus 5:35, plus reading clocks.

- ✓ Add **Vigil patrol** (5th patrol) covering 3rd-grade time. — *(v15.0.0-b: clock reading via `ClockFace` SVG framed as the "twoleg sun-face" the elders learned to read; duration math framed as silent night-watch / patrol travel; time addition framed as Gathering / journey timing. Difficulty grain ramps lightly with totalCorrect (hour → half → quarter → 5-min → any).)*

---

## How to add to this file

When she gives feedback, log it here verbatim or near-verbatim. Group by theme. Mark `○` for open, `✓` for addressed. When closing an entry, add a brief note: `✓ (v13: rotated 12 location names)`.

Never argue with her in this file. If something can't be implemented as requested, note it as `⚠` with the reason and propose an alternative.

---

## Versions log

- v1–v12: rapid iteration with dad. Game progresses Kit → Apprentice → Warrior. She earned Warrior on day 2.
- v12 patch: save export/import added so progress survives rewrites.
- v13: full lore audit per the v12 feedback above. Naming-ceremony arc, save slots, slowed progression, 30+ flavor lines per pool.
- v13.x: Deputy/Leader as chance-based ceremonies; "ask the medicine cat" two-step apprentice ceremony; Leader ceremony with medicine-cat companion at the Moonstone; per-Clan accent palette; 10 geometry locations per Clan; hawks restored to prey table per direct feedback.
- v14: spaced repetition (Wild/Tracking/Trusted), player-authored fact stories, prebuilt strategy hint library, SVG illustrations.
- v14.1: Freckleleap migration bug fix — totalCorrect/totalAttempted now stay consistent.
- v15a: multi-file split (33 modules under src/), Vite build pipeline, GitHub Action auto-deploy to VPS, Caddy serving on plain HTTP at the VPS IP. Site live.
- v15.0.0-b: Vigil patrol — fifth patrol covering 3rd-grade time (clock reading, duration, time addition).
- v15b (planned): mastery-gated topic progression — see ROADMAP.md.
