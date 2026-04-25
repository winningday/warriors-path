import React, { useState, useEffect } from 'react';

// =====================================================================
// Warrior's Path  v13
// Single-file React artifact. Math-practice game framed as warrior life.
// Lore canon: see CLAUDE.md and DAUGHTER_NOTES.md.
// =====================================================================

// ============ GAME DATA ============

const CLANS = [
  { name: 'ThunderClan', accent: '#e2ec70', desc: 'Brave cats of the forest' },
  { name: 'ShadowClan', accent: '#1b1480', desc: 'Cunning cats of the shadowed pines' },
  { name: 'RiverClan',  accent: '#4ba4d8', desc: 'Sleek cats of the river and reeds' },
  { name: 'WindClan',   accent: '#66b366', desc: 'Swift cats of the open moor' },
];

const FUR_COLORS = ['Black', 'Grey', 'White', 'Tabby', 'Ginger', 'Calico', 'Tortoiseshell'];
const EYE_COLORS = ['Amber', 'Green', 'Blue', 'Yellow', 'Ice'];
const KIT_PREFIX_OPTIONS = [
  'Moss', 'Shadow', 'Ember', 'Fern', 'Ash', 'Storm', 'Dusk', 'Frost',
  'Thorn', 'Raven', 'Silver', 'Briar', 'Holly', 'Sun', 'Cloud', 'Mist',
  'Spider', 'Berry', 'Hazel', 'Leaf', 'Brook', 'Pine', 'Bramble', 'Lark',
];

// Warrior-name suffix options (book-faithful). Player picks one at the warrior ceremony.
const WARRIOR_SUFFIXES = [
  'heart', 'foot', 'fire', 'fur', 'strike', 'claw', 'pelt', 'tail', 'leaf',
  'stripe', 'shine', 'spot', 'frost', 'song', 'step', 'wing', 'fang', 'mist',
  'breeze', 'flight', 'tooth', 'eye', 'pool', 'fall',
];

// Medicine-cat suffixes lean gentler; book examples: Spottedleaf, Yellowfang, Cinderpelt, Leafpool, Mothwing.
const MEDICINE_SUFFIXES = [
  'leaf', 'pool', 'fur', 'wing', 'nose', 'song', 'whisker', 'spirit',
  'shine', 'breeze', 'pelt', 'mist', 'cloud', 'stripe',
];

// Patrols. Border = no prey; Herb = herbs.
const PATROLS = [
  { id: 'training', name: 'Training Patrol', subtitle: 'Spar with your mentor',     desc: 'Multiplication drills',                topic: 'mult',     reward: 'training' },
  { id: 'hunting',  name: 'Hunting Patrol',  subtitle: 'Feed the Clan',             desc: 'Addition and subtraction',             topic: 'add',      reward: 'prey' },
  { id: 'border',   name: 'Border Patrol',   subtitle: 'Keep the border scent fresh', desc: 'Perimeter and area of the territory', topic: 'geometry', reward: 'border' },
  { id: 'herb',     name: 'Herb Patrol',     subtitle: 'Walk with the medicine cat', desc: 'Fractions of herbs and leaves',        topic: 'fraction', reward: 'herb' },
];

// Rank ladders by path. Apprentices and kits do not have a chosen suffix.
//
// Promotion model:
//   - `min`         is the volume threshold to even be ELIGIBLE.
//   - `auto: true`  promotes the moment min is reached (apprentice → young warrior, warrior, etc).
//   - `auto: false` is leader's choice (Deputy) or fate (Leader): once eligible, each completed patrol
//                   has a small chance to trigger the ceremony. The story reason makes the chance gate
//                   feel right — the leader picks her deputy when she sees fit, and a new leader is named
//                   only when StarClan calls the old one home.
const RANKS_WARRIOR = [
  { name: 'Apprentice',     min: 0,   auto: true  },
  { name: 'Young Warrior',  min: 60,  auto: true  }, // warrior ceremony — pick suffix
  { name: 'Warrior',        min: 150, auto: true  },
  { name: 'Deputy',         min: 280, auto: false }, // leader chooses her new deputy
  { name: 'Leader',         min: 420, auto: false }, // previous leader goes to StarClan
];
const RANKS_MEDICINE = [
  { name: 'Medicine Cat Apprentice',  min: 0,   auto: true },
  { name: 'Medicine Cat',             min: 60,  auto: true }, // medicine-cat ceremony — pick suffix
  { name: 'Senior Medicine Cat',      min: 200, auto: true },
];

// Per-patrol probability that an eligible chance-based promotion fires.
// Tuned so reaching Deputy/Leader takes many sessions of play, not just hitting the threshold.
const CHANCE_PROMOTION_PER_PATROL = 0.12;

const PATH_WARRIOR = 'warrior';
const PATH_MEDICINE = 'medicine_cat';

const ranksFor = (path) => (path === PATH_MEDICINE ? RANKS_MEDICINE : RANKS_WARRIOR);

// Prey table. Mice/voles/squirrels are the common forest prey. Birds add variety. Hawks are rare and dangerous —
// cats sometimes hunt them but it's not the usual catch.
const PREY_COMMON = [
  { name: 'mouse',     weight: 8 },
  { name: 'vole',      weight: 7 },
  { name: 'squirrel',  weight: 6 },
  { name: 'sparrow',   weight: 4 },
  { name: 'thrush',    weight: 3 },
  { name: 'blackbird', weight: 3 },
  { name: 'starling',  weight: 2 },
  { name: 'robin',     weight: 2 },
  { name: 'wren',      weight: 2 },
  { name: 'finch',     weight: 2 },
  { name: 'rabbit',    weight: 2 },
  { name: 'frog',      weight: 1 },
  { name: 'hawk',      weight: 1 }, // rare; "sometimes also hunt hawks" per daughter
];
// First catches should be modest (per daughter): brand-new apprentices catch only the smallest things.
const PREY_EARLY = [
  { name: 'mouse',   weight: 6 },
  { name: 'sparrow', weight: 2 },
  { name: 'vole',    weight: 1 },
];

// Herbs (book-faithful list with their purpose) for Herb Patrol.
const HERBS = [
  { name: 'catmint',         purpose: 'for greencough'             },
  { name: 'marigold',        purpose: 'for infected wounds'        },
  { name: 'juniper berries', purpose: 'to ease breathing'          },
  { name: 'poppy seeds',     purpose: 'for pain and sleep'         },
  { name: 'cobwebs',         purpose: 'to stop bleeding'           },
  { name: 'comfrey',         purpose: 'for broken bones'           },
  { name: 'borage leaves',   purpose: 'for nursing queens'         },
  { name: 'tansy',           purpose: 'for coughs'                 },
  { name: 'yarrow',          purpose: 'to bring up bad food'       },
  { name: 'mouse bile',      purpose: 'for ticks'                  },
  { name: 'dock leaves',     purpose: 'for sore pads'              },
  { name: 'horsetail',       purpose: 'for infected wounds'        },
  { name: 'goldenrod',       purpose: 'for healing'                },
  { name: 'chervil',         purpose: 'for kit illness'            },
  { name: 'feverfew',        purpose: 'for fever and chills'       },
  { name: 'lavender',        purpose: 'for chills'                 },
];

// Locations for geometry word problems, with size scale used for unit selection.
// scale: 'small' -> tail-lengths; 'medium' -> fox-lengths; 'large' -> tree-lengths.
const LOCATIONS_BY_CLAN = {
  ThunderClan: [
    { name: 'Sandy Hollow',          scale: 'small'  },
    { name: 'the Great Sycamore',    scale: 'medium' },
    { name: 'Snakerocks',            scale: 'medium' },
    { name: 'Sunningrocks',          scale: 'medium' },
    { name: 'Fourtrees',             scale: 'large'  },
    { name: 'the Thunderpath border',scale: 'large'  },
    { name: 'the Owl Tree',          scale: 'small'  },
    { name: 'the Twoleg nest',       scale: 'medium' },
    { name: 'Tallpines',             scale: 'large'  },
    { name: 'the ravine',            scale: 'medium' },
  ],
  ShadowClan: [
    { name: 'the marshes',           scale: 'large'  },
    { name: 'the Carrionplace',      scale: 'medium' },
    { name: 'the burned sycamore',   scale: 'medium' },
    { name: 'the pine clearing',     scale: 'large'  },
    { name: 'the Thunderpath edge',  scale: 'large'  },
    { name: 'the rotten stump',      scale: 'small'  },
    { name: 'Fourtrees',             scale: 'large'  },
    { name: 'the bramble thicket',   scale: 'medium' },
    { name: 'the dead oak',          scale: 'small'  },
    { name: 'the shadow hollow',     scale: 'medium' },
  ],
  RiverClan: [
    { name: 'the reedbeds',          scale: 'medium' },
    { name: 'Sunningrocks',          scale: 'medium' },
    { name: 'the river bend',        scale: 'large'  },
    { name: 'the stepping stones',   scale: 'small'  },
    { name: 'the willow grove',      scale: 'medium' },
    { name: 'Fourtrees',             scale: 'large'  },
    { name: 'the stone island',      scale: 'small'  },
    { name: 'the otter den',         scale: 'small'  },
    { name: 'the fishing pool',      scale: 'medium' },
    { name: 'the gorge',             scale: 'large'  },
  ],
  WindClan: [
    { name: 'the open moor',         scale: 'large'  },
    { name: 'Outlook Rock',          scale: 'medium' },
    { name: 'the gorse hollow',      scale: 'small'  },
    { name: 'the rabbit warren',     scale: 'medium' },
    { name: 'the stone hollow',      scale: 'small'  },
    { name: 'Fourtrees',             scale: 'large'  },
    { name: 'the high ridge',        scale: 'medium' },
    { name: 'the heather field',     scale: 'large'  },
    { name: 'the badger sett',       scale: 'small'  },
    { name: 'the windswept ridge',   scale: 'medium' },
  ],
};

// Mentor pools (book-faithful Clanmates). Random assignment at apprentice ceremony.
const MENTORS_BY_CLAN = {
  ThunderClan: ['Lionheart', 'Whitestorm', 'Bluestar', 'Sandstorm', 'Dustpelt', 'Brackenfur', 'Greystripe', 'Goldenflower'],
  ShadowClan:  ['Russetfur', 'Tawnypelt', 'Oakfur', 'Cedarheart', 'Rowanclaw'],
  RiverClan:   ['Mistyfoot', 'Stonefur', 'Silverstream', 'Leopardfur', 'Mosspelt', 'Blackclaw'],
  WindClan:    ['Tallstar', 'Onewhisker', 'Crowfeather', 'Ashfoot', 'Mudclaw', 'Webfoot'],
};
const LEADERS_BY_CLAN = {
  ThunderClan: 'Bluestar',
  ShadowClan:  'Blackstar',
  RiverClan:   'Leopardstar',
  WindClan:    'Tallstar',
};
const MEDICINE_CATS_BY_CLAN = {
  ThunderClan: 'Spottedleaf',
  ShadowClan:  'Runningnose',
  RiverClan:   'Mudfur',
  WindClan:    'Barkface',
};

