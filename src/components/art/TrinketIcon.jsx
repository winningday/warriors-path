import React from 'react';

// =====================================================================
// Trinket icons.
//
// Style notes (matching CatPortrait / PreyIcon / HerbIcon):
//   - 32x32 viewBox
//   - soft fills with opacity layers, dark stroke (#0a0f0a) for definition
//   - one or two muted accent colors per piece
//   - simple atomic shapes — feather, stone, leaf, etc.
//
// Custom-art pipeline: a trinket entry in src/data/trinkets.js can specify
// `imageSrc: '/trinkets/<id>.png'` to use a hand-drawn image (or any
// PNG/SVG/WebP) instead of the generated SVG. Files live under
// `public/trinkets/`. See `public/trinkets/README.md` for the convention.
//
// Future: a 4x4 grid admin/editor view per slot ('ear' / 'nose' / 'mouth'
// / 'back' / 'leg' / 'general') will let the daughter drop her Procreate
// exports straight in. The SVG fallbacks below are placeholders until
// hand-drawn art exists.
// =====================================================================

const STROKE = '#0a0f0a';

const Feather = ({ accent = '#a39d88', tint = '#5a6155' }) => (
  // Slim feather — slight curve, central rachis, fine barbs.
  <g>
    <path d="M16,3 Q22,12 19,28 Q16,30 13,28 Q10,12 16,3 Z" fill={accent} stroke={STROKE} strokeWidth="0.6" />
    <path d="M16,5 L16,28" stroke={tint} strokeWidth="0.6" opacity="0.7" />
    <path d="M16,8 L13,11 M16,11 L12,14 M16,14 L11,17 M16,17 L11,20 M16,20 L12,23 M16,23 L13,26
             M16,8 L19,11 M16,11 L20,14 M16,14 L21,17 M16,17 L21,20 M16,20 L20,23 M16,23 L19,26"
          stroke={tint} strokeWidth="0.4" opacity="0.55" fill="none" />
  </g>
);

const Stone = ({ fill = '#7a8571', highlight = '#a39d88' }) => (
  <g>
    <ellipse cx="16" cy="20" rx="10" ry="7" fill={fill} stroke={STROKE} strokeWidth="0.6" />
    <ellipse cx="13" cy="17" rx="3" ry="1.6" fill={highlight} opacity="0.55" />
  </g>
);

const Tooth = ({ size = 'small', accent = '#c8c0a8' }) => (
  // Small or large fang/tooth.
  <g>
    {size === 'large' ? (
      <path d="M16,4 L12,14 Q16,18 20,14 Z" fill={accent} stroke={STROKE} strokeWidth="0.6" />
    ) : (
      <path d="M16,8 L13,16 Q16,19 19,16 Z" fill={accent} stroke={STROKE} strokeWidth="0.5" />
    )}
    <path d="M16,4 L16,14" stroke="#fff" strokeWidth="0.4" opacity="0.5" />
  </g>
);

const FurTuft = ({ accent = '#5a4a38', highlight = '#7a6048' }) => (
  // Cloud-blob of fur — irregular, soft.
  <g>
    <path d="M8,18 Q4,14 8,10 Q11,7 15,10 Q19,7 22,11 Q26,12 24,18 Q25,22 20,22 Q15,24 12,22 Q8,22 8,18 Z"
          fill={accent} stroke={STROKE} strokeWidth="0.5" />
    <path d="M11,12 Q14,9 17,11 M19,11 Q22,12 23,15" stroke={highlight} strokeWidth="0.5" opacity="0.6" fill="none" />
  </g>
);

const Bone = () => (
  // Tiny dog-bone shape on its side.
  <g>
    <path d="M6,16 Q3,16 3,13 Q3,10 6,10 Q8,10 9,13 L23,13 Q24,10 26,10 Q29,10 29,13 Q29,16 26,16 Q24,16 23,19 L9,19 Q8,16 6,16 Z"
          fill="#d8d3c4" stroke={STROKE} strokeWidth="0.6" />
  </g>
);

