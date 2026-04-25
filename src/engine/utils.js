// Tiny shared helpers used by generators and views.

export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const weightedPick = (table) => {
  const total = table.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of table) {
    r -= t.weight;
    if (r <= 0) return t.name;
  }
  return table[0].name;
};

export const newSlotId = () => 'slot-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
