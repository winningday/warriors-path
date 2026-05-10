// Achievement engine. Phase 3 (v15.0.0-h).
//
// Pure functions, no mutation. Called from App.jsx after finishPatrol completes.
// All inputs are defensive: a missing `profile.achievementsEarned` is treated
// as an empty list, and any unknown ids in that list are tolerated (in case a
// catalog entry is removed in a future release).

import { ACHIEVEMENTS, CATEGORY_ORDER, achievementById } from '../data/achievements.js';

// Return the catalog entries that ARE earned now but NOT in profile.achievementsEarned.
// Each returned entry is the FULL achievement record (includes name, lore, etc.) so
// the CompleteView can render the ceremony without re-looking-up.
export const checkAchievements = (profile) => {
  if (!profile) return [];
  const earned = new Set(Array.isArray(profile.achievementsEarned) ? profile.achievementsEarned : []);
  const newly = [];
  for (const a of ACHIEVEMENTS) {
    if (earned.has(a.id)) continue;
    let isEarned = false;
    try {
      isEarned = !!a.predicate(profile);
    } catch {
      // Predicate threw — treat as not earned. Defensive against future
      // schema drift (e.g. fields renamed by a parallel agent).
      isEarned = false;
    }
    if (isEarned) newly.push(a);
  }
  return newly;
};

// Return a NEW profile with the given ids merged into achievementsEarned.
// Idempotent — passing an id that's already in the list is a no-op.
export const markEarned = (profile, ids) => {
  if (!profile) return profile;
  const list = Array.isArray(profile.achievementsEarned) ? profile.achievementsEarned : [];
  const set = new Set(list);
  for (const id of ids || []) {
    if (typeof id === 'string') set.add(id);
  }
  return { ...profile, achievementsEarned: Array.from(set) };
};

// Return the sorted array of full achievement records the player has earned.
// Sorted by CATEGORY_ORDER, then by catalog order within each category.
// Unknown ids (no longer in the catalog) are filtered out.
export const allEarned = (profile) => {
  const list = Array.isArray(profile?.achievementsEarned) ? profile.achievementsEarned : [];
  const out = [];
  for (const id of list) {
    const rec = achievementById(id);
    if (rec) out.push(rec);
  }
  return out.sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category);
    const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return ACHIEVEMENTS.indexOf(a) - ACHIEVEMENTS.indexOf(b);
  });
};

// Convenience for the HonorsView header.
export const earnedCount = (profile) => {
  const list = Array.isArray(profile?.achievementsEarned) ? profile.achievementsEarned : [];
  return list.filter((id) => !!achievementById(id)).length;
};

export const totalCount = () => ACHIEVEMENTS.length;
