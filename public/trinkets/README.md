# Trinket art

Hand-drawn trinket images go here. The build copies everything in `public/`
into the deployed site root, so a file at `public/trinkets/foo.png` ends up
served at `/trinkets/foo.png` and is available as an `<img>` source.

## How to add a hand-drawn trinket

1. **Export from Procreate** (or any editor) as PNG, SVG, or WebP. Square
   aspect, transparent background. 256×256 px is plenty — the icon is
   rendered at 28–48 px at most. A bigger source is fine; the renderer
   scales it.

2. **File name** must match the trinket's `id` from
   `src/data/trinkets.js`, with the matching extension. For example:
   - `t-claw-mark` → `public/trinkets/t-claw-mark.png`
   - `h-feather-jay` → `public/trinkets/h-feather-jay.png`
   - `v-moonstone` → `public/trinkets/v-moonstone.svg`

3. **Wire it up** in `src/data/trinkets.js` — set the trinket's
   `imageSrc` field:
   ```js
   { id: 't-claw-mark', slot: 'general',
     imageSrc: '/trinkets/t-claw-mark.png',
     name: 'a claw-mark on the training tree', ... }
   ```
   Once `imageSrc` is set, `TrinketIcon` uses the file instead of the
   built-in SVG fallback. Set it back to `null` (or remove the field) to
   revert to the SVG.

4. **Add new trinket slots** by editing the catalog. Each entry needs:
   - `id` — unique stable string (kebab-case, prefix by patrol family)
   - `slot` — one of `'ear' | 'mouth' | 'back' | 'leg' | 'nose' | 'general'`
   - `imageSrc` — `null` (uses SVG) or `'/trinkets/<id>.<ext>'`
   - `name` — display string ("a moonstone shard")
   - `origin` — one-line backstory
   - `weight` — drop weight (1=rare, 5=common)

## Slots (for Phase 2 cat customization)

Slots prepare for the future "dress your cat" feature where the player
picks one trinket per slot to display on the cat portrait:

- **ear** — feathers, flowers, small leaves (hung on either ear)
- **mouth** — held items (a tooth, a small bone, an acorn)
- **back** — draped/tucked over the back (silks, threads, larger items)
- **leg** — anklet-like adornments (silk strands, bark cuffs)
- **nose** — nose decoration (rare in book-flavor; mostly unused)
- **general** — kept in the nest only, not worn

## Future: 4×4 grid editor (admin/dev tool)

Planned: a hidden admin view that lets the dad / daughter drag-drop
PNGs into a 4×4 grid per slot, generating the catalog entries
automatically. Until then, edit `src/data/trinkets.js` by hand —
adding a trinket is two minutes of work.

## Daughter's hand-drawn set (in flight)

She has 13 trinkets drawn in Procreate as of writing. As they're
exported, drop them in here and toggle the `imageSrc` field. The
SVG fallbacks remain for any trinket without a hand-drawn version.
