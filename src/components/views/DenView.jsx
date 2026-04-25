import React from 'react';
import { styles, smallBtn } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { StatCard } from '../shared/StatCard.jsx';
import { CatPortrait } from '../art/CatPortrait.jsx';
import { ClanScenery } from '../art/ClanScenery.jsx';
import { CLANS } from '../../data/clans.js';
import { PATROLS } from '../../data/ranks.js';
import { getFullName, getRankInfo, getMentorTitle, isMedicinePath } from '../../engine/rank.js';

export const DenView = ({ profile, slotsCount, onStartPatrol, onSwitchCharacter, onOpenFlashcards, onExport, onImport }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const fullName = getFullName(profile);
  const { current, next } = getRankInfo(profile);
  // Display correct count = the player's REAL totalCorrect.
  // Progress-bar baseline = max(totalCorrect, rankFloor) so migrated saves whose rank was earned
  // under older lower thresholds don't render as "below your own rank".
  const progressCorrect = Math.max(profile.totalCorrect || 0, profile.rankFloor || 0);
  const progress = next
    ? Math.min(100, Math.max(0, ((progressCorrect - current.min) / (next.min - current.min)) * 100))
    : 100;
  const totalPrey  = Object.values(profile.preyCaught  || {}).reduce((s, n) => s + n, 0);
  const totalHerbs = Object.values(profile.herbsCaught || {}).reduce((s, n) => s + n, 0);
  const isApprentice = profile.rank === 'Apprentice' || profile.rank === 'Medicine Cat Apprentice';

  const storiesCount = Object.keys(profile.factStories || {}).length;

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 12, marginTop: 4, borderRadius: 2, overflow: 'hidden', border: '1px solid #1a2419' }}>
          <ClanScenery clan={profile.clan} accent={clan.accent} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 18, marginTop: -56, position: 'relative', zIndex: 2 }}>
          <CatPortrait rank={profile.rank} accent={clan.accent} furColor={profile.furColor} size={104} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 6, ...styles.display }}>
            {profile.clan.toUpperCase()}
          </div>
          <h1 style={{ ...styles.display, fontSize: 30, margin: 0, color: clan.accent, fontWeight: 700, letterSpacing: '0.05em' }}>
            {fullName.toUpperCase()}
          </h1>
          <div style={{ fontSize: 13, color: '#a39d88', fontStyle: 'italic', marginTop: 4 }}>
            {profile.rank} · {profile.furColor.toLowerCase()} pelt · {profile.eyeColor.toLowerCase()} eyes
          </div>
          {profile.mentor && (
            <div style={{ fontSize: 12, color: '#7a8571', marginTop: 4 }}>
              mentor: {getMentorTitle(profile)}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          <StatCard label="STREAK" value={`${profile.streak || 0}`} sub={`day${profile.streak === 1 ? '' : 's'}`} accent={clan.accent} />
          <StatCard label={isMedicinePath(profile) ? 'HERBS' : 'PREY'} value={isMedicinePath(profile) ? totalHerbs : totalPrey} sub={isMedicinePath(profile) ? 'gathered' : 'caught'} accent={clan.accent} />
          <StatCard label="CORRECT" value={profile.totalCorrect} sub={`of ${profile.totalAttempted}`} accent={clan.accent} />
        </div>

        {next && (
          <div style={{ background: 'rgba(26, 36, 25, 0.5)', border: '1px solid #2a3329', padding: 16, marginBottom: 18, borderRadius: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, ...styles.display, letterSpacing: '0.2em', color: '#7a8571', marginBottom: 8 }}>
              <span>{current.name.toUpperCase()}</span>
              <span>{next.name.toUpperCase()}</span>
            </div>
            <div style={{ height: 6, background: '#1a2419', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: clan.accent, transition: 'width 0.6s' }} />
            </div>
            <div style={{ fontSize: 12, textAlign: 'center', marginTop: 8, color: '#a39d88' }}>
              {Math.max(0, next.min - progressCorrect)} more correct answers to reach {next.name}
            </div>
          </div>
        )}

        <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.3em', color: '#7a8571', marginBottom: 12, textAlign: 'center' }}>
          CHOOSE YOUR PATROL
        </div>
        <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
          {PATROLS.map((p) => (
            <button key={p.id} onClick={() => onStartPatrol(p)} style={{
              background: 'rgba(26, 36, 25, 0.5)',
              border: '1px solid #2a3329',
              padding: '16px 18px',
              color: '#e8dcc0',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: 2,
              transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = clan.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a3329'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ ...styles.display, fontSize: 15, letterSpacing: '0.15em', color: clan.accent, fontWeight: 600 }}>
                    {p.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, fontStyle: 'italic', color: '#a39d88', marginTop: 2 }}>{p.subtitle}</div>
                  <div style={{ fontSize: 12, color: '#7a8571', marginTop: 6 }}>{p.desc}</div>
                </div>
                <div style={{ color: clan.accent, fontSize: 20, ...styles.display }}>→</div>
              </div>
            </button>
          ))}
        </div>

        {profile.patrolsToday > 0 && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#7a8571', fontStyle: 'italic', marginBottom: 16 }}>
            You have completed {profile.patrolsToday} patrol{profile.patrolsToday === 1 ? '' : 's'} today.
          </div>
        )}

        <button onClick={onOpenFlashcards} style={{
          width: '100%', padding: '12px',
          background: 'transparent',
          border: '1px solid #3a4339',
          color: '#c8c0a8',
          fontSize: 12,
          letterSpacing: '0.18em',
          fontFamily: "'Crimson Text', serif",
          cursor: 'pointer',
          borderRadius: 2,
          marginBottom: 18,
        }}>
          ⟡  story flashcards{storiesCount > 0 ? ` (${storiesCount})` : ''}
        </button>

        <div style={{ marginTop: 16, paddingBottom: 20 }}>
          <div style={{ ...styles.display, fontSize: 9, letterSpacing: '0.3em', color: '#5a6155', textAlign: 'center', marginBottom: 12 }}>
            ⟡  KEEPER OF THE SCROLL  ⟡
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button onClick={onExport} style={smallBtn}>save Clan cat to file</button>
            <label style={{ ...smallBtn, textAlign: 'center' }}>
              load from file
              <input type="file" accept="application/json,.json" onChange={onImport} style={{ display: 'none' }} />
            </label>
          </div>
          <button onClick={onSwitchCharacter} style={{ ...smallBtn, width: '100%', display: 'block' }}>
            {slotsCount > 1 ? 'switch to another Clan cat' : 'add another Clan cat'}
          </button>
        </div>
      </div>
    </div>
  );
};
