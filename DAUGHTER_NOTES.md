# Daughter's Notes

This is the canonical source of feedback from the actual user. **Her notes win over any other interpretation.** When in doubt, ask her.

Each entry is dated. Closed entries (✓) have been addressed in code; open entries (○) are pending. Do not delete entries; mark them addressed and move on. Her track record matters.

---

## v12 feedback (initial play sessions, ~2 days in)

### Lore corrections

- ○ "Clan" should always be capitalized
- ○ Phrase: "Keep the border scent fresh" (or similar) is the right framing for Border Patrol
- ○ Kits do not train. Only apprentices train. Currently the game lets a kit-rank player do training patrols, which is wrong.
- ○ The patrol is called **Herb Patrol**, not "Herb Gathering"
- ○ WindClan does not "run the moor." Better: "swift cats of the open moor" or similar
- ○ ShadowClan: change description. Try "cunning cats of the shadowed pines" or "cats of the secret pines"
- ○ RiverClan: change description. Current "sleek swimmers of the reeds" is okay-ish but could be sharper
- ○ "StarClan is watching" sounds creepy. In the books that phrasing is ominous. Use "StarClan walks with you," "StarClan lights your path," etc.

### Naming ceremony bugs

- ○ At naming ceremony, button should say "ENTER THE FOREST" (already does ✓ — verify still correct)
- ○ Naming ceremony is currently confused. In the books:
  - As a kit, the *mother* names you (not the player). Suffix: `-kit`
  - Apprentice ceremony: leader changes suffix to `-paw`. Mentor assigned.
  - Warrior ceremony: leader gives full warrior name. **Player picks the suffix** here.
  - Currently the game asks for full custom prefix at the start, which doesn't fit the lore arc.
- ○ Even though kit suffix shows `-kit` correctly, the current code still appends `-paw` somewhere visible — check rendering paths. Bug.

### Promotion language

- ○ Don't say "Promotion." Say **Ceremony**. (e.g., "Apprentice Ceremony," "Warrior Ceremony")

### Flavor text problems

- ○ "The Clan grows stronger" appears every time prey is caught. Repetitive. Need a pool of 30+ varied lines.
- ○ "Your mentor would be proud" implies the mentor isn't watching, or is dead. Wrong tone.
- ○ All subtraction word problems use the same phrasing ("the fresh-kill pile had X, some was eaten, how many remain"). Need variety.
- ○ Fraction problems are all "Leafpool gathered X, gave [fraction] to queens, how many." Need variety: different medicine cats, different recipients (elders, kits, queens, sick warrior), different herbs.

### Math problem realism

- ○ Hunting word problem: "Two patrols return with prey, count them all" — wrong. Only one patrol returns at a time. Also numbers like 87+47 are unrealistic for prey count.
- ○ "Fresh-kill pile had X, some was eaten, how many remain" — cats hunt and eat soon after; they don't stockpile and slowly deplete. Reframe.
- ○ Numbers in word problems should match story scale: small numbers for single patrols, larger numbers only for "the whole Clan over a moon" framings.

### Patrol mechanic problems

- ○ **Border Patrol should NOT catch prey.** It refreshes scent markers. Reward = scent refreshed, territory walked.
- ○ **Herb Patrol should catch HERBS, not prey.** Need an herb list (catmint, marigold, juniper, poppy seeds, cobwebs, comfrey, borage, tansy, yarrow, mouse bile, dock leaves, etc.)
- ○ Training Patrol: mentor should say things like "try to scratch my shoulder," "pounce on my tail," "dodge my paw." Correct answer = successful move. Don't have the apprentice "hurt" the mentor seriously; this is sparring.
- ○ Hunting Patrol: add bird variety (sparrows, blackbirds, starlings, robins). Add **frog** (rare). Make squirrels MORE common (currently rare). Rabbits should still be uncommon but present.
- ○ Hawks are predators of cats, not prey. Don't list them as catchable.

### Locations

- ○ Sandy Hollow appears every time in geometry problems. Need rotation: Sandy Hollow, the Great Sycamore, Snakerocks, Sunningrocks, Fourtrees, the Thunderpath border, the Owl Tree, the Twoleg nest, Tallpines, the ravine
- ○ "Tail-lengths" is too small for big areas. A clearing is NOT 3 tail-lengths. Use "fox-lengths" for medium, "tree-lengths" for large, "tail-lengths" only for very small things like a nest or a stone.

### Progression system (her spec)

- ○ Want full path: **Kit → Apprentice → Young Warrior → Warrior → Deputy → Leader → Elder**
- ○ At apprentice ceremony, option to become **Medicine Cat** (must request the current medicine cat as mentor; if mentor already has an apprentice, can't be a medicine cat)
- ○ Medicine cats CANNOT become Deputy or Leader
- ○ At Warrior Ceremony, **player chooses their warrior suffix** (Mossheart, Mossfire, Mossfoot, Mossfur, Mossstrike, etc.)
- ○ At Leader Ceremony, suffix changes to `-star`
- ○ Becoming a warrior should NOT happen in 2 days. Slow it down. Make it a meaningful milestone.
- ○ Should not catch a vole right away — too easy/anticlimactic. First catches should be smaller, build up.

### Save system

- ○ Want to save versions/save slots so she can play one character as a warrior and another as a medicine cat
- ○ Don't lose progress when the game updates (export/import added in v12 patch ✓)

### Repetition / adaptive learning

- ○ Questions repeat too much. Want adaptive: track which problems she's good at, repeat those less, repeat hard ones more.
- ○ Want tips and tricks for hard ones (mentor whispers but smarter)

### Visuals

- ○ Almost entirely text. Want more graphics and animations. (Priority list in CLAUDE.md.)

---

## How to add to this file

When she gives feedback, log it here verbatim or near-verbatim. Group by theme. Mark `○` for open, `✓` for addressed. When closing an entry, add a brief note: `✓ (v13: rotated 12 location names)`.

Never argue with her in this file. If something can't be implemented as requested, note it as `⚠` with the reason and propose an alternative.

---

## Versions log

- v1–v12: rapid iteration with dad. Game progresses Kit → Apprentice → Warrior. She earned Warrior on day 2.
- v12 patch: save export/import added so progress survives rewrites.
- v13 (planned): full lore audit per this document.
