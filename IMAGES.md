# Image Inventory & AI Generation Prompts

This is the working list for Step 2 of the visual roadmap: replace the current
inline SVGs with AI-generated illustrations. Step 3 (commissioned/family
hand-drawn art) replaces these later — same filenames, different bytes.

## Visual style guide — non-negotiable

Every image must match these constraints. Bake them into every prompt.

- **Mood:** dark, moody, gritty forest. Late dusk or moonlit. Charcoal, deep
  green, ink-blue, mossy brown. NOT cute. NOT pastel. NOT cartoon. Think
  Erin Hunter book covers or moody children's-illustrated-fantasy.
- **Palette:** background tones in `#0a0f0a`, `#1a2419`, `#2a3329`, with
  accent highlights in the matching Clan color:
    - ThunderClan: warm amber-gold `#e2c870`
    - ShadowClan: lifted violet `#a78bd9`
    - RiverClan: river teal-blue `#4ba4d8`
    - WindClan: moor green `#8fc28a`
- **Style:** painterly, slightly textured, soft edges. Realistic anatomy on
  cats and prey, not anime/anthropomorphized. Eyes glow softly with the
  Clan accent color when the cat is a member of that Clan.
- **Composition:** subject centered or rule-of-thirds, lots of negative space
  in background, atmospheric haze/fog, low-angle moonlight.
- **Format:** WebP for ship, with PNG fallback. Transparent background where
  the image is a sprite (cat portraits, prey icons). Full-bleed background
  art for scenery panels and ceremony scenes.
- **Resolution:** generate at 2048×2048 or higher; we'll downscale + WebP-encode.
  Iconic prey/herbs can be 512×512.
- **No text in image.** All text is rendered by the game.

## Boilerplate prefix to paste at the start of every prompt

```
Atmospheric children's-fantasy book illustration in the style of Erin Hunter
Warrior Cats book covers. Painterly, slightly textured, dark moody palette
of charcoal, deep forest green, ink-blue. Late dusk or moonlit setting,
volumetric atmospheric haze, soft cinematic lighting. Realistic feline
anatomy. No text, no UI, no watermark. Negative space and centered subject.
```

## Boilerplate negative prompt (for SD/MJ-style models)

```
no cute, no chibi, no cartoon, no anthropomorphic, no anime, no clothing,
no human characters, no text, no watermark, no UI, no neon, no rainbow,
no pastel, no Disney style, no logo
```

---

## What we currently have (inline SVG, in `src/components/art/`)

| File | What it draws | Replace with |
|---|---|---|
| `CatPortrait.jsx` | One generic cat that swaps a leaf-collar / shoulder-stripe / star based on rank, plus 7 body-color presets. | A SET of 7 rank illustrations (×4 Clans × N pelt colors). See **Cat portraits** below. |
| `PreyIcon.jsx` | 13 tiny SVG icons (mouse, vole, squirrel, sparrow, thrush, blackbird, starling, robin, wren, finch, rabbit, frog, hawk). | 13 painterly portraits. See **Prey icons** below. |
| `HerbIcon.jsx` | One generic herb icon. | 16 distinct herb illustrations OR keep one generic + a "currently gathered" tinted variant. See **Herbs** below. |
| `ClanScenery.jsx` | 4 abstract Clan landscape banners (deep forest, pine silhouettes, river+reeds, open moor). | 4 painted full-bleed banners. See **Clan scenery** below. |
| (none) | Ceremony backdrops — currently rendered with text panels only. | 4 ceremony scenes. See **Ceremonies** below. |

---

## 1. Cat portraits — most important

The cat is the player. Per the game, she can be Black, Grey, White, Tabby,
Ginger, Calico, or Tortoiseshell, with eye color Amber/Green/Blue/Yellow/Ice.
The cat rises through 7 ranks. Ideally she sees herself.

### Pragmatic approach

Generate a **base cat in 5 rank poses** (Apprentice, Young Warrior, Warrior,
Deputy, Leader) + 2 medicine ranks (Apprentice, Medicine Cat). Then either:

- **(A)** Procedurally recolor at runtime via CSS `filter: hue-rotate(...)` —
  cheapest, but fur color won't be perfect.
- **(B)** Generate each pose × pelt color combo (5 × 7 = 35 images per warrior
  path, plus a few extras for medicine cats). More files, more accurate.
- **(C)** Generate ONE base illustration per rank in a neutral grey pelt with
  amber eyes, label it as "Mossheart, the standard," and not promise the cat
  visually matches her custom pelt. Honest, simple.

