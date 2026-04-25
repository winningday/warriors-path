import React from 'react';

export const HerbIcon = ({ size = 22, accent = '#6a8e58' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M16,28 L16,10" stroke={accent} strokeWidth="1.4" />
    <path d="M16,18 Q8,14 8,8 Q14,10 16,16 Z" fill={accent} />
    <path d="M16,16 Q24,12 24,6 Q18,8 16,14 Z" fill={accent} opacity="0.85" />
    <path d="M16,22 Q10,20 10,14 Q14,16 16,20 Z" fill={accent} opacity="0.7" />
  </svg>
);
