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
  return genMult(profile);
};