// For fraction problems — vary medicine cat (any Clan), recipient, and herb.
const FRACTION_RECIPIENTS = [
  'the queens', 'the elders', 'the apprentices', 'a sick warrior',
  'a wounded patrol', 'the kits', 'the deputy', 'the medicine cat den',
];

// =====================================================================
// FLAVOR POOLS (each ≥ 30 lines per daughter's spec)
// =====================================================================

const PRAISE = [
  'A true warrior.',
  'Sharp as a claw.',
  'Swift as the wind.',
  'Quiet as the shadow.',
  'StarClan walks with you.',
  'StarClan lights your path.',
  'Your eyes are quick.',
  'Your paws are sure.',
  'You learn well.',
  'A clever apprentice.',
  'You see the answer in the moss.',
  'The Clan is well served.',
  'A patrol-worthy strike.',
  'Strong work, young one.',
  'You read the trail well.',
  'No hesitation. Good.',
  'You move like a true Clan cat.',
  'Steady. Sharp. Quiet.',
  'The fresh-kill pile remembers.',
  'You honor your kin.',
  'Bright eyes, sharp mind.',
  'A hunter at heart.',
  'Well struck.',
  'You hear the wind speak.',
  'You will lead a patrol someday.',
  'A wise apprentice.',
  'You catch what others miss.',
  'StarClan smiles on you.',
  'Your steps are silent. Good.',
  'A patrol cat in the making.',
  'You answered without flinching.',
  'A keen mind for the Clan.',
  'You sharpen with every drill.',
  'Your kin would be proud.',
];

const PREY_FLAVOR = [
  'Fresh-kill for the pile.',
  'A clean catch.',
  'Your jaws close around it.',
  'A swift strike.',
  'You felt it before you saw it.',
  'Stalked. Pounced. Caught.',
  'A worthy meal for the Clan.',
  'It never knew you were there.',
  'You shake the prey to still it.',
  'You bury it for the way home.',
  'Your stomach growls but you carry it back.',
  'A good kill, young one.',
  'You learn the rhythm of the hunt.',
  'The grass barely moved as you struck.',
  'A meal for an elder tonight.',
  'A meal for the queens.',
  'Carry it carefully.',
  'You feel the weight of it in your jaws.',
  'The wind hides the kill from rivals.',
  'You leave no scent trail.',
  'The forest gives, and you take only what you need.',
  'A small one, but the Clan eats.',
  'You set it down and breathe.',
  'You stalk back the way you came, prize in mouth.',
  'You leap. You land. You have it.',
  'A patrol-worthy catch.',
  'Quiet pride. Your patrol-mate sees.',
  'A clean strike, like your mentor showed you.',
  'Your paws find the right stone to crouch on.',
  'You wait. You wait. You strike.',
  'A meal saved from the Twolegs.',
  'You drag it free of the brambles.',
];

const HERB_FLAVOR = [
  'You pluck it carefully at the stem.',
  'You roll it in a leaf to keep it fresh.',
  'You carry it gently in your mouth.',
  'The medicine cat nods.',
  'The smell stays on your whiskers.',
  'A good handful.',
  'You remember where this grew.',
  'You note the spot for next time.',
  'You set it on a flat stone.',
  'You sniff the leaf and know it is good.',
  'A healing leaf for the den.',
  'The herb stores will be full tonight.',
  'You whisper thanks to StarClan.',
  'You pick only what is needed.',
  'You leave the rest to grow.',
  'A treasure of the medicine cat.',
  'You wrap it in a wide leaf.',
  'Your paws know the right one.',
  'You learn the names quietly.',
  'You remember the bitter scent.',
  'You bite the stem clean.',
  'You hold it light, like a kit.',
  'A quiet harvest.',
  'The forest tends its sick.',
  'You add it to your bundle.',
  'You carry the smell of leaves home.',
  'The medicine cat watches and approves.',
  'You whisper its purpose to remember.',
  'A small healing waiting to happen.',
  'You carry it past the brambles, careful.',
  'You crouch beside the patch and breathe in.',
  'You count the leaves before taking any.',
];

const BORDER_FLAVOR = [
  'You mark the boundary stone.',
  'Your scent meets the wind and stays.',
  'You leave your sign at the root of the oak.',
  'The border is fresh.',
  'You walk the line your Clan walks.',
  'No rival has crossed.',
  'You catch a faint scent — old, not new. Good.',
  'You renew the mark and move on.',
  'You note the broken branch and mark it.',
  'You walk in silence beside your patrol.',
  'You scrape the earth to leave a sign.',
  'You crouch and listen. The forest is calm.',
  'Your scent will linger past sundown.',
  'You step lightly along the boundary.',
  'The Clan border holds.',
  'You read the wind for trouble. None.',
  'You leave your mark above the root.',
  'You feel the territory in your paws.',
  'You taste the air for foreign cats.',
  'A quiet border patrol.',
  'Your kin will know your scent here.',
  'You walk the line and then turn.',
  'You name the territory in your head.',
  'You leave a clean mark.',
  'You stop at the stream and watch.',
  'No fox-scent, no Twoleg-scent. Good.',
  'You walk the path your kin walked.',
  'You touch noses with your patrol-mate before turning back.',
  'The territory answers your scent with its own.',
  'A line drawn in scent and pawprints.',
  'The boundary belongs to your Clan tonight.',
  'You catch the brush of a moth and smile.',
];

const TRAINING_FLAVOR = [
  "You scratch your mentor's shoulder.",
  "You pounce on her tail.",
  "You dodge her paw and land light.",
  "You leap over her back.",
  "You roll under her belly.",
  "You strike her flank with sheathed claws.",
  "You feint left and strike right.",
  "You knock her off balance.",
  "You twist away from her teeth.",
  "You catch her ear with a soft paw.",
  "You meet her eye and don't flinch.",
  "You swipe her muzzle, gentle but quick.",
  "You drop low and rise sharp.",
  "You spin and bat her hind leg.",
  "You dance back when she lunges.",
  "You catch her tail-tip in your teeth.",
  "You pin her front paw briefly.",
  "You feint a leap and dart sideways.",
  "You match her step for step.",
  "You break her grip with a twist.",
  "You crouch, leap, strike — all in one breath.",
  "You learn the rhythm of her paws.",
  "You read her shoulders and time the dodge.",
  "You strike before she can answer.",
  "You tag her flank and roll free.",
  "You hold your ground when she charges.",
  "You weave between her legs.",
  "You catch her muzzle, gentle.",
  "You earn a tired purr from your mentor.",
  "A well-timed pounce.",
  "You move like a warrior twice your size.",
  "You step out of reach in time.",
];

const REVEAL_LINES = [
  'No shame. The path is long.',
  'Mark it in your head for next time.',
  'Even a Clan leader missed her first hunt.',
  'StarClan is patient.',
  'A wise warrior learns from every miss.',
  'The forest does not punish learners.',
  'Your mentor watches and nods. Try again.',
  'Breathe. The next answer comes.',
  'A miss is a lesson, not a wound.',
  'Save the shame for cowardice. This is study.',
  'You will know it next time.',
  'Your paws know more than yesterday.',
  'A small slip on a long path.',
  'Your kin have all stumbled here.',
  'You will catch this one tomorrow.',
  'Even Bluestar was once an apprentice.',
  'Your mentor remembers her own mistakes.',
  'The Clan knows you are learning.',
  'You stalk the answer; it is no rabbit. It will not run forever.',
  'A breath. A fresh start. Onward.',
  'You see it now. Hold the picture in your head.',
  'A warrior keeps her tail up after a miss.',
  'The forest forgives. So should you.',
  'Tomorrow this will be easy.',
  'You missed by a whisker. Try the next.',
  'You learn faster than you think.',
  'Each miss is a step toward sure paws.',
  'Your mentor whispers — "again, with more focus."',
  'StarClan walks beside the learning, not just the winning.',
  'You will not always strike true. You always rise.',
  'Steady, young one. The next answer is yours.',
  'A lesson noted in the moss.',
];

// Med-cat training flavor (used when path is medicine cat — same drills, different framing).
const MEDCAT_TRAINING_FLAVOR = [
  'The medicine cat tests your memory of the herbs.',
  'You recite the count without looking.',
  'You arrange the leaves in piles to count.',
  'You match the stems by twos and threes.',
  'You sort the bundle by feel.',
  'The medicine cat hums approval.',
];

// =====================================================================
// STORAGE SHIM (window.storage in Anthropic artifact runtime; localStorage fallback for local dev)
// =====================================================================

const storage = (() => {
  if (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function') {
    return window.storage;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      get: async (key) => {
        const v = window.localStorage.getItem(key);
        return v ? { value: v } : null;
      },
      set: async (key, value) => { window.localStorage.setItem(key, value); },
      delete: async (key) => { window.localStorage.removeItem(key); },
    };
  }
  return { get: async () => null, set: async () => {}, delete: async () => {} };
})();

const SAVES_KEY = 'warriors-path-saves';
const LEGACY_KEY = 'apprentice-profile';

// =====================================================================
// HELPERS
// =====================================================================

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const weightedPick = (table) => {
  const total = table.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of table) {
    r -= t.weight;
    if (r <= 0) return t.name;
  }
  return table[0].name;
};

const newSlotId = () => 'slot-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);

const getRankInfo = (profile) => {
  const ladder = ranksFor(profile.path);
  const idx = ladder.findIndex((r) => r.name === profile.rank);
  return {
    ladder,
    current: ladder[idx >= 0 ? idx : 0],
    next: ladder[(idx >= 0 ? idx : 0) + 1] || null,
  };
};

// Determine the highest rank the player has earned automatically (auto: true only).
// Chance-based ranks (Deputy, Leader) are NOT included here — those are decided by rollEligibleChanceRank.
const autoRankForCorrect = (path, totalCorrect) => {
  const ladder = ranksFor(path);
  let current = ladder[0];
  for (const r of ladder) {
    if (r.auto && totalCorrect >= r.min) current = r;
  }
  return current.name;
};

// If the player is currently at the highest auto-rank, check whether a chance-based promotion is now eligible.
// Returns the new rank name to promote to, or null. Each call rolls the dice once.
const rollEligibleChanceRank = (profile) => {
  const ladder = ranksFor(profile.path);
  const idx = ladder.findIndex((r) => r.name === profile.rank);
  if (idx < 0 || idx >= ladder.length - 1) return null;
  const next = ladder[idx + 1];
  if (next.auto) return null;                          // not a chance promotion
  if (profile.totalCorrect < next.min) return null;    // not yet eligible
  if (Math.random() < CHANCE_PROMOTION_PER_PATROL) return next.name;
  return null;
};