I'd recommend **(C)** for v15c, then upgrade to (B) when the family hand-art
arrives.

### Prompts — 1 per rank, neutral grey tabby pelt, amber eyes

#### Apprentice
```
[BOILERPLATE PREFIX]
A young grey tabby cat apprentice, six moons old, sitting alert in a forest
clearing at dusk. Slightly thin and gangly, large paws she has not grown
into yet. Whiskers tilted forward in curiosity. Amber eyes glowing softly.
Ears erect and oversized. Background: ferns and tree roots, deep ThunderClan
forest, atmospheric mist. Three-quarter view. Pelt has subtle tabby stripes,
charcoal and grey-brown.
[NEGATIVES]
```

#### Young Warrior
```
[BOILERPLATE PREFIX]
A grey tabby cat freshly-named warrior, lean and confident, standing on a
fallen log in the forest at moonrise. Tail held high, body lengthening into
adult proportions. Eyes amber and bright with pride. The forest behind her
is dark with moonlit fog. She faces slightly to the right. Painted in moody
dark-fantasy style.
[NEGATIVES]
```

#### Warrior
```
[BOILERPLATE PREFIX]
A grey tabby cat in her prime as a Clan warrior, muscular and sure-footed,
crouched low on Sunningrocks at twilight, scanning the territory. A small
nick in one ear from past battles. Strong jaw, intelligent amber eyes. The
sky behind her is bruised purple-blue with thin clouds. She is alert but
calm, not aggressive.
[NEGATIVES]
```

#### Deputy
```
[BOILERPLATE PREFIX]
A grey tabby cat as Clan deputy, standing on a moss-covered stone with the
camp clearing visible behind her, the Highrock looming in the background.
Confident but watchful posture. Ears swiveled to listen. A faint accent
stripe of gold along her shoulder where a senior cat would touch noses.
Eyes warm amber, intelligent and steady. Twilight, soft golden rim-light.
[NEGATIVES]
```

#### Leader
```
[BOILERPLATE PREFIX]
An older grey tabby cat as Clan leader, regal but battle-worn, sitting
atop the Highrock under a full moon. Silver-frosted whiskers and a few
white hairs around the muzzle. A tiny silver star — almost like a single
glint — visible above her head, suggested rather than literal, painted as a
soft glow. Several scars on her flank. Wise, weighty amber eyes. Behind
her, StarClan stars wheel faintly in the sky.
[NEGATIVES]
```

#### Medicine Cat Apprentice
```
[BOILERPLATE PREFIX]
A young grey tabby cat as medicine cat apprentice, sitting in the medicine
den at dawn. Bundles of dried herbs hanging from the moss-covered ceiling
behind her. A few catmint leaves on the floor in front of her paws. Soft
green light filtering in. Curious, gentle posture. Amber eyes attentive.
Ferns frame the scene.
[NEGATIVES]
```

#### Medicine Cat
```
[BOILERPLATE PREFIX]
A grey tabby medicine cat in her prime, kneeling beside a sick warrior on
a moss bed in the medicine den. Herbs spread on a flat stone before her.
Lit by a single shaft of moonlight from above. Calm, focused, knowing.
Amber eyes warm with care. The den is intimate and private; the rest of
the camp is dark behind her.
[NEGATIVES]
```

### File names when you save them

```
src/assets/cats/apprentice.webp
src/assets/cats/young-warrior.webp
src/assets/cats/warrior.webp
src/assets/cats/deputy.webp
src/assets/cats/leader.webp
src/assets/cats/med-apprentice.webp
src/assets/cats/medicine-cat.webp
```

(Provide a 2x version too: `apprentice@2x.webp` etc., for retina.)

---

## 2. Prey portraits — 13 images

Square 512×512 each. Subject centered, slightly off-center is okay. Soft
forest-floor background or ambiguous moss/leaves blur, not pure black.

Boilerplate for ALL prey:

```
[BOILERPLATE PREFIX]
A SUBJECT in a forest at dusk, painted realistically with subtle painterly
texture. Soft moonlight rim-light. Mossy/leaf-litter background blurred and
dark. The animal is alert and naturalistic, not anthropomorphized. Square
composition, subject centered.
[NEGATIVES]
```

Substitute `SUBJECT` per row:

