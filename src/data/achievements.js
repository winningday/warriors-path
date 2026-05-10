// Book-faithful achievements ("Honors"). Phase 3 (v15.0.0-h).
//
// Honors are NAMED RECOGNITION awards for specific milestones — not
// volume-grinding. Earn once, keep forever. On first earn a small inline
// ceremony renders in CompleteView (see App.jsx + CompleteView.jsx).
//
// Design rules:
//   - Each predicate is PURE and DEFENSIVE. It reads the profile only and
//     must tolerate missing fields (profile shape evolves; parallel agents
//     may add or omit fields). Use `?.` and `|| 0` / `|| []` / `|| {}`.
//   - `name` is the title the player sees (e.g. "Hunter of the Sycamore").
//   - `description` is the earn condition phrased FOR the player (one line,
//     plain language, no spoilers of lore).
//   - `lore` is one line of book-flavor flourish revealed only AFTER earn.
//   - `category` groups the entry in HonorsView — one of:
//       'first'      one-time firsts (first prey, first vigil, first story)
//       'mastery'    SR/competence-based (×5 family Trusted, ×10 family Trusted)
//       'streak'     calendar-streak based (half-moon, moon)
//       'collection' trinkets / equipped / nest milestones
//       'milestone'  bigger numbers across patrols / topic samples
//
// Adding a new honor: append a new entry. IDs are stable strings — never
// rename or reuse. Removing an honor: leave the id in player's
// achievementsEarned (harmless; just not displayed).

import { SR_BUCKET } from '../engine/sr.js';

// ----- helpers (all defensive) -----

const sumValues = (obj) => Object.values(obj || {}).reduce((s, n) => s + (Number(n) || 0), 0);

const countPatrols = (profile, patrolId) =>
  (profile?.patrolHistory || []).filter((e) => e?.patrolId === patrolId).length;

const factsInBucketOrBetter = (profile, predicateFn) => {
  const sr = profile?.factsSR || {};
  let n = 0;
  for (const [id, entry] of Object.entries(sr)) {
    if (predicateFn(id, entry)) n++;
  }
  return n;
};

const isMultFamily = (id, factor) => {
  const m = id?.match(/^mult:(\d+)x(\d+)$/);
  if (!m) return false;
  const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
  return a === factor || b === factor;
};

const equippedCount = (profile) =>
  Object.values(profile?.equipped || {}).filter((v) => typeof v === 'string' && v.length > 0).length;

const distinctTrinketTypes = (profile) =>
  Object.entries(profile?.trinkets || {}).filter(([, c]) => (Number(c) || 0) > 0).length;

// "Steady Pace": find 5 consecutive patrols in the player's history where
// each had accuracy >= 80%. The check walks the history once and looks for
// any window of length 5 satisfying the predicate.
const hasFiveSteadyInARow = (profile) => {
  const history = profile?.patrolHistory || [];
  if (history.length < 5) return false;
  let run = 0;
  for (const e of history) {
    const total = Math.max(0, e?.total || 0);
    const correct = Math.max(0, e?.correct || 0);
    const acc = total > 0 ? correct / total : 0;
    if (acc >= 0.8) {
      run++;
      if (run >= 5) return true;
    } else {
      run = 0;
    }
  }
  return false;
};

// "Through the Thorn-thicket": completed any patrol where strategiesShown > 0.
const hasUsedStrategyOnPatrol = (profile) =>
  (profile?.patrolHistory || []).some((e) => (e?.strategiesShown || 0) > 0);

// Time-clock kind sample count (preferred) with topicStats['time'].correct fallback.
const timeClockCorrectCount = (profile) => {
  const samples = profile?.kindSamples?.['time-clock']?.samples;
  if (Array.isArray(samples)) return samples.length;
  return profile?.topicStats?.time?.correct || 0;
};

// ----- catalog -----