const getFullName = (profile) => {
  if (!profile) return '';
  const r = profile.rank;
  if (r === 'Apprentice' || r === 'Medicine Cat Apprentice') return profile.prefix + 'paw';
  if (r === 'Leader') return profile.prefix + 'star';
  // Everyone else (Young Warrior, Warrior, Deputy, Medicine Cat, Senior Medicine Cat) uses their chosen suffix
  return profile.prefix + (profile.suffix || 'foot');
};

const isMedicinePath = (profile) => profile && profile.path === PATH_MEDICINE;

const getMentorTitle = (profile) => {
  if (!profile || !profile.mentor) return '';
  return isMedicinePath(profile) ? `medicine cat ${profile.mentor}` : profile.mentor;
};

// =====================================================================
// PROBLEM GENERATORS
// =====================================================================

const genMult = (profile) => {
  const a = randInt(2, 12);
  const b = randInt(2, 12);
  // 70% pure drill, 30% short word problem
  if (Math.random() < 0.7) {
    return {
      question: `${a} × ${b}`,
      answer: a * b,
      story: isMedicinePath(profile)
        ? pick(MEDCAT_TRAINING_FLAVOR)
        : `Your mentor ${profile.mentor || ''} drills you on counting strokes.`.replace(/\s+/g, ' ').trim(),
      hint: `Think of ${a} groups of ${b}.`,
    };
  }
  const stories = [
    `Your patrol moves through ${a} thickets, scaring up ${b} sparrows from each. How many sparrows in all?`,
    `You drill ${a} sets of ${b} pounces. How many pounces?`,
    `${a} apprentices each catch ${b} mice over a moon. How many mice?`,
    `You leap ${a} times across ${b} stones each leap. How many stones?`,
  ];
  return {
    question: `${a} × ${b}`,
    answer: a * b,
    story: pick(stories),
    hint: `Picture ${a} groups of ${b}.`,
  };
};

const genAdd = () => {
  const mode = Math.random();
  // 35% small add (single patrol-scale prey)
  if (mode < 0.35) {
    const a = randInt(2, 9);
    const b = randInt(2, 9);
    const stories = [
      `On your way home you carry ${a} mice. Your patrol-mate carries ${b} voles. How many prey altogether?`,
      `You catch ${a} sparrows at the edge of the clearing. You catch ${b} more by the stream. How many sparrows in all?`,
      `Two apprentices each share their catch — ${a} from one, ${b} from the other. How many altogether?`,
      `You catch ${a} prey in the morning. You catch ${b} more in the afternoon. How many for the day?`,
    ];
    return { question: `${a} + ${b}`, answer: a + b, story: pick(stories), hint: `Add the numbers.` };
  }
  // 35% small subtract (carrying & sharing, not "fresh-kill pile depleting")
  if (mode < 0.7) {
    const start = randInt(6, 14);
    const give = randInt(1, start - 1);
    const stories = [
      `You set out with ${start} mice for the elders. You give ${give} to the elder den. How many do you carry to the queens?`,
      `You hunted ${start} prey today. You and your patrol have already eaten ${give}. How many do you bring home?`,
      `You carry ${start} sparrows to the camp. ${give} are claimed by the warriors. How many remain for the apprentices?`,
      `You begin the day with ${start} fresh-caught voles. ${give} go straight to the medicine cat for sick cats. How many for the rest of the Clan?`,
    ];
    return { question: `${start} − ${give}`, answer: start - give, story: pick(stories), hint: `Take ${give} away from ${start}.` };
  }
  // 30% large numbers ONLY in "moon-scale" framings
  if (Math.random() < 0.5) {
    const a = randInt(20, 80);
    const b = randInt(20, 80);
    const stories = [
      `Over a whole moon, your Clan caught ${a} mice and ${b} voles. How many prey in all?`,
      `In greenleaf, your Clan added ${a} prey to the pile. In the next half-moon, ${b} more. How many in total?`,
      `Across many sunrises, the apprentices brought back ${a} small birds. The warriors brought back ${b}. How many altogether?`,
    ];
    return { question: `${a} + ${b}`, answer: a + b, story: pick(stories), hint: `Tens first, then ones.` };
  }
  const big = randInt(40, 120);
  const small = randInt(10, big - 5);
  const stories = [
    `Across a moon, your Clan caught ${big} prey. ${small} were eaten by the Clan during that time. How many remained at moon's end?`,
    `Your Clan begins leaf-fall with ${big} stored herbs. Over many days, ${small} are used. How many remain?`,
    `By the end of greenleaf, the Clan had added ${big} prey to the pile. ${small} fed the elders and queens. How many were left for the warriors?`,
  ];
  return { question: `${big} − ${small}`, answer: big - small, story: pick(stories), hint: `Subtract carefully — borrow if needed.` };
};

const genGeometry = (profile) => {
  const clanLocs = LOCATIONS_BY_CLAN[profile.clan] || LOCATIONS_BY_CLAN.ThunderClan;
  const loc = pick(clanLocs);
  const unit = loc.scale === 'small' ? 'tail-lengths' : loc.scale === 'medium' ? 'fox-lengths' : 'tree-lengths';
  // Width/height kept reasonable for the scale
  const sizeRange = loc.scale === 'small' ? [3, 10] : loc.scale === 'medium' ? [4, 12] : [5, 14];
  const w = randInt(sizeRange[0], sizeRange[1]);
  const h = randInt(sizeRange[0], sizeRange[1]);
  if (Math.random() < 0.5) {
    const stories = [
      `You walk the boundary of ${loc.name}.`,
      `Your patrol traces every edge of ${loc.name}.`,
      `Your mentor asks you to pace the edge of ${loc.name}.`,
    ];
    return {
      question: `${loc.name} is ${w} ${unit} wide and ${h} ${unit} long. What is the PERIMETER?`,
      answer: 2 * (w + h),
      story: pick(stories),
      hint: `Perimeter = ${w} + ${h} + ${w} + ${h}.`,
    };
  }
  const stories = [
    `You sit at the edge of ${loc.name} and consider how much ground it covers.`,
    `Your mentor asks how many squares of ground ${loc.name} would hold.`,
    `You imagine a grid laid over ${loc.name}.`,
  ];
  return {
    question: `${loc.name} is ${w} ${unit} wide and ${h} ${unit} long. What is the AREA?`,
    answer: w * h,
    story: pick(stories),
    hint: `Area = width × length: ${w} × ${h}.`,
  };
};

const genFraction = (profile) => {
  const denoms = [2, 3, 4, 5];
  const d = denoms[randInt(0, denoms.length - 1)];
  const mult = randInt(2, 10);
  const num = d * mult;
  const names = { 2: 'half', 3: 'a third', 4: 'a quarter', 5: 'a fifth' };
  const medCat = MEDICINE_CATS_BY_CLAN[profile.clan] || pick(Object.values(MEDICINE_CATS_BY_CLAN));
  const herb = pick(HERBS).name;
  const recipient = pick(FRACTION_RECIPIENTS);
  const templates = [
    `${medCat} gathered ${num} ${herb} leaves and gave ${names[d]} to ${recipient}. How many did they receive?`,
    `You bring back ${num} ${herb} leaves. The medicine cat sends ${names[d]} to ${recipient}. How many leaves go?`,
    `${num} ${herb} leaves are split. ${names[d]} of them is set aside for ${recipient}. How many is that?`,
    `Your bundle holds ${num} ${herb} leaves. ${names[d]} is needed for ${recipient}. How many leaves?`,
  ];
  return {
    question: pick(templates),
    answer: num / d,
    story: 'A medicine cat shares the herb stores carefully.',
    hint: `Divide ${num} into ${d} equal piles. Take one pile.`,
  };
};

const generateProblem = (topic, profile) => {
  if (topic === 'mult')     return genMult(profile);
  if (topic === 'add')      return genAdd();
  if (topic === 'geometry') return genGeometry(profile);
  if (topic === 'fraction') return genFraction(profile);
  return genMult(profile);
};

// =====================================================================
// MIGRATION / NORMALIZATION
// =====================================================================

// Bring a single profile up to the v13 shape. Used both for v12→v13 migration
// and for defensive normalization of imported saves.
const normalizeToV13 = (raw) => {
  const v12HighRank = raw.highestRank || raw.rank || 'Apprentice';
  const isWarriorOrAbove =
    ['Warrior', 'Senior Warrior', 'Deputy', 'Leader', 'Young Warrior'].includes(v12HighRank);

  // Path: assume warrior path for any pre-v13 save (medicine path is new in v13).
  const path = raw.path === PATH_MEDICINE ? PATH_MEDICINE : PATH_WARRIOR;

  // Map old rank names into v13 ladder.
  let rank = 'Apprentice';
  if (path === PATH_MEDICINE) {
    rank = isWarriorOrAbove ? 'Medicine Cat' : 'Medicine Cat Apprentice';
  } else if (v12HighRank === 'Warrior')         rank = 'Young Warrior';
  else if (v12HighRank === 'Senior Warrior')    rank = 'Warrior';
  else if (v12HighRank === 'Deputy')            rank = 'Deputy';
  else if (v12HighRank === 'Leader')            rank = 'Leader';
  else if (v12HighRank === 'Young Warrior')     rank = 'Young Warrior';
  else if (v12HighRank === 'Medicine Cat')      rank = 'Medicine Cat';
  else if (v12HighRank === 'Senior Medicine Cat') rank = 'Senior Medicine Cat';
  else if (v12HighRank === 'Apprentice' || v12HighRank === 'Kit') rank = 'Apprentice';

  // Pick suffix: keep it if real; otherwise blank for apprentices, sensible default for warriors.
  let suffix = raw.suffix && raw.suffix !== 'paw' && raw.suffix !== 'kit' ? raw.suffix : '';
  if (!suffix && rank !== 'Apprentice' && rank !== 'Medicine Cat Apprentice') {
    suffix = path === PATH_MEDICINE ? 'leaf' : 'foot';
  }

  // Bump totalCorrect to the floor of the rank we're claiming, so the progress bar
  // never reports the player as below their own rank threshold.
  const ladder = ranksFor(path);
  const minForRank = (ladder.find((r) => r.name === rank) || ladder[0]).min;
  const totalCorrect = Math.max(raw.totalCorrect || 0, minForRank);

  return {
    _version: 13,
    id: raw.id || newSlotId(),
    prefix: raw.prefix || 'Moss',
    suffix,
    path,
    rank,
    clan: raw.clan || 'ThunderClan',
    furColor: raw.furColor || 'Grey',
    eyeColor: raw.eyeColor || 'Amber',
    mentor: raw.mentor || null,
    totalCorrect,
    totalAttempted: raw.totalAttempted || totalCorrect,
    preyCaught: raw.preyCaught || {},
    herbsCaught: raw.herbsCaught || {},
    streak: raw.streak || 0,
    lastPlayed: raw.lastPlayed || null,
    patrolsToday: raw.patrolsToday || 0,
    dateCreated: raw.dateCreated || new Date().toISOString(),
  };
};

