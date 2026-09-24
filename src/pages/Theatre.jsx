import { Fragment, useCallback, useEffect, useRef } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { IDEAS, findIdea } from "../ideas";
import StoryPlayer, { Rich } from "../story/StoryPlayer";
import "./Theatre.css";

// Films with a live prototype come first, then the idea-only ones, which have two screens instead of three.
const PLAYABLE = [
  ...IDEAS.filter((idea) => idea.story?.demo),
  ...IDEAS.filter((idea) => idea.story && !idea.story.demo),
];

export default function Theatre() {
  const { id } = useParams();
  const navigate = useNavigate();
  const idea = id ? findIdea(id) : null;
  const reelRef = useRef(null);

  const select = useCallback((next) => navigate(`/watch/${next}`, { replace: true }), [navigate]);

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
  }, [id, select]);

  if (id && !idea?.story) return <Navigate to="/watch" replace />;

  const at = PLAYABLE.findIndex((item) => item.id === id);
  const upNext = at >= 0 ? PLAYABLE[at + 1] : null;

  return (
    <div className="theatre">
      <header className="theatre__top">
        <Link to="/" className="theatre__back">
          ← Back
        </Link>
        <span className="theatre__title">Guided walkthrough</span>
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
              <p className="theatre__eyebrow">The teardown</p>
              <p className="theatre__intro">
                The app is already feature-rich, but some features are hard to access, resulting in{" "}
                <em>broken execution flows</em> &amp; <em>delayed decision&#8209;making</em>.
              </p>
              <button type="button" className="theatre__play" onClick={() => select(PLAYABLE[0].id)}>
                <span aria-hidden="true">▶</span> Start the show
              </button>
              <p className="theatre__hint">or pick any feature from the reel</p>
            </div>
          )}
          {idea && (
            <StoryPlayer key={idea.id} idea={idea} onNext={upNext ? () => select(upNext.id) : null} />
          )}
        </section>
      </div>
    </div>
  );
}
