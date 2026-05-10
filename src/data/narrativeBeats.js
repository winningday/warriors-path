// Narrative beats — Phase 5 (v15.0.0-h).
//
// Three categories of rare, book-faithful storyline events that the play
// loop sprinkles in over time. None of these change math — they're flavor,
// surprise, and texture. They exist so each session has the *chance* to
// feel different from the last one.
//
//   1. randomEvents      — ~1/30 per patrol completion. No math; tiny reward.
//   2. gatheringContent  — pool of vignettes for Gathering night.
//   3. starClanDreams    — soft cross-topic hints from StarClan, ~weekly.
//
// CLAUDE.md anti-patterns honored:
//   - No timers visible (Gathering cadence is calendar-driven).
//   - No streak loss or punishment of any kind.
//   - StarClan walks WITH the cat. Never watches. Reverent tone always.
//   - No generic praise. Book-faithful phrasing only.
//   - No emojis in flavor (only the ⟡ ornament used in UI chrome elsewhere).

// ---------------------------------------------------------------------------
// 1. Random patrol events
// ---------------------------------------------------------------------------
//
// One-shot beats injected on patrol completion. Each entry:
//   { id, name, story, reward }
//
// `reward` is either null (pure flavor, no item) or:
//   { trinketId: '<existing trinket id>', flavor: '<single-line backstory>' }
//
// Trinket ids reference items already present in src/data/trinkets.js so
// the keepsake fits into Your Nest without any new catalog work.

export const randomEvents = [
  {
    id: 'evt-hawk-circling',
    name: 'A hawk circles overhead',
    story: `A hawk wheels in the high air above your patrol, slow as a leaf in still water. You crouch low until its shadow has passed. The forest holds its breath, then breathes again.`,
    reward: null,
  },
  {
    id: 'evt-dog-bark',
    name: 'A dog barks across the boundary',
    story: `A Twoleg dog barks behind a far fence, loud and pointless. Your fur prickles, but the sound stays where it belongs. You sharpen your ears and finish the patrol unbothered.`,
    reward: null,
  },
  {
    id: 'evt-twoleg-crosses',
    name: 'A Twoleg crosses the moor',
    story: `A Twoleg walks far across the open ground, head down, paying you no mind. You wait in the long grass until they are only a distant shape, then move on.`,
    reward: null,
  },
  {
    id: 'evt-old-cat-story',
    name: 'An old Clan-cat stops to share a story',
    story: `An elder pads up beside you on the path and tells a brief tale of a hunt long before your time. You listen close. When the elder pads away the story stays in your chest, warm as a heartbeat.`,
    reward: null,
  },
  {
    id: 'evt-fox-trail',
    name: 'A fox trail crosses your path',
    story: `The rank-sweet smell of fox curls up from the earth. You follow the prints a few tail-lengths, then turn back. The fox is long gone — but you note where it crossed, and remember.`,
    reward: { trinketId: 'b-fox-tooth', flavor: 'You scuff up a yellowed fox-tooth from the disturbed earth.' },
  },
  {
    id: 'evt-mossy-stone',
    name: 'A mossy stone catches the light',
    story: `A stone rests half-buried where the sun reaches between branches. Moss has grown soft over its back. You pick it up and carry it home, small and cool against your tongue.`,
    reward: { trinketId: 'b-stone', flavor: 'A perfectly smooth river-stone pulled from the moss.' },
  },
  {
    id: 'evt-grey-feather',
    name: 'A feather drifts down through the leaves',
    story: `A wood-pigeon takes flight overhead and a single soft grey feather drifts down through the leaves. You catch it on your paw before it touches the ground.`,
    reward: { trinketId: 'h-feather-grey', flavor: 'A soft grey feather, still warm from the bird that lost it.' },
  },
  {
    id: 'evt-fresh-rain',
    name: 'A fresh rain crosses the forest',
    story: `A quick rain sweeps across the patrol — no warning, no thunder. The leaves drip, the earth darkens, and the smell of every plant rises up at once. You stand still and breathe it all in.`,
    reward: null,
  },
  {
    id: 'evt-deer-glance',
    name: 'A deer watches you from the ferns',
    story: `A deer stands among the ferns, watching you with steady dark eyes. Neither of you moves. Then the deer flicks an ear, turns, and is gone. You feel a quiet warmth that the forest let you see it.`,
    reward: null,
  },
  {
    id: 'evt-kit-watching',
    name: 'A kit watches from the nursery',
    story: `A kit peers out from the nursery as your patrol returns. You straighten your tail and walk past as a warrior should. You remember being that small, and the kit watching the apprentices come home.`,
    reward: null,
  },
  {
    id: 'evt-old-claw-mark',
    name: 'An old claw-mark on a familiar tree',
    story: `You stop at a tree on the patrol route and find a claw-mark you have never noticed before — high up, weathered grey. Some warrior before you marked this spot, in a time the leaves do not remember.`,
    reward: null,
  },
  {
    id: 'evt-fish-jump',
    name: 'A fish jumps in a still pool',
    story: `A fish leaps in a quiet pool ahead of you and the ripples roll out like a slow, wide smile. For a moment the whole patrol pauses to watch the water settle.`,
    reward: null,
  },
];

