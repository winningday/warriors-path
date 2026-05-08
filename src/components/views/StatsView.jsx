import React, { useMemo, useState } from 'react';
import { styles, panel } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CLANS } from '../../data/clans.js';
import { PATROLS } from '../../data/ranks.js';
import {
  SR_BUCKET, SR_FAST_MS, SR_OK_MS,
  HISTOGRAM_BUCKETS, parseFactId,
} from '../../engine/sr.js';

// =====================================================================
// Parent dashboard — visual stats only, no settings.
// Reached from the discreet ornament at the bottom of the Den view.
// =====================================================================

const TOPICS = [
  { id: 'mult',     label: 'Multiplication',  patrol: 'Training Patrol' },
  { id: 'add',      label: 'Addition / Subtraction', patrol: 'Hunting Patrol' },
  { id: 'geometry', label: 'Perimeter / Area',  patrol: 'Border Patrol' },
  { id: 'fraction', label: 'Fractions',         patrol: 'Herb Patrol' },
  { id: 'time',     label: 'Time',              patrol: 'Vigil' },
];

const HISTOGRAM_LABELS = {
  under2s:  '< 2s',
  '2to4s':  '2–4s',
  '4to7s':  '4–7s',
  '7to10s': '7–10s',
  '10to20s':'10–20s',
  over20s:  '> 20s',
};

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

const factLabel = (id) => {
  const p = parseFactId(id);
  if (!p) return id;
  return p.kind === 'mult' ? `${p.a} × ${p.b}` : `${p.a} + ${p.b}`;
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
  const avgPerPatrol = history.length ? overview.totalDuration / history.length : 0;
  const avgPerProblem = attemptedTotal ? overview.totalDuration / attemptedTotal : 0;

  // ----- Histogram -----
  const histTotal = HISTOGRAM_BUCKETS.reduce((s, b) => s + (hist[b] || 0), 0);

  // ----- Per-fact rows -----
  const factRows = useMemo(() => {
    const rows = [];
    for (const [id, e] of Object.entries(sr)) {
      const parsed = parseFactId(id);
      if (!parsed || parsed.kind !== factKind) continue;
      const seen = e.seen || 0;
      if (!showAllFacts && seen === 0) continue;
      const correct = e.correctCount || 0;
      const wrong = e.wrongCount || 0;
      // Pre-v15c saves preserved `seen` but never tracked correct/wrong/elapsed.
      // Compute accuracy and avg time only over the analytics-era sample so
      // we don't show "0%" for a fact she's actually been answering correctly.
      const tracked = correct + wrong;
      const acc = tracked > 0 ? correct / tracked : null;
      const avgMs = correct > 0 ? (e.totalCorrectMs || 0) / correct : null;
      rows.push({
        id, label: factLabel(id), bucket: e.bucket || SR_BUCKET.WILD,
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

        {/* PER-FACT TABLE */}
        <SectionHead accent={accent}>PER-FACT BREAKDOWN</SectionHead>
        <div style={{ fontSize: 11, color: '#7a8571', marginBottom: 10, lineHeight: 1.5 }}>
          Bucket, seen count, and "last" are preserved from older saves. "Right",
          "Acc.", and "Avg time" track only attempts since v15.0.0-c — earlier
          attempts didn't record per-attempt outcomes or timing, so those columns
          show "—" until she answers a fact again.
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: '#7a8571' }}>Show:</span>
          <FilterChip active={factKind === 'mult'} onClick={() => setFactKind('mult')}>multiplication</FilterChip>
          <FilterChip active={factKind === 'add'}  onClick={() => setFactKind('add')}>addition</FilterChip>
          <span style={{ color: '#7a8571', marginLeft: 8 }}>Sort:</span>
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
              No {factKind === 'mult' ? 'multiplication' : 'addition'} facts seen yet.
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
                    <Td align="right" mono>{r.seen}</Td>
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
