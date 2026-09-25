import { useEffect, useState } from "react";
import { BUILD_METRICS, PEEK_STATS } from "../../buildStats";
import "./BuildStatsPanel.css";

// A side panel on the landing page that discloses the build stats in layers. Closed, it is a slim tab. Open, it shows
// the north star first. The two metric groups open one at a time, and each metric opens to show how it was worked out.
export default function BuildStatsPanel() {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState(null);
  // The tab pulses until it has been opened once, so a first-time visitor notices it.
  const [seen, setSeen] = useState(false);
  // Each peek shows the next stat. It changes while the tab is tucked away, at the end of a cycle.
  const [peek, setPeek] = useState(0);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const { northStar, groups, guardrail } = BUILD_METRICS;

  return (
    <aside className={`build-stats${open ? " is-open" : ""}`} aria-label="Build stats">
      <button
        type="button"
        className={`build-stats__tab${seen ? "" : " is-calling"}`}
        aria-expanded={open}
        aria-label="Build stats"
        onAnimationIteration={(e) => {
          if (e.animationName === "build-stats-peek") setPeek((i) => (i + 1) % PEEK_STATS.length);
        }}
        onClick={() => {
          setSeen(true);
          setOpen((v) => !v);
        }}
      >
        {seen ? (
          <>
            <span className="build-stats__label">Build stats</span>
            <span aria-hidden="true">{open ? "›" : "‹"}</span>
          </>
        ) : (
          <>
            <span className="build-stats__dot" aria-hidden="true" />
            <span className="build-stats__peek">
              <strong>{PEEK_STATS[peek].value}</strong>
              <span>{PEEK_STATS[peek].label}</span>
            </span>
            <span aria-hidden="true">‹</span>
          </>
        )}
      </button>

      {open && (
        <div className="build-stats__panel">
          <p className="build-stats__eyebrow">If the build were a product</p>

          <div className="build-stats__north">
            <span className="build-stats__tag">North star</span>
            <strong>{northStar.value}</strong>
            <span>{northStar.label}</span>
            <details>
              <summary>How is this worked out?</summary>
              <p>{northStar.how}</p>
            </details>
          </div>

          {groups.map((g) => (
            <section key={g.title} className="build-stats__group">
              <button
                type="button"
                className="build-stats__group-head"
                aria-expanded={group === g.title}
                onClick={() => setGroup(group === g.title ? null : g.title)}
              >
                <span>
                  {g.title}
                  <small>{g.note}</small>
                </span>
                <span aria-hidden="true">{group === g.title ? "−" : "+"}</span>
              </button>
              {group === g.title && (
                <ul>
                  {g.items.map((item) => (
                    <li key={item.label}>
                      <details>
                        <summary>
                          <strong>{item.value}</strong>
                          <span>{item.label}</span>
                        </summary>
                        <p>{item.how}</p>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div className="build-stats__guardrail">
            <span className="build-stats__tag is-warn">Guardrail</span>
            <strong>{guardrail.value}</strong>
            <span>{guardrail.label}. {guardrail.how}</span>
          </div>

          <p className="build-stats__foot">For fun. Hours are estimates and include the docs work.</p>
        </div>
      )}
    </aside>
  );
}
