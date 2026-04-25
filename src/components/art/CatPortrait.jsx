import React from 'react';

const furColorToHex = (name) => ({
  Black: '#1c1c1c',
  Grey: '#4a5048',
  White: '#c8c4b8',
  Tabby: '#6a5840',
  Ginger: '#a85b2b',
  Calico: '#7a6048',
  Tortoiseshell: '#3a2a20',
}[name] || '#3a4339');

// Cat silhouette that grows/changes with rank. Kit/Apprentice are smaller; Warrior+ stands taller;
// Leader has the star marking; Deputy has the shoulder stripe; Medicine cats have a leaf collar.
export const CatPortrait = ({ rank, accent = '#d97642', furColor = '#2a3329', size = 96 }) => {
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
    </svg>
  );
};
