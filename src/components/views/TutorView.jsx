import React, { useCallback, useEffect, useState } from 'react';
import { styles, panel, labelStyle } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { StatCard } from '../shared/StatCard.jsx';
import { CLANS } from '../../data/clans.js';
import { getFullName } from '../../engine/rank.js';
import { tutorReport } from '../../engine/tutorReport.js';

// Read-only mentor dashboard, reached via ?tutor=<key>. Written for the adult
// reading it, not the player: plain English, no lore framing, no mutations,
// no timers, no auto-refresh.

const BUCKET_COLORS = {
  unseen: '#1a2419',
  wild: '#7a4a3a',
  tracking: '#8a7a3a',
  trusted: '#3a6a4a',
};

const LEGEND = [
  { bucket: 'unseen', text: 'Unseen: not practiced yet' },
  { bucket: 'wild', text: 'Wild: new or recently missed' },
  { bucket: 'tracking', text: 'Tracking: correct once or twice' },
  { bucket: 'trusted', text: 'Trusted: three or more correct in a row' },
];

const seconds = (ms) => (ms == null ? '-' : `${(ms / 1000).toFixed(1)}s`);

const bucketSummary = (b) =>
  `${b.trusted} trusted, ${b.tracking} tracking, ${b.wild} wild` +
  (b.unseen > 0 ? `, ${b.unseen} unseen` : '');

const noteStyle = { fontSize: 11, color: '#7a8571', fontStyle: 'italic', marginTop: 10 };

// Expand the report's 66 normalized pairs (a <= b) into a full symmetric
// 11 x 11 times table: rows a = 2..12, columns b = 2..12, each cell looking
// up the normalized fact (lo x hi).
const buildSymmetricMultCells = (multGrid) => {
  const byPair = new Map(multGrid.map((cell) => [`${cell.a}x${cell.b}`, cell]));
  const cells = [];
  for (let a = 2; a <= 12; a++) {
    for (let b = 2; b <= 12; b++) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      cells.push({ a, b, key: `${a}x${b}`, fact: byPair.get(`${lo}x${hi}`) });
    }
  }
  return cells;
};

const refreshBtn = {
  background: 'transparent',
  border: 'none',
  color: '#7a8571',
  fontSize: 11,
  cursor: 'pointer',
  textDecoration: 'underline',
  letterSpacing: '0.1em',
  fontFamily: "'Crimson Text', serif",
  padding: 0,
  marginTop: 8,
};

