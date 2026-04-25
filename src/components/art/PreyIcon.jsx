import React from 'react';

// Tiny iconic prey SVGs used in the reward summary tables.
export const PreyIcon = ({ name, size = 22, accent = '#a39d88' }) => {
  const common = { width: size, height: size, viewBox: '0 0 32 32', style: { display: 'inline-block', verticalAlign: 'middle' } };
  switch (name) {
    case 'mouse':
    case 'vole':
      return (
        <svg {...common}>
          <ellipse cx="18" cy="20" rx="9" ry="6" fill={accent} opacity="0.85" />
          <circle cx="10" cy="18" r="4" fill={accent} />
          <circle cx="8" cy="14" r="1.6" fill={accent} />
          <line x1="26" y1="22" x2="31" y2="26" stroke={accent} strokeWidth="1.2" />
          <circle cx="9" cy="17" r="0.6" fill="#0a0f0a" />
        </svg>
      );
    case 'squirrel':
      return (
        <svg {...common}>
          <path d="M14,24 Q10,16 16,12 Q22,14 22,22 Z" fill={accent} />
          <path d="M22,22 Q30,18 28,8 Q22,12 22,22 Z" fill={accent} opacity="0.85" />
          <circle cx="15" cy="13" r="1.2" fill="#0a0f0a" />
        </svg>
      );
    case 'sparrow':
    case 'thrush':
    case 'blackbird':
    case 'starling':
    case 'robin':
    case 'wren':
    case 'finch':
      return (
        <svg {...common}>
          <ellipse cx="16" cy="18" rx="8" ry="5" fill={accent} />
          <circle cx="22" cy="14" r="2.6" fill={accent} />
          <path d="M9,18 Q13,12 16,16" fill="none" stroke={accent} strokeWidth="1.4" />
          <line x1="24" y1="14" x2="27" y2="13" stroke={accent} strokeWidth="1" />
          <circle cx="22.5" cy="13.4" r="0.6" fill="#0a0f0a" />
        </svg>
      );
    case 'rabbit':
      return (
        <svg {...common}>
          <ellipse cx="18" cy="22" rx="9" ry="5" fill={accent} />
          <circle cx="10" cy="18" r="4" fill={accent} />
          <path d="M8,14 L7,6 L10,8 Z" fill={accent} />
          <path d="M12,14 L13,6 L10,8 Z" fill={accent} />
          <circle cx="9" cy="17" r="0.6" fill="#0a0f0a" />
        </svg>
      );
    case 'frog':
      return (
        <svg {...common}>
          <ellipse cx="16" cy="20" rx="9" ry="5" fill={accent} />
          <circle cx="11" cy="14" r="2.4" fill={accent} />
          <circle cx="21" cy="14" r="2.4" fill={accent} />
          <circle cx="11" cy="14" r="0.7" fill="#0a0f0a" />
          <circle cx="21" cy="14" r="0.7" fill="#0a0f0a" />
        </svg>
      );
    case 'hawk':
      return (
        <svg {...common}>
          <path d="M2,16 Q10,8 16,16 Q22,8 30,16 Q22,18 16,18 Q10,18 2,16 Z" fill={accent} />
          <circle cx="16" cy="17" r="1.4" fill="#0a0f0a" />
        </svg>
      );
    default:
      return <span style={{ fontSize: size, lineHeight: 1 }}>·</span>;
  }
};
