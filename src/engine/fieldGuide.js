// Field Guide unlock logic. Phase 4 (v15.0.0-h).
//
// Pure functions over `profile.factsSR`. NO new persisted fields — the unlock
// state is fully derived from existing SR data so saves don't need a migration
// bump for this feature alone (parallel agents may also touch migration —
// SAVE_VERSION should only bump once, coordinated).
//
// Mastery = ≥ TRUSTED_THRESHOLD facts in the topic's SR pool that have
// reached the Trusted bucket. Topic prefixes follow the factId conventions
// in src/engine/sr.js (factId() / parseFactId()):
//
//   mult:     'mult:LOxHI'
//   add:      'add:LO+HI'      and  'add:large'
//   sub:      'sub:a-b'        and  'sub:large'
//   geometry: 'geo:perimeter:scale' | 'geo:area:scale'
//   fraction: 'frac:half|third|quarter|fifth'
//   time:     'time:clock|duration|future:grain'

import { SR_BUCKET } from './sr.js';
import { FIELD_GUIDE_PAGES, pageForTopic } from '../data/fieldGuide.js';

// How many Trusted facts in a topic unlock its page. Tuned so each topic
// is a meaningful achievement but reachable within a few weeks of play.
export const TRUSTED_THRESHOLD = 5;

// Per-topic override. Small id pools get a lower bar so the page is reachable
// at all; large pools keep the default 5. Tuned per the actual id-pool sizes
// in src/engine/sr.js:
//   mult / add / sub  — many distinct ids, 5 is right.
//   geometry          — 6 ids (perimeter|area × small|medium|large), 3 is right.
//   fraction          — 4 ids (half|third|quarter|fifth), 3 is right.
//   time              — 12 ids (clock|duration|future × hour|half|quarter|five|any-ish),
//                       3 is right because not every grain will be reached
//                       at every difficulty.
const TOPIC_THRESHOLDS = {
  mult: 5,
  add: 5,
  sub: 5,
  geometry: 3,
  fraction: 3,
  time: 3,
};

// Map a topic key to the factId-prefix that belongs to it.
// String.prototype.startsWith covers both fine-grained ids (`add:3+4`) and
// coarse bucket ids (`add:large`) for the same topic.
const TOPIC_PREFIX = {
  mult: 'mult:',
  add: 'add:',
  sub: 'sub:',
  geometry: 'geo:',
  fraction: 'frac:',
  time: 'time:',
};

const thresholdFor = (topic) => TOPIC_THRESHOLDS[topic] ?? TRUSTED_THRESHOLD;

// Count Trusted facts for one topic. Defensive: profile.factsSR may be
// missing on legacy/in-flight saves; fall back to {}.
const countTrusted = (profile, topic) => {
  const sr = (profile && profile.factsSR) || {};
  const prefix = TOPIC_PREFIX[topic];
  if (!prefix) return 0;
  let n = 0;
  for (const [id, entry] of Object.entries(sr)) {
    if (!id.startsWith(prefix)) continue;
    if (entry && entry.bucket === SR_BUCKET.TRUSTED) n += 1;
  }
  return n;
};

// Public API ------------------------------------------------------------

// Returns true once the player has reached the per-topic Trusted threshold.
export const isPageUnlocked = (profile, topic) => {
  return countTrusted(profile, topic) >= thresholdFor(topic);
};

// Returns the unlock-progress tuple for the locked-state UI:
//   { trusted, threshold } — e.g. { trusted: 3, threshold: 5 }
export const unlockProgress = (profile, topic) => ({
  trusted: countTrusted(profile, topic),
  threshold: thresholdFor(topic),
});

// Returns an array of all unlocked pages, in catalog order.
export const unlockedPages = (profile) => {
  return FIELD_GUIDE_PAGES
    .filter((p) => isPageUnlocked(profile, p.topic))
    .map((p) => ({ ...p }));
};

// Convenience for the Den button label: how many of the six pages are
// unlocked right now.
export const unlockedCount = (profile) => {
  return FIELD_GUIDE_PAGES.reduce(
    (n, p) => n + (isPageUnlocked(profile, p.topic) ? 1 : 0),
    0,
  );
};

// All catalog pages plus their unlock state and progress. Used by the
// Field Guide view's sidebar so locked and unlocked entries render uniformly.
export const fieldGuideEntries = (profile) => {
  return FIELD_GUIDE_PAGES.map((p) => {
    const { trusted, threshold } = unlockProgress(profile, p.topic);
    return {
      ...p,
      unlocked: trusted >= threshold,
      trusted,
      threshold,
    };
  });
};

// Re-export for convenience.
export { FIELD_GUIDE_PAGES, pageForTopic };
