import React from 'react';

// Analog clock face — the "twoleg sun-face" the elders learned to read.
// Inputs: hour (1–12), minute (0–59), accent (Clan color for the hands).
// Aesthetic: weathered dark face with a brass rim, brass-amber hands.
export const ClockFace = ({ hour, minute, accent = '#d4a076', size = 200 }) => {
  const h = ((hour % 12) + (minute / 60)) * 30; // hour-hand angle
  const m = minute * 6;                          // minute-hand angle
  const cx = 100, cy = 100;

  const numbers = [];
  for (let i = 1; i <= 12; i++) {
    const a = ((i * 30) - 90) * (Math.PI / 180);
    const x = cx + Math.cos(a) * 72;
    const y = cy + Math.sin(a) * 72 + 5;
    numbers.push(
      <text key={i} x={x} y={y} textAnchor="middle"
        fontFamily="'Cinzel', serif" fontSize="14" fontWeight="600" fill="#e8dcc0">
        {i}
      </text>
    );
  }

  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * (Math.PI / 180);
    const isHour = i % 5 === 0;
    const inner = isHour ? 82 : 86;
    const outer = 90;
    ticks.push(
      <line key={i}
        x1={cx + Math.cos(a) * inner} y1={cy + Math.sin(a) * inner}
        x2={cx + Math.cos(a) * outer} y2={cy + Math.sin(a) * outer}
        stroke={isHour ? '#a39d88' : '#5a6155'}
        strokeWidth={isHour ? 1.5 : 0.8} />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block', margin: '0 auto' }}>
      {/* outer wood/stone rim */}
      <circle cx={cx} cy={cy} r="96" fill="#1a2419" stroke="#3a4339" strokeWidth="3" />
      {/* inner darker face */}
      <circle cx={cx} cy={cy} r="90" fill="#0f1610" stroke="#2a3329" strokeWidth="1" />
      {ticks}
      {numbers}
      {/* hour hand */}
      <line x1={cx} y1={cy}
        x2={cx + Math.sin(h * Math.PI / 180) * 44}
        y2={cy - Math.cos(h * Math.PI / 180) * 44}
        stroke={accent} strokeWidth="5" strokeLinecap="round" />
      {/* minute hand */}
      <line x1={cx} y1={cy}
        x2={cx + Math.sin(m * Math.PI / 180) * 68}
        y2={cy - Math.cos(m * Math.PI / 180) * 68}
        stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.95" />
      {/* center pin */}
      <circle cx={cx} cy={cy} r="4" fill={accent} />
      <circle cx={cx} cy={cy} r="1.5" fill="#0a0f0a" />
    </svg>
  );
};
