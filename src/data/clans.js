// Per-Clan accent colors. Each must read clearly against the dark forest gradient
// (#0a0f0a → #1a2419), so very-dark colors (e.g. deep navy/violet) get lifted while
// keeping their *family*. Colors MUST be 6-digit hex (RGB only) — adding 2 alpha
// digits gives RGBA, which makes text nearly invisible on the dark background.
export const CLANS = [
  { name: 'ThunderClan', accent: '#e2c870', desc: 'Brave cats of the forest' },
  { name: 'ShadowClan',  accent: '#a78bd9', desc: 'Cunning cats of the shadowed pines' },
  { name: 'RiverClan',   accent: '#4ba4d8', desc: 'Sleek cats of the river and reeds' },
  { name: 'WindClan',    accent: '#8fc28a', desc: 'Swift cats of the open moor' },
];

export const FUR_COLORS = ['Black', 'Grey', 'White', 'Tabby', 'Ginger', 'Calico', 'Tortoiseshell'];
export const EYE_COLORS = ['Amber', 'Green', 'Blue', 'Yellow', 'Ice'];

export const KIT_PREFIX_OPTIONS = [
  'Moss', 'Shadow', 'Ember', 'Fern', 'Ash', 'Storm', 'Dusk', 'Frost',
  'Thorn', 'Raven', 'Silver', 'Briar', 'Holly', 'Sun', 'Cloud', 'Mist',
  'Spider', 'Berry', 'Hazel', 'Leaf', 'Brook', 'Pine', 'Bramble', 'Lark',
];

// Warrior-name suffix options (book-faithful). Player picks one at the warrior ceremony.
export const WARRIOR_SUFFIXES = [
  'heart', 'foot', 'fire', 'fur', 'strike', 'claw', 'pelt', 'tail', 'leaf',
  'stripe', 'shine', 'spot', 'frost', 'song', 'step', 'wing', 'fang', 'mist',
  'breeze', 'flight', 'tooth', 'eye', 'pool', 'fall',
];

// Medicine-cat suffixes lean gentler; book examples: Spottedleaf, Yellowfang, Cinderpelt, Leafpool, Mothwing.
export const MEDICINE_SUFFIXES = [
  'leaf', 'pool', 'fur', 'wing', 'nose', 'song', 'whisker', 'spirit',
  'shine', 'breeze', 'pelt', 'mist', 'cloud', 'stripe',
];

// Mentor pools (book-faithful Clanmates). Random assignment at apprentice ceremony.
export const MENTORS_BY_CLAN = {
  ThunderClan: ['Lionheart', 'Whitestorm', 'Bluestar', 'Sandstorm', 'Dustpelt', 'Brackenfur', 'Greystripe', 'Goldenflower'],
  ShadowClan:  ['Russetfur', 'Tawnypelt', 'Oakfur', 'Cedarheart', 'Rowanclaw'],
  RiverClan:   ['Mistyfoot', 'Stonefur', 'Silverstream', 'Leopardfur', 'Mosspelt', 'Blackclaw'],
  WindClan:    ['Tallstar', 'Onewhisker', 'Crowfeather', 'Ashfoot', 'Mudclaw', 'Webfoot'],
};

export const LEADERS_BY_CLAN = {
  ThunderClan: 'Bluestar',
  ShadowClan:  'Blackstar',
  RiverClan:   'Leopardstar',
  WindClan:    'Tallstar',
};

export const MEDICINE_CATS_BY_CLAN = {
  ThunderClan: 'Spottedleaf',
  ShadowClan:  'Runningnose',
  RiverClan:   'Mudfur',
  WindClan:    'Barkface',
};

// Locations for geometry word problems, with size scale used for unit selection.
// scale: 'small' -> tail-lengths; 'medium' -> fox-lengths; 'large' -> tree-lengths.
export const LOCATIONS_BY_CLAN = {
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
