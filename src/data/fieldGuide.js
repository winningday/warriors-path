// The Field Guide — hidden lore reward, Phase 4 (v15.0.0-h).
//
// Each topic the player MASTERS unlocks one illustrated page of book-faithful
// lore. Mastery = ≥5 facts in that topic's SR pool in the Trusted bucket
// (see src/engine/fieldGuide.js). The unlock is quiet — the page is its own
// reward, not a "you got a thing" pop-up.
//
// Voice rules (per CLAUDE.md and DAUGHTER_NOTES.md):
//   - Clan is ALWAYS capitalized.
//   - Kits do not train. Only apprentices train.
//   - StarClan is reverent: "walks with you", "lights your path". NEVER "is
//     watching" or any ominous framing.
//   - 3rd-grade reading level. Crimson Text serif. Italic for direct quotes.
//   - The math is the framing device, not the subject. Each page should read
//     like a paragraph from the books, not a math textbook.
//   - Tone: dramatic but not silly. Reverent toward elders and StarClan.
//
// Topics map to the same `topic` strings the rest of the engine uses:
// 'mult' | 'add' | 'sub' | 'geometry' | 'fraction' | 'time'.

export const FIELD_GUIDE_PAGES = [
  {
    topic: 'mult',
    title: 'How Lionheart Taught Firepaw to Count Strokes',
    unlockHint: 'Master the multiplication tables to read this page.',
    body: [
      'When Firepaw was new to ThunderClan, his pelt still smelled faintly of twolegplace and his paws still tripped on the roots of the great oaks. Lionheart, his first mentor, would not be hurried.',
      '"You will not learn the hunting crouch in one moon," the golden tabby told him in Sandy Hollow, "nor the warrior\'s strike in one season. You learn it in rhythms. Watch."',
      'Lionheart pounced. Once. Then again, on the same beat. Then again. *Four times in the time it takes a beetle to cross a leaf* — that is how the Clan teaches a strike. Four pounces, five times over, and your paws begin to know the count before your mind does.',
      'Firepaw asked why the rhythm mattered. Lionheart\'s tail-tip flicked. "Because in a real fight, you will not have time to count. You must already know. Five strikes is one breath. Seven strikes is two. The numbers live in your shoulders by then, not your head."',
      'It is said in ThunderClan that every apprentice who learned to count their strokes never lost a stroke they had counted. Lionheart walks with StarClan now, but the rhythm he taught is still drilled into every paw in the hollow.',
      'When you practice your tables, you are practicing the same rhythm — the one that lives in your shoulders, not your head.',
    ],
  },
  {
    topic: 'add',
    title: 'The Day Goosefeather Counted the Returning Patrols',
    unlockHint: 'Master your addition facts to read this page.',
    body: [
      'Goosefeather was the strangest medicine cat ThunderClan ever had. He spoke to omens in the bracken and saw shapes in the cracks of bone. Most cats thought him half-mad. Bluestar, before she was leader, was one of the few who listened.',
      'Every evening at sunhigh\'s end he sat at the camp entrance with a row of pebbles in front of him. As each patrol padded in he counted them — *three from the river border, plus four from the Thunderpath, plus two who had stalked alone* — and laid a pebble down for every cat.',
      'When the medicine cat\'s apprentice asked why, Goosefeather only said: *"A Clan that knows its number is a Clan that knows when one is missing."*',
      'He was right. The night a patrol did not return — the night before the great battle at Sunningrocks — Goosefeather knew before any other cat. The pebbles told him. There were two fewer than there should have been.',
      'When you add, you are doing what every medicine cat has done since the Clans began. You are laying down pebbles for every cat who walks through the gorse tunnel. You are making sure the count is right.',
      'The Clan that knows its number knows when to send a search party. That is older than any of us.',
    ],
  },
  {
    topic: 'sub',
    title: 'Counting What Remains After the Long Cold',
    unlockHint: 'Master your subtraction facts to read this page.',
    body: [
      'Leaf-bare is the cruel season. The earth is iron. The prey is thin. The fresh-kill pile, which in green-leaf overflows with vole and squirrel, shrinks every dawn.',
      'In the old days the eldest cat in the Clan kept the tally. She would sit by the pile each morning and count. *Eleven pieces of prey yesterday. Six taken in the night. Five remain.* She would say it out loud, so the deputy heard, so the leader heard, so the medicine cat could decide who ate today and who waited.',
      'The elders teach that subtraction is the harder math because it is the math of loss. It is the count after the storm has passed. *We had nine warriors. Two went to StarClan. Seven walk with us still.* The hardest sums in the Clan are the ones an elder must say out loud at sunrise.',
      'But subtraction is also the math of hope. *Twelve days of leaf-bare were promised. Eight have passed. Four remain.* The elders teach the apprentices both meanings, because a warrior must know how to count down a long cold as well as count up a fat green-leaf.',
      'When you subtract, remember: somewhere in every Clan an old cat is doing the same math at dawn, counting what is left and what must last. It is not a sad task. It is the task that keeps the Clan alive.',
    ],
  },
  {
    topic: 'geometry',
    title: 'Why the Borders Are Walked Thrice',
    unlockHint: 'Master perimeter and area to read this page.',
    body: [
      'Every apprentice learns it on her first Border Patrol: the territory is not just a place. It is a shape. And a shape has an edge that must be walked, and a middle that must be known.',
      'The eldest warriors say the borders are walked thrice each moon — once at dawn, once at sunhigh, once at moonrise — because a scent-mark fades the way a paw-print fades from soft earth. The *length* of the border is what matters: every fox-length of edge must be refreshed, or the rival Clan will find the gap.',
      'But the middle matters too. When the apprentices practice their hunting crouch in Sandy Hollow, the senior warrior paces out the clearing first. *Four tree-lengths long, three tree-lengths wide. Twelve tree-lengths of ground for the catch.* That is the area — the room a hunter has to work, the room a kit has to play.',
      'The borders are the perimeter. The territory is the area. A warrior must know both, because a Clan that loses its edge loses its middle, and a Clan that forgets its middle has nowhere safe to raise its kits.',
      'When you measure a perimeter, you are walking the dawn border. When you measure an area, you are pacing out a clearing. The math is the same math the deputies have done since the Clans first divided the forest.',
    ],
  },
  {
    topic: 'fraction',
    title: 'Yellowfang\'s Herb-Share, and the Rule of Equal Piles',
    unlockHint: 'Master your fractions to read this page.',
    body: [
      'Yellowfang was a medicine cat who had seen too much. She had been ShadowClan once, and then she had been an outsider, and then ThunderClan took her in and gave her a den of moss and a stock of herbs to tend. She had little patience for foolishness, and less for greed.',
      '"Herbs are not shared by who deserves them," she would growl at Cinderpaw, her apprentice. "Herbs are shared by who needs them, in the portion they need."',
      'When the queens were sick she would split a bundle of borage into *halves* — one half for the nursery, one half kept back for tomorrow. When the elders coughed in leaf-bare she would split a sprig of coltsfoot into *thirds* — one third for each elder, no more, no less. When the apprentices scraped their pads on the stones she would split a poultice of marigold into *quarters* — small enough to dab on each torn paw without wasting a leaf.',
      'The Rule of Equal Piles, the medicine cats called it. *A fraction is a promise of fairness.* A half means two cats get the same. A third means three cats get the same. A fifth means five cats get the same. There is no haggling.',
      'Cinderpaw asked once why it had to be exact. Yellowfang only narrowed her yellow eyes and said: *"Because the queen whose share was short will die before the queen whose share was full. And StarClan will know which one we let go."*',
      'When you split something into equal parts, you are doing the medicine cat\'s work. You are making the promise of fairness. You are making sure no cat is shorted.',
    ],
  },
  {
    topic: 'time',
    title: 'What the Elders Saw in the Twoleg Sun-Face',
    unlockHint: 'Master clock-reading and duration to read this page.',
    body: [
      'There is a round face nailed above the door of an old twoleg den at the edge of ThunderClan territory. Two thin sticks turn inside it — one short, one long — and the twolegs glance up at it before they leave, the way a Clan cat glances up at the sun.',
      'The elders did not know what it meant for many seasons. Then a tom came to the Clans who had once been a kittypet, and he watched the round face and laughed.',
      '*"It is their sun,"* he said. *"It tells them where the real sun is, even when the day is grey. The short stick says the hour. The long stick says the count of breaths since the hour. Twelve marks for the day, twelve marks for the night."*',
      'The elders thought about this for many sunrises. Then they began to teach it to the apprentices: not because the Clans need it — the Clans have always read the sun and the moon — but because a wise warrior knows the ways of every creature in the forest. Even the twolegs.',
      'A vigil that begins at the moon\'s rise and ends at the moon\'s setting can be counted in the sun-face\'s marks. A patrol that leaves at the second mark and walks until the seventh has walked five marks of the long stick. Five marks is a long walk; a young apprentice will be footsore by the end.',
      'When you read a clock, you are reading what the elders learned from the old kittypet. When you measure how long a vigil lasted, you are doing the math the elders did when they realized the twolegs and the Clans share the same sky, even if they read it differently.',
    ],
  },
];

// Lookup helpers. Keep these tiny — the engine module owns unlock state.
export const pageForTopic = (topic) =>
  FIELD_GUIDE_PAGES.find((p) => p.topic === topic) || null;

export const FIELD_GUIDE_TOPICS = FIELD_GUIDE_PAGES.map((p) => p.topic);