| File | SUBJECT |
|---|---|
| `prey-mouse.webp` | a small wood mouse, alert, whiskers twitching, beady black eyes, brown-grey fur |
| `prey-vole.webp` | a chubby field vole with rounded face and short tail, brown fur |
| `prey-squirrel.webp` | a grey squirrel mid-stride on a fallen log, fluffy tail curled |
| `prey-sparrow.webp` | a house sparrow perched on a low branch, head tilted alertly, brown and grey plumage |
| `prey-thrush.webp` | a song thrush on the forest floor, speckled brown and cream breast |
| `prey-blackbird.webp` | a male blackbird with glossy jet-black plumage and orange beak, perched alert |
| `prey-starling.webp` | a starling with iridescent purple-green plumage, on a branch |
| `prey-robin.webp` | a European robin with red breast, perched on a tree root |
| `prey-wren.webp` | a tiny wren, tail cocked upright, on a mossy stone |
| `prey-finch.webp` | a chaffinch perched among dried leaves |
| `prey-rabbit.webp` | a wild rabbit crouched, ears half-back, alert and ready to bolt |
| `prey-frog.webp` | a small brown common frog beside a pond, half-submerged |
| `prey-hawk.webp` | a sparrowhawk perched on a high branch silhouetted against the moonlit sky, fierce yellow eyes — composition emphasizes the danger; this is a rare and risky catch |

---

## 3. Herb illustrations — 16 images

Even smaller (256×256 or 384×384). Background should be a flat-ish dark
moss tone — these go inline next to text, so they need to read at a glance.
You can do these in a more illustrative/woodcut style if it reads better
than full painting at small size.

Boilerplate:

```
[BOILERPLATE PREFIX]
A botanical illustration of HERB on a dark mossy stone background, painted
with naturalistic detail. Painterly woodcut style. The leaves/stems should
be identifiable to a 3rd-grader looking up the herb in a field guide.
Square, centered, soft cinematic side-lighting.
[NEGATIVES]
```

| File | HERB |
|---|---|
| `herb-catmint.webp` | a sprig of catmint with serrated leaves and small lavender flowers |
| `herb-marigold.webp` | a bright orange marigold flower with green leaves |
| `herb-juniper.webp` | a juniper sprig with dark blue-purple berries among needles |
| `herb-poppyseeds.webp` | a dried poppy seed head with seeds spilling onto the stone |
| `herb-cobwebs.webp` | a delicate spiderweb stretched between two twigs, dewdrops catching light |
| `herb-comfrey.webp` | a comfrey plant with broad fuzzy leaves and small bell-shaped purple flowers |
| `herb-borage.webp` | a borage plant with star-shaped blue flowers and bristly leaves |
| `herb-tansy.webp` | a tansy sprig with clusters of small yellow button-like flowers |
| `herb-yarrow.webp` | a yarrow plant with feathery leaves and flat clusters of small white flowers |
| `herb-mousebile.webp` | a small leaf parcel containing dark mouse-bile salve, on a stone — unappetizing-looking but clinical |
| `herb-dockleaves.webp` | a large dock leaf, broad and ribbed, with subtle green-brown coloring |
| `herb-horsetail.webp` | a horsetail plant with segmented bamboo-like stems |
| `herb-goldenrod.webp` | a goldenrod plant with arching stems and tiny yellow flowers |
| `herb-chervil.webp` | a chervil plant with delicate fern-like leaves and small white flowers |
| `herb-feverfew.webp` | a feverfew plant with small daisy-like flowers and lobed leaves |
| `herb-lavender.webp` | a sprig of lavender with purple flower spikes |

---

## 4. Clan scenery banners — 4 images

These appear at the top of the den. Aspect ratio ~6:1 (wide and short),
e.g. 1800×300. They should establish the FEEL of the Clan immediately.

### ThunderClan scenery
```
[BOILERPLATE PREFIX]
A wide cinematic landscape banner of ThunderClan territory at dusk: deep
green oak and beech forest with tall straight trunks, ferns and bracken in
the understory, a single moonlit clearing visible in the middle distance,
soft mist drifting between the trees. The sky between the canopy gaps is
deep purple-blue with a hint of warm amber. Painterly, atmospheric,
storybook quality. Aspect ratio 6:1 wide.
[NEGATIVES]
```

### ShadowClan scenery
```
[BOILERPLATE PREFIX]
A wide cinematic landscape banner of ShadowClan territory at twilight: dense
pine forest with tall dark conifers, marshy ground in the foreground with
patches of black water reflecting the moon, fallen pine needles and a
half-rotted stump. The atmosphere is hushed and watchful. Sky a deep
indigo-violet with a thin moon. Painterly, slightly mysterious, aspect
ratio 6:1.
[NEGATIVES]
```

