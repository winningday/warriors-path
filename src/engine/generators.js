import { randInt, pick } from './utils.js';
import { factId, selectByBuckets } from './sr.js';
import { isMedicinePath } from './rank.js';
import { MEDCAT_TRAINING_FLAVOR } from '../data/flavor.js';
import { LOCATIONS_BY_CLAN, MEDICINE_CATS_BY_CLAN } from '../data/clans.js';
import { HERBS, FRACTION_RECIPIENTS } from '../data/prey.js';

// Build a (a,b) pair for a multiplication drill, biased by SR buckets so hard facts come up more often.
const pickMultPair = (sr) => {
  const all = [];
  for (let a = 2; a <= 12; a++) for (let b = a; b <= 12; b++) all.push(factId('mult', a, b));
  const id = selectByBuckets(all, sr || {});
  const m = id.match(/^mult:(\d+)x(\d+)$/);
  const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
  return Math.random() < 0.5 ? [a, b] : [b, a];
};

const genMult = (profile) => {
  const sr = profile.factsSR || {};
  const [a, b] = pickMultPair(sr);
  const id = factId('mult', a, b);
  if (Math.random() < 0.7) {
    return {
      factId: id, factA: a, factB: b, kind: 'mult-drill',
      question: `${a} × ${b}`,
      answer: a * b,
      story: isMedicinePath(profile)
        ? pick(MEDCAT_TRAINING_FLAVOR)
        : `Your mentor ${profile.mentor || ''} drills you on counting strokes.`.replace(/\s+/g, ' ').trim(),
      hint: `Think of ${a} groups of ${b}.`,
    };
  }
  const stories = [
    `Your patrol moves through ${a} thickets, scaring up ${b} sparrows from each. How many sparrows in all?`,
    `You drill ${a} sets of ${b} pounces. How many pounces?`,
    `${a} apprentices each catch ${b} mice over a moon. How many mice?`,
    `You leap ${a} times across ${b} stones each leap. How many stones?`,
  ];
  return {
    factId: id, factA: a, factB: b, kind: 'mult-word',
    question: `${a} × ${b}`,
    answer: a * b,
    story: pick(stories),
    hint: `Picture ${a} groups of ${b}.`,
  };
};

const pickAddPair = (sr) => {
  const all = [];
  for (let a = 2; a <= 9; a++) for (let b = a; b <= 9; b++) all.push(factId('add', a, b));
  const id = selectByBuckets(all, sr || {});
  const m = id.match(/^add:(\d+)\+(\d+)$/);
  const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
  return Math.random() < 0.5 ? [a, b] : [b, a];
};

const genAdd = (profile) => {
  const sr = profile && profile.factsSR ? profile.factsSR : {};
  const mode = Math.random();
  if (mode < 0.35) {
    const [a, b] = pickAddPair(sr);
    const id = factId('add', a, b);
    const stories = [
      `On your way home you carry ${a} mice. Your patrol-mate carries ${b} voles. How many prey altogether?`,
      `You catch ${a} sparrows at the edge of the clearing. You catch ${b} more by the stream. How many sparrows in all?`,
      `Two apprentices each share their catch — ${a} from one, ${b} from the other. How many altogether?`,
      `You catch ${a} prey in the morning. You catch ${b} more in the afternoon. How many for the day?`,
    ];
    return { factId: id, factA: a, factB: b, kind: 'add-small', question: `${a} + ${b}`, answer: a + b, story: pick(stories), hint: `Add the numbers.` };
  }
  if (mode < 0.7) {
    const start = randInt(6, 14);
    const give = randInt(1, start - 1);
    const id = factId('add', give, start - give);
    const stories = [
      `You set out with ${start} mice for the elders. You give ${give} to the elder den. How many do you carry to the queens?`,
      `You hunted ${start} prey today. You and your patrol have already eaten ${give}. How many do you bring home?`,
      `You carry ${start} sparrows to the camp. ${give} are claimed by the warriors. How many remain for the apprentices?`,
      `You begin the day with ${start} fresh-caught voles. ${give} go straight to the medicine cat for sick cats. How many for the rest of the Clan?`,
    ];
    return { factId: id, factA: give, factB: start - give, kind: 'sub-small', question: `${start} − ${give}`, answer: start - give, story: pick(stories), hint: `Take ${give} away from ${start}.` };
  }
  if (Math.random() < 0.5) {
    const a = randInt(20, 80);
    const b = randInt(20, 80);
    const stories = [
      `Over a whole moon, your Clan caught ${a} mice and ${b} voles. How many prey in all?`,
      `In greenleaf, your Clan added ${a} prey to the pile. In the next half-moon, ${b} more. How many in total?`,
      `Across many sunrises, the apprentices brought back ${a} small birds. The warriors brought back ${b}. How many altogether?`,
    ];
    return { factId: null, kind: 'add-large', question: `${a} + ${b}`, answer: a + b, story: pick(stories), hint: `Tens first, then ones.` };
  }
  const big = randInt(40, 120);
  const small = randInt(10, big - 5);
  const stories = [
    `Across a moon, your Clan caught ${big} prey. ${small} were eaten by the Clan during that time. How many remained at moon's end?`,
    `Your Clan begins leaf-fall with ${big} stored herbs. Over many days, ${small} are used. How many remain?`,
    `By the end of greenleaf, the Clan had added ${big} prey to the pile. ${small} fed the elders and queens. How many were left for the warriors?`,
  ];
  return { factId: null, kind: 'sub-large', question: `${big} − ${small}`, answer: big - small, story: pick(stories), hint: `Subtract carefully — borrow if needed.` };
};

