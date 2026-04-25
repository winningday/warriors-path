// =====================================================================
// Warrior's Path  v15a — multi-file build
//
// The game is now organized under src/. This file remains as a single-export
// compatibility shim so anything (e.g. an old claude.ai artifact pointing here,
// or external tooling) that still does `import WarriorsPath from './warriors-path.jsx'`
// keeps working.
//
// New work should live in:
//   src/App.jsx              ← top-level component
//   src/data/                ← static game data (clans, ranks, prey, flavor, strategies)
//   src/engine/              ← SR, generators, rank logic, migration, utils
//   src/storage/             ← window.storage / localStorage shim
//   src/components/views/    ← screen-level React components
//   src/components/art/      ← inline-SVG illustrations
//   src/components/shared/   ← styles, FontLoader, StatCard, RewardTable
// =====================================================================

export { default } from './src/App.jsx';
