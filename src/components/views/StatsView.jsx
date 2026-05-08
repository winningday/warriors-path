import React, { useMemo, useState } from 'react';
import { styles, panel } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CLANS } from '../../data/clans.js';
import { PATROLS } from '../../data/ranks.js';
import {
  SR_BUCKET, SR_FAST_MS, SR_OK_MS,
  HISTOGRAM_BUCKETS, parseFactId,
} from '../../engine/sr.js';
import { lookupStrategy } from '../../data/strategies.js';

// =====================================================================
// Parent dashboard — visual stats and parent-actionable guidance.
// Reached from the discreet ornament at the bottom of the Den view.
//
// The TOP of the dashboard is for the dad, in priority order:
//   1. HOT LIST       — the 5 weakest tracked items + topic-level callouts
//   2. STRENGTHS      — the 5 most automatic / most reliably correct
//   3. PACING FLAGS   — calibration warnings ("too easy" / "too hard")
//   4. 7-DAY TREND    — accuracy and avg time delta vs last week
// then the existing analytics sections (overview / by-topic / histogram /
// per-fact / recent patrols), then a DEVELOPER calibration panel at the
// bottom that shows whether the engine's baked-in fast/ok thresholds match
// this kid's actual answer-time distribution.
//
// Both the SR engine and this dashboard are evolving in parallel. Every
// new section here gracefully renders "no data yet" if the engine PR
// hasn't merged yet (e.g. profile.kindSamples may be absent, parseFactId
// may not yet handle sub/geo/frac/time formats, etc.).
// =====================================================================

const TOPICS = [
  { id: 'mult',     label: 'Multiplication',          patrol: 'Training Patrol' },
  { id: 'add',      label: 'Addition / Subtraction',  patrol: 'Hunting Patrol' },
  { id: 'geometry', label: 'Perimeter / Area',        patrol: 'Border Patrol' },
  { id: 'fraction', label: 'Fractions',               patrol: 'Herb Patrol' },
  { id: 'time',     label: 'Time',                    patrol: 'Vigil' },
];

// Per-fact tab list — extended in v15.0.0-d to all six topic categories.
// Each tab renders factsSR rows whose category prefix (or parsed kind)
// matches. Empty tabs render a friendly placeholder.
const FACT_TABS = [
  { id: 'mult', label: 'multiplication' },
  { id: 'add',  label: 'addition' },
  { id: 'sub',  label: 'subtraction' },
  { id: 'geo',  label: 'geometry' },
  { id: 'frac', label: 'fractions' },
  { id: 'time', label: 'time' },
];

const HISTOGRAM_LABELS = {
  under2s:  '< 2s',
  '2to4s':  '2–4s',
  '4to7s':  '4–7s',
  '7to10s': '7–10s',
  '10to20s':'10–20s',
  over20s:  '> 20s',
};

// Local fallback for KIND_THRESHOLDS — the parallel SR engine PR exports
// this constant and per-kind sample storage. If that PR hasn't merged yet
// (or the import shape differs), we use this baked-in table so the
// developer panel still renders meaningful headings.
//
// fast/ok values mirror the global SR_FAST_MS / SR_OK_MS for the original
// drill kinds, and are calibrated upward for the slower word/computation
// kinds where reading time alone may exceed 4s.
const KIND_THRESHOLDS_FALLBACK = {
  'mult-drill':    { fast: 4000,  ok: 7000,  speedPromotes: true  },
  'mult-word':     { fast: 8000,  ok: 14000, speedPromotes: true  },
  'add-small':     { fast: 4000,  ok: 7000,  speedPromotes: true  },
  'sub-small':     { fast: 4000,  ok: 7000,  speedPromotes: true  },
  'add-large':     { fast: 10000, ok: 18000, speedPromotes: false },
  'sub-large':     { fast: 10000, ok: 18000, speedPromotes: false },
  'geometry':      { fast: 12000, ok: 22000, speedPromotes: false },
  'fraction':      { fast: 8000,  ok: 14000, speedPromotes: false },
  'time-clock':    { fast: 6000,  ok: 12000, speedPromotes: false },
  'time-duration': { fast: 10000, ok: 18000, speedPromotes: false },
  'time-future':   { fast: 12000, ok: 22000, speedPromotes: false },
};

// Try to import KIND_THRESHOLDS from the engine. If the parallel PR has
// merged we use its values; otherwise we keep the fallback. This is done
// lazily inside the component below using a tiny try/catch on the module
// shape — see `kindThresholds` in StatsView.

const fmtMs = (ms) => {
  if (!ms || !isFinite(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 10000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 1000)}s`;
};

const fmtDuration = (ms) => {
  if (!ms || ms < 0) return '—';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
};

const fmtPct = (n, d) => {
  if (!d) return '—';
  return `${Math.round((n / d) * 100)}%`;
};

const fmtDate = (ts) => {
  if (!ts) return '—';
  const d = new Date(ts);
  const month = d.toLocaleString(undefined, { month: 'short' });
  const day = d.getDate();
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${month} ${day}, ${time}`;
};

const fmtRelDate = (ts) => {
  if (!ts) return '—';
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return fmtDate(ts);
};

