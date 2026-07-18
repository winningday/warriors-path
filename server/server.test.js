import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createServer } from './server.js';

// Real HTTP tests against the sync server on an ephemeral port, with a
// throwaway data directory. Nothing here touches /srv or real save data.

let server;
let dataDir;
let base;

// node:http request helper. Used where fetch() would normalize the URL
// (path traversal test) or choke on an early 413 response (body cap test).
const rawRequest = ({ method = 'GET', path: reqPath = '/', headers = {}, body = null }) =>
  new Promise((resolve, reject) => {
    const port = server.address().port;
    const req = http.request({ host: '127.0.0.1', port, method, path: reqPath, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });

const postSync = (payload) =>
  fetch(`${base}/api/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  });

beforeAll(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wp-sync-'));
  server = createServer({ dataDir });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('sync round trip', () => {
  it('stores a profile and serves it back with an ISO updatedAt', async () => {
    const post = await postSync({ key: 'moss-abcdefgh', profile: { prefix: 'Moss' } });
    expect(post.status).toBe(200);
    expect(await post.json()).toEqual({ ok: true });

    const get = await fetch(`${base}/api/tutor/moss-abcdefgh`);
    expect(get.status).toBe(200);
    const doc = await get.json();
    expect(doc.profile.prefix).toBe('Moss');
    expect(typeof doc.updatedAt).toBe('string');
    expect(new Date(doc.updatedAt).toISOString()).toBe(doc.updatedAt);
  });

  it('overwrites: a second POST replaces the first document', async () => {
    await postSync({ key: 'moss-abcdefgh', profile: { prefix: 'Moss', totalCorrect: 10 } });
    await postSync({ key: 'moss-abcdefgh', profile: { prefix: 'Moss', totalCorrect: 25 } });
    const get = await fetch(`${base}/api/tutor/moss-abcdefgh`);
    const doc = await get.json();
    expect(doc.profile.totalCorrect).toBe(25);
  });
});

describe('key validation', () => {
  it('rejects an uppercase/punctuated key with 400', async () => {
    const res = await postSync({ key: 'UPPER!!', profile: {} });
    expect(res.status).toBe(400);
  });

  it('rejects a too-short key with 400', async () => {
    const res = await postSync({ key: 'ab', profile: {} });
    expect(res.status).toBe(400);
  });

  it('rejects a path-traversal-shaped key with 400', async () => {
    const res = await rawRequest({ path: '/api/tutor/../etc/passwd' });
    expect(res.status).toBe(400);
  });

  it('404s on an unknown but well-formed key', async () => {
    const res = await fetch(`${base}/api/tutor/never-written-key`);
    expect(res.status).toBe(404);
  });
});

describe('body handling', () => {
  it('rejects a non-JSON body with 400', async () => {
    const res = await postSync('this is not json {{');
    expect(res.status).toBe(400);
  });

  it('rejects a body over 1 MB with 413', async () => {
    const blob = 'x'.repeat(1024 * 1024);
    const body = JSON.stringify({ key: 'moss-abcdefgh', profile: { blob } });
    const res = await rawRequest({
      method: 'POST',
      path: '/api/sync',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    expect(res.status).toBe(413);
  });
});

describe('CORS', () => {
  it('every response carries Access-Control-Allow-Origin: *', async () => {
    const ok = await postSync({ key: 'moss-abcdefgh', profile: {} });
    expect(ok.headers.get('access-control-allow-origin')).toBe('*');

    const notFound = await fetch(`${base}/api/tutor/never-written-key`);
    expect(notFound.headers.get('access-control-allow-origin')).toBe('*');

    const bad = await postSync({ key: 'ab', profile: {} });
    expect(bad.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('OPTIONS preflight returns 204 with allow headers', async () => {
    const res = await fetch(`${base}/api/sync`, { method: 'OPTIONS' });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('access-control-allow-methods')).toMatch(/POST/);
    expect(res.headers.get('access-control-allow-headers')).toMatch(/content-type/i);
  });
});
