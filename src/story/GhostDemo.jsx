import { useEffect, useRef, useState } from "react";
import { PACE } from "./reel";
import "./GhostDemo.css";

// The live prototype in a phone-sized iframe, driven by a scripted cursor. The iframe is same-origin,
// so the script can find real elements, glide to them and click them. Coordinates are read inside the
// iframe and the cursor lives in the same scaled wrapper, so no conversion is needed.
const FRAME = { w: 430, h: 900 };

const NO_PREP = [];

const abortError = () => new DOMException("aborted", "AbortError");

// A sleep that only counts down while the demo is not paused.
const makeSleep = (pausedRef) => (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal.aborted) return reject(abortError());
    const tick = 50;
    let left = ms;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      left -= tick;
      if (left <= 0) {
        clearInterval(timer);
        resolve();
      }
    }, tick);
    signal.addEventListener(
      "abort",
      () => {
        clearInterval(timer);
        reject(abortError());
      },
      { once: true },
    );
  });

// Finds a step's element. `text` matches the exact label, `has` matches part of the text, `pick: "last"` takes the
// last match, and `child` then looks for a nested element (for example the switch inside a settings row).
async function waitFor(doc, step, signal, sleep) {
  for (let waited = 0; waited < 5000; waited += 100) {
    const found = [...doc.querySelectorAll(step.target)].filter(
      (el) => (!step.text || el.textContent.trim() === step.text) && (!step.has || el.textContent.includes(step.has)),
    );
    if (found.length) {
      const el = step.pick === "last" ? found[found.length - 1] : found[0];
      const inner = step.child ? el.querySelector(step.child) : el;
      if (inner) return inner;
    }
    await sleep(100, signal);
  }
  throw new Error(`Demo target not found: ${step.target}`);
}

export default function GhostDemo({ start, steps, prep = NO_PREP, paused = false, onDone, end }) {
  const frameRef = useRef(null);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  const [runId, setRunId] = useState(0);
  const [mode, setMode] = useState("auto");
  const [caption, setCaption] = useState("");
  const [cursor, setCursor] = useState({ x: FRAME.w / 2, y: FRAME.h - 160, visible: false, press: false, clicks: 0 });
  const [scale, setScale] = useState(1);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(null);

  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 250) / FRAME.h));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    if (mode !== "auto") return undefined;
    const controller = new AbortController();
    const { signal } = controller;
    const sleep = makeSleep(pausedRef);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let highlighted = null;

    const clearHighlight = () => {
      if (highlighted) {
        highlighted.style.outline = "";
        highlighted.style.outlineOffset = "";
        highlighted = null;
      }
    };

    (async () => {
      try {
        // Poll for readiness instead of relying on the iframe load event, which can fire before this effect runs.
        let doc = null;
        for (let waited = 0; waited < 10000; waited += 100) {
          const d = frameRef.current?.contentDocument;
          if (d && d.readyState === "complete" && d.location.href !== "about:blank" && d.getElementById("root")?.childElementCount) {
            doc = d;
            break;
          }
          await sleep(100, signal);
        }
        if (!doc) throw new Error("Demo prototype did not load");
        await sleep(700, signal);
        // Silent set-up taps (no cursor, no caption), for state the viewer should not have to watch being prepared.
        for (const prepStep of prep) {
          (await waitFor(doc, prepStep, signal, sleep)).click();
          await sleep(350, signal);
        }
        if (prep.length) await sleep(400, signal);
        // "Starting in 3, 2, 1" over the phone, so the viewer is looking before the cursor moves.
        for (let n = PACE.countdownFrom; n >= 1; n -= 1) {
          setCount(n);
          await sleep(PACE.countdownStepMs, signal);
        }
        setCount(null);
        for (const step of steps) {
          clearHighlight();
          const el = await waitFor(doc, step, signal, sleep);
          el.scrollIntoView({ block: "center" });
          await sleep(60, signal);
          const rect = el.getBoundingClientRect();
          setCaption(step.caption);
          setCursor((c) => ({ ...c, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, visible: true }));
          await sleep(reduced ? 0 : PACE.glideMs, signal);
          el.style.outline = "2px solid #6ea8fe";
          el.style.outlineOffset = "3px";
          highlighted = el;
          if (step.action === "click") {
            setCursor((c) => ({ ...c, press: true, clicks: c.clicks + 1 }));
            await sleep(PACE.pressMs, signal);
            el.click();
            setCursor((c) => ({ ...c, press: false }));
          }
          await sleep((step.hold ?? 1200) * PACE.hold, signal);
        }
        clearHighlight();
        setDone(true);
        onDone?.();
      } catch (error) {
        clearHighlight();
        if (error.name !== "AbortError") console.error(error);
      }
    })();

    return () => {
      controller.abort();
      clearHighlight();
      setCount(null);
    };
  }, [mode, runId, steps, prep]); // eslint-disable-line react-hooks/exhaustive-deps

  const replay = () => {
    setMode("auto");
    setDone(false);
    setCaption("");
    setCursor((c) => ({ ...c, visible: false }));
    setRunId((id) => id + 1);
  };

  const takeOver = () => {
    setMode("manual");
    setCaption("");
    setCursor((c) => ({ ...c, visible: false }));
  };

  const src = `${window.location.pathname}#${start}`;

  return (
    <div className="ghost">
      <div className="ghost__viewport" style={{ width: FRAME.w * scale, height: FRAME.h * scale }}>
        <div className="ghost__stage" style={{ width: FRAME.w, height: FRAME.h, transform: `scale(${scale})` }}>
          <iframe
            key={runId}
            ref={frameRef}
            title="Live prototype"
            className="ghost__frame"
            src={src}
            width={FRAME.w}
            height={FRAME.h}
          />
          {mode === "auto" && <div className="ghost__shield" />}
          {mode === "auto" && cursor.visible && (
            <div className="ghost__cursor" style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}>
              <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true" className={cursor.press ? "is-press" : ""}>
                <path d="M3 2l18 11-8 2.2 4.6 8.6-3.6 1.9-4.6-8.7L3 22z" fill="#fff" stroke="#0b0d12" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              {cursor.press && <span key={cursor.clicks} className="ghost__ripple" />}
            </div>
          )}
        </div>
        {count !== null && mode === "auto" && (
          <div className="ghost__count" aria-live="polite">
            <span>Starting in</span>
            <strong key={count}>{count}</strong>
          </div>
        )}
        {done && mode === "auto" && (
          <div className="ghost__end">
            {end}
            <div className="ghost__end-row">
              <button type="button" className="ghost__pill" onClick={replay}>
                Replay
              </button>
              <button type="button" className="ghost__pill" onClick={takeOver}>
                I want to explore myself
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="ghost__caption" aria-live="polite">
        {mode === "manual" ? "Your turn. Tap around." : done ? "" : count !== null ? "" : caption || "Loading the prototype..."}
      </p>

      <div className="ghost__controls">
        {!(done && mode === "auto") && (
          <button type="button" onClick={replay}>
            Replay
          </button>
        )}
        {mode === "auto" && !done && (
          <button type="button" onClick={takeOver}>
            Take over
          </button>
        )}
      </div>
    </div>
  );
}
