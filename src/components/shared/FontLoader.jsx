import React from 'react';

export const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
    body { margin: 0; background: #050706; }
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }
    button { font-family: inherit; }
    button:hover { opacity: 0.92; }
    button:active { transform: scale(0.98); }
  `}</style>
);
