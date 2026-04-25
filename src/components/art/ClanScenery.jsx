import React from 'react';

// Per-Clan scenery panel — drawn once at the top of the den.
export const ClanScenery = ({ clan, accent }) => {
  const common = { width: '100%', height: 96, viewBox: '0 0 600 100', preserveAspectRatio: 'none', style: { display: 'block', borderRadius: 2 } };
  if (clan === 'ThunderClan') {
    return (
      <svg {...common}>
        <defs><linearGradient id="sc-th" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1a2419" /><stop offset="1" stopColor="#0a0f0a" /></linearGradient></defs>
        <rect width="600" height="100" fill="url(#sc-th)" />
        {Array.from({ length: 16 }).map((_, i) => (
          <rect key={i} x={20 + i * 36} y={30 - (i % 3) * 6} width={6 + (i % 2)} height={70 + (i % 3) * 6} fill="#0a0f0a" opacity={0.85} />
        ))}
        <path d="M0,80 Q200,60 400,82 Q500,72 600,86 L600,100 L0,100 Z" fill="#0a0f0a" />
        <circle cx="520" cy="22" r="10" fill={accent} opacity="0.35" />
      </svg>
    );
  }
  if (clan === 'ShadowClan') {
    return (
      <svg {...common}>
        <defs><linearGradient id="sc-sh" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#15191c" /><stop offset="1" stopColor="#070809" /></linearGradient></defs>
        <rect width="600" height="100" fill="url(#sc-sh)" />
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M${30 + i * 42},100 L${30 + i * 42 - 14},${50 + (i % 3) * 10} L${30 + i * 42},${28 + (i % 3) * 6} L${30 + i * 42 + 14},${50 + (i % 3) * 10} Z`} fill="#0a0f0a" />
        ))}
        <circle cx="80" cy="20" r="9" fill={accent} opacity="0.3" />
      </svg>
    );
  }
  if (clan === 'RiverClan') {
    return (
      <svg {...common}>
        <defs><linearGradient id="sc-rv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#102028" /><stop offset="1" stopColor="#050a10" /></linearGradient></defs>
        <rect width="600" height="100" fill="url(#sc-rv)" />
        {[40, 70, 60, 80, 50, 75, 65].map((y, i) => (
          <path key={i} d={`M0,${60 + i * 4} Q150,${y} 300,${65 + i * 4} T600,${60 + i * 4}`} stroke={accent} strokeWidth="0.6" fill="none" opacity="0.4" />
        ))}
        <path d="M0,72 Q150,64 300,78 T600,72 L600,100 L0,100 Z" fill="#091018" />
        <circle cx="500" cy="22" r="8" fill={accent} opacity="0.4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <defs><linearGradient id="sc-wc" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1c1f1a" /><stop offset="1" stopColor="#0a0c0a" /></linearGradient></defs>
      <rect width="600" height="100" fill="url(#sc-wc)" />
      <path d="M0,76 Q200,64 400,76 Q500,68 600,78 L600,100 L0,100 Z" fill="#0d100c" />
      {Array.from({ length: 30 }).map((_, i) => (
        <line key={i} x1={20 + i * 20} y1={75} x2={20 + i * 20 + (i % 3 - 1) * 2} y2={86} stroke={accent} strokeWidth="0.4" opacity="0.5" />
      ))}
      <circle cx="120" cy="22" r="9" fill={accent} opacity="0.35" />
    </svg>
  );
};
