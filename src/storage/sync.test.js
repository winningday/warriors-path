import { describe, it, expect } from 'vitest';
import { newSyncKey, syncProfile, tutorLink } from './sync.js';

// Must stay in lockstep with KEY_RE in server/server.js.
const SERVER_KEY_RE = /^[a-z0-9][a-z0-9-]{7,63}$/;

describe('newSyncKey', () => {
  it('builds prefix-dash-10-base36-chars from the profile prefix', () => {
    const key = newSyncKey({ prefix: 'Moss' });
    expect(key).toMatch(/^moss-[a-z0-9]{10}$/);
    expect(key).toMatch(SERVER_KEY_RE);
  });

  it('two calls differ', () => {
    expect(newSyncKey({ prefix: 'Moss' })).not.toBe(newSyncKey({ prefix: 'Moss' }));
  });

  it('a weird prefix still yields a valid key', () => {
    expect(newSyncKey({ prefix: 'Ötzi!' })).toMatch(SERVER_KEY_RE);
  });

  it('falls back to cat when the prefix strips to nothing', () => {
    expect(newSyncKey({ prefix: '!!!' })).toMatch(/^cat-[a-z0-9]{10}$/);
    expect(newSyncKey({})).toMatch(/^cat-[a-z0-9]{10}$/);
  });

  it('is deterministic under an injected rng', () => {
    const rng = () => 0.5;
    expect(newSyncKey({ prefix: 'Moss' }, rng)).toBe(newSyncKey({ prefix: 'Moss' }, rng));
  });
});

describe('syncProfile', () => {
  it('posts JSON { key, profile } to /api/sync and resolves true on ok', async () => {
    const calls = [];
    const fakeFetch = async (url, opts) => {
      calls.push({ url, opts });
      return { ok: true, status: 200 };
    };
    const ok = await syncProfile('moss-abcdefgh', { prefix: 'Moss' }, fakeFetch);
    expect(ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('/api/sync');
    expect(calls[0].opts.method).toBe('POST');
    const body = JSON.parse(calls[0].opts.body);
    expect(body.key).toBe('moss-abcdefgh');
    expect(body.profile).toEqual({ prefix: 'Moss' });
  });

  it('resolves false on a non-ok response', async () => {
    const fakeFetch = async () => ({ ok: false, status: 400 });
    expect(await syncProfile('moss-abcdefgh', {}, fakeFetch)).toBe(false);
  });

  it('resolves false (never throws) when fetch rejects', async () => {
    const fakeFetch = async () => { throw new Error('offline'); };
    expect(await syncProfile('moss-abcdefgh', {}, fakeFetch)).toBe(false);
  });

  it('resolves false without fetching when the key is falsy', async () => {
    let called = false;
    const fakeFetch = async () => { called = true; return { ok: true }; };
    expect(await syncProfile('', { prefix: 'Moss' }, fakeFetch)).toBe(false);
    expect(await syncProfile(null, { prefix: 'Moss' }, fakeFetch)).toBe(false);
    expect(called).toBe(false);
  });
});

describe('tutorLink', () => {
  it('builds origin/?tutor=key', () => {
    expect(tutorLink('abc-12345678', 'https://example.com'))
      .toBe('https://example.com/?tutor=abc-12345678');
  });
});