const Whisker = () => (
  // A single curved whisker — barely visible, very fine.
  <g>
    <path d="M4,22 Q12,18 18,16 Q24,15 28,12" stroke="#c8c4b8" strokeWidth="0.7" fill="none" />
    <circle cx="4" cy="22" r="0.6" fill="#c8c4b8" />
  </g>
);

const ClawMark = ({ accent = '#3a4339' }) => (
  // Three diagonal scratch lines.
  <g>
    <path d="M8,28 L18,4" stroke={accent} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
    <path d="M14,28 L22,8" stroke={accent} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
    <path d="M20,28 L26,12" stroke={accent} strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    <path d="M9,27 L17,5" stroke="#c8c0a8" strokeWidth="0.4" opacity="0.4" />
  </g>
);

const Leaf = ({ accent = '#5a7a48', tint = '#3a5028' }) => (
  // Pressed leaf — pointed oval with central vein.
  <g>
    <path d="M16,4 Q24,12 22,22 Q16,28 10,22 Q8,12 16,4 Z" fill={accent} stroke={STROKE} strokeWidth="0.5" />
    <path d="M16,5 L16,26" stroke={tint} strokeWidth="0.6" opacity="0.6" />
    <path d="M16,10 L20,12 M16,14 L21,17 M16,18 L20,21 M16,10 L12,12 M16,14 L11,17 M16,18 L12,21"
          stroke={tint} strokeWidth="0.3" opacity="0.45" fill="none" />
  </g>
);

const Petal = ({ accent = '#c8b8c8' }) => (
  // Single moonshade petal — pale, curved.
  <g>
    <path d="M16,4 Q23,12 20,22 Q16,28 12,22 Q9,12 16,4 Z" fill={accent} stroke={STROKE} strokeWidth="0.4" opacity="0.92" />
    <path d="M16,6 Q19,14 17,22" stroke="#fff" strokeWidth="0.4" opacity="0.5" />
  </g>
);

const Marigold = () => (
  // Many-petaled bloom around a center.
  <g>
    {[0, 60, 120, 180, 240, 300].map((deg) => (
      <ellipse key={deg} cx="16" cy="9" rx="2.2" ry="4.2" fill="#d8842a" stroke={STROKE} strokeWidth="0.4"
               transform={`rotate(${deg} 16 16)`} />
    ))}
    <circle cx="16" cy="16" r="2.6" fill="#5a3a18" stroke={STROKE} strokeWidth="0.4" />
  </g>
);

const PoppySeed = () => (
  // Single tiny dark seed — very rare.
  <g>
    <ellipse cx="16" cy="16" rx="3.2" ry="2.4" fill="#1c1c1c" stroke="#3a2a20" strokeWidth="0.4" />
    <ellipse cx="14.5" cy="15" rx="0.8" ry="0.4" fill="#5a4a38" opacity="0.6" />
  </g>
);

const JuniperBerry = () => (
  // Pair of blue-black berries.
  <g>
    <circle cx="13" cy="18" r="4.2" fill="#28304a" stroke={STROKE} strokeWidth="0.5" />
    <circle cx="20" cy="14" r="3.6" fill="#384058" stroke={STROKE} strokeWidth="0.5" />
    <ellipse cx="11.5" cy="16.5" rx="1" ry="0.6" fill="#5a6588" opacity="0.55" />
  </g>
);

const Yarrow = () => (
  // A small umbel of tiny white dots.
  <g>
    <path d="M16,28 L16,18" stroke="#5a7a48" strokeWidth="0.8" />
    {[[14, 15], [18, 15], [16, 13], [12, 17], [20, 17], [16, 17], [13, 13], [19, 13]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="1.1" fill="#e8dcc0" stroke="#a39d88" strokeWidth="0.3" />
    ))}
  </g>
);

