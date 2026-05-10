import React from 'react';
import { styles, panel } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CatPortrait } from '../art/CatPortrait.jsx';
import { TrinketIcon } from '../art/TrinketIcon.jsx';
import { CLANS } from '../../data/clans.js';
import { TRINKETS, trinketById } from '../../data/trinkets.js';
import { getFullName } from '../../engine/rank.js';

// =====================================================================
// Decorate your cat — pick one trinket per wearable slot to display on
// the cat portrait. Slots: ear, mouth, back, leg, nose. Trinkets with
// slot='general' aren't wearable and don't appear here; they live in
// the Den's "Your Nest" panel only.
//
// UI is one card per slot, each card showing every owned trinket in
// that slot as a tappable chip. Tapping a chip equips it; tapping the
// already-equipped chip unequips it. The cat at the top updates live
// as she picks.
// =====================================================================

const SLOT_META = [
  { id: 'ear',   label: 'EAR',   blurb: 'Feathers, flowers, small leaves — hung on the ear.' },
  { id: 'mouth', label: 'MOUTH', blurb: 'Held in the mouth — a tooth, a small bone, an acorn.' },
  { id: 'back',  label: 'BACK',  blurb: 'Draped or tucked over the back.' },
  { id: 'leg',   label: 'LEG',   blurb: 'Anklet-like adornments — silks, bark cuffs.' },
  { id: 'nose',  label: 'NOSE',  blurb: 'Rare in book-flavor. Most cats prefer their nose bare.' },
];

// Flatten the catalog to a single list, then index by slot. Trinkets are
// owned (visible in this view) when profile.trinkets[id] > 0.
const ALL_TRINKETS = Object.values(TRINKETS).flat();
const TRINKETS_BY_SLOT = ALL_TRINKETS.reduce((m, t) => {
  if (!t.slot || t.slot === 'general') return m;
  (m[t.slot] = m[t.slot] || []).push(t);
  return m;
}, {});

export const DecorateView = ({ profile, onEquip, onBack }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const accent = clan?.accent || '#e2c870';
  const fullName = getFullName(profile);
  const owned = profile.trinkets || {};
  const equipped = profile.equipped || {};

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 8px 60px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={onBack} style={{
            background: 'transparent', border: 'none', color: '#7a8571',
            fontSize: 12, cursor: 'pointer', fontFamily: "'Crimson Text', serif",
            letterSpacing: '0.1em',
          }}>← back to camp</button>
          <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571' }}>
            ⟡ DECORATE ⟡
          </div>
        </div>

        {/* Live cat preview — reflects the equipped state as she picks. */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <CatPortrait
            rank={profile.rank}
            accent={accent}
            furColor={profile.furColor}
            size={160}
            equipped={equipped}
          />
          <div style={{ ...styles.display, fontSize: 18, color: accent, fontWeight: 700, marginTop: 8, letterSpacing: '0.05em' }}>
            {fullName.toUpperCase()}
          </div>
          <div style={{ fontSize: 12, color: '#7a8571', fontStyle: 'italic', marginTop: 4 }}>
            Tap a trinket to equip it. Tap an equipped trinket to remove it.
          </div>
        </div>

        {/* One card per wearable slot. Cards collapse to a "no trinkets yet"
            placeholder if the player has not collected any items for that slot. */}
        {SLOT_META.map((slot) => {
          const ownedHere = (TRINKETS_BY_SLOT[slot.id] || []).filter((t) => (owned[t.id] || 0) > 0);
          const equippedId = equipped[slot.id] || null;
          return (
            <div key={slot.id} style={{ ...panel, padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.3em', color: accent }}>
                  {slot.label}
                </div>
                {equippedId && (
                  <button onClick={() => onEquip(slot.id, null)} style={{
                    background: 'transparent', border: 'none', color: '#7a8571',
                    fontSize: 11, cursor: 'pointer', fontFamily: "'Crimson Text', serif",
                    letterSpacing: '0.1em', textDecoration: 'underline',
                  }}>
                    clear
                  </button>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#7a8571', fontStyle: 'italic', marginBottom: 10 }}>
                {slot.blurb}
              </div>
              {ownedHere.length === 0 ? (
                <div style={{ fontSize: 12, color: '#5a6155', fontStyle: 'italic', padding: '8px 0' }}>
                  No {slot.label.toLowerCase()} trinkets in your collection yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {ownedHere.map((t) => {
                    const isOn = equippedId === t.id;
                    return (
                      <button key={t.id} onClick={() => onEquip(slot.id, isOn ? null : t.id)} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 4, padding: 8, minWidth: 78,
                        background: isOn ? 'rgba(217, 118, 66, 0.18)' : 'rgba(10, 15, 10, 0.4)',
                        border: `1px solid ${isOn ? accent : '#3a4339'}`,
                        borderRadius: 3, cursor: 'pointer',
                        color: '#e8dcc0',
                        fontFamily: "'Crimson Text', serif",
                      }}>
                        <div style={{
                          width: 40, height: 40,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <TrinketIcon id={t.id} imageSrc={t.imageSrc} size={36} alt={t.name} />
                        </div>
                        <div style={{
                          fontSize: 10, color: isOn ? '#e8c598' : '#a39d88',
                          textAlign: 'center', lineHeight: 1.3, maxWidth: 80,
                        }}>
                          {t.name.replace(/^a /, '').replace(/^an /, '')}
                        </div>
                        <div style={{ fontSize: 9, color: '#5a6155', ...styles.display, letterSpacing: '0.1em' }}>
                          ×{owned[t.id]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
};
