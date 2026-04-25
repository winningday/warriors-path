# src/ — Developer notes

The game is a single-page React app built by Vite. No backend, no router,
no state-management library. State lives in the top-level `App.jsx` and the
browser's localStorage (via `window.storage` shim that prefers the Anthropic
artifact runtime when present).

## Layout

```
src/
├── App.jsx                       Top-level component + view switch
├── main.jsx                      ReactDOM bootstrap
├── data/
│   ├── clans.js                  CLANS palette, suffixes, mentors, locations
│   ├── ranks.js                  Rank ladders, patrol list, path constants
│   ├── prey.js                   Prey table, herbs, fraction recipients
│   ├── flavor.js                 Praise/prey/herb/border/training/reveal pools
│   └── strategies.js             Multiplication & addition strategy lookups
├── engine/
│   ├── utils.js                  randInt, pick, weightedPick, newSlotId
│   ├── sr.js                     SR_BUCKET, factId, ensureFact, applySRResult, selectByBuckets
│   ├── rank.js                   autoRankForCorrect, rollEligibleChanceRank, getFullName, …
│   ├── generators.js             genMult, genAdd, genGeometry, genFraction → generateProblem
│   └── migration.js              normalizeProfile (v12/v13/v14 → v14)
├── storage/
│   └── storage.js                window.storage / localStorage shim, load/save container
└── components/
    ├── views/                    One file per screen (Intro, Slots, Patrol, Den, ceremonies, …)
    ├── art/                      Inline-SVG illustrations (CatPortrait, PreyIcon, HerbIcon, ClanScenery)
    └── shared/                   styles.js, FontLoader, StatCard, RewardTable
```

## Local development

```bash
npm install
npm run dev          # http://localhost:5173, hot reload
npm run build        # → dist/  (228 KB total, all static)
npm run preview      # serve dist/ locally to sanity-check before deploy
```

## Deploy

See `../DEPLOY.md` (one level up). Short version:
- `npm run build` → upload `dist/` to `/srv/warriors-path/` on the VPS via rsync.
- The GitHub Action at `.github/workflows/deploy.yml` does this automatically on push to `main`.

## Save-format notes

- `_version: 14` is the current shape.
- `factsSR[id]` has `{ bucket, correctStreak, seen, lastSeenAt }`.
- `factStories[id]` is a free-text string (≤200 chars), keyed by stable factId.
- `rankFloor` is the progress-bar baseline ONLY. The display `totalCorrect` is
  always the player's real count. Migration uses the old rank threshold to set
  `rankFloor` so older saves render correctly without fabricating answers.

## Compatibility

`warriors-path.jsx` at the repo root is now a thin re-export of `src/App.jsx`.
This preserves any external import path (e.g. an old claude.ai artifact upload).
New work should always live in `src/`, not in that shim.