// ---------------------------------------------------------------------------
// 2. Gathering night vignettes
// ---------------------------------------------------------------------------
//
// At a Gathering, the four Clans meet under a full moon at Fourtrees. There
// is a truce. Apprentices meet apprentices from the other Clans, exchange a
// few words, brag a little, learn a little. Each vignette is ONE such
// meeting from the player's point of view.
//
// Each entry:
//   { id, apprenticeName, clan, dialogue, lesson }
//
// `dialogue` is a single short paragraph in quotes (curly quotes used to
// dodge JS string-escaping). `lesson` is a one-line observational
// takeaway. The player's character is the listener.

export const gatheringContent = [
  {
    id: 'gather-shadow-1',
    apprenticeName: 'Mistpaw',
    clan: 'ShadowClan',
    dialogue: `“You are from the forest? I can smell it on your fur. ShadowClan apprentices hunt at night — you should try it, sometime. The frogs don’t see you coming.”`,
    lesson: 'Each Clan hunts its own way. None is better; all are needed.',
  },
  {
    id: 'gather-river-1',
    apprenticeName: 'Reedpaw',
    clan: 'RiverClan',
    dialogue: `“I swam across the river twice yesterday. Twice! My mentor says I am almost ready for my warrior name. You should see the way fish move when you are quiet enough. Like silver thoughts.”`,
    lesson: 'RiverClan hears the water the way the forest Clans hear the wind.',
  },
  {
    id: 'gather-wind-1',
    apprenticeName: 'Heatherpaw',
    clan: 'WindClan',
    dialogue: `“Forest cats are slow. No offense. Out on the moor you can run forever and the wind helps you. It’s a different kind of hunting. Quicker. The rabbits know.”`,
    lesson: 'WindClan trains for the open sky; the forest Clans for the closed canopy.',
  },
  {
    id: 'gather-thunder-1',
    apprenticeName: 'Brackenpaw',
    clan: 'ThunderClan',
    dialogue: `“My mentor is teaching me a new fighting move — the leap-and-twist. He says only ThunderClan apprentices learn it. He’s lying, probably, but I like that he says so. Have a good Gathering.”`,
    lesson: 'Apprentices brag at Gatherings. So do mentors. It is part of the moonlight.',
  },
  {
    id: 'gather-shadow-2',
    apprenticeName: 'Cedarpaw',
    clan: 'ShadowClan',
    dialogue: `“Our medicine cat saw a strange dream last moon. She would not say what. The elders are watching the sky. Have your medicine cat seen anything? — Never mind. The truce is the truce. We do not speak of it tonight.”`,
    lesson: 'StarClan sends warnings sometimes. The Clans hold them close until the time is right.',
  },
  {
    id: 'gather-river-2',
    apprenticeName: 'Otterpaw',
    clan: 'RiverClan',
    dialogue: `“Your eyes are like my sister’s. She was made a warrior at the last full moon. They named her Otterheart. I think one day my name will have heart in it too. What about yours?”`,
    lesson: 'Suffixes are not picked for nothing. Every Clan-cat carries the leader’s blessing in their name.',
  },
  {
    id: 'gather-wind-2',
    apprenticeName: 'Larkpaw',
    clan: 'WindClan',
    dialogue: `“I ran here. All the way from the moor. My paws are still buzzing. We arrived before the moon was full. My mentor laughed at me, but kindly. Do you ever run just to feel your heart?”`,
    lesson: 'Running for joy is a WindClan thing. The other Clans do it less. They should do it more.',
  },
  {
    id: 'gather-thunder-2',
    apprenticeName: 'Sorrelpaw',
    clan: 'ThunderClan',
    dialogue: `“My mentor says the best warriors listen first and speak second. So tell me about your Clan. I will listen. There are four moons until I am made a warrior, and I want to know everything I can.”`,
    lesson: 'Listening is a warrior skill. Some apprentices learn it before they leave the nursery.',
  },
];