const genGeometry = (profile) => {
  const clanLocs = LOCATIONS_BY_CLAN[profile.clan] || LOCATIONS_BY_CLAN.ThunderClan;
  const loc = pick(clanLocs);
  const unit = loc.scale === 'small' ? 'tail-lengths' : loc.scale === 'medium' ? 'fox-lengths' : 'tree-lengths';
  const sizeRange = loc.scale === 'small' ? [3, 10] : loc.scale === 'medium' ? [4, 12] : [5, 14];
  const w = randInt(sizeRange[0], sizeRange[1]);
  const h = randInt(sizeRange[0], sizeRange[1]);
  if (Math.random() < 0.5) {
    const stories = [
      `You walk the boundary of ${loc.name}.`,
      `Your patrol traces every edge of ${loc.name}.`,
      `Your mentor asks you to pace the edge of ${loc.name}.`,
    ];
    return {
      question: `${loc.name} is ${w} ${unit} wide and ${h} ${unit} long. What is the PERIMETER?`,
      answer: 2 * (w + h),
      story: pick(stories),
      hint: `Perimeter = ${w} + ${h} + ${w} + ${h}.`,
    };
  }
  const stories = [
    `You sit at the edge of ${loc.name} and consider how much ground it covers.`,
    `Your mentor asks how many squares of ground ${loc.name} would hold.`,
    `You imagine a grid laid over ${loc.name}.`,
  ];
  return {
    question: `${loc.name} is ${w} ${unit} wide and ${h} ${unit} long. What is the AREA?`,
    answer: w * h,
    story: pick(stories),
    hint: `Area = width × length: ${w} × ${h}.`,
  };
};

// Time problems. Three kinds:
//   time-clock     — read an analog clock face (twoleg sun-face)
//   time-duration  — how much time elapsed between two given times
//   time-future    — given a start time and a duration, what time will it be?
//
// Answers are total minutes (0–1439) for direct integer compare in the patrol view.
// The view renders the answer back as H:MM.

