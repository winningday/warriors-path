import React, { useState, useMemo } from 'react';
import { styles, panel } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CLANS } from '../../data/clans.js';
import { fieldGuideEntries } from '../../engine/fieldGuide.js';

// Topic-icon glyph (small inline-SVG) for the sidebar. Tiny, abstract, in
// keeping with the existing ⟡ ornaments. Each glyph is 18×18 and uses
// currentColor so we can tint it per-row.
const TopicGlyph = ({ topic, size = 18 }) => {
  const s = size;
  const half = s / 2;
  switch (topic) {
    case 'mult':
      // Crossed claw-strikes (×).
      return (
        <svg width={s} height={s} viewBox="0 0 18 18" aria-hidden="true">
          <path d="M3.5 3.5 L14.5 14.5 M14.5 3.5 L3.5 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'add':
      // Pebble cross (+).
      return (
        <svg width={s} height={s} viewBox="0 0 18 18" aria-hidden="true">
          <path d="M9 3 V15 M3 9 H15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'sub':
      // Single horizontal mark — what remains.
      return (
        <svg width={s} height={s} viewBox="0 0 18 18" aria-hidden="true">
          <path d="M3 9 H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'geometry':
      // Walked border — a small open square.
      return (
        <svg width={s} height={s} viewBox="0 0 18 18" aria-hidden="true">
          <rect x="3.5" y="4.5" width="11" height="9" stroke="currentColor" strokeWidth="1.4" fill="none" />
        </svg>
      );
    case 'fraction':
      // Two-piles divider — a slash with dots.
      return (
        <svg width={s} height={s} viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="5" cy="5" r="1.4" fill="currentColor" />
          <path d="M3 14 L14 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="13" cy="13" r="1.4" fill="currentColor" />
        </svg>
      );
    case 'time':
      // Sun-face — a circle with two hands.
      return (
        <svg width={s} height={s} viewBox="0 0 18 18" aria-hidden="true">
          <circle cx={half} cy={half} r="6" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <path d="M9 9 L9 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M9 9 L12 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

// Friendly topic label.
const TOPIC_LABEL = {
  mult: 'Multiplication',
  add: 'Addition',
  sub: 'Subtraction',
  geometry: 'Perimeter & Area',
  fraction: 'Fractions',
  time: 'Time',
};

export const FieldGuideView = ({ profile, onBack }) => {
  // Defensive lookups — parallel phase agents may add fields, so use ?? / || {}
  // patterns and never assume new schema keys exist.
  const clan = CLANS.find((c) => c.name === profile?.clan) || CLANS[0];
  const accent = clan?.accent || '#e2c870';

  // Build the entry list once per render. Order is the catalog order from
  // fieldGuide.js (which is also the conventional topic order).
  const entries = useMemo(() => fieldGuideEntries(profile || {}), [profile]);

  // Default the selection to the first UNLOCKED entry, falling back to the
  // first locked one if none are unlocked yet. The right pane handles the
  // "nothing unlocked" empty state separately.
  const firstUnlocked = entries.find((e) => e.unlocked);
  const [selectedTopic, setSelectedTopic] = useState(
    firstUnlocked ? firstUnlocked.topic : (entries[0]?.topic ?? null)
  );
  const selected = entries.find((e) => e.topic === selectedTopic) || null;

  const anyUnlocked = entries.some((e) => e.unlocked);

  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '20px 8px' }}>
        {/* Header — back link + title */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
        }}>
          <button onClick={onBack} style={{
            background: 'transparent', border: 'none', color: '#7a8571', fontSize: 12, cursor: 'pointer',
            fontFamily: "'Crimson Text', serif", letterSpacing: '0.1em',
          }}>← back to camp</button>
          <div style={{ ...styles.display, fontSize: 10, letterSpacing: '0.3em', color: '#7a8571' }}>
            ⟡  THE FIELD GUIDE  ⟡
          </div>
        </div>

        {/* Hint line — only shown once anything is unlocked, otherwise the empty
            state in the right pane carries the message. */}
        {anyUnlocked && (
          <div style={{
            textAlign: 'center', fontSize: 12, color: '#7a8571', fontStyle: 'italic', marginBottom: 14,
          }}>
            Stories the elders pass down. One page for every topic you master.
          </div>
        )}

        {/* Two-pane layout: sidebar (left) + page (right) on wide screens.
            On narrow viewports the grid still works — the sidebar simply
            renders short above the page. */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
          gap: 14,
        }}>
          {/* SIDEBAR */}
          <div style={{
            background: 'rgba(26, 36, 25, 0.4)',
            border: '1px solid #2a3329',
            borderRadius: 2,
            padding: '10px 6px',
            alignSelf: 'start',
          }}>
            <div style={{
              ...styles.display,
              fontSize: 9, letterSpacing: '0.3em', color: '#7a8571',
              padding: '4px 10px 10px',
              borderBottom: '1px dotted rgba(122, 133, 113, 0.25)',
              marginBottom: 8,
              textAlign: 'center',
            }}>
              ELDERS&apos; SCROLL · {entries.filter((e) => e.unlocked).length} / {entries.length}
            </div>
            <div style={{ display: 'grid', gap: 2 }}>
              {entries.map((e) => {
                const isActive = e.topic === selectedTopic;
                const isLocked = !e.unlocked;
                return (
                  <button
                    key={e.topic}
                    onClick={() => setSelectedTopic(e.topic)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 10px',
                      background: isActive ? 'rgba(58, 67, 57, 0.45)' : 'transparent',
                      border: '1px solid transparent',
                      borderLeft: isActive ? `2px solid ${accent}` : '2px solid transparent',
                      color: isLocked ? '#5a6155' : '#c8c0a8',
                      cursor: 'pointer',
                      borderRadius: 2,
                      fontFamily: "'Crimson Text', serif",
                    }}
                  >
                    <span style={{
                      color: isLocked ? '#3a4339' : accent,
                      flexShrink: 0, marginTop: 2,
                    }}>
                      <TopicGlyph topic={e.topic} size={16} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        display: 'block',
                        ...styles.display,
                        fontSize: 10, letterSpacing: '0.2em',
                        color: isLocked ? '#5a6155' : '#a39d88',
                        marginBottom: 3,
                      }}>
                        {TOPIC_LABEL[e.topic] || e.topic}
                      </span>
                      <span style={{
                        display: 'block',
                        fontSize: 13,
                        lineHeight: 1.35,
                        color: isLocked ? '#5a6155' : (isActive ? '#e8dcc0' : '#c8c0a8'),
                        fontStyle: isLocked ? 'italic' : 'normal',
                      }}>
                        {isLocked ? '— sealed —' : e.title}
                      </span>
                      {isLocked && (
                        <span style={{
                          display: 'block',
                          fontSize: 10,
                          color: '#5a6155',
                          marginTop: 4,
                          ...styles.display,
                          letterSpacing: '0.18em',
                        }}>
                          {e.trusted} / {e.threshold} TRUSTED
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PAGE */}
          <div style={{
            ...panel,
            padding: 24,
            marginBottom: 0,
            minHeight: 360,
          }}>
            {!anyUnlocked ? (
              // Whole-guide empty state.
              <div style={{ textAlign: 'center', padding: '32px 8px' }}>
                <div style={{
                  ...styles.display,
                  fontSize: 11, letterSpacing: '0.3em',
                  color: '#7a8571', marginBottom: 16,
                }}>
                  THE FIELD GUIDE IS QUIET
                </div>
                <p style={{
                  fontSize: 15,
                  color: '#a39d88',
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                  maxWidth: 440, margin: '0 auto',
                }}>
                  The elders are saving their stories for a warrior who has earned them.
                  Master a topic — five facts to <span style={{ color: '#7a9d6a' }}>Trusted</span> —
                  and an elder will share a page with you.
                </p>
              </div>
            ) : selected && selected.unlocked ? (
              <FieldGuidePage page={selected} accent={accent} />
            ) : selected ? (
              <LockedPageStub entry={selected} accent={accent} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// One unlocked lore page rendered as readable prose. Title in Cinzel, body
// in Crimson Text serif, italic spans preserved via *...* markers parsed by
// formatBody below.
const FieldGuidePage = ({ page, accent }) => {
  return (
    <div>
      <div style={{
        ...styles.display,
        fontSize: 10, letterSpacing: '0.3em',
        color: '#7a8571', marginBottom: 6,
      }}>
        {(TOPIC_LABEL[page.topic] || page.topic).toUpperCase()} · A STORY FROM THE ELDERS
      </div>
      <h2 style={{
        ...styles.display,
        fontSize: 22, margin: '0 0 18px',
        color: accent, fontWeight: 700, letterSpacing: '0.04em',
        lineHeight: 1.25,
      }}>
        {page.title}
      </h2>
      <div style={{
        fontSize: 15,
        color: '#d4cdb8',
        lineHeight: 1.75,
        fontFamily: "'Crimson Text', 'EB Garamond', Georgia, serif",
      }}>
        {(page.body || []).map((para, i) => (
          <p key={i} style={{ margin: '0 0 14px' }}>
            {formatBody(para)}
          </p>
        ))}
      </div>
      <div style={{
        marginTop: 18, paddingTop: 14,
        borderTop: '1px dotted rgba(122, 133, 113, 0.3)',
        textAlign: 'center',
        fontSize: 10, ...styles.display, letterSpacing: '0.3em',
        color: '#5a6155',
      }}>
        ⟡
      </div>
    </div>
  );
};

// Locked-state right pane.
const LockedPageStub = ({ entry, accent }) => {
  return (
    <div style={{ textAlign: 'center', padding: '24px 8px' }}>
      <div style={{
        ...styles.display,
        fontSize: 10, letterSpacing: '0.3em',
        color: '#7a8571', marginBottom: 6,
      }}>
        {(TOPIC_LABEL[entry.topic] || entry.topic).toUpperCase()} · SEALED
      </div>
      <h2 style={{
        ...styles.display,
        fontSize: 22, margin: '0 0 18px',
        color: '#5a6155', fontWeight: 700, letterSpacing: '0.04em',
        fontStyle: 'italic',
      }}>
        — page sealed —
      </h2>
      <p style={{
        fontSize: 14,
        color: '#a39d88',
        fontStyle: 'italic',
        lineHeight: 1.7,
        maxWidth: 420, margin: '0 auto 18px',
      }}>
        {entry.unlockHint}
      </p>
      <div style={{
        display: 'inline-block',
        padding: '10px 16px',
        border: `1px solid ${accent}`,
        borderRadius: 2,
        fontSize: 11, ...styles.display, letterSpacing: '0.25em',
        color: accent,
      }}>
        {entry.trusted} OF {entry.threshold} TRUSTED FACTS
      </div>
    </div>
  );
};

// Render a paragraph string with *italic* wrapping. Tiny in-file parser —
// we don't want a markdown dependency for what is one inline style.
function formatBody(text) {
  if (!text || typeof text !== 'string') return null;
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 1) {
      return (
        <em key={i} style={{ color: '#e8dcc0' }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
