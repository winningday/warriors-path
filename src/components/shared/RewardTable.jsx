import React from 'react';
import { styles, rewardSummary } from './styles.js';
import { PreyIcon } from '../art/PreyIcon.jsx';
import { HerbIcon } from '../art/HerbIcon.jsx';

export const RewardTable = ({ title, rows, accent, kind }) => (
  <div style={rewardSummary}>
    <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571', marginBottom: 12, textAlign: 'center' }}>
      {title}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {Object.entries(rows).map(([name, count]) => (
        <div key={name} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 12px', background: '#0a0f0a',
          borderRadius: 2, fontSize: 14,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#c8c0a8', textTransform: 'capitalize' }}>
            {kind === 'prey' ? <PreyIcon name={name} accent={accent} /> : <HerbIcon accent={accent} />}
            {name}
          </span>
          <span style={{ color: accent, fontWeight: 700 }}>× {count}</span>
        </div>
      ))}
    </div>
  </div>
);
