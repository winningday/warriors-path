import React from 'react';
import { styles, smallBtn } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { StatCard } from '../shared/StatCard.jsx';
import { CatPortrait } from '../art/CatPortrait.jsx';
import { ClanScenery } from '../art/ClanScenery.jsx';
import { TrinketIcon } from '../art/TrinketIcon.jsx';
import { CLANS } from '../../data/clans.js';
import { PATROLS } from '../../data/ranks.js';
import { getFullName, getRankInfo, getMentorTitle, isMedicinePath } from '../../engine/rank.js';
import { mentorFocus, patrolStatus, pickCapFlavor, patrolForTopic } from '../../engine/patrolGate.js';
import { trinketById } from '../../data/trinkets.js';
import { unlockedCount as fieldGuideUnlockedCount, fieldGuideEntries } from '../../engine/fieldGuide.js';
import { earnedCount, totalCount } from '../../engine/achievements.js';

export const DenView = ({ profile, slotsCount, onStartPatrol, onSwitchCharacter, onOpenFlashcards, onOpenStats, onOpenDecorate, onOpenFieldGuide, onOpenHonors, onExport, onImport }) => {
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

  const storiesCount = Object.keys(profile.factStories || {}).length;
  // v15.0.0-h Phase 3 — Honors counts (X earned / Y total).
  const honorsEarned = earnedCount(profile);
  const honorsTotal = totalCount();

  // v15.0.0-h Field Guide — count of unlocked lore pages (out of 6). Derived
  // entirely from factsSR; no persisted field. Defensive: works on legacy
  // saves where factsSR is missing.
  const fieldGuideCount = fieldGuideUnlockedCount(profile);
  const fieldGuideTotal = fieldGuideEntries(profile).length;

  // v15.0.0-f gamification:
  // - Mentor's focus topic (today). Persists per character per calendar day.
  // - Per-patrol cap status (daily + weekly). Used to grey out capped patrols
  //   and show book-faithful mentor flavor instead of the description.
  // - Trinket collection ("Your Nest") — small keepsakes earned at random
  //   from completed patrols.
  const focus = mentorFocus(profile);
  const focusPatrol = patrolForTopic(focus.topic);
  // Cache cap status per patrol so the render is one pass through PATROLS.
  const statuses = PATROLS.reduce((m, p) => { m[p.id] = patrolStatus(profile, p.id); return m; }, {});

  // Trinket entries grouped for "Your Nest". Object: { [id]: count } → array
  // sorted by descending count so the most-collected appears first.
  const trinketEntries = Object.entries(profile.trinkets || {})
    .filter(([, count]) => count > 0)
    .map(([id, count]) => ({ ...trinketById(id), count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 12, marginTop: 4, borderRadius: 2, overflow: 'hidden', border: '1px solid #1a2419' }}>
          <ClanScenery clan={profile.clan} accent={clan.accent} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 18, marginTop: -56, position: 'relative', zIndex: 2 }}>
          <CatPortrait
            rank={profile.rank}
            accent={clan.accent}
            furColor={profile.furColor}
            size={104}
            equipped={profile.equipped}
          />
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

        {/* MENTOR'S FOCUS — today's bonus-rewards topic. Picks the kid's
            weakest topic 70% of the time, random rotation 30%. */}
        {focusPatrol && (
          <div style={{
            background: 'rgba(217, 118, 66, 0.08)',
            border: '1px solid rgba(217, 118, 66, 0.4)',
            padding: '12px 14px',
            marginBottom: 14,
            borderRadius: 2,
          }}>
            <div style={{ ...styles.display, fontSize: 9, letterSpacing: '0.3em', color: '#d97642', marginBottom: 4 }}>
              ⟡ MENTOR&apos;S FOCUS TODAY ⟡
            </div>
            <div style={{ fontSize: 14, color: '#e8c598' }}>
              {focusPatrol.name} <span style={{ color: '#a39d88', fontSize: 12 }}>· bonus rewards (1.5×)</span>
            </div>
            <div style={{ fontSize: 11, color: '#a39d88', fontStyle: 'italic', marginTop: 4 }}>
              Your mentor wants you to focus on {focusPatrol.subtitle.toLowerCase()} today.
            </div>
          </div>
        )}

        <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.3em', color: '#7a8571', marginBottom: 12, textAlign: 'center' }}>
          CHOOSE YOUR PATROL
        </div>
        <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
          {PATROLS.map((p) => {
            const st = statuses[p.id];
            const isCapped = st.capped;
            const isFocus = focus.topic === p.topic;
            const capLine = isCapped ? pickCapFlavor(p.id, st.reason) : null;
            return (
              <button key={p.id} onClick={() => !isCapped && onStartPatrol(p)} style={{
                background: isCapped ? 'rgba(26, 36, 25, 0.25)' : 'rgba(26, 36, 25, 0.5)',
                border: `1px solid ${isFocus ? 'rgba(217, 118, 66, 0.55)' : '#2a3329'}`,
                padding: '16px 18px',
                color: isCapped ? '#7a8571' : '#e8dcc0',
                textAlign: 'left',
                cursor: isCapped ? 'default' : 'pointer',
                borderRadius: 2,
                transition: 'all 0.2s',
                opacity: isCapped ? 0.6 : 1,
              }}
                onMouseEnter={(e) => { if (!isCapped) e.currentTarget.style.borderColor = clan.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = isFocus ? 'rgba(217, 118, 66, 0.55)' : '#2a3329'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...styles.display, fontSize: 15, letterSpacing: '0.15em', color: isCapped ? '#7a8571' : clan.accent, fontWeight: 600 }}>
                      {p.name.toUpperCase()}
                      {isFocus && !isCapped && (
                        <span style={{ marginLeft: 10, fontSize: 9, letterSpacing: '0.3em', color: '#d97642' }}>
                          · FOCUS
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, fontStyle: 'italic', color: '#a39d88', marginTop: 2 }}>{p.subtitle}</div>
                    <div style={{ fontSize: 12, color: isCapped ? '#a39d88' : '#7a8571', fontStyle: isCapped ? 'italic' : 'normal', marginTop: 6 }}>
                      {capLine || p.desc}
                    </div>
                    {/* Per-patrol day/week count. Visible whenever there's a cap or
                        the player has done at least one of this patrol today. */}
                    {(st.perDay != null || st.todayCount > 0) && (
                      <div style={{ fontSize: 10, color: '#5a6155', marginTop: 8, ...styles.display, letterSpacing: '0.2em' }}>
                        TODAY {st.todayCount}{st.perDay != null ? ` / ${st.perDay}` : ''}
                        {st.perWeek != null && (
                          <span style={{ marginLeft: 14 }}>
                            THIS WEEK {st.weekCount} / {st.perWeek}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ color: isCapped ? '#3a4339' : clan.accent, fontSize: 20, ...styles.display, marginLeft: 10 }}>
                    {isCapped ? '·' : '→'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {profile.patrolsToday > 0 && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#7a8571', fontStyle: 'italic', marginBottom: 16 }}>
            You have completed {profile.patrolsToday} patrol{profile.patrolsToday === 1 ? '' : 's'} today.
          </div>
        )}

        {/* YOUR NEST — collected trinkets. Renders only when she has at
            least one. Compact list with name + count + origin tooltip.
            v19 — "decorate your cat" button up top. */}
        {trinketEntries.length > 0 && (
          <div style={{ background: 'rgba(26, 36, 25, 0.4)', border: '1px solid #2a3329', padding: 14, borderRadius: 2, marginBottom: 18 }}>
            <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#a39d88', marginBottom: 10, textAlign: 'center' }}>
              ⟡ YOUR NEST ⟡
            </div>
            <div style={{ fontSize: 11, color: '#7a8571', textAlign: 'center', marginBottom: 12, fontStyle: 'italic' }}>
              Small keepsakes from your patrols
            </div>
            <button onClick={onOpenDecorate} style={{
              width: '100%', padding: '10px',
              background: 'rgba(217, 118, 66, 0.08)',
              border: `1px solid ${clan.accent}`,
              color: clan.accent,
              fontSize: 11, cursor: 'pointer',
              borderRadius: 2,
              letterSpacing: '0.2em',
              fontFamily: "'Crimson Text', serif",
              marginBottom: 12,
            }}>
              ⟡  DECORATE YOUR CAT  ⟡
            </button>
            <div style={{ display: 'grid', gap: 8 }}>
              {trinketEntries.map((t) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  fontSize: 13, color: '#c8c0a8',
                  borderBottom: '1px dotted rgba(122, 133, 113, 0.18)',
                  paddingBottom: 8,
                }}>
                  <div style={{
                    width: 36, height: 36,
                    background: 'rgba(10, 15, 10, 0.5)',
                    border: '1px solid rgba(58, 67, 57, 0.6)',
                    borderRadius: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <TrinketIcon id={t.id} imageSrc={t.imageSrc} size={28} alt={t.name} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div>{t.name}</div>
                    {t.origin && (
                      <div style={{ fontSize: 11, color: '#7a8571', fontStyle: 'italic', marginTop: 2 }}>
                        {t.origin}
                      </div>
                    )}
                  </div>
                  <div style={{ ...styles.display, fontSize: 13, color: clan.accent, letterSpacing: '0.1em', minWidth: 24, textAlign: 'right' }}>
                    ×{t.count}
                  </div>
                </div>
              ))}
            </div>
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
          marginBottom: 10,
        }}>
          ⟡  story flashcards{storiesCount > 0 ? ` (${storiesCount})` : ''}
        </button>

        {/* v15.0.0-h Phase 3 — Honors button. Always visible; shows (X/Y)
            count once she's earned at least one. */}
        <button onClick={onOpenHonors} style={{
          width: '100%', padding: '12px',
          background: 'transparent',
          border: '1px solid #3a4339',
          color: '#c8c0a8',
          fontSize: 12,
          letterSpacing: '0.18em',
          fontFamily: "'Crimson Text', serif",
          cursor: 'pointer',
          borderRadius: 2,
          marginBottom: 10,
        }}>
          ⟡  HONORS{honorsEarned > 0 ? ` (${honorsEarned}/${honorsTotal})` : ''}
        </button>

        {/* v15.0.0-h Phase 4 — the Field Guide button. Always visible (the daughter
            loves the books, and the lore is the reward), but with a quiet
            unlocked-count suffix when she has at least one page. */}
        <button onClick={onOpenFieldGuide} style={{
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
          ⟡  FIELD GUIDE  ⟡{fieldGuideCount > 0 ? ` (${fieldGuideCount}/${fieldGuideTotal})` : ''}
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

        {/* Discreet parent-dashboard handle. The decorative line below looks like a footer
            ornament, but the centre dot is clickable. No hover state, no cursor change,
            no affordance. Daughter ignores it; parent knows where to tap. */}
        <div style={{
          textAlign: 'center', marginTop: 20, paddingBottom: 6,
          fontSize: 10, color: '#3a4339', letterSpacing: '0.4em',
          fontFamily: "'Crimson Text', serif", userSelect: 'none',
        }}>
          ·  ·  ·
          <span
            onClick={onOpenStats}
            style={{ display: 'inline-block', padding: '0 8px', color: '#3a4339' }}
            aria-hidden="true"
          >
            ⟡
          </span>
          ·  ·  ·
        </div>
      </div>
    </div>
  );
};
