import React from 'react';
import { styles, panel, btnPrimary } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CLANS, LEADERS_BY_CLAN, MEDICINE_CATS_BY_CLAN } from '../../data/clans.js';
import { getFullName } from '../../engine/rank.js';

export const LeaderCeremony = ({ profile, onContinue }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const oldLeader = LEADERS_BY_CLAN[profile.clan];
  const medCat = MEDICINE_CATS_BY_CLAN[profile.clan];
  const fullName = getFullName(profile); // already has -star applied in finishPatrol
  const oldName = profile.prefix + (profile._oldSuffix || 'foot');

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 10, ...styles.display }}>
            LEADER CEREMONY · AT THE MOONSTONE
          </div>
          <h2 style={{ ...styles.display, fontSize: 22, margin: 0, color: clan.accent, fontWeight: 600 }}>
            NINE LIVES BY MOONLIGHT
          </h2>
        </div>

        <div style={panel}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
            <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{oldLeader}</strong> has gone to walk with StarClan. The Clan grieves, but the Clan endures. As the deputy, you must travel to the Moonstone — and you do not go alone. <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{medCat}</strong>, the medicine cat, walks at your side to guide you. She has spoken to StarClan many times. Tonight, she will help you speak to them for the first time.
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            You travel through the night together. At the cave, {medCat} dips her head and tells you what to do.
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
            "<em>Lie down. Press your nose to the stone. Sleep, and they will come.</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            You press your nose to the cold stone. The cave fills with starlight. One by one, nine of your warrior ancestors come forward, each giving you a life and the strength to use it well. {medCat} watches in silence, guarding your sleeping body until you wake.
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            "<em>You are no longer {oldName}. From this moment you will be known as <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{fullName}</strong>, leader of {profile.clan}. StarClan honors your courage and your loyalty.</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.7, color: '#a39d88' }}>
            You wake at the Moonstone with nine lives in your chest. {medCat} touches her nose to your shoulder and walks you home through the dawn. When the Clan sees you, they raise their voices: <em>{fullName}! {fullName}!</em>
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.7, color: '#a39d88', fontStyle: 'italic' }}>
            (Your first task as leader will be to name your own deputy — but that is for another night.)
          </p>
        </div>

        <button onClick={onContinue} style={btnPrimary(clan.accent)}>
          RETURN TO YOUR CLAN
        </button>
      </div>
    </div>
  );
};
