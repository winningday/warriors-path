<h1 align="center">🐈‍⬛ Warrior's Path</h1>

<p align="center">
  <em>A math practice game for a 3rd grader who loves Warrior Cats.<br/>
  Built collaboratively by a dad and his daughter, who is the actual product owner.</em>
</p>

<p align="center">
  <a href="https://github.com/winningday/warriors-path/stargazers"><img src="https://img.shields.io/github/stars/winningday/warriors-path?style=for-the-badge&color=e2c870&logo=github&logoColor=0a0f0a" alt="Stars"></a>
  <a href="https://github.com/winningday/warriors-path/network/members"><img src="https://img.shields.io/github/forks/winningday/warriors-path?style=for-the-badge&color=8fc28a&logo=github&logoColor=0a0f0a" alt="Forks"></a>
  <a href="https://github.com/winningday/warriors-path/issues"><img src="https://img.shields.io/github/issues/winningday/warriors-path?style=for-the-badge&color=a78bd9&logo=github&logoColor=0a0f0a" alt="Issues"></a>
  <a href="https://github.com/winningday/warriors-path/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/winningday/warriors-path/deploy.yml?style=for-the-badge&color=4ba4d8&label=deploy&logo=github&logoColor=0a0f0a" alt="Deploy"></a>
  <a href="https://github.com/winningday/warriors-path/blob/main/LICENSE"><img src="https://img.shields.io/github/license/winningday/warriors-path?style=for-the-badge&color=c8c0a8" alt="License"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/built%20with-React-61dafb?style=flat-square&logo=react&logoColor=0a0f0a" alt="React">
  <img src="https://img.shields.io/badge/bundled%20by-Vite-646cff?style=flat-square&logo=vite&logoColor=ffffff" alt="Vite">
  <img src="https://img.shields.io/badge/single--page-static-2a3329?style=flat-square" alt="Static">
  <img src="https://img.shields.io/badge/no%20backend-required-8fc28a?style=flat-square" alt="No backend">
  <img src="https://img.shields.io/badge/timers-NEVER-3a2929?style=flat-square&color=8b3a3a" alt="No timers">
</p>

---

## What this is