// ---------------------------------------------------------------------------
// 3. StarClan dreams
// ---------------------------------------------------------------------------
//
// Soft, reverent visions from the cat's StarClan ancestors. Each dream
// gently focuses attention on a topic the player has been struggling with.
// The dream does NOT teach the math — it points to the practice.
//
// Each entry:
//   { id, opening, body, hintFor, closing }
//
// `hintFor` matches topicStats keys: 'mult' | 'add' | 'geometry' |
// 'fraction' | 'time'. The engine picks the dream that matches the
// player's weakest topic.
//
// StarClan ancestors used here are all canonical from the first arc:
// Bluestar, Spottedleaf, Lionheart, Yellowfang, Whitestorm. CLAUDE.md:
// "StarClan walks with you" / "lights your path" — never "is watching."

export const starClanDreams = [
  // -- Multiplication ------------------------------------------------------
  {
    id: 'dream-bluestar-mult',
    opening: `You sleep in your nest and dream of mist. Through the mist walks a blue-grey she-cat with stars caught in her fur — Bluestar.`,
    body: `She speaks low. “Counting by ones is good, young one. But to feed a Clan, you must count by paws and tails and litters. Practice your tens. Practice your fives. They are the steps to all the others.”`,
    hintFor: 'mult',
    closing: 'She walks beside you for one more breath, then is only stars. You wake before dawn, calm.',
  },
  {
    id: 'dream-lionheart-mult',
    opening: `In the dream, the trees are silver. A great golden warrior pads up — Lionheart, broad-shouldered and bright-eyed.`,
    body: `“Multiplication is only counting in groups, apprentice. A Clan of four litters of three is twelve kits — say it twice and you will not forget. When you are sure of the smaller groups, the larger ones bow to you.”`,
    hintFor: 'mult',
    closing: 'He dips his head once, in respect. You wake with the warmth of a den that does not exist.',
  },
  {
    id: 'dream-whitestorm-mult',
    opening: `You walk in a forest of starlight. An old white warrior sits at the edge of a clearing — Whitestorm.`,
    body: `“The fact you fear is the fact you do not yet know,” he says, slow as drifting snow. “Pick one times-table. Walk it like a patrol route until the path is clear. Then the next.”`,
    hintFor: 'mult',
    closing: 'He says nothing more, only watches the stars move. You wake at first light.',
  },

  // -- Addition / subtraction ---------------------------------------------
  {
    id: 'dream-spottedleaf-add',
    opening: `You dream of the medicine cat den. A tortoiseshell with stars in her whiskers stands among the herbs — Spottedleaf.`,
    body: `“Adding and taking away is the medicine cat’s daily work, little one. Three poppy seeds left, two more found, five now in the store. Slow down with the bigger numbers — the answer is patient. So am I.”`,
    hintFor: 'add',
    closing: 'She brushes her tail across your shoulder. The dream fades, but the kindness stays.',
  },
  {
    id: 'dream-yellowfang-add',
    opening: `A grumpy old grey she-cat sits across from you in the dream-clearing — Yellowfang, gruff even in StarClan.`,
    body: `“Stop rushing your addition, kit. Count the tens first, then the ones. Adults do it that way too — they just hide it better. Use your paws if you have to. No one’s watching but me.”`,
    hintFor: 'add',
    closing: 'She snorts, not unkindly, and looks away into the stars. You wake half-smiling.',
  },
  {
    id: 'dream-bluestar-add',
    opening: `Bluestar pads to you across a starry stream. The water reflects her stars and your own.`,
    body: `“When two patrols return, count the catch of one, then add the catch of the other,” she says, calm. “That is all addition asks. Take your time. The Clan will eat either way.”`,
    hintFor: 'add',
    closing: 'She turns back into the mist. You wake with a steady chest.',
  },

  // -- Geometry (perimeter / area) ----------------------------------------
  {
    id: 'dream-whitestorm-geometry',
    opening: `Whitestorm walks with you along the edge of a territory that is yours and not-yours, in the dream.`,
    body: `“The border is just the path around a thing,” he says. “Add the sides — that is the perimeter. Multiply two sides — that is the area inside. The forest has known this longer than the Clans.”`,
    hintFor: 'geometry',
    closing: 'He nods once and is gone. You wake remembering the shape of the patrol route.',
  },
  {
    id: 'dream-lionheart-geometry',
    opening: `In the dream, you stand at the edge of Sunningrocks. Lionheart sits beside you, gold on the grey stone.`,
    body: `“To know a territory you walk every side of it. That is perimeter. To know what it holds, you count the squares inside it. That is area. Do not confuse them, apprentice.”`,
    hintFor: 'geometry',
    closing: 'He flicks his tail toward the rising sun. You wake before it.',
  },

  // -- Fractions ----------------------------------------------------------
  {
    id: 'dream-spottedleaf-fraction',
    opening: `Spottedleaf is sorting herbs in the dream. The piles are neat halves and thirds.`,
    body: `“Half of six leaves is three. A third of six is two. A quarter of eight is two. A fraction is just a fair share, little one. The medicine cat den runs on fair shares.”`,
    hintFor: 'fraction',
    closing: 'She nudges a poppy head toward you, and the dream softens into morning.',
  },
  {
    id: 'dream-yellowfang-fraction',
    opening: `Yellowfang is muttering over a pile of marigold petals in the dream-den.`,
    body: `“You have eight petals, you give the queen half. That is four. Not so hard, was it? The trouble is you let the word ‘fraction’ scare you. Stop letting it.”`,
    hintFor: 'fraction',
    closing: 'She huffs a kind huff. You wake with the dry-leaf smell of her in your fur.',
  },

  // -- Time ---------------------------------------------------------------
  {
    id: 'dream-bluestar-time',
    opening: `Bluestar stands under a starry sky in the dream. The moon is at its full height — moonhigh.`,
    body: `“Time is the patrol of the sun and the moon, young one. Read the twoleg sun-face slowly — the small hand for hours, the long hand for the minutes. Vigils end when the stars say they end.”`,
    hintFor: 'time',
    closing: 'She tips her head back to the stars. You wake to first light.',
  },
  {
    id: 'dream-whitestorm-time',
    opening: `Whitestorm is keeping watch in the dream. The Gathering moon hangs over Fourtrees.`,
    body: `“From sunhigh to sundown is many paw-steps of the long hand. Count them carefully. A Gathering at moonhigh waits for no one — but you can know when to leave, if you read the sky.”`,
    hintFor: 'time',
    closing: 'He turns his pale head to you, then to the moon. You wake with the moon still in your eyes.',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Look up the catalog dream(s) for a given topic. Used by the engine picker.
export const dreamsForTopic = (topic) =>
  starClanDreams.filter((d) => d.hintFor === topic);

// Trinket id awarded by a Gathering — referenced from the engine when
// finalizing a Gathering vignette. Lives here so all Gathering content can
// be tweaked from one file.
export const GATHERING_TRINKET = {
  id: 'g-gathering-token',
  slot: 'general',
  imageSrc: null,
  name: 'a Gathering token',
  origin: 'A scrap of bark scratched with the four-Clan mark, kept from the night the Clans met under the full moon.',
};
