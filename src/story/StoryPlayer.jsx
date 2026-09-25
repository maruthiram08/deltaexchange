import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import GhostDemo from "./GhostDemo";
import { useScript } from "./ScriptContext";
import "./StoryPlayer.css";

// Turns "**bold** text" into spans, so the doc's highlighted words stay highlighted.
export function Rich({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>,
  );
}

const NAMES = { pain: "The pain", idea: "The idea", demo: "In action" };
// Lines split at sentence ends, and also at a `|` the script can place where the key pain starts inside one sentence.
const sentences = (text) => text.split(/(?<=[.?!])\s+|\s*\|\s*/).filter(Boolean);
// Timing of the pain screen. The last `keys` sentences are the key pains (usually one; a story whose doc lists two
// separate pains sets `punch: 2`). The setup lines come first, then a beat of silence, then the key lines land.
function painTimes(text, keys, PACE) {
  const n = sentences(text).length;
  const gap = PACE.painLineGapMs / 1000;
  const k = n > 1 ? Math.min(keys ?? 1, n) : 0;
  const setup = n - k;
  const firstKey = n === 1 ? 0.4 : setup === 0 ? 0.4 : 0.4 + (setup - 1) * gap + PACE.painPunchPauseMs / 1000;
  const lastKey = k > 1 ? firstKey + (k - 1) * gap : firstKey;
  return { n, k, setup, gap, firstKey, lastKey };
}

// The pain beat lasts long enough to read the text and always leaves time with the key lines on screen.
const readMs = (text, keys, PACE) => {
  const t = painTimes(text, keys, PACE);
  const base = text.length * PACE.painReadMsPerChar + (t.n > 1 ? PACE.painPunchPauseMs : 0);
  return Math.max(PACE.painMinMs, base, (t.lastKey + PACE.painPunchHoldMs / 1000) * 1000);
};

// The pain sentences appear one by one. The setup lines dim when the key lines land, larger and in a warm colour.
function PainLines({ text, keys, pace, reduced }) {
  const lines = sentences(text);
  const t = painTimes(text, keys, pace);
  const [punched, setPunched] = useState(false);

  useEffect(() => {
    if (t.n < 2 || t.setup === 0) return undefined;
    const id = setTimeout(() => setPunched(true), (t.firstKey - 0.2) * 1000);
    return () => clearTimeout(id);
  }, [t.n, t.setup, t.firstKey]);

  return lines.map((line, i) => {
    const punch = i >= t.setup && t.n > 1;
    const at = punch ? t.firstKey + (i - t.setup) * t.gap : 0.4 + i * t.gap;
    if (reduced) {
      return (
        <p key={line} className={punch ? "player__punch" : ""}>
          {line}
        </p>
      );
    }
    return (
      <motion.p
        key={line}
        className={punch ? "player__punch" : ""}
        initial={{ opacity: 0, y: punch ? 20 : 12, scale: punch ? 0.94 : 1 }}
        animate={{ opacity: !punch && punched ? 0.35 : 1, y: 0, scale: 1 }}
        transition={punched && !punch ? { duration: 0.6 } : { delay: at, duration: punch ? 0.7 : 0.5, ease: "easeOut" }}
      >
        {line}
      </motion.p>
    );
  });
}

// One story as a short film: the pain, then the idea, then the live prototype with a ghost cursor.
// Beats advance on their own, and the dots let the viewer jump.
export default function StoryPlayer({ idea, onNext }) {
  const { story } = idea;
  const { pace: PACE } = useScript();
  const reduced = useReducedMotion();
  // The beats a story has: the pain (if the doc gives one), the idea, and the demo (if there is a prototype).
  const kinds = [story.pain && "pain", "idea", story.demo && "demo"].filter(Boolean);
  const [beat, setBeat] = useState(0);
  const kind = kinds[beat];

  const [paused, setPaused] = useState(false);
  // Bumped by "Replay story" so every part of the story remounts and plays from the pain again.
  const [runKey, setRunKey] = useState(0);
  const timer = useRef({ startedAt: 0, left: null });

  // Starting a new beat forgets any time left over from the last one.
  useEffect(() => {
    timer.current.left = null;
  }, [beat]);

  // Beats one and two advance on a timer. Pausing keeps the time that was left and resumes from it.
  useEffect(() => {
    if (paused || kind === "demo" || beat === kinds.length - 1) return undefined;
    const t = timer.current;
    const total = t.left ?? (kind === "pain" ? readMs(story.pain, story.punch, PACE) : PACE.ideaMs);
    t.startedAt = Date.now();
    const id = setTimeout(() => setBeat((b) => b + 1), total);
    return () => {
      clearTimeout(id);
      t.left = total - (Date.now() - t.startedAt);
    };
  }, [beat, kind, kinds.length, paused, story.pain, story.punch, PACE]);

  const lastBeat = kinds.length - 1;
  const nextBeat = () => setBeat((b) => Math.min(lastBeat, b + 1));
  const restartStory = () => {
    timer.current.left = null;
    setPaused(false);
    setBeat(0);
    setRunKey((k) => k + 1);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (["BUTTON", "INPUT", "A"].includes(e.target.tagName)) return;
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "ArrowRight") {
        setBeat((b) => Math.min(lastBeat, b + 1));
      } else if (e.key === "ArrowLeft") {
        setBeat((b) => Math.max(0, b - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lastBeat]);

  const fade = reduced ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 } };

  return (
    <div className="player">
      <div className="player__top">
      <div className="player__dots" role="tablist" aria-label="Story beats">
        {kinds.map((name, i) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={beat === i}
            aria-label={NAMES[name]}
            className={beat === i ? "is-active" : ""}
            onClick={() => setBeat(i)}
          />
        ))}
      </div>
        {(kind !== "idea" || story.demo) && (
        <button type="button" className="player__pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? "▶ Resume" : "❚❚ Pause"}
        </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${beat}-${runKey}`} className="player__beat" {...fade} transition={{ duration: 0.4 }}>
          {kind === "pain" && (
            <div className="player__pain">
              <div className="player__labelrow">
                <p className="player__label">The pain</p>
                {story.tag && (
                  <motion.span
                    className="player__tag"
                    {...(reduced ? {} : { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 }, transition: { delay: painTimes(story.pain, story.punch, PACE).lastKey + 1, duration: 0.5 } })}
                  >
                    {story.tag}
                  </motion.span>
                )}
              </div>
              <PainLines text={story.pain} keys={story.punch} pace={PACE} reduced={reduced} />
              <button type="button" className="player__step" onClick={nextBeat}>
                Next →
              </button>
            </div>
          )}

          {kind === "idea" && (
            <div className="player__idea">
              <p className="player__label">The idea</p>
              <h2>
                <Rich text={story.feature} />
              </h2>
              {story.demo ? (
                <button type="button" className="player__step" onClick={nextBeat}>
                  Next →
                </button>
              ) : (
                onNext && (
                  <button type="button" className="player__next player__next--solo" onClick={onNext}>
                    Next feature →
                  </button>
                )
              )}
            </div>
          )}

          {kind === "demo" && (
            <div className="player__action">
              <GhostDemo
                key={`${idea.id}-${runKey}`}
                start={story.demo.start}
                steps={story.demo.steps}
                prep={story.demo.prep}
                paused={paused}
                onRestart={restartStory}
                end={
                  <>
                    {onNext && (
                      <button type="button" className="player__next" onClick={onNext}>
                        Next feature →
                      </button>
                    )}
                  </>
                }
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
