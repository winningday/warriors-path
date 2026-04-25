import { ranksFor, CHANCE_PROMOTION_PER_PATROL, PATH_MEDICINE } from '../data/ranks.js';

// Determine the highest rank the player has earned automatically (auto: true only).
// Chance-based ranks (Deputy, Leader) are NOT included here — those are decided by rollEligibleChanceRank.
export const autoRankForCorrect = (path, totalCorrect) => {
  const ladder = ranksFor(path);
  let current = ladder[0];
  for (const r of ladder) {
    if (r.auto && totalCorrect >= r.min) current = r;
  }
  return current.name;
};

// If the player is currently at the highest auto-rank, check whether a chance-based promotion is now eligible.
// Returns the new rank name to promote to, or null. Each call rolls the dice once.
export const rollEligibleChanceRank = (profile) => {
  const ladder = ranksFor(profile.path);
  const idx = ladder.findIndex((r) => r.name === profile.rank);
  if (idx < 0 || idx >= ladder.length - 1) return null;
  const next = ladder[idx + 1];
  if (next.auto) return null;
  if (profile.totalCorrect < next.min) return null;
  if (Math.random() < CHANCE_PROMOTION_PER_PATROL) return next.name;
  return null;
};

export const getRankInfo = (profile) => {
  const ladder = ranksFor(profile.path);
  const idx = ladder.findIndex((r) => r.name === profile.rank);
  return {
    ladder,
    current: ladder[idx >= 0 ? idx : 0],
    next: ladder[(idx >= 0 ? idx : 0) + 1] || null,
  };
};

export const isMedicinePath = (profile) => profile && profile.path === PATH_MEDICINE;

export const getFullName = (profile) => {
  if (!profile) return '';
  const r = profile.rank;
  if (r === 'Apprentice' || r === 'Medicine Cat Apprentice') return profile.prefix + 'paw';
  if (r === 'Leader') return profile.prefix + 'star';
  return profile.prefix + (profile.suffix || 'foot');
};

export const getMentorTitle = (profile) => {
  if (!profile || !profile.mentor) return '';
  return isMedicinePath(profile) ? `medicine cat ${profile.mentor}` : profile.mentor;
};
