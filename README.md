# Warrior's Path

Math practice game for a 3rd grade Warrior Cats fan. Built by her dad.

## Quick start (Claude Code)

```bash
# In an empty directory
git init
# Drop in the files: warriors-path.jsx, CLAUDE.md, DAUGHTER_NOTES.md, README.md
# Open Claude Code in this directory
claude
```

First message to Claude Code:

> Read CLAUDE.md and DAUGHTER_NOTES.md fully before doing anything. These are the spec. The current code is in warriors-path.jsx (single-file React artifact). I want to refactor this into a proper Vite + React project with the structure outlined in CLAUDE.md, then implement the open items from DAUGHTER_NOTES.md in priority order. Start with the lore corrections (those are quick wins my daughter will notice immediately), then save slots, then progression spec, then variety pools for flavor text. Save the spaced repetition and visual upgrades for after she validates the lore changes.

## File structure

- `CLAUDE.md` — design philosophy, lore canon, anti-patterns. **Read first, every session.**
- `DAUGHTER_NOTES.md` — feedback from the actual user. **Canonical. Her notes win.**
- `warriors-path.jsx` — current single-file React implementation (v12).
- `README.md` — this file.

## Workflow

1. Daughter plays a version, gives feedback
2. Dad logs feedback in `DAUGHTER_NOTES.md` verbatim
3. Open Claude Code, ask for next sprint based on open items
4. Test locally, deploy as artifact (paste into Claude.ai) or as Vite build to a static host
5. Daughter exports her save before each version bump, imports after
6. Repeat

## Saving her progress

The game writes profiles to `window.storage` (in artifact runtime) or `localStorage` (in standalone build). The Den screen has "save apprentice to file" / "load from file" buttons. **Always export before a version that changes data structure.**

## Math content

Generators in code; deterministic. Adaptive (spaced repetition) selection on top of generators. Optional LLM hints via Anthropic API for stuck-twice scenarios (rate-limited, cached).

## Visual direction

Currently text-heavy. SVG-based illustrations and CSS animations are the next visual upgrade. Avoid heavy asset pipelines — keep the game lightweight enough to run in an artifact.

## Non-negotiables

- No timers
- No streak punishment
- No nagging notifications
- Lore accuracy beats convenience
- The 8-year-old is the product owner

## Versions

See `DAUGHTER_NOTES.md` bottom section.