// Load all saves: prefer new multi-slot key; fall back to migrating legacy single-profile.
const loadSavesContainer = async () => {
  try {
    const newer = await storage.get(SAVES_KEY);
    if (newer && newer.value) {
      const parsed = JSON.parse(newer.value);
      if (parsed && parsed.slots && parsed.slots.length > 0) {
        // Re-normalize each slot defensively.
        parsed.slots = parsed.slots.map(normalizeToV13);
        return parsed;
      }
    }
  } catch (e) { /* fall through to legacy */ }

  try {
    const legacy = await storage.get(LEGACY_KEY);
    if (legacy && legacy.value) {
      const oldProfile = JSON.parse(legacy.value);
      const migrated = normalizeToV13(oldProfile);
      const container = { _format: 'warriors-path-saves', _version: 13, activeId: migrated.id, slots: [migrated] };
      await storage.set(SAVES_KEY, JSON.stringify(container));
      // Leave legacy key in place — non-destructive.
      return container;
    }
  } catch (e) { /* none */ }

  return null;
};

const persistContainer = async (container) => {
  try { await storage.set(SAVES_KEY, JSON.stringify(container)); }
  catch (e) { console.error('Storage error:', e); }
};

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export default function WarriorsPath() {
  const [container, setContainer] = useState(null); // { activeId, slots }
  const [view, setView] = useState('loading');
  const [patrol, setPatrol] = useState(null);
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [pendingCeremony, setPendingCeremony] = useState(null); // 'warrior' | 'medicine'

  const profile = container && container.slots.find((s) => s.id === container.activeId);

  useEffect(() => { (async () => {
    const loaded = await loadSavesContainer();
    if (loaded && loaded.slots.length > 0) {
      // Daily-streak housekeeping for the active profile only.
      const active = loaded.slots.find((s) => s.id === loaded.activeId) || loaded.slots[0];
      const today = new Date().toDateString();
      if (active.lastPlayed && active.lastPlayed !== today) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (active.lastPlayed !== yesterday.toDateString()) active.streak = 0;
        active.patrolsToday = 0;
      }
      loaded.activeId = active.id;
      setContainer(loaded);
      setView(loaded.slots.length > 1 ? 'slots' : 'den');
    } else {
      setView('intro');
    }
  })(); }, []);

  // ---- Slot/profile helpers ----

  const persist = async (next) => { setContainer(next); await persistContainer(next); };

  const updateActive = async (mutator) => {
    if (!container) return;
    const next = {
      ...container,
      slots: container.slots.map((s) => (s.id === container.activeId ? mutator(s) : s)),
    };
    await persist(next);
    return next.slots.find((s) => s.id === next.activeId);
  };

  const addSlotAndActivate = async (newProfile) => {
    const next = container
      ? { ...container, activeId: newProfile.id, slots: [...container.slots, newProfile] }
      : { _format: 'warriors-path-saves', _version: 13, activeId: newProfile.id, slots: [newProfile] };
    await persist(next);
  };

  const setActiveSlot = async (id) => {
    if (!container) return;
    await persist({ ...container, activeId: id });
  };

  const deleteSlot = async (id) => {
    if (!container) return;
    const remaining = container.slots.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      await storage.delete(SAVES_KEY);
      setContainer(null);
      setView('intro');
      return;
    }
    const next = { ...container, slots: remaining, activeId: remaining[0].id };
    await persist(next);
  };

  // ---- Export / import ----

  const exportProfile = () => {
    if (!profile) return;
    const data = { _format: 'warriors-path-save', _version: 13, _exportedAt: new Date().toISOString(), profile };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warriors-path-${getFullName(profile)}-${profile.clan}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importProfile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // Accept three shapes:
        //   1. Wrapped v12/v13 export:   { _format, _version, profile: {...} }
        //   2. Bare profile JSON:        { prefix, suffix, clan, ... }
        //   3. Multi-slot container:     { _format, slots: [...], activeId }
        let raw = null;
        if (data && data.profile) raw = data.profile;
        else if (data && Array.isArray(data.slots) && data.slots.length > 0) raw = data.slots[0];
        else if (data && (data.prefix || data.clan)) raw = data;
        if (!raw) {
          alert('That file does not look like a Warrior\'s Path save.');
          return;
        }
        const imported = normalizeToV13({ ...raw, id: newSlotId() });
        await addSlotAndActivate(imported);
        setView('den');
      } catch (err) {
        alert('Could not read save file: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // ---- Patrol completion / rank-ups / ceremony detection ----

  const finishPatrol = async (correct, rewards) => {
    const today = new Date().toDateString();
    const isNewDay = profile.lastPlayed !== today;
    const updated = await updateActive((p) => {
      const next = {
        ...p,
        totalCorrect: p.totalCorrect + correct,
        totalAttempted: p.totalAttempted + patrol.problems.length,
        preyCaught: { ...(p.preyCaught || {}) },
        herbsCaught: { ...(p.herbsCaught || {}) },
        streak: isNewDay ? (p.streak || 0) + 1 : p.streak,
        lastPlayed: today,
        patrolsToday: isNewDay ? 1 : (p.patrolsToday || 0) + 1,
      };
      rewards.prey.forEach((x) => { next.preyCaught[x] = (next.preyCaught[x] || 0) + 1; });
      rewards.herbs.forEach((x) => { next.herbsCaught[x] = (next.herbsCaught[x] || 0) + 1; });

      // Step 1: auto-rank promotions (Apprentice→Young Warrior→Warrior, or Med Apprentice→Med Cat→Senior).
      const autoRank = autoRankForCorrect(p.path, next.totalCorrect);
      let newRank = autoRank;

      // Step 2: chance-based promotions (Deputy / Leader). Only roll if the auto-rank kept us at the
      // highest auto step — i.e. we're a Warrior eyeing Deputy, or a Deputy eyeing Leader.
      const chancePick = rollEligibleChanceRank({ ...next, rank: newRank });
      if (chancePick) newRank = chancePick;

      next._rankUp = newRank !== p.rank;
      next._previousRank = p.rank;
      next.rank = newRank;

      // When promoted to Leader, the suffix becomes -star (book canon). Stash the old suffix so
      // the leader-ceremony view can render the "you are no longer X" line.
      if (next.rank === 'Leader' && p.rank !== 'Leader') {
        next._oldSuffix = p.suffix;
        next.suffix = 'star';
      }
      return next;
    });

    // Route to the appropriate ceremony view if this rank-up calls for one.
    if (updated && updated._rankUp) {
      const r = updated.rank;
      if (r === 'Young Warrior') { setPendingCeremony('warrior');  setView('name_ceremony'); return; }
      if (r === 'Medicine Cat')  { setPendingCeremony('medicine'); setView('name_ceremony'); return; }
      if (r === 'Deputy')        { setView('deputy_ceremony'); return; }
      if (r === 'Leader')        { setView('leader_ceremony'); return; }
    }
    setView('complete');
  };

  // =====================================================================
  // VIEW SWITCH
  // =====================================================================

  if (view === 'loading') {
    return (
      <div style={styles.root}>
        <FontLoader />
        <div style={{ textAlign: 'center', padding: '120px 20px', opacity: 0.6 }}>
          <div style={{ ...styles.display, fontSize: 14, letterSpacing: '0.3em' }}>THE FOREST STIRS...</div>
        </div>
      </div>
    );
  }

  if (view === 'intro') {
    return <IntroView
      onStart={() => setView('character')}
      onImport={importProfile}
      hasSlots={container && container.slots.length > 0}
      onChooseSlot={() => setView('slots')}
    />;
  }

  if (view === 'slots') {
    return <SlotListView
      container={container}
      onSelect={async (id) => { await setActiveSlot(id); setView('den'); }}
      onNew={() => setView('character')}
      onDelete={async (id) => {
        if (window.confirm('Forget this Clan cat? This cannot be undone. (Save to file first if you want to keep them.)')) {
          await deleteSlot(id);
        }
      }}
      onImport={importProfile}
    />;
  }

  if (view === 'character') {
    return <CharacterCreation
      onCreate={async (data) => {
        // Determine medicine-cat eligibility deterministically per slot creation.
        const medCatHasOpening = Math.random() < 0.7; // 70% of new kits find an opening
        const newProfile = {
          _version: 13,
          id: newSlotId(),
          prefix: data.prefix,
          suffix: '', // empty until warrior/medicine ceremony
          path: PATH_WARRIOR, // tentatively; chosen at apprentice ceremony
          rank: 'Apprentice', // tentative; locked in at apprentice ceremony
          clan: data.clan,
          furColor: data.furColor,
          eyeColor: data.eyeColor,
          mentor: null,
          medCatOpening: medCatHasOpening,
          totalCorrect: 0,
          totalAttempted: 0,
          preyCaught: {},
          herbsCaught: {},
          streak: 0,
          lastPlayed: null,
          patrolsToday: 0,
          dateCreated: new Date().toISOString(),
        };
        await addSlotAndActivate(newProfile);
        setView('apprentice_ceremony');
      }}
      onCancel={() => setView(container && container.slots.length > 0 ? 'slots' : 'intro')}
    />;
  }

  if (view === 'apprentice_ceremony') {
    return <ApprenticeCeremony
      profile={profile}
      onComplete={async (path) => {
        await updateActive((p) => {
          const isMed = path === PATH_MEDICINE;
          const mentor = isMed
            ? MEDICINE_CATS_BY_CLAN[p.clan]
            : pick(MENTORS_BY_CLAN[p.clan] || ['Lionheart']);
          return {
            ...p,
            path,
            rank: isMed ? 'Medicine Cat Apprentice' : 'Apprentice',
            mentor,
          };
        });
        setView('den');
      }}
    />;
  }

  if (view === 'name_ceremony') {
    return <NameCeremony
      profile={profile}
      ceremony={pendingCeremony}
      onComplete={async (suffix) => {
        await updateActive((p) => ({ ...p, suffix }));
        setPendingCeremony(null);
        setView('complete');
      }}
    />;
  }

  if (view === 'deputy_ceremony') {
    return <DeputyCeremony profile={profile} onContinue={() => setView('complete')} />;
  }

  if (view === 'leader_ceremony') {
    return <LeaderCeremony profile={profile} onContinue={() => setView('complete')} />;
  }

  if (view === 'den') {
    return <DenView
      profile={profile}
      slotsCount={container ? container.slots.length : 0}
      onStartPatrol={(patrolType) => {
        const problems = Array.from({ length: 5 }, () => generateProblem(patrolType.topic, profile));
        setPatrol({ type: patrolType, problems, currentIdx: 0, correct: 0, rewards: { prey: [], herbs: [], borders: 0, training: 0 }, attempts: 0 });
        setAnswerInput(''); setFeedback(null); setShowHint(false);
        setView('patrol');
      }}
      onSwitchCharacter={() => setView('slots')}
      onExport={exportProfile}
      onImport={importProfile}
    />;
  }

  if (view === 'patrol') {
    const current = patrol.problems[patrol.currentIdx];
    const clan = CLANS.find((c) => c.name === profile.clan);
    return <PatrolView
      patrol={patrol}
      profile={profile}
      current={current}
      answerInput={answerInput}
      setAnswerInput={setAnswerInput}
      feedback={feedback}
      showHint={showHint}
      setShowHint={setShowHint}
      clanAccent={clan.accent}
      onSubmit={() => {
        const num = parseInt(answerInput, 10);
        if (isNaN(num)) {
          setFeedback({ type: 'nudge', text: 'Enter a number, warrior.' });
          return;
        }
        if (num === current.answer) {
          // Build the reward for this problem based on patrol kind.
          const reward = buildCorrectReward(patrol.type, profile);
          setFeedback({ type: 'correct', praise: pick(PRAISE), ...reward });
          const nextIdx = patrol.currentIdx + 1;
          const nextRewards = {
            ...patrol.rewards,
            prey: reward.prey ? [...patrol.rewards.prey, reward.prey] : patrol.rewards.prey,
            herbs: reward.herb ? [...patrol.rewards.herbs, reward.herb] : patrol.rewards.herbs,
            borders: patrol.rewards.borders + (reward.kind === 'border' ? 1 : 0),
            training: patrol.rewards.training + (reward.kind === 'training' ? 1 : 0),
          };
          const updatedPatrol = { ...patrol, correct: patrol.correct + 1, rewards: nextRewards, attempts: 0 };
          setTimeout(() => {
            if (nextIdx >= patrol.problems.length) {
              finishPatrol(updatedPatrol.correct, updatedPatrol.rewards);
            } else {
              setPatrol({ ...updatedPatrol, currentIdx: nextIdx });
              setAnswerInput(''); setFeedback(null); setShowHint(false);
            }
          }, 1500);
        } else {
          if (patrol.attempts >= 1) {
            setFeedback({ type: 'reveal', text: `${pick(REVEAL_LINES)} The answer was ${current.answer}.` });
            const nextIdx = patrol.currentIdx + 1;
            setTimeout(() => {
              if (nextIdx >= patrol.problems.length) {
                finishPatrol(patrol.correct, patrol.rewards);
              } else {
                setPatrol({ ...patrol, currentIdx: nextIdx, attempts: 0 });
                setAnswerInput(''); setFeedback(null); setShowHint(false);
              }
            }, 2400);
          } else {
            setPatrol({ ...patrol, attempts: patrol.attempts + 1 });
            setFeedback({ type: 'try_again', text: 'Not quite. Try again.' });
            setAnswerInput('');
          }
        }
      }}
      onQuit={() => setView('den')}
    />;
  }

  if (view === 'complete') {
    return <CompleteView
      profile={profile}
      patrol={patrol}
      onReturn={() => { setPatrol(null); setView('den'); }}
    />;
  }

  return null;
}

// Build the per-problem reward based on patrol kind.
function buildCorrectReward(patrolType, profile) {
  if (patrolType.reward === 'prey') {
    // Earliest catches biased to small prey
    const veryEarly = (profile.totalCorrect || 0) < 8;
    const prey = weightedPick(veryEarly ? PREY_EARLY : PREY_COMMON);
    return { kind: 'prey', prey, flavor: pick(PREY_FLAVOR) };
  }
  if (patrolType.reward === 'herb') {
    const herb = pick(HERBS).name;
    return { kind: 'herb', herb, flavor: pick(HERB_FLAVOR) };
  }
  if (patrolType.reward === 'border') {
    return { kind: 'border', flavor: pick(BORDER_FLAVOR) };
  }
  if (patrolType.reward === 'training') {
    return { kind: 'training', flavor: pick(TRAINING_FLAVOR) };
  }
  return { kind: 'none', flavor: '' };
}

// =====================================================================
// SUB-VIEWS
// =====================================================================

const IntroView = ({ onStart, onImport, hasSlots, onChooseSlot }) => (
  <div style={styles.root}>
    <FontLoader />
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 12px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.5em', color: '#7a8571', marginBottom: 16, ...styles.display }}>
          A TALE FROM THE CLANS
        </div>
        <h1 style={{ ...styles.display, fontSize: 42, margin: 0, color: '#e8dcc0', fontWeight: 700, lineHeight: 1.1 }}>
          THE WARRIOR'S PATH
        </h1>
        <div style={{ width: 80, height: 1, background: '#7a8571', margin: '24px auto' }} />
        <div style={{ fontSize: 16, color: '#a39d88', fontStyle: 'italic', lineHeight: 1.6 }}>
          Every warrior was once a kit in the nursery.<br />
          Every leader began with a name ending in -paw.
        </div>
      </div>
      <div style={{ background: 'rgba(26, 36, 25, 0.5)', border: '1px solid #2a3329', padding: '28px 24px', borderRadius: 2, marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: '#c8c0a8' }}>
          You will be named in the nursery. The leader will call you to the Highrock and make you an apprentice. You will train with your mentor, hunt for your Clan, walk the borders, and learn the herbs.
        </p>
        <p style={{ margin: '16px 0 0', fontSize: 17, lineHeight: 1.7, color: '#c8c0a8' }}>
          No timers. No pressure. Only the path.
        </p>
      </div>

      {hasSlots && (
        <button onClick={onChooseSlot} style={btnPrimary('#d97642')}>
          CONTINUE A CLAN CAT
        </button>
      )}

      <button onClick={onStart} style={hasSlots ? btnSecondary('#d97642') : btnPrimary('#d97642')}>
        BEGIN A NEW JOURNEY
      </button>

      <label style={loadFromFileLink}>
        load saved Clan cat from file
        <input type="file" accept="application/json,.json" onChange={onImport} style={{ display: 'none' }} />
      </label>
    </div>
  </div>
);

const SlotListView = ({ container, onSelect, onNew, onDelete, onImport }) => (
  <div style={styles.root}>
    <FontLoader />
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 12px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 8, ...styles.display }}>
          THE NURSERY · THE WARRIORS' DEN
        </div>
        <h2 style={{ ...styles.display, fontSize: 28, margin: 0, color: '#e8dcc0', fontWeight: 600 }}>
          CHOOSE YOUR CAT
        </h2>
      </div>

      <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
        {container.slots.map((s) => {
          const clan = CLANS.find((c) => c.name === s.clan);
          const fullName = getFullName(s);
          return (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'stretch', gap: 8,
            }}>
              <button onClick={() => onSelect(s.id)} style={{
                flex: 1,
                background: 'rgba(26, 36, 25, 0.5)',
                border: '1px solid #2a3329',
                padding: '14px 16px',
                color: '#e8dcc0',
                cursor: 'pointer',
                borderRadius: 2,
                textAlign: 'left',
              }}>
                <div style={{ ...styles.display, fontSize: 18, color: clan.accent, fontWeight: 700, letterSpacing: '0.05em' }}>
                  {fullName.toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: '#a39d88', marginTop: 4, fontStyle: 'italic' }}>
                  {s.rank} · {s.clan} · {s.furColor.toLowerCase()} pelt · {s.eyeColor.toLowerCase()} eyes
                </div>
                <div style={{ fontSize: 11, color: '#7a8571', marginTop: 4 }}>
                  {s.totalCorrect} correct · streak {s.streak || 0}
                </div>
              </button>
              <button onClick={() => onDelete(s.id)} title="forget this Clan cat" style={{
                background: 'transparent',
                border: '1px solid #3a2929',
                color: '#7a4a4a',
                cursor: 'pointer',
                padding: '0 12px',
                fontSize: 12,
                borderRadius: 2,
                fontFamily: "'Crimson Text', serif",
              }}>
                forget
              </button>
            </div>
          );
        })}
      </div>

      <button onClick={onNew} style={btnPrimary('#d97642')}>
        + NEW APPRENTICE
      </button>
      <label style={loadFromFileLink}>
        load saved Clan cat from file
        <input type="file" accept="application/json,.json" onChange={onImport} style={{ display: 'none' }} />
      </label>
    </div>
  </div>
);

