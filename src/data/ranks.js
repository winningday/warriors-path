// Rank ladders by path. Apprentices and kits do not have a chosen suffix.
//
// Promotion model:
//   - `min`         is the volume threshold to even be ELIGIBLE.
//   - `auto: true`  promotes the moment min is reached (apprentice → young warrior, warrior, etc).
//   - `auto: false` is leader's choice (Deputy) or fate (Leader): once eligible, each completed patrol
//                   has a small chance to trigger the ceremony.

export const PATH_WARRIOR = 'warrior';
export const PATH_MEDICINE = 'medicine_cat';

export const RANKS_WARRIOR = [
  { name: 'Apprentice',     min: 0,   auto: true  },
  { name: 'Young Warrior',  min: 60,  auto: true  }, // warrior ceremony — pick suffix
  { name: 'Warrior',        min: 150, auto: true  },
  { name: 'Deputy',         min: 280, auto: false }, // leader chooses her new deputy
  { name: 'Leader',         min: 420, auto: false }, // previous leader goes to StarClan
];

export const RANKS_MEDICINE = [
  { name: 'Medicine Cat Apprentice',  min: 0,   auto: true },
  { name: 'Medicine Cat',             min: 60,  auto: true }, // medicine-cat ceremony — pick suffix
  { name: 'Senior Medicine Cat',      min: 200, auto: true },
];

// Per-patrol probability that an eligible chance-based promotion fires.
// Tuned so reaching Deputy/Leader takes many sessions of play, not just hitting the threshold.
export const CHANCE_PROMOTION_PER_PATROL = 0.12;

export const ranksFor = (path) => (path === PATH_MEDICINE ? RANKS_MEDICINE : RANKS_WARRIOR);

// Patrols. Border = no prey; Herb = herbs.
export const PATROLS = [
  { id: 'training', name: 'Training Patrol', subtitle: 'Spar with your mentor',     desc: 'Multiplication drills',                topic: 'mult',     reward: 'training' },
  { id: 'hunting',  name: 'Hunting Patrol',  subtitle: 'Feed the Clan',             desc: 'Addition and subtraction',             topic: 'add',      reward: 'prey' },
  { id: 'border',   name: 'Border Patrol',   subtitle: 'Keep the border scent fresh', desc: 'Perimeter and area of the territory', topic: 'geometry', reward: 'border' },
  { id: 'herb',     name: 'Herb Patrol',     subtitle: 'Walk with the medicine cat', desc: 'Fractions of herbs and leaves',        topic: 'fraction', reward: 'herb' },
];