export const ACHIEVEMENTS = [
  // ----- FIRSTS -----
  {
    id: 'first-catch',
    name: 'First Catch',
    description: 'Catch your first piece of prey.',
    lore: 'The Clan welcomes a new hunter to the fresh-kill pile.',
    category: 'first',
    predicate: (p) => sumValues(p?.preyCaught) >= 1,
  },
  {
    id: 'first-hunt',
    name: 'First Hunt',
    description: 'Complete your first Hunting Patrol.',
    lore: 'You returned with the scent of prey still on your fur.',
    category: 'first',
    predicate: (p) => countPatrols(p, 'hunting') >= 1,
  },
  {
    id: 'first-vigil',
    name: 'First Vigil',
    description: 'Stand your first silent Vigil.',
    lore: 'The night held. The stars marked your watch.',
    category: 'first',
    predicate: (p) => countPatrols(p, 'vigil') >= 1,
  },
  {
    id: 'first-border',
    name: 'First Border',
    description: 'Walk your first Border Patrol.',
    lore: 'Your scent is in the earth now, at the edge of the territory.',
    category: 'first',
    predicate: (p) => countPatrols(p, 'border') >= 1,
  },
  {
    id: 'first-herb',
    name: 'First Herb',
    description: 'Walk your first Herb Patrol with the medicine cat.',
    lore: 'She showed you which leaves the Clan trusts.',
    category: 'first',
    predicate: (p) => countPatrols(p, 'herb') >= 1,
  },
  {
    id: 'first-story',
    name: 'First Story',
    description: 'Write your first fact-story flashcard.',
    lore: 'A story remembered is a fact never lost.',
    category: 'first',
    predicate: (p) => Object.keys(p?.factStories || {}).length >= 1,
  },
  {
    id: 'first-trinket',
    name: 'First Trinket',
    description: 'Bring home your first keepsake from a patrol.',
    lore: 'Small finds make a warrior\'s nest.',
    category: 'first',
    predicate: (p) => sumValues(p?.trinkets) >= 1,
  },

  // ----- STREAKS -----
  {
    id: 'half-moon-watcher',
    name: 'Half-a-Moon Watcher',
    description: 'Play on seven different days in a row.',
    lore: 'Half a moon has passed, and still you walk the path.',
    category: 'streak',
    predicate: (p) => (p?.bestStreak || p?.streak || 0) >= 7,
  },
  {
    id: 'moon-of-service',
    name: 'A Moon of Service',
    description: 'Play on twenty-eight different days in a row.',
    lore: 'A full moon of devotion. StarClan walks with you.',
    category: 'streak',
    predicate: (p) => (p?.bestStreak || p?.streak || 0) >= 28,
  },

  // ----- MILESTONES (patrol counts, sample counts) -----
  {
    id: 'walker-of-borders',
    name: 'Walker of the Borders',
    description: 'Complete ten Border Patrols.',
    lore: 'No fox slips past a warrior who knows every scent-marker by heart.',
    category: 'milestone',
    predicate: (p) => countPatrols(p, 'border') >= 10,
  },
  {
    id: 'stalker-of-reeds',
    name: 'Stalker of the Reeds',
    description: 'Complete ten Hunting Patrols.',
    lore: 'The prey of the forest know your shadow now.',
    category: 'milestone',
    predicate: (p) => countPatrols(p, 'hunting') >= 10,
  },
  {
    id: 'reader-of-twoleg-sun-face',
    name: 'Reader of the Twoleg Sun-Face',
    description: 'Answer thirty clock-reading problems correctly.',
    lore: 'The elders nod. You read the twoleg sun-face like a tracker reads pawprints.',
    category: 'milestone',
    predicate: (p) => timeClockCorrectCount(p) >= 30,
  },
  {
    id: 'pile-filler',
    name: 'Pile-Filler',
    description: 'Catch fifty pieces of prey in total.',
    lore: 'The fresh-kill pile rises higher every moon because of you.',
    category: 'milestone',
    predicate: (p) => sumValues(p?.preyCaught) >= 50,
  },
  {
    id: 'steady-pace',
    name: 'Steady Pace',
    description: 'Complete five patrols in a row with 80% or more correct.',
    lore: 'You move like a warrior who has done this before.',
    category: 'milestone',
    predicate: (p) => hasFiveSteadyInARow(p),
  },
  {
    id: 'through-the-thorn-thicket',
    name: 'Through the Thorn-thicket',
    description: 'Finish a patrol after a strategy hint helped you.',
    lore: 'A good warrior learns from her mentor\'s whisper.',
    category: 'milestone',
    predicate: (p) => hasUsedStrategyOnPatrol(p),
  },

  // ----- MASTERY (SR-based) -----
  {
    id: 'counter-of-strokes',
    name: 'Counter of Strokes',
    description: 'Move fifty multiplication facts past Wild.',
    lore: 'Your mentor stops calling out the count. You already know.',
    category: 'mastery',
    predicate: (p) => factsInBucketOrBetter(p, (id, e) =>
      id?.startsWith('mult:') && (e?.bucket === SR_BUCKET.TRACKING || e?.bucket === SR_BUCKET.TRUSTED),
    ) >= 50,
  },
  {
    id: 'master-of-tens',
    name: 'Master of the Tens',
    description: 'Trust eight facts from the ×10 family.',
    lore: '"Add the empty stone," the mentor says. "The number stays — only its tail changes."',
    category: 'mastery',
    predicate: (p) => factsInBucketOrBetter(p, (id, e) =>
      isMultFamily(id, 10) && e?.bucket === SR_BUCKET.TRUSTED,
    ) >= 8,
  },
  {
    id: 'master-of-fives',
    name: 'Master of the Fives',
    description: 'Trust eight facts from the ×5 family.',
    lore: 'Half of ten, and never more than a heartbeat to find.',
    category: 'mastery',
    predicate: (p) => factsInBucketOrBetter(p, (id, e) =>
      isMultFamily(id, 5) && e?.bucket === SR_BUCKET.TRUSTED,
    ) >= 8,
  },

  // ----- COLLECTION -----
  {
    id: 'keeper-of-seven-trinkets',
    name: 'Keeper of Seven Trinkets',
    description: 'Collect seven different kinds of trinket.',
    lore: 'Your nest is rich with small wonders.',
    category: 'collection',
    predicate: (p) => distinctTrinketTypes(p) >= 7,
  },
  {
    id: 'decorated-cat',
    name: 'Decorated Cat',
    description: 'Wear three trinkets at once.',
    lore: 'The Clan turns to look as you pass.',
    category: 'collection',
    predicate: (p) => equippedCount(p) >= 3,
  },
];

// Stable ordering for display: by category then by id (matches the catalog
// order, since we wrote them in that order). HonorsView groups by category.
export const CATEGORY_ORDER = ['first', 'mastery', 'streak', 'collection', 'milestone'];

export const CATEGORY_LABELS = {
  first:      'FIRSTS',
  mastery:    'MASTERY',
  streak:     'STREAKS',
  collection: 'COLLECTION',
  milestone:  'MILESTONES',
};

export const achievementById = (id) => ACHIEVEMENTS.find((a) => a.id === id) || null;