// ============ CHARACTER CREATION ============

const CharacterCreation = ({ onCreate, onCancel }) => {
  const [prefix, setPrefix]       = useState('Moss');
  const [clan, setClan]           = useState(CLANS[0].name);
  const [furColor, setFurColor]   = useState('Grey');
  const [eyeColor, setEyeColor]   = useState('Amber');
  const [customPrefix, setCustom] = useState('');

  const finalPrefix = customPrefix.trim() || prefix;
  const clanObj = CLANS.find((c) => c.name === clan);

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 8px' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 12, ...styles.display }}>
            IN THE NURSERY
          </div>
          <h2 style={{ ...styles.display, fontSize: 26, margin: 0, color: '#e8dcc0', fontWeight: 600 }}>
            YOUR MOTHER NAMES YOU
          </h2>
          <div style={{ fontSize: 14, color: '#a39d88', fontStyle: 'italic', marginTop: 8, lineHeight: 1.5 }}>
            She licks your fur flat, looks down at you, and decides on a name. Help her choose.
          </div>
        </div>

        <div style={panel}>
          <label style={labelStyle}>YOUR KIT NAME (prefix only)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {KIT_PREFIX_OPTIONS.map((p) => (
              <button key={p} onClick={() => { setPrefix(p); setCustom(''); }} style={{
                ...chipStyle,
                background: (customPrefix === '' && prefix === p) ? clanObj.accent : 'transparent',
                color: (customPrefix === '' && prefix === p) ? '#0a0f0a' : '#c8c0a8',
                borderColor: (customPrefix === '' && prefix === p) ? clanObj.accent : '#3a4339',
              }}>{p}</button>
            ))}
          </div>
          <input type="text" placeholder="Or type your own prefix..." value={customPrefix}
            onChange={(e) => setCustom(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            maxLength={12} style={inputStyle} />
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 18, color: '#e8dcc0' }}>
            "Welcome, little one. You are <strong style={{ color: clanObj.accent }}>{finalPrefix}kit</strong>."
          </div>
        </div>

        <div style={panel}>
          <label style={labelStyle}>YOUR CLAN</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {CLANS.map((c) => (
              <button key={c.name} onClick={() => setClan(c.name)} style={{
                padding: '14px 10px',
                background: clan === c.name ? 'rgba(217, 118, 66, 0.1)' : 'transparent',
                border: `1px solid ${clan === c.name ? c.accent : '#3a4339'}`,
                color: clan === c.name ? c.accent : '#c8c0a8',
                cursor: 'pointer', borderRadius: 2, textAlign: 'left',
              }}>
                <div style={{ ...styles.display, fontSize: 12, letterSpacing: '0.15em', marginBottom: 4 }}>
                  {c.name.toUpperCase()}
                </div>
                <div style={{ fontSize: 11, opacity: 0.8, fontStyle: 'italic' }}>{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={panel}>
          <label style={labelStyle}>PELT</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {FUR_COLORS.map((f) => (
              <button key={f} onClick={() => setFurColor(f)} style={{
                ...chipStyle,
                background: furColor === f ? clanObj.accent : 'transparent',
                color: furColor === f ? '#0a0f0a' : '#c8c0a8',
                borderColor: furColor === f ? clanObj.accent : '#3a4339',
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ ...panel, marginBottom: 24 }}>
          <label style={labelStyle}>EYES</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EYE_COLORS.map((e) => (
              <button key={e} onClick={() => setEyeColor(e)} style={{
                ...chipStyle,
                background: eyeColor === e ? clanObj.accent : 'transparent',
                color: eyeColor === e ? '#0a0f0a' : '#c8c0a8',
                borderColor: eyeColor === e ? clanObj.accent : '#3a4339',
              }}>{e}</button>
            ))}
          </div>
        </div>

        <button onClick={() => onCreate({ prefix: finalPrefix, clan, furColor, eyeColor })} style={btnPrimary(clanObj.accent)}>
          ENTER THE FOREST
        </button>
        <button onClick={onCancel} style={{
          width: '100%', background: 'transparent', border: 'none', color: '#5a6155',
          fontSize: 11, marginTop: 6, cursor: 'pointer', textDecoration: 'underline',
          fontFamily: "'Crimson Text', serif", letterSpacing: '0.1em',
        }}>
          back
        </button>
      </div>
    </div>
  );
};

// ============ APPRENTICE CEREMONY ============

const ApprenticeCeremony = ({ profile, onComplete }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const leader = LEADERS_BY_CLAN[profile.clan];
  const possibleMentor = pick(MENTORS_BY_CLAN[profile.clan] || ['Lionheart']);
  const medCat = MEDICINE_CATS_BY_CLAN[profile.clan];
  const medOpening = profile.medCatOpening !== false;

  // Three steps so the medicine-cat path is something you ASK FOR, not just a button:
  //   'choose'  — do you want to ask the medicine cat to be your mentor?
  //   'asking'  — you walk to the medicine cat den and speak.
  //   (then onComplete fires)
  const [step, setStep] = useState('choose');
  const [intent, setIntent] = useState(null); // 'warrior' | 'ask_medicine'

  if (step === 'asking') {
    return (
      <div style={styles.root}>
        <FontLoader />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 12px' }}>
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 10, ...styles.display }}>
              THE MEDICINE CAT'S DEN
            </div>
            <h2 style={{ ...styles.display, fontSize: 22, margin: 0, color: clan.accent, fontWeight: 600 }}>
              YOU ASK FOR A MENTOR
            </h2>
          </div>

          <div style={panel}>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
              You slip past the bramble screen into the medicine cat den. The smell of herbs is sharp and green. <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{medCat}</strong> looks up from sorting leaves.
            </p>
            <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
              "<em>{medCat}, I want to be a medicine cat. Will you take me as your apprentice?</em>"
            </p>
            {medOpening ? (
              <>
                <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                  {medCat} studies you a long moment. Then she dips her head.
                </p>
                <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
                  "<em>I have no apprentice. StarClan has not sent me one — perhaps until now. If your heart is set on this path, I will speak to {leader}.</em>"
                </p>
                <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.7, color: '#a39d88' }}>
                  At the next ceremony, the leader announces a different name for you: not warrior apprentice, but medicine cat apprentice. {medCat} will be your mentor.
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                  {medCat} sighs, kindly.
                </p>
                <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
                  "<em>I already have an apprentice this season. There is only ever one. But your heart is good, little one — go and learn the warrior way. The Clan needs every kind of cat.</em>"
                </p>
              </>
            )}
          </div>

          {medOpening ? (
            <button onClick={() => onComplete(PATH_MEDICINE)} style={btnPrimary(clan.accent)}>
              ACCEPT THE PATH
            </button>
          ) : (
            <button onClick={() => onComplete(PATH_WARRIOR)} style={btnPrimary(clan.accent)}>
              RETURN TO THE CLEARING
            </button>
          )}
          <button onClick={() => setStep('choose')} style={{
            width: '100%', background: 'transparent', border: 'none', color: '#5a6155',
            fontSize: 11, marginTop: 6, cursor: 'pointer', textDecoration: 'underline',
            fontFamily: "'Crimson Text', serif", letterSpacing: '0.1em',
          }}>
            back
          </button>
        </div>
      </div>
    );
  }

  // 'choose' step
  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 10, ...styles.display }}>
            APPRENTICE CEREMONY
          </div>
          <h2 style={{ ...styles.display, fontSize: 24, margin: 0, color: clan.accent, fontWeight: 600 }}>
            BENEATH THE HIGHROCK
          </h2>
        </div>

        <div style={panel}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
            <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{leader}</strong> calls the Clan together. You step out of the nursery, blinking in the sun. The cats of {profile.clan} gather around the Highrock.
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            "<em>{profile.prefix}kit, you have reached six moons. From this day forward, until you have earned your warrior name, you will be known as <strong style={{ color: clan.accent }}>{profile.prefix}paw</strong>.</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.7, color: '#a39d88' }}>
            Before the leader names your mentor, you have a choice. Most apprentices become warrior apprentices. A rare few feel called to walk the medicine cat's path — but they must ask the medicine cat themselves.
          </p>
        </div>

        <div style={panel}>
          <label style={labelStyle}>WHAT IS IN YOUR HEART?</label>
          <button onClick={() => setIntent('warrior')} style={{
            ...pathChoiceStyle,
            borderColor: intent === 'warrior' ? clan.accent : '#3a4339',
            background: intent === 'warrior' ? 'rgba(217, 118, 66, 0.08)' : 'transparent',
          }}>
            <div style={{ ...styles.display, fontSize: 13, letterSpacing: '0.18em', color: clan.accent, fontWeight: 700 }}>
              I WILL BE A WARRIOR
            </div>
            <div style={{ fontSize: 13, color: '#c8c0a8', marginTop: 6, lineHeight: 1.5 }}>
              "<em>{possibleMentor}, you are ready for an apprentice. You will mentor {profile.prefix}paw. Pass on all you know.</em>"
            </div>
            <div style={{ fontSize: 12, color: '#7a8571', marginTop: 8, fontStyle: 'italic' }}>
              Train with {possibleMentor}. Hunt for the Clan. Walk the borders. Earn your warrior name.
            </div>
          </button>
          <button onClick={() => setIntent('ask_medicine')} style={{
            ...pathChoiceStyle,
            borderColor: intent === 'ask_medicine' ? clan.accent : '#3a4339',
            background: intent === 'ask_medicine' ? 'rgba(217, 118, 66, 0.08)' : 'transparent',
          }}>
            <div style={{ ...styles.display, fontSize: 13, letterSpacing: '0.18em', color: clan.accent, fontWeight: 700 }}>
              I WILL ASK {medCat.toUpperCase()}
            </div>
            <div style={{ fontSize: 13, color: '#c8c0a8', marginTop: 6, lineHeight: 1.5 }}>
              You leave the clearing and pad to the medicine cat den to ask {medCat} to take you as her apprentice.
            </div>
            <div style={{ fontSize: 12, color: '#7a8571', marginTop: 8, fontStyle: 'italic' }}>
              Whether she says yes depends on whether she already has an apprentice. (Medicine cats cannot become Deputy or Leader.)
            </div>
          </button>
        </div>

        <button
          onClick={() => {
            if (intent === 'warrior') onComplete(PATH_WARRIOR);
            else if (intent === 'ask_medicine') setStep('asking');
          }}
          disabled={!intent}
          style={{ ...btnPrimary(clan.accent), opacity: intent ? 1 : 0.45, cursor: intent ? 'pointer' : 'not-allowed' }}>
          {intent === 'ask_medicine' ? 'GO TO THE MEDICINE DEN' : 'ACCEPT THE NAME'}
        </button>
      </div>
    </div>
  );
};

