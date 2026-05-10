import React from 'react';
import { styles, rewardSummary } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { TrinketIcon } from '../art/TrinketIcon.jsx';
import { CLANS } from '../../data/clans.js';
import { getFullName } from '../../engine/rank.js';
import { pickGatheringContent, gatheringTrinket } from '../../engine/narrativeBeats.js';

// Gathering view — Phase 5 (v15.0.0-h).
//
// Once per moon the four Clans meet under a full moon at Fourtrees. There is
// a truce. Apprentices brag and learn from one another. This view is a pure
// story screen — no math problems. Tapping "return to camp" awards the
// Gathering token (a g-gathering-token trinket) and marks the night attended
// so the banner won't reappear today.
//
// Vignette is stable per Gathering night (mulberry32 seeded on year/month +
// character id), so re-opening within a night shows the same scene. New
// Gatherings rotate.

export const GatheringView = ({ profile, onReturn }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const fullName = getFullName(profile);
  const vignette = pickGatheringContent(profile, Date.now());
  const token = gatheringTrinket();

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 520, margin: '0 auto', paddingTop: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.4em', color: '#a39d88', marginBottom: 8, ...styles.display }}>
            ⟡  THE GATHERING  ⟡
          </div>
          <div style={{ ...styles.display, fontSize: 22, color: clan.accent, fontWeight: 700, marginBottom: 6 }}>
            FOUR TREES, FULL MOON
          </div>
          <div style={{ fontSize: 13, color: '#a39d88', fontStyle: 'italic', lineHeight: 1.6 }}>
            The four Clans gather under a truce. No claws unsheathed.<br />
            You sit in the long grass and listen.
          </div>
        </div>

        {vignette ? (
          <div style={{
            background: 'rgba(26, 36, 25, 0.55)',
            border: '1px solid #2a3329',
            padding: '18px 18px',
            marginBottom: 16,
            borderRadius: 2,
          }}>
            <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#a39d88', marginBottom: 10, textAlign: 'center' }}>
              AN APPRENTICE OF {vignette.clan.toUpperCase()}
            </div>
            <div style={{ fontSize: 14, color: '#e8dcc0', textAlign: 'center', marginBottom: 12, fontStyle: 'italic' }}>
              — {vignette.apprenticeName} —
            </div>
            <div style={{ fontSize: 14, color: '#d4cdb8', lineHeight: 1.7, marginBottom: 14 }}>
              {vignette.dialogue}
            </div>
            {vignette.lesson && (
              <div style={{
                fontSize: 12,
                color: '#a39d88',
                fontStyle: 'italic',
                borderTop: '1px dotted rgba(122, 133, 113, 0.25)',
                paddingTop: 10,
                textAlign: 'center',
                lineHeight: 1.6,
              }}>
                {vignette.lesson}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: 'rgba(26, 36, 25, 0.55)',
            border: '1px solid #2a3329',
            padding: 18,
            marginBottom: 16,
            borderRadius: 2,
            fontStyle: 'italic',
            color: '#a39d88',
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            You sit in the long grass and listen to the four Clans talk under the moon.
          </div>
        )}

        {/* Token awarded — matches the dashed-callout style used elsewhere. */}
        <div style={{
          ...rewardSummary,
          background: 'rgba(226, 200, 112, 0.06)',
          border: '1px dashed rgba(226, 200, 112, 0.4)',
        }}>
          <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#e2c870', marginBottom: 8, textAlign: 'center' }}>
            ⟡ A GATHERING TOKEN ⟡
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 56, height: 56,
              background: 'rgba(10, 15, 10, 0.55)',
              border: '1px solid rgba(226, 200, 112, 0.35)',
              borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrinketIcon
                id={token.id}
                imageSrc={token.imageSrc}
                size={40}
                alt={token.name}
              />
            </div>
            <div style={{ fontSize: 13, color: '#e8dcc0', textAlign: 'center' }}>
              You carry home {token.name}.
            </div>
            <div style={{ fontSize: 12, color: '#a39d88', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.6 }}>
              {token.origin}
            </div>
          </div>
        </div>

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

        <div style={{ textAlign: 'center', fontSize: 11, color: '#5a6155', fontStyle: 'italic', marginTop: 16 }}>
          {fullName} of {profile.clan} pads home through the moonlight.
        </div>
      </div>
    </div>
  );
};