Warrior's Path is a single-page web game that drills 3rd-grade math —
multiplication, addition, subtraction, geometry, and fractions — wrapped in
the world of the [_Warriors_ book series](https://en.wikipedia.org/wiki/Warriors_(novel_series)).
Instead of a generic "level up", the player progresses through the canonical
Warrior Cats arc: kit → apprentice → young warrior → warrior → deputy →
leader, with name ceremonies, a chosen mentor, hunting and herb patrols,
and book-faithful flavor at every step.

It is **not a portfolio piece**. It is a real game that gets played by a
real 8-year-old who is the project's product owner. Every design choice is
audited against one question: _does this make her want to play tomorrow?_

> 🎨 _Screenshot coming once the next round of illustrations lands.
> See [IMAGES.md](./IMAGES.md) if you'd like to help!_

---

## Highlights

- **No timers, ever.** Never displayed. Stress shuts kids down. There IS
  internal timing (used for spaced-repetition promotion), but it is invisible.
- **Spaced repetition built in.** Every math fact she encounters lives in
  one of three buckets — Wild, Tracking, Trusted — with weighted selection
  so hard facts come up more often and mastered ones come up less.
- **Player-authored memory aids.** When she catches a tricky fact, the mentor
  asks if she'd like to write a 200-character story to remember it. Next
  time that fact appears, the mentor whispers her own story back to her.
- **Lore-faithful.** Every Clan descriptor, every ceremony, every herb name,
  every prey rebalance comes from her direct feedback. She is a stricter
  Erin Hunter lore-checker than any adult.
- **Rank ceremonies as gameplay milestones.** Apprentice ceremony lets her
  ask the medicine cat to mentor her. Warrior ceremony lets her pick her
  own suffix (Mossheart, Mossfire, Mossfoot…). The Leader ceremony has the
  medicine cat walk her to the Moonstone for her first communion with
  StarClan.
- **Static + safe.** Pure client-side React + Vite. No backend, no database,
  no accounts. Saves are JSON files exportable to her iPad's Files app.
  Total bundle: ~70 KB gzipped.

---

## Live deployment

The game runs on a small VPS behind [Caddy](https://caddyserver.com/), with
auto-HTTPS available when a domain is set, and a clean plain-HTTP fallback
when only an IP is available. Every push to `main` triggers a GitHub Action
that builds and rsyncs `dist/` to the VPS using a deploy key locked to a
single rsync command. See [DEPLOY.md](./DEPLOY.md) for the full setup,
including how to harden the unprivileged service user.

```
push to main  →  GitHub Action  →  npm ci  →  npm run build  →  rsync to VPS  →  iPad refresh
```

---

## Quick start (local development)

```bash
git clone https://github.com/winningday/warriors-path.git
cd warriors-path
npm install
npm run dev                # → http://localhost:5173, hot reload
npm run build              # → dist/  (static, ~226 KB)
npm run preview            # serve dist/ locally to sanity-check
```

There are no environment variables, no API keys, no secrets to set up. The
game runs entirely in your browser; saves go to `localStorage`.

---

## Repo layout

```
warriors-path/
├── src/
│   ├── App.jsx                      Top-level component + view switch
│   ├── main.jsx                     React DOM bootstrap
│   ├── data/                        Clans, ranks, prey, herbs, flavor, strategies
│   ├── engine/                      SR, problem generators, rank logic, migration
│   ├── storage/                     Storage shim (window.storage / localStorage)
│   └── components/
│       ├── views/                   IntroView, DenView, PatrolView, ceremonies, …
│       ├── art/                     Inline SVG: cat portrait, prey & herb icons, scenery
│       └── shared/                  Styles, FontLoader, StatCard, RewardTable
├── .github/workflows/deploy.yml     Auto-deploy on push to main
├── CLAUDE.md                        Design philosophy, lore canon, agent rules
├── DAUGHTER_NOTES.md                Canonical player feedback
├── ROADMAP.md                       Planned, deferred, and rejected work
├── IMAGES.md                        Image inventory + AI generation prompts
├── SOUND.md                         Opt-in audio plan
├── DEPLOY.md                        VPS setup walkthrough
└── warriors-path.jsx                One-line re-export shim (legacy artifact path)
```

---

## How the game works (briefly)

1. **In the nursery**, the player picks her kit name (her "mother" decides
   between options). She's named `Mosskit` or similar.
2. **The Apprentice Ceremony** moves her to `Mosspaw`, assigns a mentor, and
   offers a choice: warrior path or _ask the medicine cat_ (which itself is
   a two-step that may or may not be accepted).
3. **The Den** is the home base. Four patrols are available:
   - **Training Patrol** (mentor sparring) — multiplication.
   - **Hunting Patrol** (catch prey) — addition / subtraction.
   - **Border Patrol** (refresh scent markers, no prey) — perimeter / area.
   - **Herb Patrol** (with the medicine cat) — fractions.
4. **Each patrol = 5 problems.** Correct answers earn flavor + reward (a
   prey species, an herb, a refreshed scent, a clean training move). The
   spaced-repetition system tracks which facts she struggles with and brings
   them up more often.
5. **Rank ceremonies** mark milestones. The Warrior ceremony is the most
   important — the leader asks her to pick her own suffix in front of the
   Clan. The Leader ceremony takes place at the Moonstone, with the medicine
   cat as her guide.

---

## Design principles

The full list lives in [CLAUDE.md](./CLAUDE.md). The non-negotiables:

| | |
|---|---|
| 🚫 **No timers, ever** | Internal timing for SR is fine — the player must never see a clock. |
| 🚫 **No punishment** | No streak loss, no nag notifications, no "Try harder!" |
| 📚 **Lore over convenience** | If the books say it works a certain way, the game works that way. |
| 💾 **Saves are sacred** | Migrations are additive. Export/import always available. |
| 🌑 **Dark, moody, grown-up** | Charcoal hoodie, not pastel unicorn. |
| 🐈‍⬛ **The 8-year-old is the product owner** | When her feedback contradicts game-design instinct, her feedback wins. |

---

## Roadmap & contributing

[ROADMAP.md](./ROADMAP.md) tracks shipped features, the next batch of
planned work, and items we deliberately rejected (with reasons). Highlights:

- **v15b — Mastery-gated topic progression.** Topics unlock by demonstrated
  competence, not rank or time.
- **Achievements & gamification.** Badges for first catches, rare hunts, full
  field-guide entries, comeback promotions of facts she struggled with.
- **AI-generated illustrations** to replace inline SVGs. Prompts and style
  guide ready in [IMAGES.md](./IMAGES.md).
- **Cloud saves with SQLite** (deferred — fully scoped, will only build when
  the manual export ritual actually fails her).
- **Opt-in sound** — soft purr on rank-up, paw-step on patrol start. Default
  OFF given player sensitivity. Plan in [SOUND.md](./SOUND.md).

### If you'd like to help

You're welcome here, especially if you're an educator, a Warriors fan, an
illustrator, or a parent of a kid who'd play this. **Open an issue first**
to talk through what you're thinking before opening a PR — the design
constraints are tight (the actual player has strong preferences), so an
issue saves both of us time.

Areas where outside help is most welcome:

- 🎨 **Art.** Painted illustrations to replace the SVGs. See `IMAGES.md`
  for the visual style guide and ready-to-paste AI prompts. Hand-drawn art
  is the long-term goal.
- ✍️ **Flavor pools.** Every category has 30+ lines today, but more variety
  is always welcome (especially for prey-caught flavor and border-patrol
  flavor). Lines must be book-faithful — re-read a few _Warriors_ chapters
  to calibrate before submitting.
- 🧮 **Math content.** New problem-types (division, two-step word problems,
  equivalent fractions, elapsed time) are on the roadmap. CCSS Grade 3
  alignment matters here.
- 🐛 **Bug reports**, especially anything that breaks her save data. Save
  compatibility is sacred.

### What we won't accept

- Timers, countdown bars, "urgency" UX of any kind.
- Streak loss / punishment for missed days.
- Generic praise ("Great job!"). Use book-faithful phrasing only.
- Monetization, ads, account walls.
- Adding a backend, database, or accounts without prior discussion in an
  issue. (We have a plan; it's deliberately deferred.)

---

## Stargazers over time

<a href="https://www.star-history.com/#winningday/warriors-path&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=winningday/warriors-path&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=winningday/warriors-path&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=winningday/warriors-path&type=Date" />
  </picture>
</a>

---

## Privacy

There is no telemetry. There are no analytics. No data leaves the player's
device unless she chooses to download a save file. The repo never contains
real player saves — those are excluded by `.gitignore`. The example save
in `sample-save.example.json` is fictional.

---

## License

MIT — see [LICENSE](./LICENSE). The _Warriors_ book series and its
characters/worldbuilding are © Erin Hunter (Working Partners) — this is an
unofficial fan project for personal/family use, with deep respect for the
source material.

---

<p align="center">
  <em>"Every warrior was once a kit in the nursery.<br/>
  Every leader began with a name ending in <code>-paw</code>."</em>
</p>
