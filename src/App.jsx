import React, { useState, useEffect } from 'react';

// Data
import { CLANS, MENTORS_BY_CLAN, MEDICINE_CATS_BY_CLAN } from './data/clans.js';
import { PATROLS, PATH_WARRIOR, PATH_MEDICINE, ranksFor } from './data/ranks.js';
import { PREY_COMMON, PREY_EARLY, HERBS } from './data/prey.js';
import { PRAISE, PREY_FLAVOR, HERB_FLAVOR, BORDER_FLAVOR, TRAINING_FLAVOR, VIGIL_FLAVOR, REVEAL_LINES } from './data/flavor.js';
import { lookupStrategy } from './data/strategies.js';

// Engine
import { pick, weightedPick, newSlotId } from './engine/utils.js';
import { SR_BUCKET, SAVE_VERSION, ensureFact, applySRResult, personalThreshold, appendSample } from './engine/sr.js';
import { mentorFocus, FOCUS_RANK_BONUS_PER_CORRECT, patrolStatus } from './engine/patrolGate.js';
import { rollTrinket } from './data/trinkets.js';
import { autoRankForCorrect, rollEligibleChanceRank, getFullName } from './engine/rank.js';
import { generateProblem } from './engine/generators.js';
import { normalizeProfile, normalizeToV13 } from './engine/migration.js';
import { checkAchievements, markEarned } from './engine/achievements.js';

// Storage
import { storage, SAVES_KEY, loadSavesContainer, persistContainer } from './storage/storage.js';

// Shared chrome
import { styles } from './components/shared/styles.js';
import { FontLoader } from './components/shared/FontLoader.jsx';

