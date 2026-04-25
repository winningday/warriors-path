// Prey table. Mice/voles/squirrels are the common forest prey. Birds add variety. Hawks are rare and dangerous —
// cats sometimes hunt them but it's not the usual catch.
export const PREY_COMMON = [
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
export const PREY_EARLY = [
  { name: 'mouse',   weight: 6 },
  { name: 'sparrow', weight: 2 },
  { name: 'vole',    weight: 1 },
];

// Herbs (book-faithful list with their purpose) for Herb Patrol.
export const HERBS = [
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

// For fraction problems — vary medicine cat (any Clan), recipient, and herb.
export const FRACTION_RECIPIENTS = [
  'the queens', 'the elders', 'the apprentices', 'a sick warrior',
  'a wounded patrol', 'the kits', 'the deputy', 'the medicine cat den',
];