// ============ NAME CEREMONY (Warrior or Medicine Cat) ============

const NameCeremony = ({ profile, ceremony, onComplete }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const leader = LEADERS_BY_CLAN[profile.clan];
  const isMed = ceremony === 'medicine';
  const mentorName = profile.mentor || (isMed ? MEDICINE_CATS_BY_CLAN[profile.clan] : 'Lionheart');
  const suffixOptions = isMed ? MEDICINE_SUFFIXES : WARRIOR_SUFFIXES;
  const [suffix, setSuffix] = useState(suffixOptions[0]);
  const [custom, setCustom] = useState('');
  const finalSuffix = (custom.trim() || suffix).toLowerCase();

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 10, ...styles.display }}>
            {isMed ? 'MEDICINE CAT CEREMONY' : 'WARRIOR CEREMONY'}
          </div>
          <h2 style={{ ...styles.display, fontSize: 24, margin: 0, color: clan.accent, fontWeight: 600 }}>
            BY MOONLIGHT AT THE HIGHROCK
          </h2>
        </div>

        <div style={panel}>
          {isMed ? (
            <>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
                You stand at the Moonstone with <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{mentorName}</strong>. The night is silver. The Clan waits below.
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>{profile.prefix}paw, do you promise to use your skills to heal and aid your Clan?</em>"
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>I do.</em>"
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>Then by the powers of StarClan, I give you your true name as a medicine cat. {profile.prefix}paw, from this moment you will be known as...</em>"
              </p>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
                <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{leader}</strong> stands on the Highrock and calls the Clan together. <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{mentorName}</strong> stands beside you, tail proudly raised.
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>I, {leader}, leader of {profile.clan}, call upon my warrior ancestors to look down on this apprentice. {profile.prefix}paw has trained hard to understand the ways of your noble code, and I commend her to you as a warrior in her turn.</em>"
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>{profile.prefix}paw, do you promise to uphold the warrior code, even at the cost of your life?</em>"
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>I do.</em>"
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>Then by the powers of StarClan, I give you your warrior name. {profile.prefix}paw, from this moment you will be known as...</em>"
              </p>
            </>
          )}
        </div>

        <div style={panel}>
          <label style={labelStyle}>CHOOSE YOUR SUFFIX</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {suffixOptions.map((s) => (
              <button key={s} onClick={() => { setSuffix(s); setCustom(''); }} style={{
                ...chipStyle,
                background: (custom === '' && suffix === s) ? clan.accent : 'transparent',
                color: (custom === '' && suffix === s) ? '#0a0f0a' : '#c8c0a8',
                borderColor: (custom === '' && suffix === s) ? clan.accent : '#3a4339',
              }}>{s}</button>
            ))}
          </div>
          <input type="text" placeholder="Or type your own suffix..." value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            maxLength={12} style={inputStyle} />
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 22, color: '#e8dcc0', ...styles.display, letterSpacing: '0.05em' }}>
            <strong style={{ color: clan.accent }}>{profile.prefix}{finalSuffix}</strong>
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#a39d88', fontStyle: 'italic' }}>
            "<em>{profile.clan} honors your courage and your hard work. We welcome you as a full {isMed ? 'medicine cat' : 'warrior'} of {profile.clan}.</em>"
          </div>
        </div>

        <button onClick={() => onComplete(finalSuffix)} disabled={!finalSuffix} style={btnPrimary(clan.accent)}>
          TAKE YOUR NAME
        </button>
      </div>
    </div>
  );
};

