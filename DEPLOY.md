# Deploying Warrior's Path to a VPS

This is a **static site** (Vite-built React). No backend, no database, no
secrets. The build output is plain HTML/JS/CSS and is served by a webserver
(Caddy is recommended for the simplest TLS setup; nginx works too).

The hosting model below is designed so:

- the game runs as an **unprivileged user** (`warriors`), never root
- the deploy directory is owned by that user, not by `root` or `www-data`
- a hijack of the running process gets you only files in `/srv/warriors-path/`
  (which contains nothing sensitive) — your VPS as a whole is not at risk
- save files (which are personal and `.gitignore`d) live **outside** the
  deploy tree and are never overwritten by deploys

---

## One-time VPS setup

> Run all of these as `root` (or with `sudo`). You'll create a non-root user,
> install Node + Caddy, and put the project where Caddy can serve it.

### 1. Create an unprivileged service user

```bash
adduser --disabled-password --gecos "" warriors
```

This user has no password, no sudo, no shell login. Even if the *web server*
were exploited, the worst it can do is write into `/srv/warriors-path/` —
which only contains the build output anyway.

### 2. Install Node 20+ and Caddy

```bash
# Node (Debian/Ubuntu)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git rsync

# Caddy (Debian/Ubuntu) — easy automatic HTTPS
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update && apt-get install -y caddy
```

### 3. Create deploy + saves directories

```bash
mkdir -p /srv/warriors-path             # build output goes here
mkdir -p /srv/warriors-path-saves       # YOUR personal save files (manual upload)
chown -R warriors:warriors /srv/warriors-path /srv/warriors-path-saves
chmod 750 /srv/warriors-path /srv/warriors-path-saves
```

The site will be served from `/srv/warriors-path/`. Save files (the
`Freckleleap-WindClan-save.json` you upload manually from your laptop) live
in `/srv/warriors-path-saves/` so they're never blown away when you redeploy.

> **Note:** save files don't actually need to live on the VPS. They're loaded
> through the *browser's* file-picker and stored in *the browser's*
> localStorage. Putting them on the VPS is only useful if you want a
> backup the iPad can browse to.

### 4. Configure Caddy to serve the static site

You have two options: serve over **plain HTTP using just the VPS IP** (good
enough to start; iPad will warn about "Not Secure" but the game still works),
or serve over **HTTPS with a domain** (recommended once you have one).

#### Option A — IP only, plain HTTP (no domain yet)

Edit `/etc/caddy/Caddyfile` so it contains exactly this:

```caddyfile
:80 {
    root * /srv/warriors-path
    file_server
    encode gzip zstd

    # SPA fallback — all 404s go to index.html
    try_files {path} /index.html

    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy no-referrer
    }
}
```

The leading `:80` (note the colon) tells Caddy to listen on port 80 for
ANY hostname — meaning `http://YOUR-VPS-IP/` will serve the site. No DNS,
no certificates, no domain needed. Then:

```bash
systemctl reload caddy
ufw allow 80/tcp 2>/dev/null || true   # if you use ufw firewall
```

Visit `http://YOUR-VPS-IP/` in a browser. The site appears immediately.
Note: the iPad will show "Not Secure" in the URL bar, but localStorage works
fine over HTTP.

#### Option B — domain with auto-HTTPS (later, when you have one)

Once you point a DNS A-record at the VPS IP, replace the Caddyfile with:

```caddyfile
warriorspath.example.com {
    root * /srv/warriors-path
    file_server
    encode gzip zstd
    try_files {path} /index.html
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy no-referrer
    }
}
```

```bash
systemctl reload caddy
```

Caddy will automatically obtain a Let's Encrypt cert and serve HTTPS. No
further config.

### 5. Deploy SSH key for GitHub Actions

```bash
sudo -u warriors -H bash -c '
  mkdir -p ~/.ssh && chmod 700 ~/.ssh
  ssh-keygen -t ed25519 -N "" -f ~/.ssh/deploy -C github-actions-warriors
'
```

Add the **public** key to `/home/warriors/.ssh/authorized_keys`:

```bash
sudo -u warriors -H bash -c 'cat ~/.ssh/deploy.pub >> ~/.ssh/authorized_keys; chmod 600 ~/.ssh/authorized_keys'
```

Restrict the key in `authorized_keys` to only run rsync into the deploy
directory (defense in depth). Edit `/home/warriors/.ssh/authorized_keys` and
prefix the key line with:

```
command="rsync --server -avz --delete . /srv/warriors-path/",no-pty,no-agent-forwarding,no-port-forwarding,no-X11-forwarding ssh-ed25519 AAAA...
```

Now print the **private** key — you'll paste it into GitHub:

```bash
sudo cat /home/warriors/.ssh/deploy
```

In your GitHub repo: **Settings → Secrets and variables → Actions → New
repository secret**:

- `VPS_SSH_KEY` — paste the private key (the whole `-----BEGIN ... END-----`)
- `VPS_HOST` — your VPS IP or hostname
- `VPS_USER` — `warriors`
- `VPS_PATH` — `/srv/warriors-path/` (trailing slash matters)

### 6. (Optional) Manually transfer your save files

From your laptop:

```bash
rsync -avz Freckleleap-WindClan-save.json sample-save.example.json \
  warriors@your-vps:/srv/warriors-path-saves/
```

These are your personal property and never touched by deploys.

---

## Continuous deploy via GitHub Action

The repo includes `.github/workflows/deploy.yml` (added in v15a). On every
push to `main`, it:

1. Checks out the repo
2. Runs `npm ci && npm run build`
3. Rsyncs `dist/` to `warriors@VPS_HOST:/srv/warriors-path/` using your
   deploy key

The action only writes to `/srv/warriors-path/` (enforced by the `command="..."`
restriction on the SSH key). It cannot touch your saves directory or any
other part of the VPS.

---

## Manual deploy (when you want to push a build right now)

From your laptop:

```bash
npm ci
npm run build
rsync -avz --delete dist/ warriors@your-vps:/srv/warriors-path/
```

---

## Why this is safe

- **No backend.** The app is pure static files + browser-side JavaScript +
  the iPad's localStorage. There is no server-side code that can be exploited.
- **The serving user (`warriors`) has no shell, no sudo, no password.**
- **Caddy runs as its own non-root user (`caddy`)** on standard installs.
- **The deploy SSH key is locked to a single rsync command.**
- **Saves are not in the deploy tree.** Even a successful supply-chain attack
  on `npm` only ships malicious *client* code that runs in the browser — your
  saves on the VPS (and on the iPad) are untouched.
- **No environment variables, no secrets, no API keys** are needed at runtime.

If anything online ever feels off, the recovery is `rm -rf /srv/warriors-path/*`
and redeploy. There is nothing in the deploy tree that can't be rebuilt from
the GitHub repo.

---

## Updating the iPad

Open Safari on the iPad → navigate to your domain → **Share → Add to Home
Screen.** From then on it launches like a native app, full-screen, no
browser chrome. The iPad caches the static assets aggressively; if you push
a build and the iPad still shows the old version, force-quit the home-screen
app and reopen.

---

## Letting Claude Code manage the VPS

If you run `claude` (the Claude Code CLI) on the VPS itself, see CLAUDE.md
for what it should and should NOT touch. In short: it can pull, build, and
restart `caddy reload`. It must never run `rm -rf` outside `/srv/warriors-path/`,
never edit anything in `/srv/warriors-path-saves/`, and never run as root.
