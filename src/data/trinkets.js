// Trinket catalog — small keepsakes the player brings home from patrols.
// Each patrol type has its own pool. Drops are weighted (higher weight = more
// common). Origin lines are the flavor shown when the trinket appears in
// "Your Nest" — a one-line backstory that matches the patrol that found it.
//
// Design intent: the trinket is the novelty engine. Even on a familiar
// patrol, the random keepsake gives the player something specific and small
// to look forward to, without any grinding incentive (a 4th hunting patrol
// of the day is just as eligible as the 1st). Variety > volume.
//
// Per-Clan flavor and book-faithfulness: items are drawn from things real
// Clan cats notice in the books — feathers, mossy stones, Twoleg trinkets,
// owl pellets, tufts of fur, glimpses of starlight on the Moonpool.

export const TRINKETS = {
  training: [
    { id: 't-claw-mark', name: 'a claw-mark on the training tree', origin: 'A scar in the bark from a missed strike. Your mentor pretends not to notice.', weight: 4 },
    { id: 't-whisker',   name: "an apprentice's shed whisker",      origin: 'Lost in a rough tumble. Carried for luck.', weight: 3 },
    { id: 't-stone',     name: 'a sparring stone',                  origin: 'A smooth pebble worn by paws on the training ground.', weight: 4 },
    { id: 't-tuft',      name: 'a tuft of mentor fur',              origin: 'Caught between your claws during a clean strike.', weight: 2 },
    { id: 't-feather',   name: 'a feather from the training-tree branches', origin: 'A robin landed to watch and left this behind.', weight: 1 },
  ],

  hunting: [
    { id: 'h-feather-grey',   name: 'a soft grey feather',          origin: 'Light as breath, dropped by a startled wood-pigeon.', weight: 5 },
    { id: 'h-fur-tuft',       name: 'a tuft of vole fur',           origin: 'Caught in a thicket where a vole fled.', weight: 4 },
    { id: 'h-bone',           name: 'a small bleached bone',        origin: 'Sun-bleached by the clearing. The owl never came back for it.', weight: 2 },
    { id: 'h-feather-brown',  name: 'a brown feather',              origin: 'A thrush left it on the moss after taking flight.', weight: 4 },
    { id: 'h-mouse-tooth',    name: "a tiny mouse's tooth",         origin: 'White as milk, found by the old log.', weight: 2 },
    { id: 'h-feather-jay',    name: "a jay's blue wing-feather",    origin: 'Brilliant blue. Rare — the jay rarely loses these.', weight: 1 },
  ],

  border: [
    { id: 'b-stone',         name: 'a smooth river-stone',          origin: 'Worn perfectly round by water you have never seen.', weight: 4 },
    { id: 'b-thorn',         name: 'a sharp thorn',                 origin: 'From the edge of the bramble-wall. A reminder.', weight: 3 },
    { id: 'b-fox-tooth',     name: 'a fox-tooth',                   origin: 'Old, bone-yellow. The fox is long gone.', weight: 2 },
    { id: 'b-sheep-wool',    name: 'a wisp of sheep-wool',          origin: 'Snagged on a hawthorn branch near the moor.', weight: 2 },
    { id: 'b-twoleg-thread', name: 'a strand of bright Twoleg thread', origin: 'Caught on a bramble. Twolegs leave the strangest things.', weight: 2 },
    { id: 'b-bark-curl',     name: 'a curl of birch bark',          origin: 'Peeled clean from a tree at the edge of the world.', weight: 3 },
  ],

  herb: [
    { id: 'g-pressed-leaf',   name: 'a pressed catmint leaf',       origin: 'Flattened in your bundle. Still faintly sweet.', weight: 4 },
    { id: 'g-moonshade',      name: 'a moonshade petal',            origin: 'Pale and silver-edged. The medicine cat saved this one for you.', weight: 2 },
    { id: 'g-marigold',       name: 'a marigold blossom',           origin: 'Bright orange against the dark. For wound-cleansing.', weight: 3 },
    { id: 'g-poppy',          name: 'a single poppy seed',          origin: 'Black as a crow’s eye. A medicine cat’s most precious help with pain.', weight: 1 },
    { id: 'g-juniper',        name: 'a juniper berry',              origin: 'Blue-black, bitter, calms the belly.', weight: 3 },
    { id: 'g-yarrow',         name: 'a sprig of yarrow',            origin: 'White flowers, narrow leaves. For drawing out poison.', weight: 3 },
  ],

  vigil: [
    { id: 'v-starlight',     name: 'a sliver of starlight',          origin: 'Caught in a dewdrop at moonhigh. Hard to keep, hard to forget.', weight: 3 },
    { id: 'v-moonstone',     name: 'a moonstone shard',              origin: 'Pale, glowing faintly under starlight. StarClan walks close to these.', weight: 1 },
    { id: 'v-owl-feather',   name: 'a barn-owl feather',             origin: 'Soft as breath. The owl flew over your watch and left it.', weight: 2 },
    { id: 'v-night-mist',    name: 'a curl of night-mist',           origin: 'You catch it in your paws. By dawn it is only memory.', weight: 3 },
    { id: 'v-acorn',         name: 'an acorn',                       origin: 'Fallen at your feet during the longest watch.', weight: 4 },
    { id: 'v-spider-silk',   name: 'a strand of spider-silk',        origin: 'Stretched between two birches in the dark. Strong as it is fine.', weight: 3 },
  ],
};

// Roll a trinket from a patrol's pool, weighted. Returns null if no pool.
export const rollTrinket = (patrolId) => {
  const pool = TRINKETS[patrolId];
  if (!pool || pool.length === 0) return null;
  const total = pool.reduce((s, t) => s + (t.weight || 1), 0);
  let r = Math.random() * total;
  for (const t of pool) {
    r -= (t.weight || 1);
    if (r <= 0) return t;
  }
  return pool[pool.length - 1];
};

// Look up a trinket's metadata by its id (for rendering "Your Nest" entries
// from the persisted { [id]: count } map). Falls back to a synthetic entry
// for unknown ids so removing a trinket from the catalog never crashes the
// dashboard for a player who already collected one.
export const trinketById = (id) => {
  for (const pool of Object.values(TRINKETS)) {
    const found = pool.find((t) => t.id === id);
    if (found) return found;
  }
  return { id, name: id, origin: '', weight: 1 };
};
