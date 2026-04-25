import React from 'react';
import { styles, inputStyle, btnPrimary } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';

export const PatrolView = ({ patrol, profile, current, factStory, answerInput, setAnswerInput, feedback, showHint, setShowHint, showStrategy, strategy, clanAccent, onSubmit, onQuit }) => {
  const progress = ((patrol.currentIdx) / patrol.problems.length) * 100;
  const handleKey = (e) => { if (e.key === 'Enter') onSubmit(); };
  const isMoving = feedback?.type === 'correct' || feedback?.type === 'reveal';

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={onQuit} style={{
            background: 'transparent', border: 'none', color: '#7a8571', fontSize: 12, cursor: 'pointer',
            fontFamily: "'Crimson Text', serif", letterSpacing: '0.1em',
          }}>← return to camp</button>
          <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571' }}>
            {patrol.type.name.toUpperCase()}
          </div>
        </div>

        <div style={{ height: 3, background: '#1a2419', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: clanAccent, transition: 'width 0.4s' }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#7a8571', marginBottom: 24 }}>
          Problem {patrol.currentIdx + 1} of {patrol.problems.length}
        </div>

        <div style={{
          background: 'rgba(26, 36, 25, 0.5)',
          border: '1px solid #2a3329',
          padding: '28px 22px',
          borderRadius: 2,
          marginBottom: 20,
          minHeight: 220,
        }}>
          {factStory && (
            <div style={{
              marginBottom: 14, padding: '10px 14px',
              background: 'rgba(122, 133, 113, 0.1)',
              border: '1px dashed rgba(168, 180, 145, 0.3)',
              fontSize: 13, color: '#bdb898', fontStyle: 'italic', borderRadius: 2,
            }}>
              <span style={{ ...styles.display, fontSize: 9, letterSpacing: '0.25em', display: 'block', marginBottom: 4, color: '#7a8571', fontStyle: 'normal' }}>
                YOUR STORY
              </span>
              {factStory}
            </div>
          )}
          <div style={{ fontSize: 13, color: '#a39d88', fontStyle: 'italic', marginBottom: 18, textAlign: 'center' }}>
            {current.story}
          </div>
          <div style={{
            fontSize: current.question.length > 40 ? 16 : 28,
            color: '#e8dcc0',
            textAlign: 'center',
            lineHeight: 1.5,
            fontWeight: current.question.length > 40 ? 400 : 600,
            fontFamily: current.question.length > 40 ? "'Crimson Text', serif" : "'Cinzel', serif",
            letterSpacing: current.question.length > 40 ? 'normal' : '0.05em',
          }}>
            {current.question}
          </div>
          {showHint && (
            <div style={{
              marginTop: 20, padding: '12px 14px',
              background: 'rgba(217, 118, 66, 0.08)',
              border: '1px solid rgba(217, 118, 66, 0.3)',
              fontSize: 13, color: '#d4a076', fontStyle: 'italic', borderRadius: 2,
            }}>
              Mentor whispers: {current.hint}
            </div>
          )}
          {showStrategy && strategy && (
            <div style={{
              marginTop: 12, padding: '12px 14px',
              background: 'rgba(217, 118, 66, 0.14)',
              border: '1px solid rgba(217, 118, 66, 0.5)',
              fontSize: 13, color: '#e8c598', borderRadius: 2,
            }}>
              <span style={{ ...styles.display, fontSize: 9, letterSpacing: '0.25em', display: 'block', marginBottom: 4, color: '#d4a076' }}>
                MENTOR'S STRATEGY
              </span>
              {strategy}
            </div>
          )}
        </div>

        {feedback && (
          <div style={{
            padding: '14px 18px',
            borderRadius: 2,
            marginBottom: 16,
            textAlign: 'center',
            fontSize: 14,
            background: feedback.type === 'correct' ? 'rgba(217, 118, 66, 0.12)' :
                        feedback.type === 'reveal'  ? 'rgba(122, 133, 113, 0.15)' :
                                                      'rgba(122, 133, 113, 0.08)',
            border: `1px solid ${feedback.type === 'correct' ? 'rgba(217, 118, 66, 0.4)' : '#3a4339'}`,
            color: feedback.type === 'correct' ? '#d97642' : '#c8c0a8',
          }}>
            {feedback.type === 'correct' && (
              <>
                {feedback.kind === 'prey'  && <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.3em', marginBottom: 6 }}>PREY CAUGHT · {feedback.prey.toUpperCase()}</div>}
                {feedback.kind === 'herb'  && <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.3em', marginBottom: 6 }}>HERB GATHERED · {feedback.herb.toUpperCase()}</div>}
                {feedback.kind === 'border' && <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.3em', marginBottom: 6 }}>SCENT REFRESHED</div>}
                {feedback.kind === 'training' && <div style={{ ...styles.display, fontSize: 11, letterSpacing: '0.3em', marginBottom: 6 }}>A CLEAN MOVE</div>}
                <div style={{ fontStyle: 'italic' }}>{feedback.flavor}</div>
                <div style={{ fontSize: 12, marginTop: 6, color: '#a39d88' }}>{feedback.praise}</div>
              </>
            )}
            {feedback.type !== 'correct' && <div>{feedback.text}</div>}
          </div>
        )}

        {!isMoving && (
          <>
            <input type="number" value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Your answer" autoFocus
              style={{ ...inputStyle, fontSize: 22, textAlign: 'center', padding: '16px', marginBottom: 12 }} />
            <button onClick={onSubmit} style={btnPrimary(clanAccent)}>STRIKE</button>
            {!showHint && (
              <button onClick={() => setShowHint(true)} style={{
                width: '100%', padding: '10px',
                background: 'transparent',
                border: '1px dashed #3a4339',
                color: '#7a8571',
                fontSize: 12, cursor: 'pointer',
                borderRadius: 2,
                fontFamily: "'Crimson Text', serif",
                fontStyle: 'italic',
                marginTop: 8,
              }}>
                ask the mentor for a hint
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
