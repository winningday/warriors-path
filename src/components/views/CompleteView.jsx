import React from 'react';
import { styles, rewardSummary } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { RewardTable } from '../shared/RewardTable.jsx';
import { CLANS } from '../../data/clans.js';
import { getFullName } from '../../engine/rank.js';

export const CompleteView = ({ profile, patrol, onReturn }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const fullName = getFullName(profile);
  const perfect = patrol.correct === patrol.problems.length;
  const rankUp = !!profile._rankUp && profile._previousRank && profile._previousRank !== profile.rank;
  // Group rewards
  const preyCounts = (patrol.rewards.prey || []).reduce((acc, p) => { acc[p] = (acc[p] || 0) + 1; return acc; }, {});
  const herbCounts = (patrol.rewards.herbs || []).reduce((acc, h) => { acc[h] = (acc[h] || 0) + 1; return acc; }, {});

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 520, margin: '0 auto', paddingTop: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {rankUp && (
            <div style={{
              padding: '16px 20px',
              background: 'rgba(217, 118, 66, 0.1)',
              border: `1px solid ${clan.accent}`,
              marginBottom: 22,
              borderRadius: 2,
            }}>
              <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.4em', color: clan.accent, marginBottom: 6 }}>
                ⟡  CEREMONY  ⟡
              </div>
              <div style={{ fontSize: 17, color: '#e8dcc0', fontStyle: 'italic' }}>
                You are now a <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{profile.rank}</strong>.
              </div>
              <div style={{ fontSize: 13, color: '#a39d88', marginTop: 6 }}>
                {fullName} of {profile.clan}.
              </div>
            </div>
          )}

          <div style={{ fontSize: 11, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 12, ...styles.display }}>
            {patrol.type.name.toUpperCase()} COMPLETE
          </div>
          <div style={{ ...styles.display, fontSize: 32, color: clan.accent, fontWeight: 700 }}>
            {patrol.correct} / {patrol.problems.length}
          </div>
          <div style={{ fontSize: 13, color: '#a39d88', fontStyle: 'italic', marginTop: 8 }}>
            {perfect          ? 'A flawless patrol. The Clan sings your name tonight.' :
             patrol.correct >= 4 ? 'Strong work. Your mentor flicks an ear in approval.' :
             patrol.correct >= 2 ? 'You served the Clan today. Rest now.' :
                                   'Every warrior stumbles. Return tomorrow and try again.'}
          </div>
        </div>

        {Object.keys(preyCounts).length > 0 && (
          <RewardTable title="FRESH-KILL PILE" rows={preyCounts} accent={clan.accent} kind="prey" />
        )}
        {Object.keys(herbCounts).length > 0 && (
          <RewardTable title="HERB STORES" rows={herbCounts} accent={clan.accent} kind="herb" />
        )}
        {patrol.rewards.borders > 0 && (
          <div style={rewardSummary}>
            <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571', marginBottom: 8, textAlign: 'center' }}>
              BORDER TENDED
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#c8c0a8', fontStyle: 'italic' }}>
              You refreshed the scent at {patrol.rewards.borders} marker{patrol.rewards.borders === 1 ? '' : 's'} along the boundary.
            </div>
          </div>
        )}
        {patrol.rewards.training > 0 && (
          <div style={rewardSummary}>
            <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571', marginBottom: 8, textAlign: 'center' }}>
              TRAINING
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#c8c0a8', fontStyle: 'italic' }}>
              {patrol.rewards.training} clean move{patrol.rewards.training === 1 ? '' : 's'} on the training ground.
            </div>
          </div>
        )}
        {patrol.rewards.vigils > 0 && (
          <div style={rewardSummary}>
            <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571', marginBottom: 8, textAlign: 'center' }}>
              VIGIL HELD
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#c8c0a8', fontStyle: 'italic' }}>
              {patrol.rewards.vigils} silent watch{patrol.rewards.vigils === 1 ? '' : 'es'} kept under the stars.
            </div>
          </div>
        )}

        <button onClick={onReturn} style={{
          width: '100%', padding: '16px',
          background: 'transparent',
          border: `1px solid ${clan.accent}`,
          color: clan.accent,
          ...styles.display, fontSize: 13, letterSpacing: '0.3em',
          cursor: 'pointer', borderRadius: 2,
          marginTop: 12,
        }}>
          RETURN TO CAMP
        </button>
      </div>
    </div>
  );
};