// Views
import { IntroView } from './components/views/IntroView.jsx';
import { SlotListView } from './components/views/SlotListView.jsx';
import { CharacterCreation } from './components/views/CharacterCreation.jsx';
import { ApprenticeCeremony } from './components/views/ApprenticeCeremony.jsx';
import { NameCeremony } from './components/views/NameCeremony.jsx';
import { DeputyCeremony } from './components/views/DeputyCeremony.jsx';
import { LeaderCeremony } from './components/views/LeaderCeremony.jsx';
import { DenView } from './components/views/DenView.jsx';
import { PatrolView } from './components/views/PatrolView.jsx';
import { CompleteView } from './components/views/CompleteView.jsx';
import { StoryPromptView } from './components/views/StoryPromptView.jsx';
import { FlashcardsView } from './components/views/FlashcardsView.jsx';
import { StatsView } from './components/views/StatsView.jsx';
import { DecorateView } from './components/views/DecorateView.jsx';
import { FieldGuideView } from './components/views/FieldGuideView.jsx';
import { HonorsView } from './components/views/HonorsView.jsx';

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export default function WarriorsPath() {
  const [container, setContainer] = useState(null);
  const [view, setView] = useState('loading');
  const [patrol, setPatrol] = useState(null);
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  const [storyPrompt, setStoryPrompt] = useState(null);
  const [storyDraft, setStoryDraft] = useState('');
  const [problemStartedAt, setProblemStartedAt] = useState(null);
  const [patrolStartedAt, setPatrolStartedAt] = useState(null);
  const [pendingCeremony, setPendingCeremony] = useState(null);

  const profile = container && container.slots.find((s) => s.id === container.activeId);

  useEffect(() => { (async () => {
    const loaded = await loadSavesContainer();
    if (loaded && loaded.slots.length > 0) {
      const active = loaded.slots.find((s) => s.id === loaded.activeId) || loaded.slots[0];
      const today = new Date().toDateString();
      if (active.lastPlayed && active.lastPlayed !== today) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (active.lastPlayed !== yesterday.toDateString()) active.streak = 0;
        active.patrolsToday = 0;
      }
      loaded.activeId = active.id;
      setContainer(loaded);
      setView(loaded.slots.length > 1 ? 'slots' : 'den');
    } else {
      setView('intro');
    }
  })(); }, []);

  // ---- Slot/profile helpers ----

  const persist = async (next) => { setContainer(next); await persistContainer(next); };

  const updateActive = async (mutator) => {
    if (!container) return;
    const next = {
      ...container,
      slots: container.slots.map((s) => (s.id === container.activeId ? mutator(s) : s)),
    };
    await persist(next);
    return next.slots.find((s) => s.id === next.activeId);
  };

  const addSlotAndActivate = async (newProfile) => {
    const next = container
      ? { ...container, activeId: newProfile.id, slots: [...container.slots, newProfile] }
      : { _format: 'warriors-path-saves', _version: SAVE_VERSION, activeId: newProfile.id, slots: [newProfile] };
    await persist(next);
  };

  const setActiveSlot = async (id) => {
    if (!container) return;
    await persist({ ...container, activeId: id });
  };

  const deleteSlot = async (id) => {
    if (!container) return;
    const remaining = container.slots.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      await storage.delete(SAVES_KEY);
      setContainer(null);
      setView('intro');
      return;
    }
    const next = { ...container, slots: remaining, activeId: remaining[0].id };
    await persist(next);
  };

  // ---- Export / import ----

  const exportProfile = () => {
    if (!profile) return;
    const data = { _format: 'warriors-path-save', _version: SAVE_VERSION, _exportedAt: new Date().toISOString(), profile };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warriors-path-${getFullName(profile)}-${profile.clan}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importProfile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        let raw = null;
        if (data && data.profile) raw = data.profile;
        else if (data && Array.isArray(data.slots) && data.slots.length > 0) raw = data.slots[0];
        else if (data && (data.prefix || data.clan)) raw = data;
        if (!raw) {
          alert('That file does not look like a Warrior\'s Path save.');
          return;
        }
        const imported = normalizeProfile({ ...raw, id: newSlotId() });
        await addSlotAndActivate(imported);
        setView('den');
      } catch (err) {
        alert('Could not read save file: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // ---- Patrol completion / rank-ups / ceremony detection ----

  const finishPatrol = async (correct, rewards) => {
    const today = new Date().toDateString();
    const isNewDay = profile.lastPlayed !== today;
    const endedAt = Date.now();
    const startedAt = patrolStartedAt || endedAt;
    const historyEntry = {
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt,
      topic: patrol.type.topic,
      patrolId: patrol.type.id,
      total: patrol.problems.length,
      correct,
      hintsShown: patrol.hintsShown || 0,
      strategiesShown: patrol.strategiesShown || 0,
      reveals: patrol.reveals || 0,
    };

    // v15.0.0-f gamification:
    //   1. Focus-topic bonus: if this patrol's topic matches today's mentor
    //      focus, accumulate bonus rank credit (0.5 per correct → 1.5x effective
    //      rank progress). totalCorrect stays honest for stats.
    //   2. Trinket roll: ~35% chance of a small keepsake on patrol completion.
    //      Eligibility doesn't depend on caps — even a capped patrol's drop
    //      still rolls (in case caps are bypassed or relaxed in future).
    const focus = mentorFocus(profile, endedAt);
    const isFocusPatrol = focus.topic === patrol.type.topic;
    const focusBonus = isFocusPatrol ? correct * FOCUS_RANK_BONUS_PER_CORRECT : 0;
    const trinket = Math.random() < 0.35 ? rollTrinket(patrol.type.id) : null;

    const updated = await updateActive((p) => {
      const newStreak = isNewDay ? (p.streak || 0) + 1 : (p.streak || 0);
      const next = {
        ...p,
        totalCorrect: p.totalCorrect + correct,
        totalAttempted: p.totalAttempted + patrol.problems.length,
        preyCaught: { ...(p.preyCaught || {}) },
        herbsCaught: { ...(p.herbsCaught || {}) },
        streak: newStreak,
        bestStreak: Math.max(p.bestStreak || 0, newStreak),
        lastPlayed: today,
        patrolsToday: isNewDay ? 1 : (p.patrolsToday || 0) + 1,
        patrolHistory: [...(p.patrolHistory || []), historyEntry].slice(-200),
        rankBonusCorrect: (p.rankBonusCorrect || 0) + focusBonus,
        trinkets: trinket
          ? { ...(p.trinkets || {}), [trinket.id]: ((p.trinkets || {})[trinket.id] || 0) + 1 }
          : (p.trinkets || {}),
      };
      rewards.prey.forEach((x) => { next.preyCaught[x] = (next.preyCaught[x] || 0) + 1; });
      rewards.herbs.forEach((x) => { next.herbsCaught[x] = (next.herbsCaught[x] || 0) + 1; });

      // Stash transient flags for the CompleteView to render once.
      next._focusBonus = focusBonus;
      next._isFocusPatrol = isFocusPatrol;
      next._trinketFound = trinket;

      // Rank-up: use rankFloor-aware count so migrated saves don't demote on next patrol.
      // rankBonusCorrect is added on top so focus-topic patrols ratchet rank faster.
      // Promotions only ratchet UP.
      const effectiveCorrect = Math.max(
        Math.floor(next.totalCorrect + (next.rankBonusCorrect || 0)),
        p.rankFloor || 0
      );
      const autoRank = autoRankForCorrect(p.path, effectiveCorrect);
      const ladder = ranksFor(p.path);
      const currentIdx = ladder.findIndex((r) => r.name === p.rank);
      const autoIdx = ladder.findIndex((r) => r.name === autoRank);
      let newRank = autoIdx > currentIdx ? autoRank : p.rank;

      const chancePick = rollEligibleChanceRank({ ...next, rank: newRank });
      if (chancePick) newRank = chancePick;

      next._rankUp = newRank !== p.rank;
      next._previousRank = p.rank;
      next.rank = newRank;

      if (next.rank === 'Leader' && p.rank !== 'Leader') {
        next._oldSuffix = p.suffix;
        next.suffix = 'star';
      }
      return next;
    });

    // v15.0.0-h Phase 3 — check for newly-earned Honors against the JUST-updated
    // profile. Persist the earned ids so they don't re-trigger, and stash the
    // full records on a transient field so CompleteView can render the
    // one-shot ceremony block. Same pattern as _trinketFound / _focusBonus.
    let newlyEarned = [];
    if (updated) {
      newlyEarned = checkAchievements(updated);
      if (newlyEarned.length > 0) {
        const newIds = newlyEarned.map((a) => a.id);
        await updateActive((p) => {
          const merged = markEarned(p, newIds);
          // Stash transient records (full objects) for CompleteView. Cleared
          // when the player taps RETURN TO CAMP (we don't persist this; it's
          // recomputed on each patrol completion).
          return { ...merged, _newlyEarned: newlyEarned };
        });
      }
    }

    if (updated && updated._rankUp) {
      const r = updated.rank;
      if (r === 'Young Warrior') { setPendingCeremony('warrior');  setView('name_ceremony'); return; }
      if (r === 'Medicine Cat')  { setPendingCeremony('medicine'); setView('name_ceremony'); return; }
      if (r === 'Deputy')        { setView('deputy_ceremony'); return; }
      if (r === 'Leader')        { setView('leader_ceremony'); return; }
    }
    setView('complete');
  };

  // =====================================================================
  // VIEW SWITCH
  // =====================================================================

  if (view === 'loading') {
    return (
      <div style={styles.root}>
        <FontLoader />
        <div style={{ textAlign: 'center', padding: '120px 20px', opacity: 0.6 }}>
          <div style={{ ...styles.display, fontSize: 14, letterSpacing: '0.3em' }}>THE FOREST STIRS...</div>
        </div>
      </div>
    );
  }

  if (view === 'intro') {
    return <IntroView
      onStart={() => setView('character')}
      onImport={importProfile}
      hasSlots={container && container.slots.length > 0}
      onChooseSlot={() => setView('slots')}
    />;
  }

  if (view === 'slots') {
    return <SlotListView
      container={container}
      onSelect={async (id) => { await setActiveSlot(id); setView('den'); }}
      onNew={() => setView('character')}
      onDelete={async (id) => {
        if (window.confirm('Forget this Clan cat? This cannot be undone. (Save to file first if you want to keep them.)')) {
          await deleteSlot(id);
        }
      }}
      onImport={importProfile}
    />;
  }

  if (view === 'character') {
    return <CharacterCreation
      onCreate={async (data) => {
        const medCatHasOpening = Math.random() < 0.7;
        const newProfile = {
          _version: SAVE_VERSION,
          id: newSlotId(),
          prefix: data.prefix,
          suffix: '',
          path: PATH_WARRIOR,
          rank: 'Apprentice',
          clan: data.clan,
          furColor: data.furColor,
          eyeColor: data.eyeColor,
          mentor: null,
          medCatOpening: medCatHasOpening,
          totalCorrect: 0,
          totalAttempted: 0,
          rankFloor: 0,
          preyCaught: {},
          herbsCaught: {},
          streak: 0,
          lastPlayed: null,
          patrolsToday: 0,
          dateCreated: new Date().toISOString(),
          factsSR: {},
          factStories: {},
        };
        await addSlotAndActivate(newProfile);
        setView('apprentice_ceremony');
      }}
      onCancel={() => setView(container && container.slots.length > 0 ? 'slots' : 'intro')}
    />;
  }

  if (view === 'apprentice_ceremony') {
    return <ApprenticeCeremony
      profile={profile}
      onComplete={async (path) => {
        await updateActive((p) => {
          const isMed = path === PATH_MEDICINE;
          const mentor = isMed
            ? MEDICINE_CATS_BY_CLAN[p.clan]
            : pick(MENTORS_BY_CLAN[p.clan] || ['Lionheart']);
          return {
            ...p,
            path,
            rank: isMed ? 'Medicine Cat Apprentice' : 'Apprentice',
            mentor,
          };
        });
        setView('den');
      }}
    />;
  }

  if (view === 'name_ceremony') {
    return <NameCeremony
      profile={profile}
      ceremony={pendingCeremony}
      onComplete={async (suffix) => {
        await updateActive((p) => ({ ...p, suffix }));
        setPendingCeremony(null);
        setView('complete');
      }}
    />;
  }

  if (view === 'deputy_ceremony') {
    return <DeputyCeremony profile={profile} onContinue={() => setView('complete')} />;
  }

  if (view === 'leader_ceremony') {
    return <LeaderCeremony profile={profile} onContinue={() => setView('complete')} />;
  }

  if (view === 'den') {
    return <DenView
      profile={profile}
      slotsCount={container ? container.slots.length : 0}
      onStartPatrol={(patrolType) => {
        // Belt-and-suspenders: DenView already greys out capped patrols, but
        // also reject here in case anything bypasses the UI.
        if (patrolStatus(profile, patrolType.id).capped) return;
        const problems = Array.from({ length: 5 }, () => generateProblem(patrolType.topic, profile));
        setPatrol({
          type: patrolType, problems, currentIdx: 0, correct: 0,
          rewards: { prey: [], herbs: [], borders: 0, training: 0, vigils: 0 },
          attempts: 0,
          hintsShown: 0, strategiesShown: 0, reveals: 0,
        });
        setAnswerInput(''); setFeedback(null); setShowHint(false); setShowStrategy(false);
        const now = Date.now();
        setProblemStartedAt(now);
        setPatrolStartedAt(now);
        setView('patrol');
      }}
      onOpenFlashcards={() => setView('flashcards')}
      onOpenStats={() => setView('stats')}
      onOpenDecorate={() => setView('decorate')}
      onOpenFieldGuide={() => setView('fieldGuide')}
      onOpenHonors={() => setView('honors')}
      onSwitchCharacter={() => setView('slots')}
      onExport={exportProfile}
      onImport={importProfile}
    />;
  }

  if (view === 'decorate') {
    return <DecorateView
      profile={profile}
      onBack={() => setView('den')}
      onEquip={async (slot, trinketId) => {
        await updateActive((p) => ({
          ...p,
          equipped: { ...(p.equipped || {}), [slot]: trinketId },
        }));
      }}
    />;
  }

  if (view === 'stats') {
    return <StatsView profile={profile} onBack={() => setView('den')} />;
  }

  if (view === 'fieldGuide') {
    return <FieldGuideView profile={profile} onBack={() => setView('den')} />;
  }

  if (view === 'flashcards') {
    return <FlashcardsView
      profile={profile}
      onSave={async (factId, story) => {
        await updateActive((p) => ({
          ...p,
          factStories: { ...(p.factStories || {}), [factId]: story },
        }));
      }}
      onDelete={async (factId) => {
        await updateActive((p) => {
          const next = { ...(p.factStories || {}) };
          delete next[factId];
          return { ...p, factStories: next };
        });
      }}
      onBack={() => setView('den')}
    />;
  }

  // Story prompt overlay takes precedence over the patrol view.
  if (storyPrompt) {
    return <StoryPromptView
      profile={profile}
      factQuestion={storyPrompt.question}
      story={storyDraft}
      onChange={setStoryDraft}
      onSkip={async () => {
        const wasResuming = patrol && patrol._pendingResume;
        setStoryPrompt(null); setStoryDraft('');
        if (wasResuming) {
          const np = { ...patrol }; delete np._pendingResume; setPatrol(np);
          if (patrol.currentIdx >= patrol.problems.length) finishPatrol(patrol.correct, patrol.rewards);
          else setProblemStartedAt(Date.now());
        }
      }}
      onSave={async () => {
        const trimmed = storyDraft.trim().slice(0, 200);
        if (trimmed) {
          await updateActive((p) => ({ ...p, factStories: { ...(p.factStories || {}), [storyPrompt.factId]: trimmed } }));
        }
        const wasResuming = patrol && patrol._pendingResume;
        setStoryPrompt(null); setStoryDraft('');
        if (wasResuming) {
          const np = { ...patrol }; delete np._pendingResume; setPatrol(np);
          if (patrol.currentIdx >= patrol.problems.length) finishPatrol(patrol.correct, patrol.rewards);
          else setProblemStartedAt(Date.now());
        }
      }}
    />;
  }

  if (view === 'patrol') {
    const current = patrol.problems[patrol.currentIdx];
    const clan = CLANS.find((c) => c.name === profile.clan);
    const factStory = current.factId ? (profile.factStories || {})[current.factId] : null;
    return <PatrolView
      patrol={patrol}
      profile={profile}
      current={current}
      factStory={factStory}
      answerInput={answerInput}
      setAnswerInput={setAnswerInput}
      feedback={feedback}
      showHint={showHint}
      setShowHint={(v) => {
        if (v && !showHint) {
          setPatrol((p) => p ? { ...p, hintsShown: (p.hintsShown || 0) + 1 } : p);
        }
        setShowHint(v);
      }}
      showStrategy={showStrategy}
      strategy={current.factId ? lookupStrategy(current.factId, current.factA, current.factB) : null}
      clanAccent={clan.accent}
      onSubmit={async () => {
        const isTime = current.kind && current.kind.startsWith('time-');
        let num;
        if (isTime) {
          const parts = String(answerInput || '').split(':');
          const h = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (isNaN(h) || isNaN(m)) {
            setFeedback({ type: 'nudge', text: 'Enter hours and minutes, warrior.' });
            return;
          }
          num = h * 60 + m;
        } else {
          num = parseInt(answerInput, 10);
          if (isNaN(num)) {
            setFeedback({ type: 'nudge', text: 'Enter a number, warrior.' });
            return;
          }
        }
        const elapsedMs = problemStartedAt ? (Date.now() - problemStartedAt) : 99999;
        const topic = patrol.type.topic;

        // Record per-problem analytics. v17 — every problem produces a factId
        // (the generators all set one), so SR fires on every answer. kind comes
        // from the problem itself (e.g. 'time-duration', 'geometry') and drives
        // both the per-kind threshold lookup and the kindSamples ring used for
        // personal-fast calibration.
        const problemKind = current.kind;
        const recordResult = async (isCorrect, outcome) => {
          await updateActive((p) => {
            const next = { ...p };
            if (current.factId) {
              const sr = { ...(p.factsSR || {}) };
              const entry = ensureFact(sr, current.factId);
              const personalFastMs = personalThreshold(p, problemKind);
              sr[current.factId] = applySRResult(entry, isCorrect, elapsedMs, problemKind, personalFastMs);
              next.factsSR = sr;
            }
            // Per-kind sample ring — only on correct answers, so personal-fast
            // reflects "what does she do when she gets it right" rather than
            // being skewed by struggle-and-give-up timings.
            if (isCorrect && problemKind) {
              next.kindSamples = appendSample(p.kindSamples || {}, problemKind, elapsedMs);
            }
            const ts = { ...(p.topicStats || {}) };
            const stats = ts[topic] || { attempted: 0, correct: 0, totalElapsedMs: 0, hintsShown: 0, strategiesShown: 0, reveals: 0 };
            ts[topic] = {
              ...stats,
              attempted: stats.attempted + 1,
              correct: stats.correct + (isCorrect ? 1 : 0),
              totalElapsedMs: stats.totalElapsedMs + elapsedMs,
              hintsShown: stats.hintsShown + (showHint ? 1 : 0),
              strategiesShown: stats.strategiesShown + (showStrategy ? 1 : 0),
              reveals: stats.reveals + (outcome === 'reveal' ? 1 : 0),
            };
            next.topicStats = ts;
            // v15.0.0-e — elapsedHistogram is no longer maintained. The
            // dashboard computes the histogram on-the-fly from kindSamples,
            // which holds the raw ms values for the last 50 correct answers
            // per kind. Older saves keep their legacy elapsedHistogram field
            // (now vestigial) — migration leaves it alone.
            return next;
          });
        };

        if (num === current.answer) {
          await recordResult(true, 'correct');
          const reward = buildCorrectReward(patrol.type, profile);
          setFeedback({ type: 'correct', praise: pick(PRAISE), ...reward });
          const nextIdx = patrol.currentIdx + 1;
          const nextRewards = {
            ...patrol.rewards,
            prey: reward.prey ? [...patrol.rewards.prey, reward.prey] : patrol.rewards.prey,
            herbs: reward.herb ? [...patrol.rewards.herbs, reward.herb] : patrol.rewards.herbs,
            borders: patrol.rewards.borders + (reward.kind === 'border' ? 1 : 0),
            training: patrol.rewards.training + (reward.kind === 'training' ? 1 : 0),
            vigils: (patrol.rewards.vigils || 0) + (reward.kind === 'vigil' ? 1 : 0),
          };
          const updatedPatrol = { ...patrol, correct: patrol.correct + 1, rewards: nextRewards, attempts: 0 };

          const factWasHard = current.factId
            && !(profile.factStories || {})[current.factId]
            && (() => {
              const e = (profile.factsSR || {})[current.factId];
              if (!e) return false;
              return e.bucket === SR_BUCKET.WILD || (e.seen >= 2 && (e.correctStreak || 0) <= 1);
            })();

          setTimeout(() => {
            if (factWasHard) {
              setStoryPrompt({ factId: current.factId, question: current.question });
              setStoryDraft('');
              setPatrol({ ...updatedPatrol, currentIdx: nextIdx, _pendingResume: true });
              setAnswerInput(''); setFeedback(null); setShowHint(false); setShowStrategy(false);
            } else if (nextIdx >= patrol.problems.length) {
              finishPatrol(updatedPatrol.correct, updatedPatrol.rewards);
            } else {
              setPatrol({ ...updatedPatrol, currentIdx: nextIdx });
              setAnswerInput(''); setFeedback(null); setShowHint(false); setShowStrategy(false);
              setProblemStartedAt(Date.now());
            }
          }, 1500);
        } else {
          if (patrol.attempts >= 1) {
            await recordResult(false, 'reveal');
            const revealAnswer = isTime
              ? `${Math.floor(current.answer / 60)}:${String(current.answer % 60).padStart(2, '0')}`
              : current.answer;
            setFeedback({ type: 'reveal', text: `${pick(REVEAL_LINES)} The answer was ${revealAnswer}.` });
            const nextIdx = patrol.currentIdx + 1;
            const updatedPatrol = { ...patrol, reveals: (patrol.reveals || 0) + 1 };
            setTimeout(() => {
              if (nextIdx >= patrol.problems.length) {
                finishPatrol(updatedPatrol.correct, updatedPatrol.rewards);
              } else {
                setPatrol({ ...updatedPatrol, currentIdx: nextIdx, attempts: 0 });
                setAnswerInput(''); setFeedback(null); setShowHint(false); setShowStrategy(false);
                setProblemStartedAt(Date.now());
              }
            }, 2400);
          } else {
            const showStrat = !!current.factId;
            setPatrol({
              ...patrol,
              attempts: patrol.attempts + 1,
              strategiesShown: (patrol.strategiesShown || 0) + (showStrat ? 1 : 0),
            });
            setFeedback({ type: 'try_again', text: 'Not quite. Try again.' });
            setShowStrategy(showStrat);
            setAnswerInput('');
          }
        }
      }}
      onQuit={() => setView('den')}
    />;
  }

  if (view === 'complete') {
    return <CompleteView
      profile={profile}
      patrol={patrol}
      onReturn={async () => {
        // v15.0.0-h Phase 3 — clear the one-shot _newlyEarned stash so the
        // ceremony doesn't render again when the player re-enters the den.
        // Other transient flags (_trinketFound, _focusBonus, _rankUp) follow
        // the existing pattern: they're overwritten by the NEXT finishPatrol
        // so we leave them alone here.
        if (profile && profile._newlyEarned) {
          await updateActive((p) => {
            const next = { ...p };
            delete next._newlyEarned;
            return next;
          });
        }
        setPatrol(null);
        setView('den');
      }}
    />;
  }

  if (view === 'honors') {
    return <HonorsView profile={profile} onBack={() => setView('den')} />;
  }

  return null;
}

// Build the per-problem reward based on patrol kind.
function buildCorrectReward(patrolType, profile) {
  if (patrolType.reward === 'prey') {
    const veryEarly = (profile.totalCorrect || 0) < 8;
    const prey = weightedPick(veryEarly ? PREY_EARLY : PREY_COMMON);
    return { kind: 'prey', prey, flavor: pick(PREY_FLAVOR) };
  }
  if (patrolType.reward === 'herb') {
    const herb = pick(HERBS).name;
    return { kind: 'herb', herb, flavor: pick(HERB_FLAVOR) };
  }
  if (patrolType.reward === 'border') {
    return { kind: 'border', flavor: pick(BORDER_FLAVOR) };
  }
  if (patrolType.reward === 'training') {
    return { kind: 'training', flavor: pick(TRAINING_FLAVOR) };
  }
  if (patrolType.reward === 'vigil') {
    return { kind: 'vigil', flavor: pick(VIGIL_FLAVOR) };
  }
  return { kind: 'none', flavor: '' };
}
