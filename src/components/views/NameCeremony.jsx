import React, { useState } from 'react';
import { styles, panel, labelStyle, chipStyle, inputStyle, btnPrimary } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CLANS, LEADERS_BY_CLAN, MEDICINE_CATS_BY_CLAN, WARRIOR_SUFFIXES, MEDICINE_SUFFIXES } from '../../data/clans.js';

export const NameCeremony = ({ profile, ceremony, onComplete }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const leader = LEADERS_BY_CLAN[profile.clan];
  const isMed = ceremony === 'medicine';
  const mentorName = profile.mentor || (isMed ? MEDICINE_CATS_BY_CLAN[profile.clan] : 'Lionheart');
  const suffixOptions = isMed ? MEDICINE_SUFFIXES : WARRIOR_SUFFIXES;
  const [suffix, setSuffix] = useState(suffixOptions[0]);
  const [custom, setCustom] = useState('');
  const finalSuffix = (custom.trim() || suffix).toLowerCase();

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 10, ...styles.display }}>
            {isMed ? 'MEDICINE CAT CEREMONY' : 'WARRIOR CEREMONY'}
          </div>
          <h2 style={{ ...styles.display, fontSize: 24, margin: 0, color: clan.accent, fontWeight: 600 }}>
            BY MOONLIGHT AT THE HIGHROCK
          </h2>
        </div>

        <div style={panel}>
          {isMed ? (
            <>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
                You stand at the Moonstone with <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{mentorName}</strong>. The night is silver. The Clan waits below.
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>{profile.prefix}paw, do you promise to use your skills to heal and aid your Clan?</em>"
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>I do.</em>"
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>Then by the powers of StarClan, I give you your true name as a medicine cat. {profile.prefix}paw, from this moment you will be known as...</em>"
              </p>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
                <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{leader}</strong> stands on the Highrock and calls the Clan together. <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{mentorName}</strong> stands beside you, tail proudly raised.
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>I, {leader}, leader of {profile.clan}, call upon my warrior ancestors to look down on this apprentice. {profile.prefix}paw has trained hard to understand the ways of your noble code, and I commend her to you as a warrior in her turn.</em>"
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>{profile.prefix}paw, do you promise to uphold the warrior code, even at the cost of your life?</em>"
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>I do.</em>"
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                "<em>Then by the powers of StarClan, I give you your warrior name. {profile.prefix}paw, from this moment you will be known as...</em>"
              </p>
            </>
          )}
        </div>

        <div style={panel}>
          <label style={labelStyle}>CHOOSE YOUR SUFFIX</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {suffixOptions.map((s) => (
              <button key={s} onClick={() => { setSuffix(s); setCustom(''); }} style={{
                ...chipStyle,
                background: (custom === '' && suffix === s) ? clan.accent : 'transparent',
                color: (custom === '' && suffix === s) ? '#0a0f0a' : '#c8c0a8',
                borderColor: (custom === '' && suffix === s) ? clan.accent : '#3a4339',
              }}>{s}</button>
            ))}
          </div>
          <input type="text" placeholder="Or type your own suffix..." value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            maxLength={12} style={inputStyle} />
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 22, color: '#e8dcc0', ...styles.display, letterSpacing: '0.05em' }}>
            <strong style={{ color: clan.accent }}>{profile.prefix}{finalSuffix}</strong>
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#a39d88', fontStyle: 'italic' }}>
            "<em>{profile.clan} honors your courage and your hard work. We welcome you as a full {isMed ? 'medicine cat' : 'warrior'} of {profile.clan}.</em>"
          </div>
        </div>

        <button onClick={() => onComplete(finalSuffix)} disabled={!finalSuffix} style={btnPrimary(clan.accent)}>
          TAKE YOUR NAME
        </button>
      </div>
    </div>
  );
};
