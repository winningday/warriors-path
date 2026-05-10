import React from 'react';
import { styles, rewardSummary } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { RewardTable } from '../shared/RewardTable.jsx';
import { TrinketIcon } from '../art/TrinketIcon.jsx';
import { CLANS } from '../../data/clans.js';
import { getFullName } from '../../engine/rank.js';
import { trinketById } from '../../data/trinkets.js';

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

        {/* v15.0.0-f focus-bonus call-out — only when this patrol matched
            today's mentor focus and earned at least one bonus credit. */}
        {profile._isFocusPatrol && profile._focusBonus > 0 && (
          <div style={{
            ...rewardSummary,
            background: 'rgba(217, 118, 66, 0.1)',
            border: '1px solid rgba(217, 118, 66, 0.4)',
          }}>
            <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#d97642', marginBottom: 8, textAlign: 'center' }}>
              ⟡ MENTOR&apos;S FOCUS BONUS ⟡
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#e8c598', fontStyle: 'italic' }}>
              Your mentor smiles. Today&apos;s focus paid off — bonus rank credit earned.
            </div>
          </div>
        )}

        {/* v15.0.0-h Phase 3 — newly-earned Honor ceremony. One small block
            per Honor earned on this patrol (in practice 0 or 1; multiple
            possible in edge cases). Same dashed-border / orange-accent
            framing as the trinket-found callout. */}
        {Array.isArray(profile._newlyEarned) && profile._newlyEarned.length > 0 && (
          profile._newlyEarned.map((a) => (
            <div key={a.id} style={{
              ...rewardSummary,
              background: 'rgba(217, 118, 66, 0.08)',
              border: '1px dashed rgba(217, 118, 66, 0.55)',
            }}>
              <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#d97642', marginBottom: 8, textAlign: 'center' }}>
                ⟡ NEW HONOR ⟡
              </div>
              <div style={{
                textAlign: 'center', ...styles.display,
                fontSize: 16, color: clan.accent, fontWeight: 700, letterSpacing: '0.1em',
                marginBottom: 6,
              }}>
                {a.name.toUpperCase()}
              </div>
              <div style={{ textAlign: 'center', fontSize: 13, color: '#e8dcc0', marginBottom: 4 }}>
                {a.description}
              </div>
              {a.lore && (
                <div style={{
                  textAlign: 'center', fontSize: 12, color: '#a39d88',
                  fontStyle: 'italic', marginTop: 6, lineHeight: 1.5,
                }}>
                  {a.lore}
                </div>
              )}
            </div>
          ))
        )}

        {/* v15.0.0-f trinket drop — small keepsake from this patrol.
            Lives in "Your Nest" once collected. */}
        {profile._trinketFound && (
          <div style={{
            ...rewardSummary,
            background: 'rgba(122, 133, 113, 0.08)',
            border: '1px dashed rgba(168, 180, 145, 0.4)',
          }}>
            <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#a39d88', marginBottom: 8, textAlign: 'center' }}>
              ⟡ A SMALL FIND ⟡
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 64, height: 64,
                background: 'rgba(10, 15, 10, 0.55)',
                border: '1px solid rgba(168, 180, 145, 0.35)',
                borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrinketIcon
                  id={profile._trinketFound.id}
                  imageSrc={profile._trinketFound.imageSrc}
                  size={48}
                  alt={profile._trinketFound.name}
                />
              </div>
              <div style={{ textAlign: 'center', fontSize: 14, color: '#e8dcc0' }}>
                You bring home {profile._trinketFound.name}.
              </div>
            </div>
            {profile._trinketFound.origin && (
              <div style={{ textAlign: 'center', fontSize: 12, color: '#a39d88', fontStyle: 'italic', marginTop: 8, lineHeight: 1.5 }}>
                {profile._trinketFound.origin}
              </div>
            )}
          </div>
        )}

        {/* v15.0.0-h narrative beat — one-shot per patrol. Set by App.jsx in
            finishPatrol via rollRandomEvent() and cleared on RETURN TO CAMP.
            Pure flavor (no math); optional small reward via trinket. */}
        {profile._narrativeBeat && (() => {
          const beat = profile._narrativeBeat;
          const rewardTrinket = beat.reward?.trinketId
            ? trinketById(beat.reward.trinketId)
            : null;
          return (
            <div style={{
              ...rewardSummary,
              background: 'rgba(168, 180, 145, 0.06)',
              border: '1px dashed rgba(217, 118, 66, 0.45)',
            }}>
              <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#d97642', marginBottom: 8, textAlign: 'center' }}>
                ⟡ {beat.name.toUpperCase()} ⟡
              </div>
              <div style={{ fontSize: 13, color: '#c8c0a8', fontStyle: 'italic', lineHeight: 1.6, textAlign: 'center' }}>
                {beat.story}
              </div>
              {rewardTrinket && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: '1px dotted rgba(168, 180, 145, 0.25)',
                }}>
                  <div style={{
                    width: 48, height: 48,
                    background: 'rgba(10, 15, 10, 0.55)',
                    border: '1px solid rgba(168, 180, 145, 0.35)',
                    borderRadius: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <TrinketIcon
                      id={rewardTrinket.id}
                      imageSrc={rewardTrinket.imageSrc}
                      size={36}
                      alt={rewardTrinket.name}
                    />
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#a39d88', fontStyle: 'italic' }}>
                    {beat.reward.flavor || rewardTrinket.origin}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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
