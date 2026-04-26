# Sound design — plan

## The constraint

From CLAUDE.md, your daughter is "hyper-sensitive to sound and overstimulation."
This means:

- **No auto-play.** Ever.
- **Sound must be opt-in**, default OFF, and easy to turn off again.
- **Tones must be soft and natural** — no synth chimes, no upbeat fanfares, no
  cartoon sounds. Think: a real cat purring nearby. A single paw on damp
  earth. Wind through ferns.
- **No music.** A single ambient track playing in the background = bad. The
  forest's ambient sound IS the music if anything.

Within those constraints, satisfying sound IS achievable. The trick is
**diegetic, in-world sounds, played sparsely at meaningful moments.** Not
gamification noises.

## Sound triggers — what would actually feel right

These are the moments where a single sound effect would *enhance* (not
intrude on) the moment, given her sensitivity:

| Moment | Sound | Why it works |
|---|---|---|
| Patrol begins (any) | Single soft pawstep on leaves (~150ms) | "We're moving now." Diegetic. Not a fanfare. |
| Correct answer — prey caught | Soft, brief rustle in undergrowth + a single muted thump (the strike) | Implies the catch without being violent. |
| Correct answer — herb gathered | Faint snap of a stem (~100ms) | Quiet, plant-y, gentle. |
| Correct answer — border refreshed | Wind through grass, very brief (~250ms) | Open-territory feel. |
| Correct answer — training spar | Single soft "pad" of paw-on-paw contact | Sheathed claws, no violence. |
| Wrong answer | NO sound | Silence is correct here. Don't punish with audio. |
| Reveal after second miss | NO sound | Same. The text is the moment; sound would feel scolding. |
| Rank-up ceremony | A single low, gentle purr (1–2 seconds) | The most "rewarding" sound a cat-loving kid can imagine. Use SPARINGLY — only on rank-ups, not on every correct. |
| Story flashcard saved | Faint chirp of a single bird (~200ms) | "A note kept." Birdsong is calm in this context. |
| Returning to den | Distant owl hoot (very brief) | Atmospheric, never startling. |
| Idle in den (every ~30s, optional) | Wind/leaves rustle (~500ms, very quiet) | Adds presence WITHOUT music. **This is the most likely trigger to backfire** — if she finds it annoying, kill it immediately. |

**What I'd ship first:** rank-up purr, prey-caught soft thump, herb snap,
patrol-start pawstep. Five sounds total. Skip the idle-in-den ambient
unless she actively asks for it.

## Where to get the sounds

You want **CC0 / CC-BY licensed natural sound recordings.** Don't generate
them with AI for this — the textures need to be real for them to feel like
the real forest.

### Best free sources, in order of "best for this project":

1. **freesound.org** — huge, reliable, well-tagged. Most uploads are CC-BY
   (attribute the creator) or CC0 (use freely). Search for: `cat purr`,
   `paw step grass`, `paw step leaves`, `snap twig`, `wind grass`, `owl
   distant`, `bird call short`. Filter by "CC0" if you want zero attribution
   hassle.
2. **BBC Sound Effects** (sound-effects.bbcrewind.co.uk) — high-quality, free
   for personal/educational use. Some are nature recordings from BBC archives.
3. **Pixabay sounds** (pixabay.com/sound-effects) — CC0 by default. Smaller
   selection but easier license.
4. **YouTube → audio extraction** of nature documentaries — only if you have
   the rights. Probably skip.

### Search terms for each sound:

- **rank-up purr**: "cat purr close", "domestic cat purring loop" (5-10s →
  trim to 1-2s, gentle fade-in/out)
- **patrol-start pawstep**: "footstep grass single", "paw on leaves",
  "padding on dirt"
- **prey-caught**: "rustle undergrowth", "small impact thump muffled"
- **herb-gathered**: "twig snap small", "stem break", "leaf pluck"
- **border-refreshed**: "wind through grass", "breeze rustle short"
- **training spar**: "paw pat pillow", "soft thud" (you want it muted)
- **story saved**: "bird chirp single", "robin chirp short"
- **idle den ambient**: "forest dusk loop quiet" — DO NOT ship without
  testing on her first.

## Processing the sounds

For each sound:

1. **Trim hard.** Most clips you find are 5+ seconds; you want 100ms-500ms
   except the purr (1-2s).
2. **Add a 30-50ms fade-in and 50-100ms fade-out.** Eliminates clicks at
   start/stop. Critical for not being jarring.
3. **Normalize peaks to -6dB.** Don't normalize to 0; you want sounds quiet.
4. **Save as `.webm` (Opus codec) at 64kbps mono.** Tiny files (~5-15KB
   each) and Safari supports them. Total sound budget: ~100KB for the whole
   set.

Tools that work well: **Audacity** (free, mac/windows), or **ffmpeg**
on the command line. ffmpeg one-liner per file:

```bash
ffmpeg -i input.wav -ss 0 -t 0.4 -af "afade=in:d=0.04,afade=out:st=0.3:d=0.1,volume=-6dB" \
  -c:a libopus -b:a 64k -ac 1 output.webm
```

## How to wire it into the game (when ready)

This is roughly a 1-hour task in `src/`:

1. Drop the `.webm` files into `src/assets/sounds/`.
2. Add a tiny `useSound` hook that respects a `profile.settings.soundEnabled`
   flag (defaults to `false`).
3. Add a Settings panel in the den with a single checkbox: "Soft sounds
   (off by default)". Stored in profile so it persists per-character.
4. Trigger sounds at the moments listed in the table above. Use the Web
   Audio API or a `<audio>` tag with `preload="auto"`. NEVER `autoplay`.
5. Add an "always-respect-prefers-reduced-motion-and-audio" guard:
   ```js
   const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   if (reduced || !profile.settings?.soundEnabled) return;
   ```

## What NOT to do

- ❌ Background music loop (any kind)
- ❌ "Achievement unlocked" chime
- ❌ Synthesized/8-bit/MIDI sounds
- ❌ "Whoosh" sound on screen transitions
- ❌ Click/tap sounds on every button
- ❌ Sound on wrong answer (would feel scolding)
- ❌ Sound on streak milestone (would feel like pressure)
- ❌ Sound on TIMER (we don't have timers, ever)

## Test plan when sounds are added

Show her ONE sound first — the rank-up purr. If she likes it, add the others
incrementally. If at any point she says "ugh, too much" or visibly winces,
the default of OFF is doing its job; ask if she wants to leave it off
forever. **Trust her instincts here completely.** Sound is the easiest
feature to over-engineer and the easiest to permanently ruin a kid's
relationship with the game. Better to ship five good sounds she sometimes
opts into than thirty she always opts out of.