const Star = ({ accent = '#e8c598', glow = '#d97642' }) => (
  // 5-pointed star with subtle glow.
  <g>
    <circle cx="16" cy="16" r="9" fill={glow} opacity="0.18" />
    <path d="M16,5 L18.4,13 L26.5,13 L20,17.8 L22.4,26 L16,20.8 L9.6,26 L12,17.8 L5.5,13 L13.6,13 Z"
          fill={accent} stroke={STROKE} strokeWidth="0.4" />
  </g>
);

const Shard = () => (
  // Angular crystal sliver — moonstone, pale.
  <g>
    <path d="M14,4 L20,8 L24,18 L18,28 L10,22 L8,12 Z" fill="#c8d4e8" stroke={STROKE} strokeWidth="0.5" />
    <path d="M14,4 L18,28" stroke="#fff" strokeWidth="0.5" opacity="0.45" />
    <path d="M8,12 L20,8 L18,28" stroke="#5a6588" strokeWidth="0.4" opacity="0.5" fill="none" />
  </g>
);

const Acorn = () => (
  <g>
    <ellipse cx="16" cy="20" rx="6" ry="8" fill="#8a6038" stroke={STROKE} strokeWidth="0.5" />
    <path d="M9,12 Q9,8 16,7 Q23,8 23,12 Q23,14 16,14 Q9,14 9,12 Z" fill="#5a3a18" stroke={STROKE} strokeWidth="0.5" />
    <path d="M16,5 L16,7" stroke="#3a2a20" strokeWidth="0.8" />
    <ellipse cx="14" cy="16" rx="1.2" ry="2.4" fill="#a8754a" opacity="0.6" />
  </g>
);

const Mist = () => (
  // Curling spiral of pale night-mist.
  <g>
    <path d="M6,22 Q12,16 18,22 Q24,28 26,18 Q26,8 16,12"
          stroke="#c8d4e8" strokeWidth="1.4" fill="none" opacity="0.85" strokeLinecap="round" />
    <path d="M8,20 Q14,14 20,20 Q24,24 24,16"
          stroke="#fff" strokeWidth="0.5" fill="none" opacity="0.5" />
  </g>
);

const SpiderSilk = () => (
  // Fine zigzag thread.
  <g>
    <path d="M3,20 L8,12 L12,18 L17,10 L21,18 L26,11 L29,16"
          stroke="#e8dcc0" strokeWidth="0.5" fill="none" opacity="0.85" />
    <circle cx="3" cy="20" r="0.5" fill="#e8dcc0" />
    <circle cx="29" cy="16" r="0.5" fill="#e8dcc0" />
  </g>
);

const Thorn = () => (
  // Sharp pointed spike with base.
  <g>
    <path d="M16,3 L20,28 L12,28 Z" fill="#5a4a38" stroke={STROKE} strokeWidth="0.6" />
    <path d="M16,3 L18,18" stroke="#a8754a" strokeWidth="0.5" opacity="0.5" />
  </g>
);

const Wool = () => (
  // Fluffy pale cloud of sheep-wool.
  <g>
    <path d="M6,18 Q4,14 7,11 Q9,8 13,10 Q16,7 19,10 Q23,8 25,12 Q28,15 26,19 Q27,23 22,23 Q17,25 13,23 Q9,24 6,21 Z"
          fill="#e8dcc0" stroke={STROKE} strokeWidth="0.4" />
    <path d="M10,14 Q13,11 16,13 M18,11 Q21,12 23,15 M11,18 Q14,17 17,18 M19,18 Q22,17 24,18"
          stroke="#a39d88" strokeWidth="0.5" opacity="0.6" fill="none" />
  </g>
);

const Thread = () => (
  // Bright Twoleg thread — zigzag in unnatural color.
  <g>
    <path d="M3,12 L8,20 L13,12 L18,20 L23,12 L28,20"
          stroke="#d8423a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <path d="M3,12 L8,20 L13,12 L18,20 L23,12 L28,20"
          stroke="#fff" strokeWidth="0.4" fill="none" opacity="0.4" />
  </g>
);

