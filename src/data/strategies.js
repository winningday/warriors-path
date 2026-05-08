// Strategy hint library — shown when the player misses a fact twice.
//
// Design rule (v15.1): a strategy MUST teach a technique without computing
// the answer for the player. The point is to coach the path; the player
// still has to walk it. No `= 42`, no `${b * 11}`, no `${b}${b}` collapses.

export const MULT_STRATEGIES = {
  // Multiplication tables 2-12 — strategy keyed on the smaller factor; falls back to decomposition.
  byFactor: {
    2:  (a, b) => `Times two means double. Add ${b} to itself.`,
    3:  (a, b) => `Three groups of ${b}. Add ${b} + ${b}, then add one more ${b}.`,
    4:  (a, b) => `Double, then double again. First find ${b} doubled, then double that.`,
    5:  (a, b) => `Times five is half of times ten. Find ten ${b}s, then take half.`,
    9:  (a, b) => `The nine trick: ten ${b}s minus one ${b}. Find ${b} × 10, then subtract one ${b}.`,
    10: (a, b) => `Times ten just adds a zero on the end of ${b}.`,
    11: (a, b) => b < 10
      ? `Single-digit times eleven: write the digit twice — like a little echo.`
      : `For ${b} × 11, split it: ${b} × 10 plus one more ${b}.`,
  },
  // Hand-picked decomposition for the famously hard ones. Show a path, never the destination.
  hard: {
    'mult:6x6': '6 × 6 — the square of six. Try 6 × 5, then add one more 6.',
    'mult:6x7': '6 × 7 — start at 6 × 6 (the square), then add one more 6.',
    'mult:6x8': '6 × 8 — find 6 × 4, then double the result.',
    'mult:6x9': '6 × 9 — find 6 × 10, then subtract one 6.',
    'mult:7x7': '7 × 7 — the square of seven. Try 7 × 6, then add one more 7. Worth memorizing on its own.',
    'mult:7x8': '7 × 8 — find 7 × 4, then double the result. Or: 7 × 10 minus two 7s.',
    'mult:7x9': '7 × 9 — find 7 × 10, then subtract one 7.',
    'mult:8x8': '8 × 8 — the square of eight. Find 8 × 4, then double the result.',
    'mult:8x9': '8 × 9 — find 8 × 10, then subtract one 8.',
    'mult:9x9': '9 × 9 — find 9 × 10, then subtract one 9. The digits of the answer add to nine.',
    'mult:11x11': '11 × 11 — find 11 × 10, then add one more 11. The answer is a palindrome.',
    'mult:12x12': '12 × 12 — split it: 10 × 12 plus 2 × 12. Add the two pieces.',
  },
};

export const ADD_STRATEGIES = {
  byKind: (a, b) => {
    if (a === b)         return `Doubles. Add ${a} to itself — count up from ${a} by ${a} more.`;
    if (Math.abs(a - b) === 1) {
      const lo = Math.min(a, b);
      return `Near-doubles. Find ${lo} doubled, then add 1 more.`;
    }
    if (a === 9 || b === 9) {
      const other = a === 9 ? b : a;
      return `Adding 9 is like adding 10 and stepping back. Find ${other} + 10, then subtract 1.`;
    }
    if (a === 10 || b === 10) return `Adding 10 just bumps the tens place up by one. The ones digit stays the same.`;
    return `Make a ten first. Take enough from one number to round the other up to 10, then add what's left over.`;
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
    return `Break it apart. Try ${lo} × ${Math.floor(hi / 2)} and ${lo} × ${Math.ceil(hi / 2)}, then add the two pieces.`;
  }
  if (id.startsWith('add:')) return ADD_STRATEGIES.byKind(a, b);
  return null;
};
