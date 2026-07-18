// Tutor sync client. Pure functions, no React, no app imports.
//
// The sync key doubles as the capability: whoever holds it can read the
// shared progress via the tutor link. Keys are generated here with ~40 bits
// of randomness and must always satisfy the server's key regex
// (^[a-z0-9][a-z0-9-]{7,63}$ in server/server.js).

const KEY_SUFFIX_LEN = 10;
const MAX_PREFIX_LEN = 12;

// e.g. newSyncKey({ prefix: 'Moss' }) -> 'moss-x7k2p9q4w1'
export const newSyncKey = (profile, rng = Math.random) => {
  const cleaned = String(profile?.prefix || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, MAX_PREFIX_LEN);
  const prefix = cleaned || 'cat';
  let suffix = '';
  for (let i = 0; i < KEY_SUFFIX_LEN; i++) {
    suffix += Math.floor(rng() * 36).toString(36);
  }
  return `${prefix}-${suffix}`;
};

// Fire-and-forget push. Resolves true on an ok response, false on ANY
// failure (offline, artifact runtime, dev without the server, bad key).
// Never throws: sync must never break gameplay.
export const syncProfile = async (key, profile, fetchFn = fetch) => {
  if (!key) return false;
  try {
    const res = await fetchFn('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, profile }),
    });
    return !!(res && res.ok);
  } catch {
    return false;
  }
};

export const tutorLink = (key, origin) => `${origin}/?tutor=${key}`;
