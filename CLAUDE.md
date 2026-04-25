# Warrior's Path

A math practice game for a 3rd grade girl who loves Warrior Cats. Built by her dad. Iterated based on her direct feedback.

## Project intent

This is a tool to help a real kid build math fluency without dread. It is not a portfolio piece, not a generic edu-game, and not a place to add features that sound cool. Every change should pass one test: **does this make her want to play tomorrow?**

The math is the point. Everything else (lore, ranks, prey, ceremonies) exists to make the math feel earned, not endured.

## The player

- 8 years old, 3rd grade
- Reads Warrior Cats books and knows the lore deeply. She is a stricter lore-checker than any adult.
- Hates timers. Stress shuts her down. Never add timers, never imply timers, never use timer-adjacent UX (countdown bars, urgent colors, "hurry" language).
- Hyper-sensitive to sound and overstimulation. Avoid auto-playing audio unless explicitly user-triggered.
- Aesthetic preference: dark, moody, gritty forest. Not cutesy. Not babyish. Think charcoal hoodie, not pastel unicorn.
- Math weaknesses (entry state): multiplication facts not fluent, addition/subtraction shaky, currently learning perimeter and area, beginning fractions.
- Reading level: solid 3rd grade. Can handle the actual vocabulary from the books (ThunderClan, fresh-kill, mentor, apprentice, Gathering, etc.) and prefers it.

## The product owner

**Her notes are canonical.** When her feedback contradicts the code, the code is wrong. When her feedback contradicts general game design instincts, her feedback wins. She is the lore expert and the user. See `DAUGHTER_NOTES.md` for the running list.

## Design principles

1. **Lore accuracy over convenience.** If a kit doesn't train in the books, kits don't train in the game. If StarClan is reverent in the books, StarClan is reverent here. Erika Hunter Cherith Baldry the Erin Hunter team has built a world; we honor it.
2. **No timers, ever.** Pacing comes from streak, ceremonies, and progression, never from clocks.
3. **Effort > correctness for rewards.** Wrong answers are learning moments. Show the answer after two tries, no penalty, move on. The game tracks correctness internally for spaced repetition; the *child* is praised for showing up.
4. **Save data is sacred.** Never break a saved profile. Migration paths must be additive. Always provide export/import.
5. **Variety is mandatory.** Repeated flavor text breaks immersion. Every category needs a pool of 30+ lines minimum, drawn from book-faithful phrasing.
6. **Programmatic where possible, LLM where valuable.** Math problems are deterministic generators. Flavor is large pools with weighted random. LLM API is reserved for adaptive hints when the player has struggled twice on the same fact.
7. **The next thing is always visible.** She should always know what she's working toward, whether that's the next prey, the next rank, or the next ceremony.

## Lore canon (per the player)

These are non-negotiable corrections from her direct feedback:

- **Clan** is always capitalized.
- **Kits do not train.** They live in the nursery with their mother. Apprentices train, not kits.
- **Naming convention:**
  - Birth (Kit): mother gives a name ending in `-kit` (e.g., Mosskit). The player does not "design" their kit name; their mother names them.
  - Apprentice ceremony: leader changes the suffix to `-paw` (Mosspaw). Mentor is assigned.
  - Warrior ceremony: leader gives a full warrior name. **The player chooses the suffix** (e.g., Mossheart, Mossfoot, Mossfire). This is the canonical naming arc.
  - Leader: suffix becomes `-star` (Mossstar).
- **Patrol types and what they actually do:**
  - **Training Patrol:** apprentice trains battle moves with mentor. Mentor says things like "try to scratch my shoulder." Correct answer = successful move (you scratch the mentor, you pounce). Topic: multiplication.
  - **Hunting Patrol:** stalk and catch prey. Topic: addition/subtraction. Caveat: a single hunting patrol catches a small number of prey, not 87 voles. Numbers in word problems must be plausible (1-15 prey range for a single patrol; bigger numbers belong to "the whole Clan over a moon" framing).
  - **Border Patrol:** walk the territory and refresh scent markers. **No prey caught here.** Reward = "the border is fresh," "your scent marks the edge," etc. Topic: perimeter and area.
  - **Herb Patrol** (NOT "Herb Gathering"): collect herbs with the medicine cat. **Herbs caught, not prey.** Topic: fractions.
- **StarClan is sacred, not creepy.** "StarClan walks with you" yes; "StarClan is watching" no.
- **Prey commonality (per her feedback):**
  - Common: mice, voles, squirrels (more common than current game has them)
  - Less common but normal: thrushes, sparrows, starlings, blackbirds
  - Rarer: rabbits, hares (WindClan more often), water voles (RiverClan)
  - Occasional: frogs (RiverClan/ShadowClan), small birds
  - Hawks are predators, not prey. Cats fear hawks; they don't catch them.
