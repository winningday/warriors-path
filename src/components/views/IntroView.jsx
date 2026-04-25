import React from 'react';
import { styles, btnPrimary, btnSecondary, loadFromFileLink } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';

export const IntroView = ({ onStart, onImport, hasSlots, onChooseSlot }) => (
  <div style={styles.root}>
    <FontLoader />
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 12px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.5em', color: '#7a8571', marginBottom: 16, ...styles.display }}>
          A TALE FROM THE CLANS
        </div>
        <h1 style={{ ...styles.display, fontSize: 42, margin: 0, color: '#e8dcc0', fontWeight: 700, lineHeight: 1.1 }}>
          THE WARRIOR'S PATH
        </h1>
        <div style={{ width: 80, height: 1, background: '#7a8571', margin: '24px auto' }} />
        <div style={{ fontSize: 16, color: '#a39d88', fontStyle: 'italic', lineHeight: 1.6 }}>
          Every warrior was once a kit in the nursery.<br />
          Every leader began with a name ending in -paw.
        </div>
      </div>
      <div style={{ background: 'rgba(26, 36, 25, 0.5)', border: '1px solid #2a3329', padding: '28px 24px', borderRadius: 2, marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: '#c8c0a8' }}>
          You will be named in the nursery. The leader will call you to the Highrock and make you an apprentice. You will train with your mentor, hunt for your Clan, walk the borders, and learn the herbs.
        </p>
        <p style={{ margin: '16px 0 0', fontSize: 17, lineHeight: 1.7, color: '#c8c0a8' }}>
          No timers. No pressure. Only the path.
        </p>
      </div>

      {hasSlots && (
        <button onClick={onChooseSlot} style={btnPrimary('#d97642')}>
          CONTINUE A CLAN CAT
        </button>
      )}

      <button onClick={onStart} style={hasSlots ? btnSecondary('#d97642') : btnPrimary('#d97642')}>
        BEGIN A NEW JOURNEY
      </button>

      <label style={loadFromFileLink}>
        load saved Clan cat from file
        <input type="file" accept="application/json,.json" onChange={onImport} style={{ display: 'none' }} />
      </label>
    </div>
  </div>
);
