// Shared style objects (plain JS — no React, no JSX). Used by every view.

export const styles = {
  root: {
    fontFamily: "'Crimson Text', 'EB Garamond', Georgia, serif",
    background: 'radial-gradient(ellipse at top, #1a2419 0%, #0a0f0a 60%, #050706 100%)',
    color: '#d4cdb8',
    minHeight: '100vh',
    padding: '24px 16px',
    backgroundAttachment: 'fixed',
  },
  display: {
    fontFamily: "'Cinzel', 'Trajan Pro', serif",
    letterSpacing: '0.08em',
  },
};

export const panel = {
  background: 'rgba(26, 36, 25, 0.5)',
  border: '1px solid #2a3329',
  padding: 20,
  marginBottom: 16,
  borderRadius: 2,
};

export const rewardSummary = {
  background: 'rgba(26, 36, 25, 0.5)',
  border: '1px solid #2a3329',
  padding: 16,
  marginBottom: 14,
  borderRadius: 2,
};

export const labelStyle = {
  display: 'block',
  fontFamily: "'Cinzel', 'Trajan Pro', serif",
  letterSpacing: '0.3em',
  fontSize: 10,
  color: '#7a8571',
  marginBottom: 10,
};

export const chipStyle = {
  padding: '8px 12px',
  border: '1px solid #3a4339',
  fontSize: 13,
  cursor: 'pointer',
  borderRadius: 2,
  fontFamily: "'Crimson Text', serif",
};

export const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: '#0a0f0a',
  border: '1px solid #3a4339',
  color: '#e8dcc0',
  fontSize: 15,
  borderRadius: 2,
  fontFamily: "'Crimson Text', serif",
  boxSizing: 'border-box',
};

export const pathChoiceStyle = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '14px 16px',
  border: '1px solid #3a4339',
  background: 'transparent',
  borderRadius: 2,
  marginTop: 8,
  cursor: 'pointer',
  color: '#e8dcc0',
  fontFamily: "'Crimson Text', serif",
};

export const smallBtn = {
  flex: 1,
  padding: '10px',
  background: 'transparent',
  border: '1px solid #3a4339',
  color: '#a39d88',
  fontSize: 11,
  cursor: 'pointer',
  borderRadius: 2,
  letterSpacing: '0.15em',
  fontFamily: "'Crimson Text', serif",
};

export const loadFromFileLink = {
  display: 'block',
  textAlign: 'center',
  fontSize: 11,
  color: '#5a6155',
  cursor: 'pointer',
  textDecoration: 'underline',
  letterSpacing: '0.1em',
  fontFamily: "'Crimson Text', serif",
  marginTop: 12,
};

export const btnPrimary = (accent) => ({
  width: '100%',
  padding: '18px',
  background: accent,
  border: 'none',
  color: '#0a0f0a',
  fontFamily: "'Cinzel', 'Trajan Pro', serif",
  letterSpacing: '0.3em',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  borderRadius: 2,
  marginBottom: 10,
});

export const btnSecondary = (accent) => ({
  width: '100%',
  padding: '18px',
  background: 'transparent',
  border: `1px solid ${accent}`,
  color: accent,
  fontFamily: "'Cinzel', 'Trajan Pro', serif",
  letterSpacing: '0.3em',
  fontSize: 13,
  cursor: 'pointer',
  borderRadius: 2,
  marginBottom: 10,
});
