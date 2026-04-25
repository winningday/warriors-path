// Storage shim: prefers `window.storage` (Anthropic artifact runtime) so the same source
// file runs unchanged inside claude.ai; falls back to localStorage for our local Vite/VPS build.

import { normalizeProfile } from '../engine/migration.js';
import { SAVE_VERSION } from '../engine/sr.js';

export const storage = (() => {
  if (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function') {
    return window.storage;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      get: async (key) => {
        const v = window.localStorage.getItem(key);
        return v ? { value: v } : null;
      },
      set: async (key, value) => { window.localStorage.setItem(key, value); },
      delete: async (key) => { window.localStorage.removeItem(key); },
    };
  }
  return { get: async () => null, set: async () => {}, delete: async () => {} };
})();

export const SAVES_KEY = 'warriors-path-saves';
export const LEGACY_KEY = 'apprentice-profile';

// Load all saves: prefer new multi-slot key; fall back to migrating legacy single-profile.
export const loadSavesContainer = async () => {
  try {
    const newer = await storage.get(SAVES_KEY);
    if (newer && newer.value) {
      const parsed = JSON.parse(newer.value);
      if (parsed && parsed.slots && parsed.slots.length > 0) {
        parsed.slots = parsed.slots.map(normalizeProfile);
        return parsed;
      }
    }
  } catch (e) { /* fall through to legacy */ }

  try {
    const legacy = await storage.get(LEGACY_KEY);
    if (legacy && legacy.value) {
      const oldProfile = JSON.parse(legacy.value);
      const migrated = normalizeProfile(oldProfile);
      const container = { _format: 'warriors-path-saves', _version: SAVE_VERSION, activeId: migrated.id, slots: [migrated] };
      await storage.set(SAVES_KEY, JSON.stringify(container));
      return container;
    }
  } catch (e) { /* none */ }

  return null;
};

export const persistContainer = async (container) => {
  try { await storage.set(SAVES_KEY, JSON.stringify(container)); }
  catch (e) { console.error('Storage error:', e); }
};
