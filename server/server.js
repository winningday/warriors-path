// Tutor sync service. Plain node:http, zero npm dependencies.
//
// POST /api/sync        body { key, profile }  -> stores DATA_DIR/<key>.json
// GET  /api/tutor/<key>                        -> { updatedAt, profile } or 404
//
// The key is the capability: it is generated client-side, never listed by
// the server, and validated against KEY_RE before any filesystem use.
// See server/README.md and DEPLOY.md for running this in production.

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const KEY_RE = /^[a-z0-9][a-z0-9-]{7,63}$/;
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB, profiles are ~10 KB
const TUTOR_PREFIX = '/api/tutor/';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const sendJson = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...CORS_HEADERS,
  });
  res.end(JSON.stringify(body));
};

// Read the request body, rejecting with code TOO_LARGE past the cap.
// On overflow the remaining stream is drained so the client still gets
// the 413 response instead of a connection reset.
const readBody = (req, limit) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        req.removeAllListeners('data');
        req.resume();
        reject(Object.assign(new Error('body too large'), { code: 'TOO_LARGE' }));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

const handleSync = async (req, res, dataDir) => {
  let raw;
  try {
    raw = await readBody(req, MAX_BODY_BYTES);
  } catch (err) {
    if (err.code === 'TOO_LARGE') return sendJson(res, 413, { error: 'profile too large' });
    return sendJson(res, 400, { error: 'unreadable body' });
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return sendJson(res, 400, { error: 'invalid JSON' });
  }

  const { key, profile } = parsed || {};
  if (typeof key !== 'string' || !KEY_RE.test(key)) {
    return sendJson(res, 400, { error: 'invalid key' });
  }
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return sendJson(res, 400, { error: 'invalid profile' });
  }

  const doc = JSON.stringify({ updatedAt: new Date().toISOString(), profile });
  await fs.mkdir(dataDir, { recursive: true });
  // Atomic write: tmp file then rename, so a crash mid-write never leaves
  // a truncated <key>.json behind. A failed rename removes its tmp file so
  // they cannot accumulate in the data dir.
  const finalPath = path.join(dataDir, `${key}.json`);
  const tmpPath = `${finalPath}.tmp-${crypto.randomBytes(6).toString('hex')}`;
  await fs.writeFile(tmpPath, doc, 'utf8');
  try {
    await fs.rename(tmpPath, finalPath);
  } catch (err) {
    await fs.unlink(tmpPath).catch(() => {});
    throw err;
  }
  return sendJson(res, 200, { ok: true });
};

const handleTutor = async (req, res, dataDir, key) => {
  if (!KEY_RE.test(key)) return sendJson(res, 400, { error: 'invalid key' });
  let raw;
  try {
    raw = await fs.readFile(path.join(dataDir, `${key}.json`), 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return sendJson(res, 404, { error: 'unknown key' });
    throw err;
  }
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    ...CORS_HEADERS,
  });
  return res.end(raw);
};

export const createServer = ({ dataDir }) =>
  http.createServer((req, res) => {
    const route = async () => {
      const url = req.url || '/';
      if (req.method === 'OPTIONS') {
        res.writeHead(204, CORS_HEADERS);
        return res.end();
      }
      if (req.method === 'POST' && url === '/api/sync') {
        return handleSync(req, res, dataDir);
      }
      if (req.method === 'GET' && url.startsWith(TUTOR_PREFIX)) {
        return handleTutor(req, res, dataDir, url.slice(TUTOR_PREFIX.length));
      }
      return sendJson(res, 404, { error: 'not found' });
    };
    route().catch(() => {
      if (!res.headersSent) sendJson(res, 500, { error: 'server error' });
      else res.end();
    });
  });

// Start listening only when run directly (node server/server.js), so tests
// can import createServer without binding a port.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const port = Number(process.env.PORT) || 8787;
  const dataDir = process.env.DATA_DIR || '/srv/warriors-path-data';
  createServer({ dataDir }).listen(port, () => {
    console.log(`warriors-path sync server on port ${port}, data in ${dataDir}`);
  });
}