// ============ DEPUTY CEREMONY ============
// Per book canon: the leader names her own deputy, traditionally before moonhigh on the night of
// a deputy's death or retirement. Here, once the warrior has earned eligibility (≥280 correct),
// any patrol can be the one where the leader calls them up.

const DeputyCeremony = ({ profile, onContinue }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const leader = LEADERS_BY_CLAN[profile.clan];
  const fullName = getFullName(profile);

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 10, ...styles.display }}>
            DEPUTY CEREMONY
          </div>
          <h2 style={{ ...styles.display, fontSize: 24, margin: 0, color: clan.accent, fontWeight: 600 }}>
            BEFORE MOONHIGH
          </h2>
        </div>

        <div style={panel}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
            <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{leader}</strong> stands on the Highrock as the moon climbs. The Clan gathers below, expectant. The previous deputy has stepped aside.
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            "<em>I say these words before StarClan, that the spirits of our ancestors may hear and approve my choice.</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            "<em><strong style={{ color: clan.accent, fontStyle: 'normal' }}>{fullName}</strong>, do you accept the duty of deputy — to serve {profile.clan}, to protect every cat from kit to elder, and to stand at my side for as long as you live?</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            "<em>I do.</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            "<em>Then from this moment, {fullName} will be the new deputy of {profile.clan}. May StarClan watch over your every step.</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.7, color: '#a39d88' }}>
            The Clan murmurs your name in approval. You dip your head to {leader}, then to your Clanmates. From this night, you stand at the leader's side.
          </p>
        </div>

        <button onClick={onContinue} style={btnPrimary(clan.accent)}>
          I DO. I ACCEPT.
        </button>
      </div>
    </div>
  );
};

// ============ LEADER CEREMONY ============
// Per book canon: leaders are not chosen by play, but by fate. When the previous leader goes to
// StarClan (or steps aside), the deputy travels to the Moonstone and receives nine lives. The
// suffix becomes -star at this moment.

const LeaderCeremony = ({ profile, onContinue }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const oldLeader = LEADERS_BY_CLAN[profile.clan];
  const medCat = MEDICINE_CATS_BY_CLAN[profile.clan];
  const fullName = getFullName(profile); // already has -star applied in finishPatrol
  const oldName = profile.prefix + (profile._oldSuffix || 'foot');

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 10, ...styles.display }}>
            LEADER CEREMONY · AT THE MOONSTONE
          </div>
          <h2 style={{ ...styles.display, fontSize: 22, margin: 0, color: clan.accent, fontWeight: 600 }}>
            NINE LIVES BY MOONLIGHT
          </h2>
        </div>

        <div style={panel}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
            <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{oldLeader}</strong> has gone to walk with StarClan. The Clan grieves, but the Clan endures. As the deputy, you must travel to the Moonstone — and you do not go alone. <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{medCat}</strong>, the medicine cat, walks at your side to guide you. She has spoken to StarClan many times. Tonight, she will help you speak to them for the first time.
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            You travel through the night together. At the cave, {medCat} dips her head and tells you what to do.
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
            "<em>Lie down. Press your nose to the stone. Sleep, and they will come.</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            You press your nose to the cold stone. The cave fills with starlight. One by one, nine of your warrior ancestors come forward, each giving you a life and the strength to use it well. {medCat} watches in silence, guarding your sleeping body until you wake.
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            "<em>You are no longer {oldName}. From this moment you will be known as <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{fullName}</strong>, leader of {profile.clan}. StarClan honors your courage and your loyalty.</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.7, color: '#a39d88' }}>
            You wake at the Moonstone with nine lives in your chest. {medCat} touches her nose to your shoulder and walks you home through the dawn. When the Clan sees you, they raise their voices: <em>{fullName}! {fullName}!</em>
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.7, color: '#a39d88', fontStyle: 'italic' }}>
            (Your first task as leader will be to name your own deputy — but that is for another night.)
          </p>
        </div>

        <button onClick={onContinue} style={btnPrimary(clan.accent)}>
          RETURN TO YOUR CLAN
        </button>
      </div>
    </div>
  );
};

// ============ DEN ============

const DenView = ({ profile, slotsCount, onStartPatrol, onSwitchCharacter, onExport, onImport }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const fullName = getFullName(profile);
  const { current, next } = getRankInfo(profile);
  const progress = next
    ? Math.min(100, Math.max(0, ((profile.totalCorrect - current.min) / (next.min - current.min)) * 100))
    : 100;
  const totalPrey  = Object.values(profile.preyCaught  || {}).reduce((s, n) => s + n, 0);
  const totalHerbs = Object.values(profile.herbsCaught || {}).reduce((s, n) => s + n, 0);
  const isApprentice = profile.rank === 'Apprentice' || profile.rank === 'Medicine Cat Apprentice';

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 20, paddingTop: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 6, ...styles.display }}>
            {profile.clan.toUpperCase()}
          </div>
          <h1 style={{ ...styles.display, fontSize: 30, margin: 0, color: clan.accent, fontWeight: 700, letterSpacing: '0.05em' }}>
            {fullName.toUpperCase()}
          </h1>
          <div style={{ fontSize: 13, color: '#a39d88', fontStyle: 'italic', marginTop: 4 }}>
            {profile.rank} · {profile.furColor.toLowerCase()} pelt · {profile.eyeColor.toLowerCase()} eyes
          </div>
          {profile.mentor && (
            <div style={{ fontSize: 12, color: '#7a8571', marginTop: 4 }}>
              mentor: {getMentorTitle(profile)}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          <StatCard label="STREAK" value={`${profile.streak || 0}`} sub={`day${profile.streak === 1 ? '' : 's'}`} accent={clan.accent} />
          <StatCard label={isMedicinePath(profile) ? 'HERBS' : 'PREY'} value={isMedicinePath(profile) ? totalHerbs : totalPrey} sub={isMedicinePath(profile) ? 'gathered' : 'caught'} accent={clan.accent} />
          <StatCard label="CORRECT" value={profile.totalCorrect} sub={`of ${profile.totalAttempted}`} accent={clan.accent} />
        </div>

        {next && (
          <div style={{ background: 'rgba(26, 36, 25, 0.5)', border: '1px solid #2a3329', padding: 16, marginBottom: 18, borderRadius: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, ...styles.display, letterSpacing: '0.2em', color: '#7a8571', marginBottom: 8 }}>
              <span>{current.name.toUpperCase()}</span>
              <span>{next.name.toUpperCase()}</span>
            </div>
            <div style={{ height: 6, background: '#1a2419', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: clan.accent, transition: 'width 0.6s' }} />
            </div>
            <div style={{ fontSize: 12, textAlign: 'center', marginTop: 8, color: '#a39d88' }}>
              {Math.max(0, next.min - profile.totalCorrect)} more correct answers to reach {next.name}
            </div>
          </div>
        )}

        <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.3em', color: '#7a8571', marginBottom: 12, textAlign: 'center' }}>
          CHOOSE YOUR PATROL
        </div>
        <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
          {PATROLS.map((p) => (
            <button key={p.id} onClick={() => onStartPatrol(p)} style={{
              background: 'rgba(26, 36, 25, 0.5)',
              border: '1px solid #2a3329',
              padding: '16px 18px',
              color: '#e8dcc0',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: 2,
              transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = clan.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a3329'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ ...styles.display, fontSize: 15, letterSpacing: '0.15em', color: clan.accent, fontWeight: 600 }}>
                    {p.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, fontStyle: 'italic', color: '#a39d88', marginTop: 2 }}>{p.subtitle}</div>
                  <div style={{ fontSize: 12, color: '#7a8571', marginTop: 6 }}>{p.desc}</div>
                </div>
                <div style={{ color: clan.accent, fontSize: 20, ...styles.display }}>→</div>
              </div>
            </button>
          ))}
        </div>

        {profile.patrolsToday > 0 && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#7a8571', fontStyle: 'italic', marginBottom: 16 }}>
            You have completed {profile.patrolsToday} patrol{profile.patrolsToday === 1 ? '' : 's'} today.
          </div>
        )}

        <div style={{ marginTop: 32, paddingBottom: 20 }}>
          <div style={{ ...styles.display, fontSize: 9, letterSpacing: '0.3em', color: '#5a6155', textAlign: 'center', marginBottom: 12 }}>
            ⟡  KEEPER OF THE SCROLL  ⟡
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button onClick={onExport} style={smallBtn}>save Clan cat to file</button>
            <label style={{ ...smallBtn, textAlign: 'center' }}>
              load from file
              <input type="file" accept="application/json,.json" onChange={onImport} style={{ display: 'none' }} />
            </label>
          </div>
          <button onClick={onSwitchCharacter} style={{ ...smallBtn, width: '100%', display: 'block' }}>
            {slotsCount > 1 ? 'switch to another Clan cat' : 'add another Clan cat'}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: 'rgba(26, 36, 25, 0.5)',
    border: '1px solid #2a3329',
    padding: '14px 8px',
    textAlign: 'center',
    borderRadius: 2,
  }}>
    <div style={{ ...styles.display, fontSize: 9, letterSpacing: '0.25em', color: '#7a8571', marginBottom: 4 }}>{label}</div>
    <div style={{ ...styles.display, fontSize: 26, color: accent, fontWeight: 700, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 10, color: '#7a8571', marginTop: 2 }}>{sub}</div>
  </div>
);

// ============ PATROL ============