- **Clan descriptors** (current ones are not great per her):
  - ThunderClan: brave cats of the forest ✓
  - ShadowClan: cunning cats of the shadowed pines (or similar; "secret" themes)
  - RiverClan: sleek swimmers of the reeds (needs better wording)
  - WindClan: swift cats of the open moor (NOT "run the moor")
  - Final wording should be cross-checked with her.
- **Locations for word problems** (rotate these, don't always use Sandy Hollow):
  - ThunderClan territory: Sandy Hollow, the Great Sycamore, Snakerocks, Sunningrocks, Fourtrees, the Thunderpath border, the Owl Tree, the Twoleg nest, Tallpines, the ravine
  - Use realistic dimensions. "Tail-lengths" is okay for small things; for larger areas use "fox-lengths" or "tree-lengths." A clearing is not 3 tail-lengths long.

## Progression system (per her spec)

Linear path:
```
Kit → Apprentice → Young Warrior → Warrior → Deputy → Leader → Elder
```

Branch at apprentice:
```
Apprentice → Medicine Cat Apprentice → Medicine Cat → (cannot become Leader; can become Elder)
```

Rules:
- **Kit → Apprentice:** apprentice ceremony at the start of play (no math required; this is the starting point of the game proper).
- **Apprentice → Young Warrior:** complete an "assessment" (a final patrol with mixed problems). Warrior ceremony, player picks suffix.
- **Young Warrior → Warrior:** time/volume gate (months in the books = many sessions of play).
- **Warrior → Deputy:** chosen by current leader. In-game, this is a milestone the player must reach by accumulating correct answers AND patrols, then the leader "names" them.
- **Deputy → Leader:** when previous leader dies/retires. Suffix changes to `-star`. Picks a new deputy (an NPC).
- **Warrior/Deputy/Leader → Elder:** voluntary or after long service. Honorary. Game continues but with reflection-flavored content.
- **Medicine Cat path:** at apprentice ceremony, player can request to be a medicine cat. Available only if "the current medicine cat has no apprentice" (in-game flag). Medicine Cat does Herb Patrol primarily, also fractions, and additional content involving herb knowledge. Cannot become Deputy or Leader.

## Multi-character / save slots

Per her request: she wants to play one character as a warrior, another as a medicine cat. Support multiple named save slots. Each slot has its own profile, ceremony history, prey count, etc. Selectable from the den/intro screen.

## Spaced repetition

Implement a simple Leitner-style system for math facts:
- Each fact (e.g., `7 × 8`) tracked individually
- Three buckets: New, Learning, Mastered
- Wrong answer or slow answer (>10 sec) demotes a fact
- Two consecutive correct fast answers promote it
- Question selection weighted ~60% Learning, ~25% New, ~15% Mastered review
- Goal: she sees `7 × 8` more often if she struggles with it, less if she nails it

## Hint system (LLM-augmented)

When the player misses a problem twice:
- The "mentor whispers" hint should be context-specific
- For deterministic problems, prebuilt hints are fine (e.g., decomposition strategies for multiplication)
- For trickier word problems or when she's stuck on the same fact across sessions, an LLM call can generate a custom mnemonic or strategy
- LLM calls are rate-limited and cached per fact; never call the API mid-problem-flow without the hint button being pressed

## Visual direction

Currently text-heavy. Add in priority order:
1. **SVG illustrations** for cats, prey, locations. Style: simple, dark-toned, moody silhouettes with accent color highlights. Inspired by the cover art of the books.
2. **CSS animations** for transitions, prey-caught moments, ceremonies. Subtle, not distracting.
3. **Per-rank cat illustration** that visibly grows/changes as the player ranks up.
4. **Scenery backgrounds** per Clan and per patrol type (forest for ThunderClan training, marshes for ShadowClan, etc.).
5. **Sound (optional, opt-in only):** soft purr on level-up, paw-step on patrol start. Default OFF given her sensitivity to sound.

## Anti-patterns (do not do these)

- ❌ Adding a timer of any kind, even a "soft" one
- ❌ Streak loss or punishment for missed days
- ❌ "Buy gems" or any monetization-style mechanics
- ❌ Notifications/reminders that nag
- ❌ Generic praise ("Great job!"). Use book-faithful phrasing.
- ❌ Repeating the same flavor line within 10 problems
- ❌ Adding features she didn't ask for to inflate scope
- ❌ Breaking save compatibility without an explicit migration

## Technical

- React (single file currently; can split into modules in Claude Code)
- Persistent storage via `window.storage` API (Anthropic artifact runtime). For local Claude Code dev, swap to localStorage with the same interface.
- No external API calls in the artifact runtime except the Anthropic API (for adaptive hints, optional).
- Save format: JSON, versioned (`_version` field), with migration functions for breaking changes.
- File output for human-readable backup (already implemented).

## How to make changes

1. Read `DAUGHTER_NOTES.md` first. Always.
2. Cross-check against this file's lore canon.
3. Implement minimum-viable change. No feature creep.
4. Preserve save compatibility. If breaking, write a migration.
5. Test the lore with her. She will tell you if you got it wrong.