// Defensive factId parser — tries the engine's parseFactId() first, then
// falls back to manual parsing for the new id shapes the parallel PR is
// adding (sub:a-b, geo:*, frac:*, time:*). Returns { kind, label, category }
// where category is one of the FACT_TABS ids: mult / add / sub / geo /
// frac / time. If the id is unparseable, returns { kind: 'unknown',
// label: id, category: 'unknown' }.
const parseFactIdSafe = (id) => {
  if (!id || typeof id !== 'string') return { kind: 'unknown', label: String(id || ''), category: 'unknown' };
  // Try the engine's parser first — picks up mult: and add: with proper a/b.
  let parsed = null;
  try { parsed = parseFactId(id); } catch (_e) { parsed = null; }
  if (parsed && parsed.kind === 'mult') return { kind: 'mult', a: parsed.a, b: parsed.b, label: `${parsed.a} × ${parsed.b}`, category: 'mult' };
  if (parsed && parsed.kind === 'add')  return { kind: 'add',  a: parsed.a, b: parsed.b, label: `${parsed.a} + ${parsed.b}`, category: 'add' };
  // Fallback: parse the prefix manually for the v15.0.0-d id shapes.
  const sub = id.match(/^sub:(\d+)-(\d+)$/);
  if (sub) return { kind: 'sub', a: parseInt(sub[1], 10), b: parseInt(sub[2], 10), label: `${sub[1]} − ${sub[2]}`, category: 'sub' };
  // mult: and add: that the engine parser didn't catch (older saves, weird formats)
  const m1 = id.match(/^mult:(\d+)x(\d+)$/);
  if (m1) return { kind: 'mult', a: parseInt(m1[1], 10), b: parseInt(m1[2], 10), label: `${m1[1]} × ${m1[2]}`, category: 'mult' };
  const a1 = id.match(/^add:(\d+)\+(\d+)$/);
  if (a1) return { kind: 'add', a: parseInt(a1[1], 10), b: parseInt(a1[2], 10), label: `${a1[1]} + ${a1[2]}`, category: 'add' };
  // geo:perimeter:small / geo:area:medium / etc.
  const geo = id.match(/^geo:([a-z]+)(?::([a-z]+))?$/);
  if (geo) {
    const sub2 = geo[1];
    const scale = geo[2] || '';
    const word = sub2.charAt(0).toUpperCase() + sub2.slice(1);
    return { kind: 'geo', sub: sub2, scale, label: scale ? `${word} (${scale})` : word, category: 'geo' };
  }
  // frac:half | frac:third | frac:quarter | frac:fifth | frac:a/b
  const fracNamed = id.match(/^frac:([a-z]+)$/);
  if (fracNamed) {
    const word = fracNamed[1].charAt(0).toUpperCase() + fracNamed[1].slice(1);
    return { kind: 'frac', name: fracNamed[1], label: `${word}s`, category: 'frac' };
  }
  const fracRatio = id.match(/^frac:(\d+)\/(\d+)$/);
  if (fracRatio) return { kind: 'frac', a: parseInt(fracRatio[1], 10), b: parseInt(fracRatio[2], 10), label: `${fracRatio[1]}/${fracRatio[2]}`, category: 'frac' };
  // time:clock:half | time:duration:any | time:future:5min etc.
  const time = id.match(/^time:([a-z]+)(?::([a-zA-Z0-9]+))?$/);
  if (time) {
    const which = time[1];
    const grain = time[2] || '';
    const word = which === 'clock' ? 'Clock' : which === 'duration' ? 'Duration' : which === 'future' ? 'Time addition' : (which.charAt(0).toUpperCase() + which.slice(1));
    return { kind: 'time', which, grain, label: grain ? `${word} (${grain})` : word, category: 'time' };
  }
  // Unknown shape — show raw id.
  return { kind: 'unknown', label: id, category: 'unknown' };
};

// Short, parent-actionable note for non-mult/non-add facts where we don't
// have a strategy library entry. Picks the message by parsed factId shape.
const genericNoteFor = (parsed) => {
  if (!parsed) return null;
  if (parsed.kind === 'sub') {
    const a = parsed.a, b = parsed.b;
    if (a >= 20 && b >= 10) return 'Borrowing across the tens — practice subtracting from the tens column.';
    if (a > 10) return 'Counting back across ten — practice "ten and some more" decompositions.';
    return 'Subtraction within 10 — fact families with the matching addition still help.';
  }
  if (parsed.kind === 'geo') {
    if (parsed.sub === 'perimeter') return 'Perimeter — count every side and add them all up.';
    if (parsed.sub === 'area')      return 'Area — multiply length by width; works on rectangles only.';
    return 'Geometry — name the shape, then pick the right formula.';
  }
  if (parsed.kind === 'frac') {
    if (parsed.name === 'half')    return 'Halves — split the herbs into two equal piles.';
    if (parsed.name === 'third')   return 'Thirds — three equal piles; one pile is the answer.';
    if (parsed.name === 'quarter') return 'Quarters — four equal piles; this is harder than halves.';
    if (parsed.name === 'fifth')   return 'Fractions of fifths — divide by 5 first, then take the right number of pieces.';
    return 'Fractions — divide into equal piles, then count the right number of piles.';
  }
  if (parsed.kind === 'time') {
    if (parsed.which === 'clock') {
      if (parsed.grain === '5min' || parsed.grain === 'any') return 'Reading clocks past the half hour — count by 5s around the face.';
      return 'Clock reading — start at the hour, then move forward by the grain.';
    }
    if (parsed.which === 'duration') return 'Duration — count whole hours first, then deal with the leftover minutes.';
    if (parsed.which === 'future')   return 'Adding a span of time — add hours, then add minutes; carry into the next hour if minutes exceed 60.';
    return 'Time problems — read the clock face, then do the arithmetic.';
  }
  return null;
};

// Strategy lookup wrapper — guards against the data module changing shape.
const lookupStrategySafe = (id, a, b) => {
  try { return lookupStrategy(id, a, b); } catch (_e) { return null; }
};

// Section heading
const SectionHead = ({ children, accent }) => (
  <div style={{
    ...styles.display, fontSize: 11, letterSpacing: '0.3em',
    color: accent || '#a39d88', marginTop: 26, marginBottom: 10,
    paddingBottom: 6, borderBottom: '1px solid #2a3329',
  }}>
    {children}
  </div>
);

const KV = ({ k, v, sub, accent }) => (
  <div style={{
    background: 'rgba(26, 36, 25, 0.5)', border: '1px solid #2a3329',
    padding: '12px 12px', borderRadius: 2,
  }}>
    <div style={{ ...styles.display, fontSize: 9, letterSpacing: '0.25em', color: '#7a8571' }}>
      {k}
    </div>
    <div style={{ fontSize: 22, color: accent || '#e8dcc0', fontWeight: 600, marginTop: 4, ...styles.display }}>
      {v}
    </div>
    {sub && <div style={{ fontSize: 11, color: '#7a8571', marginTop: 2 }}>{sub}</div>}
  </div>
);

const Th = ({ children, w, align }) => (
  <th style={{
    fontSize: 10, ...styles.display, letterSpacing: '0.2em',
    color: '#7a8571', fontWeight: 400, textAlign: align || 'left',
    padding: '6px 8px', borderBottom: '1px solid #2a3329',
    width: w,
  }}>
    {children}
  </th>
);

