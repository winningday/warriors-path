import React from 'react';
import { TRINKET_ICONS } from './TrinketIcon.jsx';

const furColorToHex = (name) => ({
  Black: '#1c1c1c',
  Grey: '#4a5048',
  White: '#c8c4b8',
  Tabby: '#6a5840',
  Ginger: '#a85b2b',
  Calico: '#7a6048',
  Tortoiseshell: '#3a2a20',
}[name] || '#3a4339');

// v19 — slot positions on the 100×100 cat viewBox. Each slot has a center
// point and a rotation (degrees), so the trinket icon can be placed and
// gently tilted to feel like it belongs on that body part instead of
// floating. The icon is drawn at TRINKET_SIZE in its own 32×32 box,
// translated so its center lands on the slot's (x, y).
const TRINKET_SIZE = 22; // pixels in the 100-unit viewBox
const HALF = TRINKET_SIZE / 2;
const SLOT_POSITIONS = {
  ear:   { x: 42, y: 22, rotate: -18 },  // left ear, slight outward tilt
  nose:  { x: 50, y: 45, rotate: 0  },   // dead-center over the muzzle
  mouth: { x: 50, y: 55, rotate: 0  },   // just below the nose, in the chin area
  back:  { x: 65, y: 56, rotate: 8  },   // shoulder/upper back
  leg:   { x: 38, y: 80, rotate: -6 },   // front left leg, near the foot
};

// Cat silhouette that grows/changes with rank. Kit/Apprentice are smaller; Warrior+ stands taller;
// Leader has the star marking; Deputy has the shoulder stripe; Medicine cats have a leaf collar.
//
// v19 — accepts an optional `equipped` map ({ ear, nose, mouth, back, leg })
// where each value is either:
//   - a trinket id string (looked up in TRINKET_ICONS for the SVG fallback)
//   - { id, imageSrc } so a hand-drawn image is rendered via <image href>
//   - null/undefined (slot empty)
export const CatPortrait = ({
  rank, accent = '#d97642', furColor = '#2a3329', size = 96,
  equipped = null,
}) => {
  // Normalize the equipped map to { slot: { id, imageSrc } | null }.
  const slotEntries = !equipped ? {} : Object.entries(equipped).reduce((m, [s, v]) => {
    if (!v) m[s] = null;
    else if (typeof v === 'string') m[s] = { id: v, imageSrc: null };
    else if (typeof v === 'object') m[s] = { id: v.id, imageSrc: v.imageSrc || null };
    return m;
  }, {});
  const isKitLike = rank === 'Kit' || rank === 'Apprentice' || rank === 'Medicine Cat Apprentice';
  const isLeader = rank === 'Leader';
  const isDeputy = rank === 'Deputy';
  const isMedCat = rank === 'Medicine Cat' || rank === 'Senior Medicine Cat' || rank === 'Medicine Cat Apprentice';
  const fur = furColorToHex(furColor);
  const scaleY = isKitLike ? 0.86 : 1;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <radialGradient id="cp-fur" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor={fur} stopOpacity="1" />
          <stop offset="100%" stopColor="#0a0f0a" stopOpacity="1" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="28" ry="3" fill="#000" opacity="0.45" />
      <g transform={`translate(0,${isKitLike ? 4 : 0}) scale(1,${scaleY})`} style={{ transformOrigin: '50px 90px' }}>
        <path d="M78,72 Q92,60 86,42 Q83,52 76,60 Z" fill="url(#cp-fur)" stroke="#0a0f0a" strokeWidth="0.8" />
        <path d="M22,82 Q18,55 32,40 L38,28 L46,40 Q50,38 54,40 L62,28 L68,40 Q82,55 78,82 Z" fill="url(#cp-fur)" stroke="#0a0f0a" strokeWidth="0.8" />
        <path d="M36,72 L34,88 L40,88 L40,72 Z" fill={fur} stroke="#0a0f0a" strokeWidth="0.6" />
        <path d="M58,72 L58,88 L64,88 L62,72 Z" fill={fur} stroke="#0a0f0a" strokeWidth="0.6" />
        <circle cx="50" cy="38" r="14" fill="url(#cp-fur)" stroke="#0a0f0a" strokeWidth="0.8" />
        <path d="M38,28 L40,18 L46,28 Z" fill={fur} stroke="#0a0f0a" strokeWidth="0.6" />
        <path d="M62,28 L60,18 L54,28 Z" fill={fur} stroke="#0a0f0a" strokeWidth="0.6" />
        <ellipse cx="44" cy="38" rx="2.4" ry="1.6" fill={accent} />
        <ellipse cx="56" cy="38" rx="2.4" ry="1.6" fill={accent} />
        <path d="M48,44 L50,46 L52,44 Z" fill="#0a0f0a" />
        <path d="M50,46 Q47,49 45,48 M50,46 Q53,49 55,48" stroke="#0a0f0a" strokeWidth="0.8" fill="none" />
        <line x1="42" y1="46" x2="32" y2="44" stroke="#c8c0a8" strokeWidth="0.4" opacity="0.8" />
        <line x1="42" y1="48" x2="32" y2="48" stroke="#c8c0a8" strokeWidth="0.4" opacity="0.8" />
        <line x1="58" y1="46" x2="68" y2="44" stroke="#c8c0a8" strokeWidth="0.4" opacity="0.8" />
        <line x1="58" y1="48" x2="68" y2="48" stroke="#c8c0a8" strokeWidth="0.4" opacity="0.8" />
        {isMedCat && (
          <g>
            <path d="M40,52 Q44,55 50,54 Q56,55 60,52" stroke="#6a8e58" strokeWidth="1.4" fill="none" />
            <ellipse cx="46" cy="54" rx="1.5" ry="0.8" fill="#6a8e58" />
            <ellipse cx="54" cy="54" rx="1.5" ry="0.8" fill="#6a8e58" />
          </g>
        )}
        {isDeputy && <path d="M30,52 Q40,48 50,52" stroke={accent} strokeWidth="1.6" fill="none" opacity="0.85" />}
        {isLeader && (
          <g transform="translate(50,12)">
            <path d="M0,-6 L1.8,-1.8 L6,-1.8 L2.4,1.2 L4,6 L0,3 L-4,6 L-2.4,1.2 L-6,-1.8 L-1.8,-1.8 Z" fill={accent} />
          </g>
        )}
      </g>
      {/* v19 — equipped trinkets overlay. Drawn OUTSIDE the kit-scale group
          so they always render at the same size regardless of rank. Each
          slot has a fixed position; the trinket fills a 32×32 box that
          we scale down to TRINKET_SIZE units and gently tilt to feel
          like it belongs on the body part. */}
      {Object.entries(SLOT_POSITIONS).map(([slot, pos]) => {
        const entry = slotEntries[slot];
        if (!entry) return null;
        const scale = TRINKET_SIZE / 32;
        const xform = `translate(${pos.x - HALF}, ${pos.y - HALF}) scale(${scale}) rotate(${pos.rotate} 16 16)`;
        if (entry.imageSrc) {
          // Hand-drawn art: render as <image>. SVG handles PNG/SVG/WebP fine.
          return (
            <g key={slot} transform={xform}>
              <image href={entry.imageSrc} x="0" y="0" width="32" height="32" />
            </g>
          );
        }
        const renderInner = TRINKET_ICONS[entry.id];
        if (!renderInner) return null;
        return (
          <g key={slot} transform={xform}>
            {renderInner()}
          </g>
        );
      })}
    </svg>
  );
};
