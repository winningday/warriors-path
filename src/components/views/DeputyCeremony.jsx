import React from 'react';
import { styles, panel, btnPrimary } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CLANS, LEADERS_BY_CLAN } from '../../data/clans.js';
import { getFullName } from '../../engine/rank.js';

export const DeputyCeremony = ({ profile, onContinue }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const leader = LEADERS_BY_CLAN[profile.clan];
  const fullName = getFullName(profile);

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 10, ...styles.display }}>
            DEPUTY CEREMONY
          </div>
          <h2 style={{ ...styles.display, fontSize: 24, margin: 0, color: clan.accent, fontWeight: 600 }}>
            BEFORE MOONHIGH
          </h2>
        </div>

        <div style={panel}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
            <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{leader}</strong> stands on the Highrock as the moon climbs. The Clan gathers below, expectant. The previous deputy has stepped aside.
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            "<em>I say these words before StarClan, that the spirits of our ancestors may hear and approve my choice.</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            "<em><strong style={{ color: clan.accent, fontStyle: 'normal' }}>{fullName}</strong>, do you accept the duty of deputy — to serve {profile.clan}, to protect every cat from kit to elder, and to stand at my side for as long as you live?</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            "<em>I do.</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            "<em>Then from this moment, {fullName} will be the new deputy of {profile.clan}. May StarClan watch over your every step.</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.7, color: '#a39d88' }}>
            The Clan murmurs your name in approval. You dip your head to {leader}, then to your Clanmates. From this night, you stand at the leader's side.
          </p>
        </div>

        <button onClick={onContinue} style={btnPrimary(clan.accent)}>
          I DO. I ACCEPT.
        </button>
      </div>
    </div>
  );
};