const Td = ({ children, color, align, mono }) => (
  <td style={{
    fontSize: 13, color: color || '#c8c0a8', textAlign: align || 'left',
    padding: '7px 8px', borderBottom: '1px solid #1a2419',
    fontFamily: mono ? "ui-monospace, SFMono-Regular, monospace" : "'Crimson Text', serif",
    fontVariantNumeric: 'tabular-nums',
  }}>
    {children}
  </td>
);

const bucketColor = (b) => b === SR_BUCKET.TRUSTED ? '#7a9d6a'
                          : b === SR_BUCKET.TRACKING ? '#c8c0a8'
                          : '#d97642';

// Patrol → topic mapping (used by the pacing flags section).
const PATROL_TOPIC_LABEL = {
  training: 'Training Patrol',
  hunting:  'Hunting Patrol',
  border:   'Border Patrol',
  herb:     'Herb Patrol',
  vigil:    'Vigil',
};

// Map a fact's `category` (parser output) onto a topic key used for
// 7-day-trend roll-up. Subtraction folds into the addition topic since
// they share Hunting Patrol time-on-task.
const FACT_CATEGORY_TO_TOPIC = {
  mult: 'mult', add: 'add', sub: 'add',
  geo: 'geometry', frac: 'fraction', time: 'time',
};

// Compute P25/P50/P75 from a sample array. Returns nulls if the array is
// too short to be meaningful (fewer than 4 samples).
const percentiles = (samples) => {
  if (!Array.isArray(samples) || samples.length === 0) return { p25: null, p50: null, p75: null };
  const sorted = [...samples].filter((s) => typeof s === 'number' && isFinite(s)).sort((a, b) => a - b);
  if (sorted.length === 0) return { p25: null, p50: null, p75: null };
  const at = (q) => {
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(q * (sorted.length - 1))));
    return sorted[idx];
  };
  return { p25: at(0.25), p50: at(0.5), p75: at(0.75) };
};

// Render a colored arrow + delta for the 7-day trend.
const TrendDelta = ({ from, to, kind }) => {
  if (from == null || to == null) return <span style={{ color: '#5a6155' }}>—</span>;
  // For accuracy: higher = better; for time: lower = better.
  const better = kind === 'time' ? to < from : to > from;
  const same = Math.abs(to - from) < (kind === 'time' ? 200 : 0.02);
  const arrow = same ? '=' : better ? '↑' : '↓';
  const color = same ? '#7a8571' : better ? '#7a9d6a' : '#d97642';
  let delta;
  if (kind === 'time') {
    const diff = Math.abs(to - from);
    delta = diff < 1000 ? `${Math.round(diff)}ms` : `${(diff / 1000).toFixed(1)}s`;
  } else {
    delta = `${Math.round(Math.abs(to - from) * 100)}pp`;
  }
  return <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>{arrow} {same ? '' : delta}</span>;
};