const PatrolView = ({ patrol, profile, current, answerInput, setAnswerInput, feedback, showHint, setShowHint, clanAccent, onSubmit, onQuit }) => {
  const progress = ((patrol.currentIdx) / patrol.problems.length) * 100;
  const handleKey = (e) => { if (e.key === 'Enter') onSubmit(); };
  const isMoving = feedback?.type === 'correct' || feedback?.type === 'reveal';

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={onQuit} style={{
            background: 'transparent', border: 'none', color: '#7a8571', fontSize: 12, cursor: 'pointer',
            fontFamily: "'Crimson Text', serif", letterSpacing: '0.1em',
          }}>← return to camp</button>
          <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571' }}>
            {patrol.type.name.toUpperCase()}
          </div>
        </div>

        <div style={{ height: 3, background: '#1a2419', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: clanAccent, transition: 'width 0.4s' }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#7a8571', marginBottom: 24 }}>
          Problem {patrol.currentIdx + 1} of {patrol.problems.length}
        </div>

        <div style={{
          background: 'rgba(26, 36, 25, 0.5)',
          border: '1px solid #2a3329',
          padding: '28px 22px',
          borderRadius: 2,
          marginBottom: 20,
          minHeight: 220,
        }}>
          <div style={{ fontSize: 13, color: '#a39d88', fontStyle: 'italic', marginBottom: 18, textAlign: 'center' }}>
            {current.story}
          </div>
          <div style={{
            fontSize: current.question.length > 40 ? 16 : 28,
            color: '#e8dcc0',
            textAlign: 'center',
            lineHeight: 1.5,
            fontWeight: current.question.length > 40 ? 400 : 600,
            fontFamily: current.question.length > 40 ? "'Crimson Text', serif" : "'Cinzel', serif",
            letterSpacing: current.question.length > 40 ? 'normal' : '0.05em',
          }}>
            {current.question}
          </div>
          {showHint && (
            <div style={{
              marginTop: 20, padding: '12px 14px',
              background: 'rgba(217, 118, 66, 0.08)',
              border: '1px solid rgba(217, 118, 66, 0.3)',
              fontSize: 13, color: '#d4a076', fontStyle: 'italic', borderRadius: 2,
            }}>
              Mentor whispers: {current.hint}
            </div>
          )}
        </div>

        {feedback && (
          <div style={{
            padding: '14px 18px',
            borderRadius: 2,
            marginBottom: 16,
            textAlign: 'center',
            fontSize: 14,
            background: feedback.type === 'correct' ? 'rgba(217, 118, 66, 0.12)' :
                        feedback.type === 'reveal'  ? 'rgba(122, 133, 113, 0.15)' :
                                                      'rgba(122, 133, 113, 0.08)',
            border: `1px solid ${feedback.type === 'correct' ? 'rgba(217, 118, 66, 0.4)' : '#3a4339'}`,
            color: feedback.type === 'correct' ? '#d97642' : '#c8c0a8',
          }}>
            {feedback.type === 'correct' && (
              <>
                {feedback.kind === 'prey'  && <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.3em', marginBottom: 6 }}>PREY CAUGHT · {feedback.prey.toUpperCase()}</div>}
                {feedback.kind === 'herb'  && <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.3em', marginBottom: 6 }}>HERB GATHERED · {feedback.herb.toUpperCase()}</div>}
                {feedback.kind === 'border' && <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.3em', marginBottom: 6 }}>SCENT REFRESHED</div>}
                {feedback.kind === 'training' && <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.3em', marginBottom: 6 }}>A CLEAN MOVE</div>}
                <div style={{ fontStyle: 'italic' }}>{feedback.flavor}</div>
                <div style={{ fontSize: 12, marginTop: 6, color: '#a39d88' }}>{feedback.praise}</div>
              </>
            )}
            {feedback.type !== 'correct' && <div>{feedback.text}</div>}
          </div>
        )}

        {!isMoving && (
          <>
            <input type="number" value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Your answer" autoFocus
              style={{ ...inputStyle, fontSize: 22, textAlign: 'center', padding: '16px', marginBottom: 12 }} />
            <button onClick={onSubmit} style={btnPrimary(clanAccent)}>STRIKE</button>
            {!showHint && (
              <button onClick={() => setShowHint(true)} style={{
                width: '100%', padding: '10px',
                background: 'transparent',
                border: '1px dashed #3a4339',
                color: '#7a8571',
                fontSize: 12, cursor: 'pointer',
                borderRadius: 2,
                fontFamily: "'Crimson Text', serif",
                fontStyle: 'italic',
                marginTop: 8,
              }}>
                ask the mentor for a hint
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ============ COMPLETE ============

const CompleteView = ({ profile, patrol, onReturn }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const fullName = getFullName(profile);
  const perfect = patrol.correct === patrol.problems.length;
  const rankUp = !!profile._rankUp && profile._previousRank && profile._previousRank !== profile.rank;
  // Group rewards
  const preyCounts = (patrol.rewards.prey || []).reduce((acc, p) => { acc[p] = (acc[p] || 0) + 1; return acc; }, {});
  const herbCounts = (patrol.rewards.herbs || []).reduce((acc, h) => { acc[h] = (acc[h] || 0) + 1; return acc; }, {});

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 520, margin: '0 auto', paddingTop: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {rankUp && (
            <div style={{
              padding: '16px 20px',
              background: 'rgba(217, 118, 66, 0.1)',
              border: `1px solid ${clan.accent}`,
              marginBottom: 22,
              borderRadius: 2,
            }}>
              <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.4em', color: clan.accent, marginBottom: 6 }}>
                ⟡  CEREMONY  ⟡
              </div>
              <div style={{ fontSize: 17, color: '#e8dcc0', fontStyle: 'italic' }}>
                You are now a <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{profile.rank}</strong>.
              </div>
              <div style={{ fontSize: 13, color: '#a39d88', marginTop: 6 }}>
                {fullName} of {profile.clan}.
              </div>
            </div>
          )}

          <div style={{ fontSize: 11, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 12, ...styles.display }}>
            {patrol.type.name.toUpperCase()} COMPLETE
          </div>
          <div style={{ ...styles.display, fontSize: 32, color: clan.accent, fontWeight: 700 }}>
            {patrol.correct} / {patrol.problems.length}
          </div>
          <div style={{ fontSize: 13, color: '#a39d88', fontStyle: 'italic', marginTop: 8 }}>
            {perfect          ? 'A flawless patrol. The Clan sings your name tonight.' :
             patrol.correct >= 4 ? 'Strong work. Your mentor flicks an ear in approval.' :
             patrol.correct >= 2 ? 'You served the Clan today. Rest now.' :
                                   'Every warrior stumbles. Return tomorrow and try again.'}
          </div>
        </div>

        {Object.keys(preyCounts).length > 0 && (
          <RewardTable title="FRESH-KILL PILE" rows={preyCounts} accent={clan.accent} />
        )}
        {Object.keys(herbCounts).length > 0 && (
          <RewardTable title="HERB STORES" rows={herbCounts} accent={clan.accent} />
        )}
        {patrol.rewards.borders > 0 && (
          <div style={rewardSummary}>
            <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571', marginBottom: 8, textAlign: 'center' }}>
              BORDER TENDED
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#c8c0a8', fontStyle: 'italic' }}>
              You refreshed the scent at {patrol.rewards.borders} marker{patrol.rewards.borders === 1 ? '' : 's'} along the boundary.
            </div>
          </div>
        )}
        {patrol.rewards.training > 0 && (
          <div style={rewardSummary}>
            <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571', marginBottom: 8, textAlign: 'center' }}>
              TRAINING
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#c8c0a8', fontStyle: 'italic' }}>
              {patrol.rewards.training} clean move{patrol.rewards.training === 1 ? '' : 's'} on the training ground.
            </div>
          </div>
        )}

        <button onClick={onReturn} style={{
          width: '100%', padding: '16px',
          background: 'transparent',
          border: `1px solid ${clan.accent}`,
          color: clan.accent,
          ...styles.display, fontSize: 13, letterSpacing: '0.3em',
          cursor: 'pointer', borderRadius: 2,
          marginTop: 12,
        }}>
          RETURN TO CAMP
        </button>
      </div>
    </div>
  );
};

const RewardTable = ({ title, rows, accent }) => (
  <div style={rewardSummary}>
    <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571', marginBottom: 12, textAlign: 'center' }}>
      {title}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {Object.entries(rows).map(([name, count]) => (
        <div key={name} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '8px 12px', background: '#0a0f0a',
          borderRadius: 2, fontSize: 14,
        }}>
          <span style={{ color: '#c8c0a8', textTransform: 'capitalize' }}>{name}</span>
          <span style={{ color: accent, fontWeight: 700 }}>× {count}</span>
        </div>
      ))}
    </div>
  </div>
);

// =====================================================================
// STYLES
// =====================================================================

const styles = {
  root: {
    fontFamily: "'Crimson Text', 'EB Garamond', Georgia, serif",
    background: 'radial-gradient(ellipse at top, #1a2419 0%, #0a0f0a 60%, #050706 100%)',
    color: '#d4cdb8',
    minHeight: '100vh',
    padding: '24px 16px',
    backgroundAttachment: 'fixed',
  },
  display: {
    fontFamily: "'Cinzel', 'Trajan Pro', serif",
    letterSpacing: '0.08em',
  },
};

const panel = {
  background: 'rgba(26, 36, 25, 0.5)',
  border: '1px solid #2a3329',
  padding: 20,
  marginBottom: 16,
  borderRadius: 2,
};
const rewardSummary = {
  background: 'rgba(26, 36, 25, 0.5)',
  border: '1px solid #2a3329',
  padding: 16,
  marginBottom: 14,
  borderRadius: 2,
};
const labelStyle = {
  display: 'block',
  fontFamily: "'Cinzel', 'Trajan Pro', serif",
  letterSpacing: '0.3em',
  fontSize: 10,
  color: '#7a8571',
  marginBottom: 10,
};
const chipStyle = {
  padding: '8px 12px',
  border: '1px solid #3a4339',
  fontSize: 13,
  cursor: 'pointer',
  borderRadius: 2,
  fontFamily: "'Crimson Text', serif",
};
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: '#0a0f0a',
  border: '1px solid #3a4339',
  color: '#e8dcc0',
  fontSize: 15,
  borderRadius: 2,
  fontFamily: "'Crimson Text', serif",
  boxSizing: 'border-box',
};
const pathChoiceStyle = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '14px 16px',
  border: '1px solid #3a4339',
  background: 'transparent',
  borderRadius: 2,
  marginTop: 8,
  cursor: 'pointer',
  color: '#e8dcc0',
  fontFamily: "'Crimson Text', serif",
};
const smallBtn = {
  flex: 1,
  padding: '10px',
  background: 'transparent',
  border: '1px solid #3a4339',
  color: '#a39d88',
  fontSize: 11,
  cursor: 'pointer',
  borderRadius: 2,
  letterSpacing: '0.15em',
  fontFamily: "'Crimson Text', serif",
};
const loadFromFileLink = {
  display: 'block',
  textAlign: 'center',
  fontSize: 11,
  color: '#5a6155',
  cursor: 'pointer',
  textDecoration: 'underline',
  letterSpacing: '0.1em',
  fontFamily: "'Crimson Text', serif",
  marginTop: 12,
};

const btnPrimary = (accent) => ({
  width: '100%',
  padding: '18px',
  background: accent,
  border: 'none',
  color: '#0a0f0a',
  fontFamily: "'Cinzel', 'Trajan Pro', serif",
  letterSpacing: '0.3em',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  borderRadius: 2,
  marginBottom: 10,
});
const btnSecondary = (accent) => ({
  width: '100%',
  padding: '18px',
  background: 'transparent',
  border: `1px solid ${accent}`,
  color: accent,
  fontFamily: "'Cinzel', 'Trajan Pro', serif",
  letterSpacing: '0.3em',
  fontSize: 13,
  cursor: 'pointer',
  borderRadius: 2,
  marginBottom: 10,
});

// ============ FONT LOADER ============

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
    body { margin: 0; background: #050706; }
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }
    button { font-family: inherit; }
    button:hover { opacity: 0.92; }
    button:active { transform: scale(0.98); }
  `}</style>
);