export const TutorView = ({ tutorKey }) => {
  const [state, setState] = useState({ status: 'loading', doc: null });

  const load = useCallback(() => {
    setState({ status: 'loading', doc: null });
    fetch(`/api/tutor/${encodeURIComponent(tutorKey)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json();
      })
      .then((doc) => setState({ status: 'loaded', doc }))
      .catch(() => setState({ status: 'error', doc: null }));
  }, [tutorKey]);

  useEffect(() => { load(); }, [load]);

  const frame = (children) => (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 32 }}>
        {children}
      </div>
    </div>
  );

  if (state.status === 'loading') {
    return frame(
      <div style={{ textAlign: 'center', fontSize: 13, color: '#a39d88', fontStyle: 'italic' }}>
        Loading progress report...
      </div>
    );
  }

  if (state.status === 'error') {
    return frame(
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#a39d88', fontStyle: 'italic' }}>
          Could not load progress for this link. It may not have synced yet, or the
          server may be unreachable. Ask the player to complete a patrol with sharing
          on, then refresh.
        </div>
        <button onClick={load} style={refreshBtn}>refresh</button>
      </div>
    );
  }

  const { updatedAt, profile } = state.doc;
  const report = tutorReport(profile);
  const clan = CLANS.find((c) => c.name === profile.clan);
  const accent = clan ? clan.accent : '#8fc28a';

  return frame(
    <>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 10 }}>
          MENTOR'S PROGRESS REPORT
        </div>
        <div style={{ ...styles.display, fontSize: 28, color: accent, fontWeight: 700 }}>
          {getFullName(profile)}
        </div>
        <div style={{ fontSize: 13, color: '#a39d88', marginTop: 4 }}>
          {profile.clan} · {profile.rank}
        </div>
        <div style={{ fontSize: 11, color: '#7a8571', marginTop: 4 }}>
          Updated {new Date(updatedAt).toLocaleString()}
        </div>
        <button onClick={load} style={refreshBtn}>refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        <StatCard
          label="ACCURACY"
          value={report.accuracy === null ? '-' : `${Math.round(report.accuracy * 100)}%`}
          sub="all time"
          accent={accent}
        />
        <StatCard
          label="CORRECT"
          value={profile.totalCorrect || 0}
          sub={`of ${profile.totalAttempted || 0} attempted`}
          accent={accent}
        />
        <StatCard
          label="STREAK"
          value={profile.streak || 0}
          sub={(profile.streak || 0) === 1 ? 'day' : 'days'}
          accent={accent}
        />
        <StatCard
          label="PATROLS"
          value={profile.patrolsToday || 0}
          sub="today"
          accent={accent}
        />
      </div>

      <div style={panel}>
        <span style={labelStyle}>MULTIPLICATION FACTS 2 TO 12</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 3 }}>
          {buildSymmetricMultCells(report.multGrid).map(({ a, b, key, fact }) => (
            <div
              key={key}
              title={`${a} × ${b}: streak ${fact.correctStreak}, seen ${fact.seen}`}
              style={{
                background: BUCKET_COLORS[fact.bucket],
                border: '1px solid #2a3329',
                borderRadius: 2,
                padding: '5px 0',
                textAlign: 'center',
                fontSize: 9,
                color: fact.bucket === 'unseen' ? '#5a6155' : '#e8dcc0',
              }}
            >
              {a}×{b}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 12 }}>
          {LEGEND.map((item) => (
            <div key={item.bucket} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a39d88' }}>
              <span style={{
                width: 10,
                height: 10,
                background: BUCKET_COLORS[item.bucket],
                border: '1px solid #3a4339',
                borderRadius: 2,
                display: 'inline-block',
              }} />
              {item.text}
            </div>
          ))}
        </div>
        <div style={noteStyle}>
          Addition facts: {bucketSummary(report.buckets.add)}. Subtraction facts: {bucketSummary(report.buckets.sub)}.
        </div>
      </div>

      <div style={panel}>
        <span style={labelStyle}>RECENT WINS</span>
        {report.recentWins.length === 0 ? (
          <div style={{ fontSize: 13, color: '#7a8571', fontStyle: 'italic' }}>
            No facts moved up a level in the last two days.
          </div>
        ) : (
          report.recentWins.map((win) => (
            <div key={win.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
              <span style={{ fontSize: 14, color: '#e8dcc0' }}>{win.label}</span>
              <span style={{ fontSize: 11, color: '#7a8571' }}>{new Date(win.promotedAt).toLocaleString()}</span>
            </div>
          ))
        )}
        <div style={noteStyle}>Facts that moved up a mastery level in the last 48 hours.</div>
      </div>

      <div style={panel}>
        <span style={labelStyle}>SPEED BY SESSION</span>
        {report.speedByDay.length === 0 ? (
          <div style={{ fontSize: 13, color: '#7a8571', fontStyle: 'italic' }}>
            No sessions recorded yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: '#c8c0a8' }}>
            <tbody>
              {report.speedByDay.map((day) => (
                <tr key={day.date} style={{ borderBottom: '1px solid #2a3329' }}>
                  <td style={{ padding: '6px 8px 6px 0', color: '#a39d88', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                    {day.date}
                  </td>
                  <td style={{ padding: '6px 0' }}>
                    {day.rounds.map((round) => (
                      <span key={round.round} style={{ display: 'inline-block', marginRight: 12, whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#7a8571' }}>R{round.round}</span> {seconds(round.medianMs)}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {report.typicalFatigueRound !== null && (
          <div style={{ fontSize: 12, color: '#a39d88', fontStyle: 'italic', marginTop: 10 }}>
            Speed usually stops improving around multiplication round {report.typicalFatigueRound}; the game suggests rest one round earlier.
          </div>
        )}
        <div style={noteStyle}>Multiplication rounds only, median seconds per answer. Times are internal only; the player never sees them.</div>
      </div>
    </>
  );
};
