import React from 'react';
import { styles, panel } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CLANS } from '../../data/clans.js';
import { ACHIEVEMENTS, CATEGORY_ORDER, CATEGORY_LABELS } from '../../data/achievements.js';
import { earnedCount, totalCount } from '../../engine/achievements.js';

// HonorsView — book-faithful "Honors" list. Reachable from the Den.
// Earned entries show in full color with their lore line. Unearned entries
// show greyed-out with just the description (no lore spoiler).

export const HonorsView = ({ profile, onBack }) => {
  const clan = CLANS.find((c) => c.name === profile?.clan) || CLANS[0];
  const accent = clan.accent;

  const earnedSet = new Set(
    Array.isArray(profile?.achievementsEarned) ? profile.achievementsEarned : [],
  );
  const earned = earnedCount(profile);
  const total = totalCount();

  // Group catalog by category, preserving CATEGORY_ORDER.
  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    label: CATEGORY_LABELS[cat] || cat.toUpperCase(),
    entries: ACHIEVEMENTS.filter((a) => a.category === cat),
  })).filter((g) => g.entries.length > 0);

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 18, marginTop: 8 }}>
          <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 6 }}>
            ⟡  HONORS  ⟡
          </div>
          <div style={{ ...styles.display, fontSize: 22, color: accent, fontWeight: 700, letterSpacing: '0.08em' }}>
            {earned} / {total}
          </div>
          <div style={{ fontSize: 12, color: '#a39d88', fontStyle: 'italic', marginTop: 4 }}>
            Named recognitions earned along the path.
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.cat} style={{ marginBottom: 18 }}>
            <div style={{
              ...styles.display, fontSize: 10, letterSpacing: '0.3em',
              color: '#7a8571', marginBottom: 10, textAlign: 'center',
            }}>
              ⟡  {g.label}  ⟡
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {g.entries.map((a) => {
                const isEarned = earnedSet.has(a.id);
                return (
                  <div key={a.id} style={{
                    ...panel,
                    marginBottom: 0,
                    padding: '12px 14px',
                    opacity: isEarned ? 1 : 0.5,
                    borderColor: isEarned ? '#3a4339' : '#2a3329',
                    background: isEarned ? 'rgba(26, 36, 25, 0.55)' : 'rgba(26, 36, 25, 0.3)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        ...styles.display, fontSize: 13, letterSpacing: '0.12em',
                        color: isEarned ? accent : '#7a8571', fontWeight: 600,
                      }}>
                        {a.name.toUpperCase()}
                      </div>
                      <div style={{
                        ...styles.display, fontSize: 11, letterSpacing: '0.25em',
                        color: isEarned ? '#d97642' : '#5a6155',
                        flexShrink: 0,
                      }}>
                        {isEarned ? 'EARNED' : '—'}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#c8c0a8', marginTop: 6 }}>
                      {a.description}
                    </div>
                    {isEarned && a.lore && (
                      <div style={{
                        fontSize: 12, color: '#e8dcc0', fontStyle: 'italic',
                        marginTop: 6, paddingTop: 6,
                        borderTop: '1px dotted rgba(122, 133, 113, 0.25)',
                      }}>
                        {a.lore}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button onClick={onBack} style={{
          width: '100%', padding: '14px',
          background: 'transparent',
          border: `1px solid ${accent}`,
          color: accent,
          ...styles.display, fontSize: 12, letterSpacing: '0.3em',
          cursor: 'pointer', borderRadius: 2,
          marginTop: 12, marginBottom: 32,
        }}>
          RETURN TO DEN
        </button>
      </div>
    </div>
  );
};