### RiverClan scenery
```
[BOILERPLATE PREFIX]
A wide cinematic landscape banner of RiverClan territory at moonrise: a
slow river curving through reedbeds, willow trees overhanging the water,
soft mist rising off the surface, a few stepping stones leading to a
flat island. The water reflects the moon as fragments of teal-silver light.
Painterly, peaceful but cool, aspect ratio 6:1.
[NEGATIVES]
```

### WindClan scenery
```
[BOILERPLATE PREFIX]
A wide cinematic landscape banner of WindClan territory at sundown: vast
open moorland with rolling hills, tufts of heather and gorse, a single
prominent boulder in the middle distance (Outlook Rock), wind-bent grass
in the foreground. The sky is huge and dramatic, fading from deep green at
the horizon to indigo overhead. Cool, exposed, lonely beauty. Painterly,
aspect ratio 6:1.
[NEGATIVES]
```

### File names

```
src/assets/scenery/thunderclan.webp
src/assets/scenery/shadowclan.webp
src/assets/scenery/riverclan.webp
src/assets/scenery/windclan.webp
```

---

## 5. Ceremony backdrops — 4 images

These would appear behind the ceremony text panels. Aspect ratio ~3:2 or 16:9,
~1600×900.

### Apprentice / Warrior ceremony — Highrock
```
[BOILERPLATE PREFIX]
An atmospheric scene of a Clan gathering at the Highrock in a forest clearing
at moonhigh. A large flat boulder dominates the middle distance. The Clan
leader, a regal cat in silhouette, stands atop it. Below, the rest of the
Clan is gathered as a semicircle of attentive cat shapes — they're suggested
silhouettes, not detailed. Moonlight pools on the rock. Warm amber-gold
highlights. Painterly, ceremonial, awe-tinged. Composition emphasizes the
Highrock's centrality.
[NEGATIVES]
```

### Medicine Cat ceremony — Moonstone cave
```
[BOILERPLATE PREFIX]
A small chamber inside a stone cave lit only by moonlight falling through
a hole above onto a single tall pale crystal — the Moonstone. The light is
silver-blue and otherworldly. Faint star-shapes glimmer in the darkness
beyond the crystal. Two small cat shapes are barely visible, sitting reverent
near the stone. Mystical, hushed, sacred atmosphere. Painterly.
[NEGATIVES]
```

### Deputy ceremony — Highrock at moonhigh
```
[BOILERPLATE PREFIX]
The Highrock under a high moon, the Clan leader silhouetted on top, the
Clan gathered below in a near-circle of expectant cats. Composition is
similar to the apprentice ceremony but more intimate — fewer cats, closer in,
the moment is weightier. Cool moon-silver light with hints of amber from a
distant fire pit. Painterly, ceremonial.
[NEGATIVES]
```

### Leader ceremony — Moonstone with the deputy and medicine cat
```
[BOILERPLATE PREFIX]
The Moonstone cave: the deputy (a striped cat) lies asleep with her nose
touching the base of the tall pale crystal, the medicine cat (slightly
older, gentle posture) sits watchful beside her. The crystal blazes with
silver-white light, and nine starry forms — ancestral cats — are barely
visible in the radiance, fading in and out. Mystical, awe-filled, sacred.
The deputy is dreaming her nine lives. Painterly.
[NEGATIVES]
```

### File names

```
src/assets/ceremonies/apprentice.webp
src/assets/ceremonies/warrior.webp        (can reuse apprentice — same setting)
src/assets/ceremonies/medicine-cat.webp
src/assets/ceremonies/deputy.webp
src/assets/ceremonies/leader.webp
```

---

## How to wire images into the game

Once you have the WebP files, drop them into `src/assets/`. Then:

1. Each art component (`CatPortrait.jsx`, `PreyIcon.jsx`, `HerbIcon.jsx`,
   `ClanScenery.jsx`) gets a small change: render `<img src={...} />` instead
   of inline `<svg>`, falling back to the SVG if the image hasn't loaded yet.
2. Vite handles the `import` and bundles WebPs as hashed assets in `dist/`.
3. The `IMAGES.md` file stays as the source of truth for what image goes where.

I'll wire the images in as a small v15c task whenever you're ready — won't
take long once the files exist.