const TIME_GRAINS = {
  hour:    [0],                                                  // :00
  half:    [0, 30],                                              // :00, :30
  quarter: [0, 15, 30, 45],                                      // :00, :15, :30, :45
  five:    [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
  any:     Array.from({ length: 60 }, (_, i) => i),
};

const pickGrain = (profile) => {
  const tc = profile?.totalCorrect || 0;
  // Light progression. Always include a mix so the player doesn't see only one shape.
  const w = tc < 30 ? { hour: 30, half: 40, quarter: 25, five: 5, any: 0 }
          : tc < 90 ? { hour: 10, half: 25, quarter: 30, five: 30, any: 5 }
          : tc < 200 ? { hour: 5,  half: 15, quarter: 25, five: 40, any: 15 }
          :           { hour: 0,  half: 10, quarter: 20, five: 40, any: 30 };
  const total = Object.values(w).reduce((s, n) => s + n, 0);
  let r = Math.random() * total;
  for (const [k, n] of Object.entries(w)) {
    r -= n;
    if (r <= 0) return TIME_GRAINS[k];
  }
  return TIME_GRAINS.five;
};

const fmtTime = (h, m) => `${h}:${String(m).padStart(2, '0')}`;

const genTimeClock = (profile) => {
  const grain = pickGrain(profile);
  const hour = randInt(1, 12);
  const minute = pick(grain);
  const stories = [
    'An elder once learned to read the twoleg sun-face from a high oak. She teaches you the secret.',
    'The medicine cat shows you the twoleg sun-face glimpsed past the fence-post.',
    'Your mentor points to the round face nailed above the twoleg den.',
    'You squint past the brambles at the sun-face on the twoleg wall.',
    'A kittypet once told an apprentice what the marks on the round face mean. The lesson stayed.',
    'You learn to read the twoleg time-marks the way you learn to read the wind.',
  ];
  return {
    factId: null, kind: 'time-clock',
    question: 'What time does the twoleg sun-face show?',
    clock: { hour, minute },
    answer: hour * 60 + minute,
    story: pick(stories),
    hint: 'Long hand points to the minutes. Short hand points to the hour. If the short hand is between two numbers, take the smaller one.',
  };
};

const genTimeDuration = (profile) => {
  const grain = pickGrain(profile);
  const startH = randInt(1, 9);
  const startM = pick(grain);
  // Keep within a single half-day (no AM/PM crossing) and cap span at ~5 hours.
  const spanH = randInt(0, 4);
  const spanM = pick(grain);
  const totalSpan = spanH * 60 + spanM;
  if (totalSpan === 0) {
    // Force at least 5 minutes to avoid trivial 0-minute answers.
    return genTimeDuration(profile);
  }
  const startTotal = startH * 60 + startM;
  let endTotal = startTotal + totalSpan;
  // Stay within the same half-day frame (under 12:00 from start).
  if (endTotal >= 12 * 60) endTotal = startTotal + (totalSpan % 180 || 60);
  const endH = Math.floor(endTotal / 60);
  const endM = endTotal % 60;
  const stories = [
    `Your vigil began at ${fmtTime(startH, startM)} and the next watch arrived at ${fmtTime(endH, endM)}. How long did you watch?`,
    `You set out from camp at ${fmtTime(startH, startM)} and reached the Gathering at ${fmtTime(endH, endM)}. How long was the journey?`,
    `The medicine cat began grinding herbs at ${fmtTime(startH, startM)} and finished at ${fmtTime(endH, endM)}. How long did it take?`,
    `The dawn patrol left at ${fmtTime(startH, startM)} and returned at ${fmtTime(endH, endM)}. How long were they gone?`,
    `You stalked a vole from ${fmtTime(startH, startM)} until you struck at ${fmtTime(endH, endM)}. How long was the hunt?`,
  ];
  return {
    factId: null, kind: 'time-duration',
    question: `From ${fmtTime(startH, startM)} to ${fmtTime(endH, endM)} — how much time passed?`,
    answer: endTotal - startTotal,
    story: pick(stories),
    hint: 'Hours first, then minutes. If the end-minutes are smaller than the start-minutes, borrow an hour (60 minutes).',
  };
};

const genTimeFuture = (profile) => {
  const grain = pickGrain(profile);
  const startH = randInt(1, 9);
  const startM = pick(grain);
  const spanH = randInt(0, 3);
  const spanM = pick(grain);
  const span = spanH * 60 + spanM;
  if (span === 0) return genTimeFuture(profile);
  const startTotal = startH * 60 + startM;
  let endTotal = startTotal + span;
  if (endTotal >= 12 * 60) endTotal = endTotal - 12 * 60;
  const stories = [
    `The Gathering begins at ${fmtTime(startH, startM)}. The journey takes ${spanH} hour${spanH === 1 ? '' : 's'} and ${spanM} minute${spanM === 1 ? '' : 's'}. When do you set off?`,
    `Your vigil begins at ${fmtTime(startH, startM)} and lasts ${spanH}:${String(spanM).padStart(2, '0')}. When does the next cat take over?`,
    `The patrol leaves at ${fmtTime(startH, startM)} and walks the boundary for ${spanH}:${String(spanM).padStart(2, '0')}. When do they return?`,
    `The medicine cat steeps the herb at ${fmtTime(startH, startM)}; it must steep ${spanH}:${String(spanM).padStart(2, '0')}. When is it ready?`,
  ];
  return {
    factId: null, kind: 'time-future',
    question: `${fmtTime(startH, startM)} plus ${spanH}:${String(spanM).padStart(2, '0')} — what time?`,
    answer: endTotal,
    story: pick(stories),
    hint: 'Add hours to hours, minutes to minutes. If the minutes total 60 or more, carry one hour.',
  };
};

const genTime = (profile) => {
  const r = Math.random();
  if (r < 0.45) return genTimeClock(profile);
  if (r < 0.75) return genTimeDuration(profile);
  return genTimeFuture(profile);
};

const genFraction = (profile) => {
  const denoms = [2, 3, 4, 5];
  const d = denoms[randInt(0, denoms.length - 1)];
  const mult = randInt(2, 10);
  const num = d * mult;
  const names = { 2: 'half', 3: 'a third', 4: 'a quarter', 5: 'a fifth' };
  const medCat = MEDICINE_CATS_BY_CLAN[profile.clan] || pick(Object.values(MEDICINE_CATS_BY_CLAN));
  const herb = pick(HERBS).name;
  const recipient = pick(FRACTION_RECIPIENTS);
  const templates = [
    `${medCat} gathered ${num} ${herb} leaves and gave ${names[d]} to ${recipient}. How many did they receive?`,
    `You bring back ${num} ${herb} leaves. The medicine cat sends ${names[d]} to ${recipient}. How many leaves go?`,
    `${num} ${herb} leaves are split. ${names[d]} of them is set aside for ${recipient}. How many is that?`,
    `Your bundle holds ${num} ${herb} leaves. ${names[d]} is needed for ${recipient}. How many leaves?`,
  ];
  return {
    question: pick(templates),
    answer: num / d,
    story: 'A medicine cat shares the herb stores carefully.',
    hint: `Divide ${num} into ${d} equal piles. Take one pile.`,
  };
};

export const generateProblem = (topic, profile) => {
  if (topic === 'mult')     return genMult(profile);
  if (topic === 'add')      return genAdd(profile);
  if (topic === 'geometry') return genGeometry(profile);
  if (topic === 'fraction') return genFraction(profile);
  if (topic === 'time')     return genTime(profile);
  return genMult(profile);
};
