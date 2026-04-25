import React, { useState } from 'react';
import { styles, panel, smallBtn } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CLANS } from '../../data/clans.js';
import { SR_BUCKET } from '../../engine/sr.js';

export const FlashcardsView = ({ profile, onSave, onDelete, onBack }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const stories = profile.factStories || {};
  const sr = profile.factsSR || {};
  const [editing, setEditing] = useState(null);  // { factId, draft }
  const entries = Object.entries(stories).sort(([a], [b]) => a.localeCompare(b));

  // Friendly label for a fact id
  const labelFor = (id) => {
    const m1 = id.match(/^mult:(\d+)x(\d+)$/);
    if (m1) return `${m1[1]} × ${m1[2]}`;
    const m2 = id.match(/^add:(\d+)\+(\d+)$/);
    if (m2) return `${m2[1]} + ${m2[2]}`;
    return id;
  };

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={onBack} style={{
            background: 'transparent', border: 'none', color: '#7a8571', fontSize: 12, cursor: 'pointer',
            fontFamily: "'Crimson Text', serif", letterSpacing: '0.1em',
          }}>← back to camp</button>
          <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571' }}>
            STORY FLASHCARDS
          </div>
        </div>
        {entries.length === 0 && (
          <div style={panel}>
            <p style={{ margin: 0, fontSize: 14, color: '#a39d88', fontStyle: 'italic', lineHeight: 1.6 }}>
              You haven't told yourself any stories yet. After you catch a tricky math fact, your mentor will offer you the chance to write one. Stories whisper themselves before that fact appears again.
            </p>
          </div>
        )}
        {entries.map(([factId, story]) => {
          const entry = sr[factId];
          const bucket = entry?.bucket || SR_BUCKET.WILD;
          const isEditing = editing && editing.factId === factId;
          return (
            <div key={factId} style={panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ ...styles.display, fontSize: 18, color: clan.accent, fontWeight: 700, letterSpacing: '0.05em' }}>
                  {labelFor(factId)}
                </div>
                <div style={{ fontSize: 10, ...styles.display, letterSpacing: '0.2em', color: bucket === SR_BUCKET.TRUSTED ? '#7a9d6a' : bucket === SR_BUCKET.TRACKING ? '#c8c0a8' : '#d97642' }}>
                  {bucket.toUpperCase()}
                </div>
              </div>
              {!isEditing ? (
                <>
                  <div style={{ fontSize: 14, color: '#c8c0a8', lineHeight: 1.6, fontStyle: 'italic' }}>
                    {story}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => setEditing({ factId, draft: story })} style={smallBtn}>edit</button>
                    <button onClick={() => { if (window.confirm('Forget this story?')) onDelete(factId); }} style={{ ...smallBtn, borderColor: '#3a2929', color: '#7a4a4a' }}>forget</button>
                  </div>
                </>
              ) : (
                <>
                  <textarea
                    value={editing.draft}
                    maxLength={200}
                    onChange={(e) => setEditing({ factId, draft: e.target.value })}
                    style={{
                      width: '100%', minHeight: 70, padding: '10px 12px',
                      background: '#0a0f0a', border: '1px solid #3a4339', color: '#e8dcc0',
                      fontSize: 14, borderRadius: 2, fontFamily: "'Crimson Text', serif",
                      boxSizing: 'border-box', lineHeight: 1.5, resize: 'vertical',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={async () => {
                      const trimmed = editing.draft.trim().slice(0, 200);
                      if (trimmed) await onSave(factId, trimmed);
                      setEditing(null);
                    }} style={smallBtn}>save</button>
                    <button onClick={() => setEditing(null)} style={smallBtn}>cancel</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