const BarkCurl = () => (
  // Spiraling strip of birch bark.
  <g>
    <path d="M6,8 Q22,8 24,18 Q24,26 14,26 Q6,26 6,18 Q6,12 12,12 Q18,12 18,18 Q18,22 14,22"
          fill="none" stroke="#e8dcc0" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M6,8 Q22,8 24,18 Q24,26 14,26 Q6,26 6,18 Q6,12 12,12 Q18,12 18,18 Q18,22 14,22"
          fill="none" stroke="#3a2a20" strokeWidth="0.4" />
    <line x1="9" y1="10" x2="9" y2="12" stroke="#3a2a20" strokeWidth="0.4" />
    <line x1="14" y1="10" x2="14" y2="12" stroke="#3a2a20" strokeWidth="0.4" />
    <line x1="20" y1="10" x2="20" y2="12" stroke="#3a2a20" strokeWidth="0.4" />
  </g>
);

// Map trinket id → render function. Each takes no args; the wrapper
// component supplies the size and stroke at the SVG level.
const ICONS = {
  // training
  't-claw-mark':    () => <ClawMark />,
  't-whisker':      () => <Whisker />,
  't-stone':        () => <Stone fill="#8a907a" highlight="#c8c0a8" />,
  't-tuft':         () => <FurTuft accent="#3a4339" highlight="#5a6155" />,
  't-feather':      () => <Feather accent="#a85b2b" tint="#5a3a18" />, // robin

  // hunting
  'h-feather-grey':  () => <Feather accent="#7a8571" tint="#3a4339" />,
  'h-fur-tuft':      () => <FurTuft accent="#5a4a38" highlight="#7a6048" />,
  'h-bone':          () => <Bone />,
  'h-feather-brown': () => <Feather accent="#6a5840" tint="#3a2a20" />,
  'h-mouse-tooth':   () => <Tooth size="small" accent="#e8e2cc" />,
  'h-feather-jay':   () => <Feather accent="#3a78c8" tint="#1a3858" />,

  // border
  'b-stone':         () => <Stone fill="#7a8a98" highlight="#c8c4b8" />,
  'b-thorn':         () => <Thorn />,
  'b-fox-tooth':     () => <Tooth size="large" accent="#e8c898" />,
  'b-sheep-wool':    () => <Wool />,
  'b-twoleg-thread': () => <Thread />,
  'b-bark-curl':     () => <BarkCurl />,

  // herb
  'g-pressed-leaf':  () => <Leaf accent="#5a7a48" tint="#2a4018" />,
  'g-moonshade':     () => <Petal accent="#b8b0c8" />,
  'g-marigold':      () => <Marigold />,
  'g-poppy':         () => <PoppySeed />,
  'g-juniper':       () => <JuniperBerry />,
  'g-yarrow':        () => <Yarrow />,

  // vigil
  'v-starlight':     () => <Star accent="#e8c598" glow="#d97642" />,
  'v-moonstone':     () => <Shard />,
  'v-owl-feather':   () => <Feather accent="#d8d0b8" tint="#7a6c4a" />,
  'v-night-mist':    () => <Mist />,
  'v-acorn':         () => <Acorn />,
  'v-spider-silk':   () => <SpiderSilk />,
};

// Wrapper component. If the trinket entry has an `imageSrc`, we render
// the image (player-drawn art); otherwise we fall back to the SVG icon.
// Unknown ids render a muted dot.
export const TrinketIcon = ({ id, imageSrc, size = 32, alt = '' }) => {
  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        width={size}
        height={size}
        style={{ display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }}
      />
    );
  }
  const render = ICONS[id];
  if (!render) {
    return <span style={{ fontSize: size, lineHeight: 1, opacity: 0.5 }}>·</span>;
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {render()}
    </svg>
  );
};
