import React from 'react';
import { styles, btnPrimary, loadFromFileLink } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CLANS } from '../../data/clans.js';
import { getFullName } from '../../engine/rank.js';

export const SlotListView = ({ container, onSelect, onNew, onDelete, onImport }) => (
  <div style={styles.root}>
    <FontLoader />
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 12px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 8, ...styles.display }}>
          THE NURSERY · THE WARRIORS' DEN
        </div>
        <h2 style={{ ...styles.display, fontSize: 28, margin: 0, color: '#e8dcc0', fontWeight: 600 }}>
          CHOOSE YOUR CAT
        </h2>
      </div>

      <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
        {container.slots.map((s) => {
          const clan = CLANS.find((c) => c.name === s.clan);
          const fullName = getFullName(s);
          return (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'stretch', gap: 8,
            }}>
              <button onClick={() => onSelect(s.id)} style={{
                flex: 1,
                background: 'rgba(26, 36, 25, 0.5)',
                border: '1px solid #2a3329',
                padding: '14px 16px',
                color: '#e8dcc0',
                cursor: 'pointer',
                borderRadius: 2,
                textAlign: 'left',
              }}>
                <div style={{ ...styles.display, fontSize: 18, color: clan.accent, fontWeight: 700, letterSpacing: '0.05em' }}>
                  {fullName.toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: '#a39d88', marginTop: 4, fontStyle: 'italic' }}>
                  {s.rank} · {s.clan} · {s.furColor.toLowerCase()} pelt · {s.eyeColor.toLowerCase()} eyes
                </div>
                <div style={{ fontSize: 11, color: '#7a8571', marginTop: 4 }}>
                  {s.totalCorrect} correct · streak {s.streak || 0}
                </div>
              </button>
              <button onClick={() => onDelete(s.id)} title="forget this Clan cat" style={{
                background: 'transparent',
                border: '1px solid #3a2929',
                color: '#7a4a4a',
                cursor: 'pointer',
                padding: '0 12px',
                fontSize: 12,
                borderRadius: 2,
                fontFamily: "'Crimson Text', serif",
              }}>
                forget
              </button>
            </div>
          );
        })}
      </div>

      <button onClick={onNew} style={btnPrimary('#d97642')}>
        + NEW APPRENTICE
      </button>
      <label style={loadFromFileLink}>
        load saved Clan cat from file
        <input type="file" accept="application/json,.json" onChange={onImport} style={{ display: 'none' }} />
      </label>
    </div>
  </div>
);
