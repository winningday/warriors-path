import React from 'react';
import { styles } from './styles.js';

export const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: 'rgba(26, 36, 25, 0.5)',
    border: '1px solid #2a3329',
    padding: '14px 8px',
    textAlign: 'center',
    borderRadius: 2,
  }}>
    <div style={{ ...styles.display, fontSize: 9, letterSpacing: '0.25em', color: '#7a8571', marginBottom: 4 }}>{label}</div>
    <div style={{ ...styles.display, fontSize: 26, color: accent, fontWeight: 700, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 10, color: '#7a8571', marginTop: 2 }}>{sub}</div>
  </div>
);
