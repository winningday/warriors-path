import { ranksFor, PATH_MEDICINE, PATH_WARRIOR } from '../data/ranks.js';
import { newSlotId } from './utils.js';
import { SAVE_VERSION } from './sr.js';

// Bring a single profile up to the v14 shape. Used for v12/v13/v14→v14 migration and
// defensive normalization of imported saves.
//
// Migration philosophy:
//   - Preserve player-authored data EXACTLY: prefix, suffix, totalCorrect, totalAttempted,
//     prey counts, herb counts, streak, dateCreated, factsSR, factStories.
//   - Map old rank labels to current ladder.
//   - Use a separate `rankFloor` for progress-bar baseline so we never need to fabricate
//     correct answers (fixes the v13 bug where 32/35 displayed as "60 of 35").
export const normalizeProfile = (raw) => {
  const oldHighRank = raw.highestRank || raw.rank || 'Apprentice';
  const isWarriorOrAbove =
    ['Warrior', 'Senior Warrior', 'Deputy', 'Leader', 'Young Warrior'].includes(oldHighRank);

  const path = raw.path === PATH_MEDICINE ? PATH_MEDICINE : PATH_WARRIOR;

  let rank = 'Apprentice';
  if (path === PATH_MEDICINE) {
    rank = isWarriorOrAbove ? 'Medicine Cat' : 'Medicine Cat Apprentice';
  } else if (oldHighRank === 'Warrior')             rank = 'Young Warrior';
  else if (oldHighRank === 'Senior Warrior')        rank = 'Warrior';
  else if (oldHighRank === 'Deputy')                rank = 'Deputy';
  else if (oldHighRank === 'Leader')                rank = 'Leader';
  else if (oldHighRank === 'Young Warrior')         rank = 'Young Warrior';
  else if (oldHighRank === 'Medicine Cat')          rank = 'Medicine Cat';
  else if (oldHighRank === 'Senior Medicine Cat')   rank = 'Senior Medicine Cat';
  else if (oldHighRank === 'Apprentice' || oldHighRank === 'Kit') rank = 'Apprentice';

  let suffix = raw.suffix && raw.suffix !== 'paw' && raw.suffix !== 'kit' ? raw.suffix : '';
  if (!suffix && rank !== 'Apprentice' && rank !== 'Medicine Cat Apprentice') {
    suffix = path === PATH_MEDICINE ? 'leaf' : 'foot';
  }

  const ladder = ranksFor(path);
  const minForRank = (ladder.find((r) => r.name === rank) || ladder[0]).min;
  const totalCorrect = raw.totalCorrect || 0;
  const rankFloor = Math.max(raw.rankFloor || 0, minForRank, totalCorrect);

  return {
    _version: SAVE_VERSION,
    id: raw.id || newSlotId(),
    prefix: raw.prefix || 'Moss',
    suffix,
    path,
    rank,
    clan: raw.clan || 'ThunderClan',
    furColor: raw.furColor || 'Grey',
    eyeColor: raw.eyeColor || 'Amber',
    mentor: raw.mentor || null,
    totalCorrect,
    totalAttempted: raw.totalAttempted || totalCorrect,
    rankFloor,
    preyCaught: raw.preyCaught || {},
    herbsCaught: raw.herbsCaught || {},
    streak: raw.streak || 0,
    lastPlayed: raw.lastPlayed || null,
    patrolsToday: raw.patrolsToday || 0,
    dateCreated: raw.dateCreated || new Date().toISOString(),
    factsSR: raw.factsSR && typeof raw.factsSR === 'object' ? raw.factsSR : {},
    factStories: raw.factStories && typeof raw.factStories === 'object' ? raw.factStories : {},
  };
};

// Backwards-compat alias — older code paths still reference this name.
export const normalizeToV13 = normalizeProfile;
