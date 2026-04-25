import React from 'react';
import { styles, panel, btnPrimary, btnSecondary } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CLANS } from '../../data/clans.js';

export const StoryPromptView = ({ profile, factQuestion, story, onChange, onSkip, onSave }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 10, ...styles.display }}>
            A WHISPER FOR NEXT TIME
          </div>
          <h2 style={{ ...styles.display, fontSize: 22, margin: 0, color: clan.accent, fontWeight: 600 }}>
            TELL YOURSELF A STORY
          </h2>
        </div>
        <div style={panel}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#c8c0a8' }}>
            You caught this one. Good. But it was a tricky one — your mentor pads close and asks softly:
          </p>
          <p style={{ margin: '12px 0 0', fontSize: 15, color: '#e8dcc0', fontStyle: 'italic', lineHeight: 1.6 }}>
            "<em>Tell yourself a little story so you'll remember <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{factQuestion}</strong> next time. A picture, a rhyme, anything you'll know is yours.</em>"
          </p>
          <div style={{ ...styles.display, fontSize: 9, letterSpacing: '0.25em', color: '#7a8571', marginTop: 18, marginBottom: 8 }}>
            YOUR STORY (up to 200 letters)
          </div>
          <textarea
            value={story}
            maxLength={200}
            placeholder="Example: 7 × 8 = 56. The numbers go in order: 5, 6, 7, 8."
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              minHeight: 80,
              padding: '10px 12px',
              background: '#0a0f0a',
              border: '1px solid #3a4339',
              color: '#e8dcc0',
              fontSize: 14,
              borderRadius: 2,
              fontFamily: "'Crimson Text', serif",
              boxSizing: 'border-box',
              lineHeight: 1.5,
              resize: 'vertical',
            }}
          />
          <div style={{ textAlign: 'right', fontSize: 10, color: '#5a6155', marginTop: 4 }}>
            {story.length}/200
          </div>
        </div>
        <button onClick={onSave} style={btnPrimary(clan.accent)}>SAVE THIS STORY</button>
        <button onClick={onSkip} style={{ ...btnSecondary(clan.accent), marginTop: 4 }}>SKIP — KEEP HUNTING</button>
      </div>
    </div>
  );
};
