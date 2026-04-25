// Strategy hint library — shown when the player misses a fact twice.
// Strategies are short, actionable, and book-flavored where possible.

export const MULT_STRATEGIES = {
  // Multiplication tables 2-12 — strategy keyed on the smaller factor; falls back to decomposition.
  byFactor: {
    2:  (a, b) => `Times two means double it. ${b} doubled is ${b * 2}.`,
    3:  (a, b) => `Times three is double, then add one more group. ${b} + ${b} + ${b}.`,
    4:  (a, b) => `Times four is double, then double again. ${b} → ${b * 2} → ${b * 4}.`,
    5:  (a, b) => `Times five is half of times ten. Ten ${b}s is ${b * 10}, so half is ${b * 5}.`,
    9:  (a, b) => `The nine trick: ${b} × 9 is one less than ${b} tens, then make the digits add to nine. (${b} × 10 − ${b} = ${b * 9}.)`,
    10: (a, b) => `Times ten just adds a zero. ${b} → ${b * 10}.`,
    11: (a, b) => b < 10
      ? `For single digits, write the digit twice: ${b} × 11 = ${b}${b}.`
      : `For ${b} × 11, split: ${b} × 10 + ${b} × 1 = ${b * 10} + ${b} = ${b * 11}.`,
  },
  // Hand-picked decomposition for the famously hard ones.
  hard: {
    'mult:6x7': '6 × 7 → think 6 × 6 = 36, then add one more 6. 36 + 6 = 42.',
    'mult:7x8': '7 × 8 → "5, 6, 7, 8" — 56 (the digits 5 6 7 8 line up). Or 7 × 8 = 7 × 4 doubled = 28 doubled = 56.',
    'mult:6x8': '6 × 8 → double 6 × 4. 6 × 4 = 24, doubled = 48.',
    'mult:7x9': '7 × 9 → 7 × 10 − 7 = 70 − 7 = 63.',
    'mult:8x9': '8 × 9 → 8 × 10 − 8 = 80 − 8 = 72.',
    'mult:6x9': '6 × 9 → 6 × 10 − 6 = 60 − 6 = 54.',
    'mult:7x7': '7 × 7 = 49. Lucky number to memorize on its own — "seven sevens are forty-nine."',
    'mult:8x8': '8 × 8 = 64. Memorize this one — it lives near 7 × 8 (56) and 8 × 9 (72).',
    'mult:6x6': '6 × 6 = 36. "Six sixes are thirty-six" — say it three times.',
    'mult:9x9': '9 × 9 = 81. The nine-trick: digits add to nine (8 + 1 = 9).',
    'mult:11x11': '11 × 11 = 121. A palindrome: 1, 2, 1.',
    'mult:12x12': '12 × 12 = 144. "A dozen dozens." Worth memorizing whole.',
  },
};

export const ADD_STRATEGIES = {
  byKind: (a, b) => {
    if (Math.abs(a - b) === 1 || Math.abs(a - b) === 0) return `Doubles or near-doubles. ${a === b ? `Twice ${a}` : `${Math.min(a, b)} doubled, then add 1`}.`;
    if (a === 9 || b === 9) return `Adding 9: take 1 from the other number, then add 10. 9 + ${a === 9 ? b : a} = 10 + ${(a === 9 ? b : a) - 1}.`;
    if (a === 10 || b === 10) return `Adding 10 just changes the tens place. The ones stay the same.`;
    return `Make a ten: pull from one number to round the other to 10, then finish.`;
  },
};

export const lookupStrategy = (id, a, b) => {
  if (!id) return null;
  if (id.startsWith('mult:')) {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const hardKey = `mult:${lo}x${hi}`;
    if (MULT_STRATEGIES.hard[hardKey]) return MULT_STRATEGIES.hard[hardKey];
    if (MULT_STRATEGIES.byFactor[lo]) return MULT_STRATEGIES.byFactor[lo](lo, hi);
    if (MULT_STRATEGIES.byFactor[hi]) return MULT_STRATEGIES.byFactor[hi](hi, lo);
    return `Break it apart: ${lo} × ${hi} = ${lo} × ${Math.floor(hi / 2)} + ${lo} × ${Math.ceil(hi / 2)}.`;
  }
  if (id.startsWith('add:')) return ADD_STRATEGIES.byKind(a, b);
  return null;
};
