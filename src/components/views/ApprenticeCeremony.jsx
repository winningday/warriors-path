import React, { useState } from 'react';
import { styles, panel, labelStyle, pathChoiceStyle, btnPrimary } from '../shared/styles.js';
import { FontLoader } from '../shared/FontLoader.jsx';
import { CLANS, MENTORS_BY_CLAN, LEADERS_BY_CLAN, MEDICINE_CATS_BY_CLAN } from '../../data/clans.js';
import { PATH_WARRIOR, PATH_MEDICINE } from '../../data/ranks.js';
import { pick } from '../../engine/utils.js';

export const ApprenticeCeremony = ({ profile, onComplete }) => {
  const clan = CLANS.find((c) => c.name === profile.clan);
  const leader = LEADERS_BY_CLAN[profile.clan];
  const possibleMentor = pick(MENTORS_BY_CLAN[profile.clan] || ['Lionheart']);
  const medCat = MEDICINE_CATS_BY_CLAN[profile.clan];
  const medOpening = profile.medCatOpening !== false;

  // Three steps so the medicine-cat path is something you ASK FOR, not just a button:
  //   'choose'  — do you want to ask the medicine cat to be your mentor?
  //   'asking'  — you walk to the medicine cat den and speak.
  //   (then onComplete fires)
  const [step, setStep] = useState('choose');
  const [intent, setIntent] = useState(null); // 'warrior' | 'ask_medicine'

  if (step === 'asking') {
    return (
      <div style={styles.root}>
        <FontLoader />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 12px' }}>
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 10, ...styles.display }}>
              THE MEDICINE CAT'S DEN
            </div>
            <h2 style={{ ...styles.display, fontSize: 22, margin: 0, color: clan.accent, fontWeight: 600 }}>
              YOU ASK FOR A MENTOR
            </h2>
          </div>

          <div style={panel}>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
              You slip past the bramble screen into the medicine cat den. The smell of herbs is sharp and green. <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{medCat}</strong> looks up from sorting leaves.
            </p>
            <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
              "<em>{medCat}, I want to be a medicine cat. Will you take me as your apprentice?</em>"
            </p>
            {medOpening ? (
              <>
                <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                  {medCat} studies you a long moment. Then she dips her head.
                </p>
                <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
                  "<em>I have no apprentice. StarClan has not sent me one — perhaps until now. If your heart is set on this path, I will speak to {leader}.</em>"
                </p>
                <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.7, color: '#a39d88' }}>
                  At the next ceremony, the leader announces a different name for you: not warrior apprentice, but medicine cat apprentice. {medCat} will be your mentor.
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
                  {medCat} sighs, kindly.
                </p>
                <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
                  "<em>I already have an apprentice this season. There is only ever one. But your heart is good, little one — go and learn the warrior way. The Clan needs every kind of cat.</em>"
                </p>
              </>
            )}
          </div>

          {medOpening ? (
            <button onClick={() => onComplete(PATH_MEDICINE)} style={btnPrimary(clan.accent)}>
              ACCEPT THE PATH
            </button>
          ) : (
            <button onClick={() => onComplete(PATH_WARRIOR)} style={btnPrimary(clan.accent)}>
              RETURN TO THE CLEARING
            </button>
          )}
          <button onClick={() => setStep('choose')} style={{
            width: '100%', background: 'transparent', border: 'none', color: '#5a6155',
            fontSize: 11, marginTop: 6, cursor: 'pointer', textDecoration: 'underline',
            fontFamily: "'Crimson Text', serif", letterSpacing: '0.1em',
          }}>
            back
          </button>
        </div>
      </div>
    );
  }

  // 'choose' step
  return (
    <div style={styles.root}>
      <FontLoader />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7a8571', marginBottom: 10, ...styles.display }}>
            APPRENTICE CEREMONY
          </div>
          <h2 style={{ ...styles.display, fontSize: 24, margin: 0, color: clan.accent, fontWeight: 600 }}>
            BENEATH THE HIGHROCK
          </h2>
        </div>

        <div style={panel}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#c8c0a8', fontStyle: 'italic' }}>
            <strong style={{ color: clan.accent, fontStyle: 'normal' }}>{leader}</strong> calls the Clan together. You step out of the nursery, blinking in the sun. The cats of {profile.clan} gather around the Highrock.
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: '#c8c0a8' }}>
            "<em>{profile.prefix}kit, you have reached six moons. From this day forward, until you have earned your warrior name, you will be known as <strong style={{ color: clan.accent }}>{profile.prefix}paw</strong>.</em>"
          </p>
          <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.7, color: '#a39d88' }}>
            Before the leader names your mentor, you have a choice. Most apprentices become warrior apprentices. A rare few feel called to walk the medicine cat's path — but they must ask the medicine cat themselves.
          </p>
        </div>

        <div style={panel}>
          <label style={labelStyle}>WHAT IS IN YOUR HEART?</label>
          <button onClick={() => setIntent('warrior')} style={{
            ...pathChoiceStyle,
            borderColor: intent === 'warrior' ? clan.accent : '#3a4339',
            background: intent === 'warrior' ? 'rgba(217, 118, 66, 0.08)' : 'transparent',
          }}>
            <div style={{ ...styles.display, fontSize: 13, letterSpacing: '0.18em', color: clan.accent, fontWeight: 700 }}>
              I WILL BE A WARRIOR
            </div>
            <div style={{ fontSize: 13, color: '#c8c0a8', marginTop: 6, lineHeight: 1.5 }}>
              "<em>{possibleMentor}, you are ready for an apprentice. You will mentor {profile.prefix}paw. Pass on all you know.</em>"
            </div>
            <div style={{ fontSize: 12, color: '#7a8571', marginTop: 8, fontStyle: 'italic' }}>
              Train with {possibleMentor}. Hunt for the Clan. Walk the borders. Earn your warrior name.
            </div>
          </button>
          <button onClick={() => setIntent('ask_medicine')} style={{
            ...pathChoiceStyle,
            borderColor: intent === 'ask_medicine' ? clan.accent : '#3a4339',
            background: intent === 'ask_medicine' ? 'rgba(217, 118, 66, 0.08)' : 'transparent',
          }}>
            <div style={{ ...styles.display, fontSize: 13, letterSpacing: '0.18em', color: clan.accent, fontWeight: 700 }}>
              I WILL ASK {medCat.toUpperCase()}
            </div>
            <div style={{ fontSize: 13, color: '#c8c0a8', marginTop: 6, lineHeight: 1.5 }}>
              You leave the clearing and pad to the medicine cat den to ask {medCat} to take you as her apprentice.
            </div>
            <div style={{ fontSize: 12, color: '#7a8571', marginTop: 8, fontStyle: 'italic' }}>
              Whether she says yes depends on whether she already has an apprentice. (Medicine cats cannot become Deputy or Leader.)
            </div>
          </button>
        </div>

        <button
          onClick={() => {
            if (intent === 'warrior') onComplete(PATH_WARRIOR);
            else if (intent === 'ask_medicine') setStep('asking');
          }}
          disabled={!intent}
          style={{ ...btnPrimary(clan.accent), opacity: intent ? 1 : 0.45, cursor: intent ? 'pointer' : 'not-allowed' }}>
          {intent === 'ask_medicine' ? 'GO TO THE MEDICINE DEN' : 'ACCEPT THE NAME'}
        </button>
      </div>
    </div>
  );
};
