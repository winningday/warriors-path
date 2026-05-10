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
  <a href="https://github.com/winningday/warriors-path/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-c8c0a8?style=for-the-badge" alt="License: PolyForm Noncommercial"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/built%20with-React-61dafb?style=flat-square&logo=react&logoColor=0a0f0a" alt="React">
  <img src="https://img.shields.io/badge/bundled%20by-Vite-646cff?style=flat-square&logo=vite&logoColor=ffffff" alt="Vite">
  <img src="https://img.shields.io/badge/single--page-static-2a3329?style=flat-square" alt="Static">
  <img src="https://img.shields.io/badge/no%20backend-required-8fc28a?style=flat-square" alt="No backend">
  <img src="https://img.shields.io/badge/timers-NEVER-3a2929?style=flat-square&color=8b3a3a" alt="No timers">
</p>

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
- **Per-kind adaptive SR thresholds.** v15.0.0-d retired the global 4-second
  promotion gate in favor of per-problem-kind thresholds; once ≥20 correct
  samples accumulate for a kind, the player's own P25 becomes her personal-fast
  cutoff. Each kid calibrates herself.
- **Hidden parent dashboard.** A discreet ornament at the bottom of the Den
  opens the "Keeper's Record" — overview, by-topic accuracy, speed histogram
  (per-kind breakdown), per-fact table, hot list, strengths, pacing flags,
  7-day trend, and a developer calibration panel. The daughter doesn't notice
  it; the dad knows where to tap.
- **Trinkets and decoration.** ~35% chance of a small book-faithful keepsake
  after a patrol (feathers, stones, claw-marks, moonstone shards, etc.).
  Trinkets live in "Your Nest" and can be equipped to five slots on the cat
  (ear / mouth / back / leg / nose). Hand-drawn art (Procreate exports) drops
  into `public/trinkets/` and replaces the SVG fallback automatically.
- **Patrol pacing caps + Mentor's daily focus.** Hunting Patrol locks at
  1/day and 3/week so the player can't grind the easiest topic. A daily
  mentor focus picks her weakest topic and awards 1.5× rank progress for
  doing it. Random rotation 30% of the time so the focus isn't always the
  same when she's weak in one area.
- **Static + safe.** Pure client-side React + Vite. No backend, no database,
  no accounts. Saves are JSON files exportable to her iPad's Files app.
  Total bundle: ~96 KB gzipped.

---

## Run it yourself

Warrior's Path is a 100% client-side static site. **No backend, no database,
no accounts, no environment variables, no API keys.** That makes it cheap
and easy to host anywhere — pick whichever path fits you.

### Prerequisites

You need:

