import { Fragment, useCallback, useEffect, useMemo, useRef } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import StoryPlayer, { Rich } from "../story/StoryPlayer";
import { ScriptProvider, useScript } from "../story/ScriptContext";
import { SCRIPTS, resolveScript } from "../story/scripts";
import "./Theatre.css";

// The walkthrough plays one script at a time. `?script=draft` on the address picks another one and shows a switcher
// in the header so scripts can be compared. The choice is remembered for the browser session, so going back to the
// landing page and into the walkthrough again keeps it. Visitors who never used the parameter get the default script.
const STORE_KEY = "walkthrough-script";
const remembered = () => {
  try {
    return window.sessionStorage.getItem(STORE_KEY);
  } catch {
    return null;
  }
};

export default function Theatre() {
  const [params] = useSearchParams();
  const asked = params.get("script") ?? remembered();
  const scriptId = resolveScript(asked).id;
  useEffect(() => {
    if (!params.has("script")) return;
    try {
      window.sessionStorage.setItem(STORE_KEY, scriptId);
    } catch {
      // Storage can be blocked. The choice then lasts for this page only.
    }
  }, [params, scriptId]);
  return (
    <ScriptProvider id={scriptId}>
      <TheatreScreen switcher={asked !== null} />
    </ScriptProvider>
  );
}

function TheatreScreen({ switcher }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [, setParams] = useSearchParams();
  const script = useScript();
  const idea = id ? script.ideas.find((item) => item.id === id) : null;
  const reelRef = useRef(null);

  // Films with a live prototype come first, then the idea-only ones, which have two screens instead of three.
  const PLAYABLE = useMemo(
    () => [
      ...script.ideas.filter((item) => item.story?.demo),
      ...script.ideas.filter((item) => item.story && !item.story.demo),
    ],
    [script.ideas],
  );

  const select = useCallback(
    (next) => navigate({ pathname: `/watch/${next}`, search }, { replace: true }),
    [navigate, search],
  );

  // The selected row glides to the middle of the reel.
  useEffect(() => {
    reelRef.current?.querySelector(".is-selected")?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }, [id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "j" && e.key !== "k") return;
      e.preventDefault();
      const dir = e.key === "ArrowDown" || e.key === "j" ? 1 : -1;
      const at = PLAYABLE.findIndex((item) => item.id === id);
      const next = PLAYABLE[Math.min(PLAYABLE.length - 1, Math.max(0, at + dir))];
      if (next && next.id !== id) select(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, select, PLAYABLE]);

  if (id && !idea?.story) return <Navigate to={{ pathname: "/watch", search }} replace />;

  const at = PLAYABLE.findIndex((item) => item.id === id);
  const upNext = at >= 0 ? PLAYABLE[at + 1] : null;

  return (
    <div className="theatre">
      <header className="theatre__top">
        <Link to="/" className="theatre__back">
          ← Back
        </Link>
        <span className="theatre__title">Guided walkthrough</span>
        {switcher && (
          <label className="theatre__script">
            Script
            <select value={script.id} onChange={(e) => setParams({ script: e.target.value }, { replace: true })}>
              {Object.entries(SCRIPTS).map(([key, entry]) => (
                <option key={key} value={key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <span className="theatre__legend">
          <span className="theatre__kind is-live">▶</span> Live prototype
          <span className="theatre__kind">◇</span> Idea only
        </span>
      </header>

      <div className="theatre__body">
        <nav className="theatre__reel" ref={reelRef} aria-label="Features">
          {PLAYABLE.map((item, i) => {
            const hasDemo = Boolean(item.story.demo);
            const firstIdeaOnly = !hasDemo && PLAYABLE[i - 1]?.story.demo;
            return (
              <Fragment key={item.id}>
                {firstIdeaOnly && <p className="theatre__divider">Ideas without a prototype</p>}
                <button
                  type="button"
                  className={`theatre__row${item.id === id ? " is-selected" : ""}${hasDemo ? "" : " is-idea-only"}`}
                  onClick={() => select(item.id)}
                >
                  <span className="theatre__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="theatre__text">
                    <span className="theatre__pain">{item.story.tag ?? item.pain}</span>
                    <span className="theatre__fix">
                      <Rich text={item.story.feature} />
                    </span>
                  </span>
                  <span
                    className={`theatre__kind${hasDemo ? " is-live" : ""}`}
                    title={hasDemo ? "Has a live prototype" : "Idea only, no prototype"}
                  >
                    {hasDemo ? "▶" : "◇"}
                  </span>
                </button>
              </Fragment>
            );
          })}
        </nav>

        <section className="theatre__screen" aria-live="polite">
          {!idea && (
            <div className="theatre__empty">
              <p className="theatre__eyebrow">{script.intro.eyebrow}</p>
              <p className="theatre__intro">
                <Rich text={script.intro.text} />
              </p>
              <button type="button" className="theatre__play" onClick={() => select(PLAYABLE[0].id)}>
                <span aria-hidden="true">▶</span> {script.intro.start}
              </button>
              <p className="theatre__hint">{script.intro.hint}</p>
            </div>
          )}
          {idea && (
            <StoryPlayer key={`${script.id}:${idea.id}`} idea={idea} onNext={upNext ? () => select(upNext.id) : null} />
          )}
        </section>
      </div>
    </div>
  );
}
