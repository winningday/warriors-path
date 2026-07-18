# Tutor sync service

A tiny backend that lets the game push progress snapshots so a tutor can
view them in a read-only dashboard. One file (`server.js`), plain
`node:http`, zero npm dependencies, no database. This is deliberately NOT
the full cloud-saves system from ROADMAP.md (no accounts, no passwords, no
multi-device restore).

## Endpoints

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/api/sync` | JSON `{ key, profile }` | `200 { ok: true }` |
| `GET` | `/api/tutor/<key>` | none | `200 { updatedAt, profile }` or `404` |
| `OPTIONS` | any | none | `204` (CORS preflight) |

Rules:

- Keys must match `^[a-z0-9][a-z0-9-]{7,63}$`. Anything else is a `400`,
  checked before any filesystem access (no path traversal possible).
- Request bodies are capped at 1 MB (`413` over). Real profiles are ~10 KB.
- Malformed JSON or a missing/invalid profile is a `400`.
- All responses are JSON and carry `Access-Control-Allow-Origin: *`.

## Configuration

Environment variables, both optional:

- `PORT` (default `8787`)
- `DATA_DIR` (default `/srv/warriors-path-data`)

## Local development

Run the server and the Vite dev server side by side:

```bash
DATA_DIR=/tmp/wp-sync-dev node server/server.js   # terminal 1
npm run dev                                       # terminal 2
```

`vite.config.js` proxies `/api` to `http://localhost:8787`, so the game at
`localhost:5173` talks to your local server with no extra setup. Tests live
in `server.test.js` and run against a temp data directory:

```bash
npx vitest run server/server.test.js
```

## Storage layout

One JSON file per sync key, nothing else:

```
DATA_DIR/
  moss-x7k2p9q4w1.json    # { "updatedAt": "2026-07-18T...", "profile": { ... } }
```

Writes are atomic (tmp file then rename), so a crash never leaves a
truncated document. A repeat POST for the same key overwrites the previous
snapshot; there is no history.

## Privacy

The sync key IS the access control. Keys are generated client-side with
about 40 bits of randomness, and the server has no listing or enumeration
endpoint, so a key cannot be discovered, only shared. That means:

- Keep the tutor link (`<origin>/?tutor=<key>`) private; share it with the
  tutor and no one else.
- The data directory is never served or listed by the web server, and it
  should be `chmod 700` owned by the service user (see DEPLOY.md).
- If a link ever leaks, stop sharing in the game's den (the game stops
  pushing) and delete the `<key>.json` file on the server (the old link
  goes dark).