- **Node.js 20+** ([nodejs.org](https://nodejs.org/) — installer or
  `brew install node` on macOS, or your distro's package manager).
- **git** to clone the repo.
- That's it. No Python, no Docker, no databases, no Redis, no nothing.

To verify:
```bash
node --version    # should print v20.x or higher
npm --version
git --version
```

---

### Option 1 — Just run it locally (5 minutes, zero hosting)

Easiest if you only want to play it on your own computer.

```bash
git clone https://github.com/winningday/warriors-path.git
cd warriors-path
npm install
npm run dev
```

The terminal will print `http://localhost:5173/`. Open that in any browser.
Saves persist in your browser's localStorage. Hot-reload works for editing.

When you want to stop: `Ctrl-C` in the terminal.

---

### Option 2 — Fork & deploy free on Vercel / Netlify / Cloudflare Pages (10 minutes, free, with HTTPS)

The simplest way to put a copy online with a real `https://` URL — and
the path I'd recommend if you want your kid to play on an iPad. All three
services are free for personal use, give you HTTPS automatically, and
deploy on every git push.

1. Click **Fork** on this repo (top-right of the GitHub page) to make your
   own copy.
2. Sign up at one of:
   - [vercel.com](https://vercel.com/) — recommended; easiest UI.
   - [netlify.com](https://www.netlify.com/) — also great.
   - [pages.cloudflare.com](https://pages.cloudflare.com/) — fastest CDN.
3. Click "New Project" / "Add new site" / "Create Project" → connect your
   GitHub account → select your fork.
4. Build settings (auto-detected for Vercel & Netlify; for Cloudflare Pages
   set them manually):
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Node version:** 20
5. Hit deploy. ~90 seconds later you have a URL like
   `https://warriors-path-yourname.vercel.app/` with a real TLS cert and
   a global CDN. Every push to `main` auto-redeploys.

> 🔒 **HTTPS is free here** — no Let's Encrypt setup, no domain, no
> certificate management. The platform handles all of it.

To use a custom domain: add it in the platform's dashboard, point a CNAME
or A record at the hostname they give you, and they'll provision a cert
within a few minutes. No Caddy / nginx config needed.

---

### Option 3 — GitHub Pages (free, slightly more setup)

If you want hosting on GitHub itself with a `https://yourname.github.io/...`
URL.

1. Fork the repo.
2. Enable **GitHub Pages**: repo Settings → Pages → Source: "GitHub Actions".
3. Add a workflow file at `.github/workflows/pages.yml`:

   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   permissions:
     contents: read
     pages: write
     id-token: write
   jobs:
     deploy:
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: ./dist
         - id: deployment
           uses: actions/deploy-pages@v4
   ```
4. If your fork is hosted at `https://yourname.github.io/warriors-path/`
   (not the apex of a custom domain), you also need to add a `base` to
   `vite.config.js`:

   ```js
   export default defineConfig({
     base: '/warriors-path/',
     // …rest unchanged
   });
   ```

5. Push. Wait ~2 minutes. Visit your `github.io` URL.

---

### Option 4 — Self-host on a VPS with Caddy (full control + auto-HTTPS)

This is what we run. Auto-HTTPS via Caddy + Let's Encrypt if you have a
domain; plain HTTP if you only have an IP. Includes a hardened deploy
pipeline (unprivileged service user, deploy SSH key locked to a single
rsync command, daily backups separate from the deploy tree).

📖 **Full walkthrough: [DEPLOY.md](./DEPLOY.md)** — covers VPS user setup,
Caddy install with the no-domain `:80 { … }` config, GitHub Action secret
configuration, and a security model that keeps the running webserver
isolated from the rest of your system.

```
push to main  →  GitHub Action  →  npm ci → build  →  rsync dist/ to VPS  →  iPad refresh
```

> ⚠️ **About the maintainer's deployment** — the "live" version above runs
> on plain HTTP because it currently uses an IP address (no domain pointed
> at it yet). If you visit it, your browser will say "Not Secure." That's
> fine for a single-family local-use deployment, but if you want to share
> a copy with your own kid (or others) over the open internet, **use
> Option 2 (Vercel / Netlify / Cloudflare Pages) — you'll get HTTPS for
> free, no work required.** The DEPLOY.md walkthrough also includes an
> Option B for when you have a domain ready, which automatically adds
> HTTPS.

---

## Forking — what to change for your own copy

If you fork this for your own family's use:

1. **Update the `homepage` and `repository` fields in `package.json`** to
   point at your fork.
2. **Replace `winningday` in the README badges** with your own GitHub
   username so the shields show your repo's stats.
3. **Optionally rename the project** (e.g., your kid's flavor — "Dragon's
   Hoard" for a kid who likes dragons). Keep the PolyForm Noncommercial
   license — that's the rule that lets us all share without anyone walking
   off with the work. If you re-theme away from Warriors, you can drop the
   third-party-IP NOTICE block; if you keep the Warriors theme, keep the
   NOTICE — see the [License section](#license) below.
4. **Customize `DAUGHTER_NOTES.md`** to track your own kid's feedback;
   delete the existing entries and start fresh.
5. **Adjust math content** in `src/data/` — flavor pools, prey list, herbs,
   strategies, locations. The lore canon in `CLAUDE.md` is your project's
   constitution; rewrite it for your kid's preferences.
6. **Pick a deployment path** from above and you're done.

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
planned work, and items we deliberately rejected (with reasons).
[CHANGELOG.md](./CHANGELOG.md) has the version-by-version record.

### Currently in review (draft PRs)

- **[#10 — v15.0.0-h Phase 3: Achievements / Honors](https://github.com/winningday/warriors-path/pull/10)**
  — 20 book-faithful named recognitions across five categories (Firsts /
  Streaks / Milestones / Mastery / Collection), with one-shot ceremony
  blocks on patrol completion and a browsable Honors view in the Den.
- **[#11 — v15.0.0-h Phase 4: Field Guide](https://github.com/winningday/warriors-path/pull/11)**
  — A hidden book of six lore pages, one per math topic, that unlock as
  the player accumulates Trusted-bucket SR facts. Each page is 4–6
  paragraphs in book-faithful Crimson Text serif. Reverent toward
  StarClan; lore-checked by the daughter at review time.
- **[#12 — v15.0.0-h Phase 5: Narrative beats](https://github.com/winningday/warriors-path/pull/12)**
  — Three categories of rare events: ~1-in-30 random patrol vignettes
  (a hawk circles overhead, a Twoleg crosses the moor); monthly Gathering
  night (first Saturday) with a no-math story screen at Fourtrees and a
  unique trinket; and StarClan dreams (7-day cooldown + soft daily roll)
  that hint at the player's weakest topic.

All three are functionally independent. Merge order is the dad's call;
they'll need a tiny `package.json` version-bump conflict resolution
(all three bumped to `15.0.0-h`).

### Queued — next planned work

- **v15b — Mastery-gated topic progression.** Topics unlock by demonstrated
  competence, not rank or time. ROADMAP.md has the full plan.
- **Admin grid editor for trinkets.** A 4×4 grid per slot
  (ear / mouth / back / leg / nose / general) so the daughter's Procreate
  exports can be drag-dropped in instead of edited by hand in `trinkets.js`.
  Lower priority — current per-file workflow is ~2 minutes per trinket.
- **Patrol-length & word-problem-mix tuning.** Waiting on observed play
  data — once the daughter sessions on the new gamification we tune
  problem counts per patrol type and the drill / word ratio.
- **Adaptive content.** Variable patrol length and difficulty bands within
  a topic, gated on per-fact mastery. Comes after v15b.
- **AI-generated illustrations** to replace inline SVGs. Prompts and style
  guide ready in [IMAGES.md](./IMAGES.md). Daughter is drawing the first
  13 trinkets by hand in Procreate; once exported they drop into
  `public/trinkets/<id>.png` and the SVG fallback yields automatically.
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

This project is released under the **[PolyForm Noncommercial License
1.0.0](./LICENSE)** — a source-available license written by software
lawyers ([polyformproject.org](https://polyformproject.org/licenses/noncommercial/1.0.0/))
that's permissive for personal, educational, and noncommercial use, but
explicitly disallows commercial use.

### What you CAN do under this license

- ✅ **Fork, clone, and read the code.** It's all public.
- ✅ **Run your own copy** for your family, your kid, your classroom, your
  homeschool co-op, your nonprofit, your library, etc.
- ✅ **Modify the code, change the lore, swap themes, add features.** Your
  fork is yours to evolve for your own noncommercial use.
- ✅ **Share modifications with the community** as another noncommercial
  fork, as long as the noncommercial terms travel with it.
- ✅ **Use it for research, teaching, hobby projects, or personal study.**

### What you CANNOT do under this license

- ❌ **Sell it.** No paid app, no subscription service, no in-app purchases,
  no commercial SaaS hosting.
- ❌ **Bundle it into a commercial product.** A for-profit edtech company
  can't use this code as part of their offering.
- ❌ **Re-license it under a more permissive license** (you can't strip the
  noncommercial requirement).

If you want to use the code commercially, contact the copyright holder
through a GitHub issue at
[github.com/winningday/warriors-path/issues](https://github.com/winningday/warriors-path/issues)
to discuss a separate commercial license.

### About the Warrior Cats world

**The _Warriors_ book series — its Clan names, characters, terminology, and
worldbuilding — are © Erin Hunter (Working Partners) and HarperCollins.**
They are referenced here for thematic and educational purposes as an
unofficial fan work. The PolyForm license on this repository **does not and
cannot grant rights to that third-party intellectual property** — see the
NOTICE block at the bottom of the [LICENSE](./LICENSE) file for details.

If you fork this for your own family's use, the same fan-work posture
applies. If you fork and re-theme it (e.g. dragons, space pirates, fairies),
you can drop the Warriors references entirely and the lore-respect notice
no longer applies to your fork — but the PolyForm noncommercial license
still does.

Erin Hunter, HarperCollins, and Working Partners have not endorsed or
sponsored this project.

> 🐾 **A note from the maintainer:** This game is being co-built by an
> 8-year-old and her dad over what may turn into a multi-year project.
> If we ever do work out a relationship with the rights holders to make
> this an official offering, we want our family to have built that without
> someone else having already commercialized our code. PolyForm
> Noncommercial keeps that door open. Thank you for understanding.

---

<p align="center">
  <em>"Every warrior was once a kit in the nursery.<br/>
  Every leader began with a name ending in <code>-paw</code>."</em>
</p>
