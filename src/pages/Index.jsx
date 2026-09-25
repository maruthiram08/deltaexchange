import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PAGE_REGISTRY } from "../pageRegistry";
import { IDEAS } from "../ideas";
import VantaBackground from "../components/common/VantaBackground";
import BuildStatsPanel from "../components/common/BuildStatsPanel";
import "./Index.css";

// One pain point mapped to the idea that helps. Rows with a story open a short walkthrough, other built
// rows open the live screen with a guidance strip, and ideas not built yet are dashed and not links.
// Flip to true to bring the mindmap button and view back.
const SHOW_MINDMAP = false;

function Row({ idea, index }) {
  const style = { "--i": index };
  const content = (
    <>
      <span className="index-word">{idea.pain}</span>
      <span className="index-row__arrow" aria-hidden="true" />
      <span className="index-feature">
        {idea.fix}
        {idea.story?.demo && (
          <span className="index-feature__play" aria-label="Has a walkthrough">
            ▶
          </span>
        )}
      </span>
    </>
  );
  if (idea.story) {
    return (
      <Link to={`/watch/${idea.id}`} className={`index-row${idea.built ? "" : " is-proposed"}`} style={style}>
        {content}
      </Link>
    );
  }
  if (!idea.built) {
    return (
      <span className="index-row is-proposed" style={style} title="Proposed, not built yet">
        {content}
      </span>
    );
  }
  return (
    <Link to={idea.to} state={{ tip: { fix: idea.fix, text: idea.tip } }} className="index-row" style={style}>
      {content}
    </Link>
  );
}

function Mindmap() {
  return (
    <div className="index-map">
      <div className="index-map__center">Trading on Delta</div>
      <div className="index-map__list">
        {IDEAS.map((idea, i) => (
          <Row key={idea.id} idea={idea} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function Index() {
  const location = useLocation();
  // Coming back from a screen or story reopens the mindmap straight away.
  const [open, setOpen] = useState(SHOW_MINDMAP && Boolean(location.state?.openMap));
  const revealRef = useRef(null);
  const userToggled = useRef(false);

  useEffect(() => {
    if (open && userToggled.current) {
      revealRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [open]);

  const toggle = () => {
    userToggled.current = true;
    setOpen((v) => !v);
  };

  return (
    <div className="index-page">
      <VantaBackground />
      <BuildStatsPanel />
      <header className="index-hero">
        <p className="index-page__eyebrow">A product case study</p>
        <h1>
          Speed for pros. <span>Safety for new traders.</span>
        </h1>
        <p className="index-page__subtitle">
          A product teardown of Delta Exchange India's mobile app. Each idea starts with a pain point in the trader's
          journey and ends with a fix you can watch or try.
        </p>
        <div className="index-hero__actions">
          <Link to="/watch" className="index-page__enter">
            Guided walkthrough <span aria-hidden="true">▶</span>
            <span className="index-page__badge">Recommended</span>
          </Link>
          <Link to="/home" className="index-page__reveal">
            Explore on your own <span aria-hidden="true">→</span>
          </Link>
          {SHOW_MINDMAP && (
            <button type="button" className="index-page__reveal" aria-expanded={open} onClick={toggle}>
              {open ? "Hide the mindmap" : "See the mindmap"} <span aria-hidden="true">{open ? "↑" : "↓"}</span>
            </button>
          )}
        </div>
        <p className="index-hero__hint">
          Exploring on your own? Start with the walkthrough. It shows what to look for on each screen.
        </p>
        <p className="index-hero__note">For the best experience, open this on a desktop.</p>
      </header>

      {SHOW_MINDMAP && open && (
        <div className="index-reveal" ref={revealRef}>
          <Mindmap />

          <div className="index-page__screens">
            <h2>Every screen</h2>
            <div className="index-page__screen-list">
              {PAGE_REGISTRY.flatMap((section) => section.pages).map((page) => (
                <Link key={page.id} to={page.path} className="index-page__screen">
                  {page.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="index-page__footer">
        An independent case study by Maruthi Ram MNV, not affiliated with Delta Exchange. Built from public
        information only, so every number is illustrative.
      </p>
    </div>
  );
}