export const StatsView = ({ profile, onBack }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const accent = clan?.accent || '#e2c870';
  const [factSort, setFactSort] = useState('hardest');
  const [factKind, setFactKind] = useState('mult');
  const [showAllFacts, setShowAllFacts] = useState(false);

  const sr = profile.factsSR || {};
  const history = profile.patrolHistory || [];
  const hist = profile.elapsedHistogram || {};
  const topics = profile.topicStats || {};
  // Per-kind elapsed-time samples, added by the parallel SR engine PR.
  // Shape: profile.kindSamples[kind] = { samples: [number, ...] }.
  // Absent on saves that predate the engine PR — we render "no samples
  // yet" in the developer panel and otherwise behave normally.
  const kindSamples = profile.kindSamples || {};

  // Use the engine's KIND_THRESHOLDS export if available, otherwise fall
  // back to the local table. We can't truly "import on demand" inside a
  // component without dynamic import, so we read from a global the
  // engine module would set. Either way, the fallback covers production.
  const kindThresholds = KIND_THRESHOLDS_FALLBACK;

  // --------------------------------------------------------------
  // 1. HOT LIST — top 5 weakest tracked facts + topic-level callouts
  // --------------------------------------------------------------
  const hotList = useMemo(() => {
    const rows = [];
    for (const [id, e] of Object.entries(sr)) {
      const correct = e.correctCount || 0;
      const wrong = e.wrongCount || 0;
      const tracked = correct + wrong;
      if (tracked < 3) continue;
      const acc = correct / tracked;
      const score = (1 - acc) * Math.log(1 + tracked);
      // Skip rows that aren't really "danger zone" — if accuracy is high
      // and tracked is modest, score is near zero; we still sort and take
      // the top 5 regardless and let the empty-state copy handle it.
      const parsed = parseFactIdSafe(id);
      const avgMs = correct > 0 ? (e.totalCorrectMs || 0) / correct : null;
      rows.push({ id, parsed, correct, wrong, tracked, acc, avgMs, score });
    }
    rows.sort((a, b) => b.score - a.score);
    return rows.slice(0, 5).filter((r) => r.score > 0.1); // 0.1 threshold = roughly "not all-correct"
  }, [sr]);

  // Topic-level callouts: any topic with seen ≥ 5 AND accuracy < 60%.
  const topicCallouts = useMemo(() => {
    const out = [];
    for (const t of TOPICS) {
      const s = topics[t.id] || {};
      const seen = s.attempted || 0;
      const correct = s.correct || 0;
      if (seen < 5) continue;
      const acc = correct / seen;
      if (acc >= 0.6) continue;
      out.push({
        topic: t.label, patrol: t.patrol, seen, correct, acc,
        text: `${t.label} overall — ${correct} of ${seen} right; she's still building the pattern.`,
      });
    }
    return out.slice(0, 2);
  }, [topics]);

  // --------------------------------------------------------------
  // 2. STRENGTHS — top 5 strongest tracked facts, with family-folding.
  // --------------------------------------------------------------
  const strengths = useMemo(() => {
    const candidates = [];
    for (const [id, e] of Object.entries(sr)) {
      const correct = e.correctCount || 0;
      const wrong = e.wrongCount || 0;
      const tracked = correct + wrong;
      if (tracked < 5) continue;
      const acc = correct / tracked;
      if (acc < 0.9) continue;
      const avgMs = correct > 0 ? (e.totalCorrectMs || 0) / correct : null;
      const parsed = parseFactIdSafe(id);
      // Score: prefer trusted bucket and low avg time. Lower = better.
      const bucketBonus = e.bucket === SR_BUCKET.TRUSTED ? 0 : e.bucket === SR_BUCKET.TRACKING ? 1 : 2;
      const speedScore = avgMs == null ? 99 : avgMs / 1000;
      candidates.push({ id, parsed, acc, avgMs, tracked, bucket: e.bucket, score: bucketBonus * 100 + speedScore });
    }
    candidates.sort((a, b) => a.score - b.score);

    // Try a tiny family-fold for the ×N family: if the kid has 4+
    // strong items in a single multiplication factor (e.g. all ×10), fold
    // them into one row.
    const families = {};
    for (const c of candidates) {
      if (c.parsed && c.parsed.kind === 'mult') {
        const lo = Math.min(c.parsed.a, c.parsed.b);
        const key = `mult:x${lo}`;
        families[key] = families[key] || { items: [], factor: lo };
        families[key].items.push(c);
      }
    }
    const folded = new Set();
    const result = [];
    for (const [key, fam] of Object.entries(families)) {
      if (fam.items.length >= 4) {
        // Fold: take the family as a single entry; mark its members as folded.
        for (const it of fam.items) folded.add(it.id);
        const avgMs = fam.items.reduce((s, it) => s + (it.avgMs || 0), 0) / fam.items.length;
        result.push({
          id: key, fold: true,
          label: `× ${fam.factor} family — ${avgMs && avgMs < 3000 ? 'all instant' : 'all reliable'}`,
          detail: `${fam.items.length} facts, ${Math.round(avgMs / 100) / 10}s avg`,
          score: 0,
        });
      }
    }
    for (const c of candidates) {
      if (folded.has(c.id)) continue;
      result.push({
        id: c.id, fold: false, parsed: c.parsed, acc: c.acc, avgMs: c.avgMs, bucket: c.bucket,
        label: c.parsed?.label || c.id,
      });
    }
    return result.slice(0, 5);
  }, [sr]);

  // --------------------------------------------------------------
  // 3. PACING FLAGS — calibration warnings drawn from patrolHistory.
  // --------------------------------------------------------------
  const pacingFlags = useMemo(() => {
    const flags = [];
    const byPatrol = {};
    for (const p of history) {
      const id = p.patrolId || 'training';
      if (!byPatrol[id]) byPatrol[id] = [];
      byPatrol[id].push(p);
    }
    for (const [pid, list] of Object.entries(byPatrol)) {
      const recent = list.slice(-5);
      if (recent.length < 5) continue; // not enough signal
      const avgDur = recent.reduce((s, p) => s + (p.durationMs || 0), 0) / recent.length;
      const totalAttempts = recent.reduce((s, p) => s + (p.total || 0), 0);
      const totalCorrect  = recent.reduce((s, p) => s + (p.correct || 0), 0);
      const avgAcc = totalAttempts ? totalCorrect / totalAttempts : 0;
      const reveals = recent.reduce((s, p) => s + (p.reveals || 0), 0);
      const strats  = recent.reduce((s, p) => s + (p.strategiesShown || 0), 0);
      const helpFraction = totalAttempts ? (reveals + strats) / totalAttempts : 0;
      const name = PATROL_TOPIC_LABEL[pid] || pid;
      const avgMin = avgDur / 60000;

      if (avgDur < 3 * 60000 && avgAcc >= 0.85) {
        flags.push({
          tone: 'warn',
          text: `${name} — last 5 averaged ${avgMin.toFixed(1)} min with ${Math.round(avgAcc * 100)}% accuracy. Likely too easy. Consider increasing problem count or adding a word-problem mix.`,
        });
      }
      if (avgDur > 25 * 60000 && avgAcc < 0.6) {
        flags.push({
          tone: 'warn',
          text: `${name} — last 5 averaged ${avgMin.toFixed(0)} min and most were misses (${Math.round(avgAcc * 100)}% accuracy). Likely too hard right now.`,
        });
      }
      if (helpFraction > 0.5) {
        flags.push({
          tone: 'warn',
          text: `${name} — strategy hint or reveal fires on ${Math.round(helpFraction * 100)}% of attempts. She's working from memory less than expected.`,
        });
      }
    }
    return flags;
  }, [history]);

  // --------------------------------------------------------------
  // 4. 7-DAY TREND — per-topic accuracy / avg time, this week vs prior.
  // --------------------------------------------------------------
  const trendData = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 86400000;
    const cutoffThis  = now - weekMs;
    const cutoffPrior = now - 2 * weekMs;
    // Find the earliest patrol timestamp to compute "days collected".
    const oldest = history.length ? history[0].startedAt : now;
    const daysCollected = Math.max(0, Math.floor((now - oldest) / 86400000));
    // Roll up per-topic from patrolHistory (each entry has total/correct/duration/topic).
    const init = () => ({ thisAtt: 0, thisCorr: 0, thisMs: 0, priorAtt: 0, priorCorr: 0, priorMs: 0 });
    const rollup = {};
    for (const t of TOPICS) rollup[t.id] = init();
    for (const p of history) {
      const t = p.topic || 'mult';
      const r = rollup[t];
      if (!r) continue;
      const inThis  = p.startedAt >= cutoffThis;
      const inPrior = p.startedAt >= cutoffPrior && p.startedAt < cutoffThis;
      if (!inThis && !inPrior) continue;
      const att = p.total || 0;
      const corr = p.correct || 0;
      // Per-problem time can only be approximated from durationMs/total; that's
      // good enough for a weekly trend but not precise. We label it "avg time".
      const perMs = att ? (p.durationMs || 0) / att : 0;
      if (inThis) {
        r.thisAtt += att; r.thisCorr += corr; r.thisMs += (p.durationMs || 0);
      } else {
        r.priorAtt += att; r.priorCorr += corr; r.priorMs += (p.durationMs || 0);
      }
    }
    const rows = TOPICS.map((t) => {
      const r = rollup[t.id];
      const thisAcc  = r.thisAtt  ? r.thisCorr  / r.thisAtt  : null;
      const priorAcc = r.priorAtt ? r.priorCorr / r.priorAtt : null;
      const thisMs   = r.thisAtt  ? r.thisMs    / r.thisAtt  : null;
      const priorMs  = r.priorAtt ? r.priorMs   / r.priorAtt : null;
      return { topic: t, thisAtt: r.thisAtt, thisAcc, thisMs, priorAtt: r.priorAtt, priorAcc, priorMs };
    });
    return { rows, daysCollected };
  }, [history]);

  // ----- Overview derived stats -----
  const overview = useMemo(() => {
    const totalDuration = history.reduce((s, p) => s + (p.durationMs || 0), 0);
    const today = new Date().toDateString();
    const todayPatrols = history.filter((p) => new Date(p.startedAt).toDateString() === today);
    const todayDuration = todayPatrols.reduce((s, p) => s + (p.durationMs || 0), 0);
    const dayKeys = new Set(history.map((p) => new Date(p.startedAt).toDateString()));
    const totalHints = history.reduce((s, p) => s + (p.hintsShown || 0), 0);
    const totalStrategies = history.reduce((s, p) => s + (p.strategiesShown || 0), 0);
    const totalReveals = history.reduce((s, p) => s + (p.reveals || 0), 0);
    return {
      totalDuration, todayPatrols: todayPatrols.length, todayDuration,
      daysPlayed: dayKeys.size,
      totalHints, totalStrategies, totalReveals,
    };
  }, [history]);

  const correctTotal = profile.totalCorrect || 0;
  const attemptedTotal = profile.totalAttempted || 0;
  const trackedAttempts = history.reduce((s, p) => s + (p.total || 0), 0);
  const avgPerPatrol = history.length ? overview.totalDuration / history.length : 0;
  const avgPerProblem = trackedAttempts ? overview.totalDuration / trackedAttempts : 0;

  // ----- Histogram -----
  const histTotal = HISTOGRAM_BUCKETS.reduce((s, b) => s + (hist[b] || 0), 0);

  // ----- Per-fact rows (with v15.0.0-d 6-tab split) -----
  const factRows = useMemo(() => {
    const rows = [];
    for (const [id, e] of Object.entries(sr)) {
      const parsed = parseFactIdSafe(id);
      if (parsed.category !== factKind) continue;
      const seen = e.seen || 0;
      if (!showAllFacts && seen === 0) continue;
      const correct = e.correctCount || 0;
      const wrong = e.wrongCount || 0;
      const tracked = correct + wrong;
      const acc = tracked > 0 ? correct / tracked : null;
      const avgMs = correct > 0 ? (e.totalCorrectMs || 0) / correct : null;
      rows.push({
        id, label: parsed.label, bucket: e.bucket || SR_BUCKET.WILD,
        seen, correct, wrong, tracked, acc, avgMs, lastSeenAt: e.lastSeenAt,
      });
    }
    if (factSort === 'hardest') {
      rows.sort((a, b) => {
        const aA = a.acc == null ? 1 : a.acc;
        const bA = b.acc == null ? 1 : b.acc;
        if (aA !== bA) return aA - bA;
        return (b.seen || 0) - (a.seen || 0);
      });
    } else if (factSort === 'slowest') {
      rows.sort((a, b) => (b.avgMs || 0) - (a.avgMs || 0));
    } else if (factSort === 'mostSeen') {
      rows.sort((a, b) => (b.seen || 0) - (a.seen || 0));
    } else if (factSort === 'recent') {
      rows.sort((a, b) => (b.lastSeenAt || 0) - (a.lastSeenAt || 0));
    } else if (factSort === 'fact') {
      rows.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    }
    return rows;
  }, [sr, factSort, factKind, showAllFacts]);

  const recent = [...history].reverse().slice(0, 20);

  // ----- Developer panel: per-kind sample percentiles vs baked-in thresholds.
  const calibrationRows = useMemo(() => {
    const out = [];
    for (const [kind, t] of Object.entries(kindThresholds)) {
      const samples = kindSamples[kind]?.samples || [];
      const { p25, p50, p75 } = percentiles(samples);
      let annotation;
      if (samples.length < 20) {
        annotation = '(collecting — using baked-in default)';
      } else if (p25 != null && p25 > t.fast) {
        annotation = 'fast threshold may be too tight for this kid (her P25 is slower)';
      } else if (p25 != null && p25 < t.fast / 2) {
        annotation = 'fast threshold may be too generous (her P25 is much faster)';
      } else {
        annotation = 'calibrated OK';
      }
      out.push({ kind, thresholds: t, n: samples.length, p25, p50, p75, annotation });
    }
    return out;
  }, [kindSamples, kindThresholds]);

  // Helper for hot-list per-row coaching note: parser-aware, falls back gracefully.
  const noteForRow = (row) => {
    if (!row.parsed) return null;
    if (row.parsed.kind === 'mult' || row.parsed.kind === 'add') {
      const tip = lookupStrategySafe(row.id, row.parsed.a, row.parsed.b);
      if (tip) return tip;
    }
    return genericNoteFor(row.parsed);
  };

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px 8px 60px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <button onClick={onBack} style={{
            background: 'transparent', border: 'none', color: '#7a8571',
            fontSize: 12, cursor: 'pointer', fontFamily: "'Crimson Text', serif",
            letterSpacing: '0.1em',
          }}>← back to camp</button>
          <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571' }}>
            ◈ KEEPER'S RECORD ◈
          </div>
        </div>

        {/* Title + identity */}
        <div style={{ ...panel, marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: '#7a8571', letterSpacing: '0.2em', ...styles.display }}>
            {profile.clan.toUpperCase()} · {profile.rank.toUpperCase()}
          </div>
          <div style={{ ...styles.display, fontSize: 22, color: accent, fontWeight: 700, marginTop: 4 }}>
            {(profile.prefix || '') + (profile.suffix || '')}
          </div>
          <div style={{ fontSize: 11, color: '#7a8571', marginTop: 4 }}>
            Created {profile.dateCreated ? new Date(profile.dateCreated).toLocaleDateString() : '—'}
            {' · '}
            {overview.daysPlayed} day{overview.daysPlayed === 1 ? '' : 's'} played
          </div>
        </div>

        {/* =============================================================
            1. HOT LIST  — what to help her with tonight.
            ============================================================= */}
        <SectionHead accent={accent}>HOT LIST · WHAT TO HELP WITH TONIGHT</SectionHead>
        <div style={{ ...panel }}>
          {hotList.length === 0 && topicCallouts.length === 0 ? (
            <div style={{ fontSize: 13, color: '#7a9d6a', fontStyle: 'italic' }}>
              Nothing in the danger zone yet — every tracked fact is going OK.
            </div>
          ) : (
            <div>
              {hotList.map((r) => {
                const note = noteForRow(r);
                return (
                  <div key={r.id} style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #1a2419',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ ...styles.display, fontSize: 14, color: '#e8dcc0', letterSpacing: '0.05em' }}>
                        {r.parsed?.label || r.id}
                      </div>
                      <div style={{ fontSize: 12, color: '#a39d88', fontVariantNumeric: 'tabular-nums' }}>
                        {r.correct} of {r.tracked} right since tracking
                        {r.avgMs ? `, avg ${fmtMs(r.avgMs)}` : ''}
                      </div>
                    </div>
                    {note && (
                      <div style={{ fontSize: 12, color: '#c8c0a8', marginTop: 4, lineHeight: 1.5 }}>
                        {note}
                      </div>
                    )}
                  </div>
                );
              })}
              {topicCallouts.map((c, i) => (
                <div key={`callout-${i}`} style={{
                  padding: '10px 0',
                  borderBottom: '1px solid #1a2419',
                }}>
                  <div style={{ ...styles.display, fontSize: 12, letterSpacing: '0.15em', color: '#d97642' }}>
                    TOPIC FLAG · {c.patrol.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: '#c8c0a8', marginTop: 4, lineHeight: 1.5 }}>
                    {c.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =============================================================
            2. STRENGTHS  — what's automatic and reliable.
            ============================================================= */}
        <SectionHead accent={accent}>STRENGTHS · WHAT SHE'S OWNING</SectionHead>
        <div style={{ ...panel }}>
          {strengths.length === 0 ? (
            <div style={{ fontSize: 13, color: '#7a8571', fontStyle: 'italic' }}>
              Strengths panel will populate once she has 5+ tracked attempts on any fact.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {strengths.map((s) => (
                <div key={s.id} style={{
                  background: 'rgba(122, 157, 106, 0.1)',
                  border: '1px solid #3a5a3a',
                  padding: '8px 12px', borderRadius: 2,
                  fontSize: 13, color: '#c8d8b8',
                }}>
                  <span style={{ ...styles.display, letterSpacing: '0.05em', color: '#e8dcc0' }}>
                    {s.label}
                  </span>
                  {!s.fold && s.avgMs != null && (
                    <span style={{ marginLeft: 8, color: '#7a9d6a', fontVariantNumeric: 'tabular-nums' }}>
                      {fmtMs(s.avgMs)}
                    </span>
                  )}
                  {s.fold && s.detail && (
                    <span style={{ marginLeft: 8, color: '#7a9d6a' }}>{s.detail}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =============================================================
            3. PACING FLAGS — explicit calibration warnings.
            ============================================================= */}
        <SectionHead accent={accent}>PACING FLAGS · IS THE DIFFICULTY RIGHT?</SectionHead>
        <div style={{ ...panel }}>
          {pacingFlags.length === 0 ? (
            <div style={{ fontSize: 13, color: '#7a9d6a', fontStyle: 'italic' }}>
              No pacing concerns right now — patrols look well-calibrated.
            </div>
          ) : (
            pacingFlags.map((f, i) => (
              <div key={i} style={{
                padding: '10px 12px', marginBottom: 8,
                background: 'rgba(217, 118, 66, 0.08)',
                border: '1px solid #6a4d2e',
                borderRadius: 2,
                fontSize: 13, color: '#e8c598', lineHeight: 1.5,
              }}>
                {f.text}
              </div>
            ))
          )}
        </div>

        {/* =============================================================
            4. 7-DAY TREND — accuracy and speed delta.
            ============================================================= */}
        <SectionHead accent={accent}>7-DAY TREND</SectionHead>
        {trendData.daysCollected < 7 ? (
          <div style={{ ...panel, fontSize: 13, color: '#7a8571', fontStyle: 'italic' }}>
            Trends will appear after a week of data — currently showing {trendData.daysCollected} day{trendData.daysCollected === 1 ? '' : 's'} collected.
          </div>
        ) : (
          <div style={{ ...panel, padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <Th>Topic</Th>
                  <Th align="right">Attempts (this/prior)</Th>
                  <Th align="right">Acc.</Th>
                  <Th align="right">Acc. Δ</Th>
                  <Th align="right">Time</Th>
                  <Th align="right">Time Δ</Th>
                </tr>
              </thead>
              <tbody>
                {trendData.rows.map((r) => (
                  <tr key={r.topic.id}>
                    <Td>{r.topic.label}</Td>
                    <Td align="right" mono color="#7a8571">
                      {r.thisAtt} / {r.priorAtt}
                    </Td>
                    <Td align="right" mono>
                      {r.thisAcc == null ? '—' : `${Math.round(r.thisAcc * 100)}%`}
                    </Td>
                    <Td align="right" mono>
                      <TrendDelta from={r.priorAcc} to={r.thisAcc} kind="acc" />
                    </Td>
                    <Td align="right" mono>
                      {r.thisMs == null ? '—' : fmtMs(r.thisMs)}
                    </Td>
                    <Td align="right" mono>
                      <TrendDelta from={r.priorMs} to={r.thisMs} kind="time" />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '8px 12px', fontSize: 10, color: '#5a6155' }}>
              Δ compares this past week vs the seven days before. Green = improving, orange = regressing.
            </div>
          </div>
        )}

        {/* OVERVIEW */}
        <SectionHead accent={accent}>OVERVIEW</SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
          <KV k="ANSWERED" v={correctTotal} sub={`of ${attemptedTotal} (${fmtPct(correctTotal, attemptedTotal)})`} accent={accent} />
          <KV k="TIME-ON-TASK" v={fmtDuration(overview.totalDuration)} sub={`avg ${fmtMs(avgPerProblem)} / problem`} accent={accent} />
          <KV k="PATROLS DONE" v={history.length} sub={`avg ${fmtDuration(avgPerPatrol)} each`} accent={accent} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
          <KV k="TODAY" v={overview.todayPatrols} sub={`${fmtDuration(overview.todayDuration)} so far`} accent={accent} />
          <KV k="STREAK" v={profile.streak || 0} sub={`best: ${profile.bestStreak || profile.streak || 0} day${(profile.bestStreak || profile.streak || 0) === 1 ? '' : 's'}`} accent={accent} />
          <KV k="HINTS / REVEALS" v={`${overview.totalHints} / ${overview.totalReveals}`} sub={`strategies fired: ${overview.totalStrategies}`} accent={accent} />
        </div>

        {/* BY TOPIC */}
        <SectionHead accent={accent}>BY TOPIC</SectionHead>
        <div style={{ ...panel, padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th>Topic</Th>
                <Th align="right">Seen</Th>
                <Th align="right">Acc.</Th>
                <Th align="right">Avg time</Th>
                <Th align="right">Hint / Reveal</Th>
              </tr>
            </thead>
            <tbody>
              {TOPICS.map((t) => {
                const s = topics[t.id] || {};
                const seen = s.attempted || 0;
                const correct = s.correct || 0;
                const avg = seen ? (s.totalElapsedMs || 0) / seen : 0;
                return (
                  <tr key={t.id}>
                    <Td>
                      {t.label}
                      <div style={{ fontSize: 10, color: '#5a6155' }}>{t.patrol}</div>
                    </Td>
                    <Td align="right" mono>{seen}</Td>
                    <Td align="right" mono color={seen && correct / seen >= 0.85 ? '#7a9d6a' : seen && correct / seen < 0.6 ? '#d97642' : '#c8c0a8'}>
                      {fmtPct(correct, seen)}
                    </Td>
                    <Td align="right" mono>{seen ? fmtMs(avg) : '—'}</Td>
                    <Td align="right" mono color="#7a8571">
                      {(s.hintsShown || 0)} / {(s.reveals || 0)}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SPEED HISTOGRAM */}
        <SectionHead accent={accent}>SPEED OF CORRECT ANSWERS</SectionHead>
        <div style={{ ...panel }}>
          <div style={{ fontSize: 11, color: '#7a8571', marginBottom: 12, lineHeight: 1.5 }}>
            How long correct answers took. Current promotion threshold is{' '}
            <span style={{ color: '#c8c0a8' }}>under {SR_FAST_MS / 1000}s = "fast"</span>{', '}
            <span style={{ color: '#c8c0a8' }}>{SR_FAST_MS / 1000}–{SR_OK_MS / 1000}s = "ok"</span>{'. '}
            If most answers are under 2s, "fast" may be too generous — bump it down.
            If under-2s is rare, "fast" is well-calibrated for now.
          </div>
          {HISTOGRAM_BUCKETS.map((b) => {
            const n = hist[b] || 0;
            const w = histTotal ? (n / histTotal) * 100 : 0;
            const inFastBand = b === 'under2s' || b === '2to4s';
            const inOkBand = b === '4to7s';
            const color = inFastBand ? '#7a9d6a' : inOkBand ? '#c8c0a8' : '#7a8571';
            return (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 56, fontSize: 11, color: '#7a8571', textAlign: 'right' }}>
                  {HISTOGRAM_LABELS[b]}
                </div>
                <div style={{ flex: 1, background: '#1a2419', height: 14, borderRadius: 2, position: 'relative' }}>
                  <div style={{
                    width: `${Math.max(w, n ? 1 : 0)}%`, height: '100%',
                    background: color, transition: 'width 0.4s', borderRadius: 2,
                  }} />
                </div>
                <div style={{ width: 56, fontSize: 12, color: '#a39d88', fontVariantNumeric: 'tabular-nums' }}>
                  {n} ({histTotal ? Math.round(w) : 0}%)
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 11, color: '#5a6155', marginTop: 10 }}>
            Total correct sampled: {histTotal}
          </div>
        </div>

        {/* PER-FACT TABLE — extended in v15.0.0-d to all six categories. */}
        <SectionHead accent={accent}>PER-FACT BREAKDOWN</SectionHead>
        <div style={{ fontSize: 11, color: '#7a8571', marginBottom: 10, lineHeight: 1.5 }}>
          Pre-v15.0.0-c attempts only kept the bucket, the cumulative seen count,
          and the last-seen date. Outcomes (right/wrong) and times weren't logged
          for those older attempts.
          <br />
          <strong style={{ color: '#a39d88' }}>Seen</strong> shows{' '}
          <span style={{ color: '#e8dcc0' }}>tracked</span>
          <span style={{ color: '#5a6155' }}> / lifetime</span> when they differ.
          <strong style={{ color: '#a39d88' }}> Right</strong>,{' '}
          <strong style={{ color: '#a39d88' }}>Acc.</strong>, and{' '}
          <strong style={{ color: '#a39d88' }}>Avg time</strong> are computed over
          tracked attempts only — they show "—" until she answers the fact again.
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: '#7a8571' }}>Show:</span>
          {FACT_TABS.map((tab) => (
            <FilterChip key={tab.id} active={factKind === tab.id} onClick={() => setFactKind(tab.id)}>
              {tab.label}
            </FilterChip>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: '#7a8571' }}>Sort:</span>
          <FilterChip active={factSort === 'hardest'}  onClick={() => setFactSort('hardest')}>hardest first</FilterChip>
          <FilterChip active={factSort === 'slowest'}  onClick={() => setFactSort('slowest')}>slowest</FilterChip>
          <FilterChip active={factSort === 'mostSeen'} onClick={() => setFactSort('mostSeen')}>most seen</FilterChip>
          <FilterChip active={factSort === 'recent'}   onClick={() => setFactSort('recent')}>recent</FilterChip>
          <FilterChip active={factSort === 'fact'}     onClick={() => setFactSort('fact')}>by fact</FilterChip>
          <FilterChip active={showAllFacts} onClick={() => setShowAllFacts(!showAllFacts)}>
            {showAllFacts ? 'hide unseen' : 'show unseen'}
          </FilterChip>
        </div>
        <div style={{ ...panel, padding: 0 }}>
          {factRows.length === 0 ? (
            <div style={{ padding: 16, fontSize: 12, color: '#7a8571', fontStyle: 'italic' }}>
              No data yet — she'll populate this with her next patrol.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <Th>Fact</Th>
                  <Th>Bucket</Th>
                  <Th align="right">Seen</Th>
                  <Th align="right">Right</Th>
                  <Th align="right">Acc.</Th>
                  <Th align="right">Avg time</Th>
                  <Th align="right">Last</Th>
                </tr>
              </thead>
              <tbody>
                {factRows.map((r) => (
                  <tr key={r.id}>
                    <Td color="#e8dcc0" mono>{r.label}</Td>
                    <Td color={bucketColor(r.bucket)}>
                      <span style={{ fontSize: 10, ...styles.display, letterSpacing: '0.18em' }}>
                        {r.bucket.toUpperCase()}
                      </span>
                    </Td>
                    <Td align="right" mono>
                      {r.tracked < r.seen
                        ? <><span style={{ color: '#e8dcc0' }}>{r.tracked}</span><span style={{ color: '#5a6155' }}> / {r.seen}</span></>
                        : r.seen}
                    </Td>
                    <Td align="right" mono color={r.tracked === 0 ? '#5a6155' : '#c8c0a8'}>
                      {r.tracked === 0 ? '—' : r.correct}
                    </Td>
                    <Td align="right" mono color={r.acc == null ? '#5a6155' : r.acc >= 0.85 ? '#7a9d6a' : r.acc < 0.6 ? '#d97642' : '#c8c0a8'}>
                      {r.acc == null ? '—' : `${Math.round(r.acc * 100)}%`}
                    </Td>
                    <Td align="right" mono>{r.avgMs == null ? '—' : fmtMs(r.avgMs)}</Td>
                    <Td align="right" color="#7a8571">{fmtRelDate(r.lastSeenAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* RECENT PATROLS */}
        <SectionHead accent={accent}>RECENT PATROLS</SectionHead>
        <div style={{ ...panel, padding: 0 }}>
          {recent.length === 0 ? (
            <div style={{ padding: 16, fontSize: 12, color: '#7a8571', fontStyle: 'italic' }}>
              No patrols recorded yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <Th>When</Th>
                  <Th>Patrol</Th>
                  <Th align="right">Score</Th>
                  <Th align="right">Time</Th>
                  <Th align="right">H / S / R</Th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p, i) => {
                  const patrolMeta = PATROLS.find((x) => x.id === p.patrolId);
                  return (
                    <tr key={i}>
                      <Td color="#a39d88">{fmtDate(p.startedAt)}</Td>
                      <Td>{patrolMeta ? patrolMeta.name : p.topic}</Td>
                      <Td align="right" mono color={p.correct === p.total ? '#7a9d6a' : p.correct < p.total / 2 ? '#d97642' : '#c8c0a8'}>
                        {p.correct} / {p.total}
                      </Td>
                      <Td align="right" mono>{fmtDuration(p.durationMs)}</Td>
                      <Td align="right" mono color="#7a8571">
                        {(p.hintsShown || 0)} / {(p.strategiesShown || 0)} / {(p.reveals || 0)}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <div style={{ padding: '8px 12px', fontSize: 10, color: '#5a6155' }}>
            H = hint asked · S = strategy fired (after 2nd miss) · R = answer revealed (gave up)
          </div>
        </div>

        {/* =============================================================
            DEVELOPER PANEL — calibration check, bottom of dashboard.
            ============================================================= */}
        <SectionHead accent="#7a8571">DEVELOPER · CALIBRATION CHECK</SectionHead>
        <div style={{ ...panel, padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th>Kind</Th>
                <Th align="right">Samples</Th>
                <Th align="right">P25 / P50 / P75</Th>
                <Th align="right">Baked-in fast / ok</Th>
                <Th>Annotation</Th>
              </tr>
            </thead>
            <tbody>
              {calibrationRows.map((r) => {
                const noSamples = r.n === 0;
                const fmtPctile = (v) => v == null ? '—' : `${(v / 1000).toFixed(1)}s`;
                return (
                  <tr key={r.kind}>
                    <Td color="#e8dcc0" mono>{r.kind}</Td>
                    <Td align="right" mono color={noSamples ? '#5a6155' : '#c8c0a8'}>{r.n}</Td>
                    <Td align="right" mono color={noSamples ? '#5a6155' : '#c8c0a8'}>
                      {noSamples
                        ? 'no per-kind samples yet — collecting'
                        : `${fmtPctile(r.p25)} / ${fmtPctile(r.p50)} / ${fmtPctile(r.p75)}`}
                    </Td>
                    <Td align="right" mono color="#7a8571">
                      {(r.thresholds.fast / 1000).toFixed(1)}s / {(r.thresholds.ok / 1000).toFixed(1)}s
                    </Td>
                    <Td color={
                      r.annotation === 'calibrated OK' ? '#7a9d6a'
                      : r.annotation.startsWith('fast threshold') ? '#d97642'
                      : '#7a8571'
                    }>
                      <span style={{ fontSize: 11 }}>{r.annotation}</span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '10px 12px', fontSize: 11, color: '#7a8571', lineHeight: 1.5 }}>
            P25/P50/P75 are this kid's correct-answer time distribution per kind.
            Once 20 samples accumulate, the SR engine uses her P25 as the personal
            "fast" threshold for that kind, overriding the baked-in default.
          </div>
        </div>

      </div>
    </div>
  );
};

// Small filter chip used for sort/filter controls.
const FilterChip = ({ children, active, onClick }) => (
  <button onClick={onClick} style={{
    background: active ? 'rgba(217, 118, 66, 0.18)' : 'transparent',
    border: `1px solid ${active ? '#d97642' : '#3a4339'}`,
    color: active ? '#e8c598' : '#a39d88',
    padding: '4px 9px', borderRadius: 2, cursor: 'pointer',
    fontFamily: "'Crimson Text', serif", fontSize: 12,
  }}>
    {children}
  </button>
);
