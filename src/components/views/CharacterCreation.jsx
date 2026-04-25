import React, { useState } from 'react';
import { styles, panel, labelStyle, chipStyle, inputStyle, btnPrimary } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CLANS, FUR_COLORS, EYE_COLORS, KIT_PREFIX_OPTIONS } from '../../data/clans.js';

export const CharacterCreation = ({ onCreate, onCancel }) => {
  const [prefix, setPrefix]       = useState('Moss');
  const [clan, setClan]           = useState(CLANS[0].name);
  const [furColor, setFurColor]   = useState('Grey');
  const [eyeColor, setEyeColor]   = useState('Amber');
  const [customPrefix, setCustom] = useState('');

  const finalPrefix = customPrefix.trim() || prefix;
  const clanObj = CLANS.find((c) => c.name === clan);

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 8px' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 12, ...styles.display }}>
            IN THE NURSERY
          </div>
          <h2 style={{ ...styles.display, fontSize: 26, margin: 0, color: '#e8dcc0', fontWeight: 600 }}>
            YOUR MOTHER NAMES YOU
          </h2>
          <div style={{ fontSize: 14, color: '#a39d88', fontStyle: 'italic', marginTop: 8, lineHeight: 1.5 }}>
            She licks your fur flat, looks down at you, and decides on a name. Help her choose.
          </div>
        </div>

        <div style={panel}>
          <label style={labelStyle}>YOUR KIT NAME (prefix only)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {KIT_PREFIX_OPTIONS.map((p) => (
              <button key={p} onClick={() => { setPrefix(p); setCustom(''); }} style={{
                ...chipStyle,
                background: (customPrefix === '' && prefix === p) ? clanObj.accent : 'transparent',
                color: (customPrefix === '' && prefix === p) ? '#0a0f0a' : '#c8c0a8',
                borderColor: (customPrefix === '' && prefix === p) ? clanObj.accent : '#3a4339',
              }}>{p}</button>
            ))}
          </div>
          <input type="text" placeholder="Or type your own prefix..." value={customPrefix}
            onChange={(e) => setCustom(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            maxLength={12} style={inputStyle} />
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 18, color: '#e8dcc0' }}>
            "Welcome, little one. You are <strong style={{ color: clanObj.accent }}>{finalPrefix}kit</strong>."
          </div>
        </div>

        <div style={panel}>
          <label style={labelStyle}>YOUR CLAN</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {CLANS.map((c) => (
              <button key={c.name} onClick={() => setClan(c.name)} style={{
                padding: '14px 10px',
                background: clan === c.name ? 'rgba(217, 118, 66, 0.1)' : 'transparent',
                border: `1px solid ${clan === c.name ? c.accent : '#3a4339'}`,
                color: clan === c.name ? c.accent : '#c8c0a8',
                cursor: 'pointer', borderRadius: 2, textAlign: 'left',
              }}>
                <div style={{ ...styles.display, fontSize: 12, letterSpacing: '0.15em', marginBottom: 4 }}>
                  {c.name.toUpperCase()}
                </div>
                <div style={{ fontSize: 11, opacity: 0.8, fontStyle: 'italic' }}>{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={panel}>
          <label style={labelStyle}>PELT</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {FUR_COLORS.map((f) => (
              <button key={f} onClick={() => setFurColor(f)} style={{
                ...chipStyle,
                background: furColor === f ? clanObj.accent : 'transparent',
                color: furColor === f ? '#0a0f0a' : '#c8c0a8',
                borderColor: furColor === f ? clanObj.accent : '#3a4339',
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ ...panel, marginBottom: 24 }}>
          <label style={labelStyle}>EYES</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EYE_COLORS.map((e) => (
              <button key={e} onClick={() => setEyeColor(e)} style={{
                ...chipStyle,
                background: eyeColor === e ? clanObj.accent : 'transparent',
                color: eyeColor === e ? '#0a0f0a' : '#c8c0a8',
                borderColor: eyeColor === e ? clanObj.accent : '#3a4339',
              }}>{e}</button>
            ))}
          </div>
        </div>

        <button onClick={() => onCreate({ prefix: finalPrefix, clan, furColor, eyeColor })} style={btnPrimary(clanObj.accent)}>
          ENTER THE FOREST
        </button>
        <button onClick={onCancel} style={{
          width: '100%', background: 'transparent', border: 'none', color: '#5a6155',
          fontSize: 11, marginTop: 6, cursor: 'pointer', textDecoration: 'underline',
          fontFamily: "'Crimson Text', serif", letterSpacing: '0.1em',
        }}>
          back
        </button>
      </div>
    </div>
  );
};
