import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PAGE_REGISTRY } from "../pageRegistry";
import "./Index.css";

// Each row pairs something a trader is trying to do (from the teardown one-pager) with the idea that
// helps. The one-pager frames two groups: pro traders who care about speed and new traders who prefer
// safety. The algo rows are placed by judgment. `fix` and `tip` are shown in a strip on the destination
// screen so nobody lands there without knowing what to tap. built: false marks ideas not yet in the
// prototype, which are not links.
const PERSONAS = [
  {
    id: "pro",
    name: "Pro traders",
    note: "care about speed",
    tone: "#f7931a",
    rgb: "247, 147, 26",
    pains: [
      {
        text: "Reach OI and builder fast",
        to: "/option-trade",
        built: true,
        fix: "Shortcuts on option page",
        tip: "Use the Strategy Builder, Option Analytics and Option Chain buttons under the header.",
      },
      {
        text: "Add contracts in one screen",
        to: "/option-chain",
        built: true,
        fix: "Basket toggle in Option Chain",
        tip: "Turn on Basket at the top right, then tap contracts to add legs.",
      },
      {
        text: "See max loss while building",
        to: "/strategy-basket",
        built: true,
        fix: "Live payoff while building",
        tip: "Change a strike or quantity. Max profit, max loss and the chart update instantly.",
      },
      {
        text: "Review payoff before ordering",
        to: "/strategy-basket",
        built: true,
        fix: "Payoff on order preview",
        tip: "Max profit, max loss and the payoff sit above the contracts, before Place Order.",
      },
      {
        text: "Find OI support and resistance",
        to: "/option-chain",
        built: true,
        fix: "OI and Max Pain tags",
        tip: "Look at the strike column for the OI Sup, Max Pain and OI Res tags.",
      },
      {
        text: "Judge premium cheap or rich",
        to: "/option-chain",
        built: true,
        fix: "Cheap / expensive read",
        tip: "Tap Strategy fit at the top right.",
      },
      {
        text: "Exit part of a position",
        to: "/charts",
        built: true,
        fix: "Add / Exit bar",
        tip: "Tap the gear next to ZipTrade and turn on Simulate Open Position. The bar switches to Add and Exit.",
      },
      {
        text: "Place limit orders from charts",
        to: "/charts",
        built: true,
        fix: "Order-type toggle",
        tip: "See Market on the bottom bar. Tap it to switch between order types.",
      },
      {
        text: "Change size in a tap",
        to: "/charts",
        built: true,
        fix: "Plus / minus on the bar",
        tip: "Use the minus and plus on the bottom bar.",
      },
      {
        text: "Spot the ATM straddle",
        to: "/straddle",
        built: true,
        fix: "Live BTC price on Straddles",
        tip: "Find BTC Spot and the ATM strike under Market Context.",
      },
      {
        text: "Know what moved the market",
        to: "/home",
        built: true,
        fix: "Market Pulse one-liner",
        tip: "Tap the Short squeeze tag on the BTC tile.",
      },
      { text: "Find straddles without scrolling", built: false, fix: "Shortcut to Straddles" },
      { text: "Build a range-breakout strategy", built: false, fix: "More algo templates" },
    ],
  },
  {
    id: "newbie",
    name: "New traders",
    note: "prefer safety",
    tone: "#1fce7a",
    rgb: "31, 206, 122",
    pains: [
      {
        text: "See liquidation before ordering",
        to: "/charts",
        built: true,
        fix: "Liquidation up front",
        tip: "Tap Long. The first-trade check shows your estimated liquidation price.",
      },
      {
        text: "Understand first-trade leverage",
        to: "/charts",
        built: true,
        fix: "Two-step risk check",
        tip: "Tap Long. A two-step check explains what 100x risks.",
      },
      {
        text: "Set a stop-loss early",
        to: "/charts",
        built: true,
        fix: "Stop-loss prompt",
        tip: "Tap Long, then Continue. Step 2 asks where you would exit.",
      },
      {
        text: "Read familiar F&O terms",
        to: "/positions",
        built: true,
        fix: "Familiar F&O labels",
        tip: "Look for Target/SL and Unrealized P&L (M2M) on the position card.",
      },
      { text: "Turn an idea into an algo", built: false, fix: "Plain English to Algo" },
      { text: "Test an algo before going live", built: false, fix: "Paper-test nudge" },
    ],
  },
];

const ALL_PAINS = PERSONAS.flatMap((p) => p.pains);
const TAPPABLE = ALL_PAINS.filter((pain) => pain.built).length;

function Arrow() {
  return <span className="index-row__arrow" aria-hidden="true" />;
}

// One pain point mapped to the feature that fixes it.
function Row({ pain, index }) {
  const style = { "--i": index };
  const content = (
    <>
      <span className="index-word">{pain.text}</span>
      <Arrow />
      <span className="index-feature">{pain.fix}</span>
    </>
  );
  if (!pain.built) {
    return (
      <span className="index-row is-proposed" style={style} title="Proposed, not built yet">
        {content}
      </span>
    );
  }
  return (
    <Link to={pain.to} state={{ tip: { fix: pain.fix, text: pain.tip } }} className="index-row" style={style}>
      {content}
    </Link>
  );
}

function OneMap() {
  const mapRef = useRef(null);
  const [spokes, setSpokes] = useState(null);

  // Spokes run from the centre node to each persona pill, measured so they stay attached at any width.
  useLayoutEffect(() => {
    const el = mapRef.current;
    const measure = () => {
      if (!window.matchMedia("(min-width: 1000px)").matches) {
        setSpokes(null);
        return;
      }
      const box = el.getBoundingClientRect();
      const mid = (node) => {
        const r = node.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      };
      const center = mid(el.querySelector(".index-map__center"));
      const lines = [...el.querySelectorAll(".index-map__persona")].map((pill) => {
        const end = mid(pill);
        return { x1: center.x, y1: center.y, x2: end.x, y2: end.y, tone: pill.dataset.tone };
      });
      setSpokes({ w: box.width, h: box.height, lines });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let wordIndex = 0;

  return (
    <div className="index-map" ref={mapRef}>
      {spokes && (
        <svg className="index-map__spokes" width={spokes.w} height={spokes.h} viewBox={`0 0 ${spokes.w} ${spokes.h}`} aria-hidden="true">
          <defs>
            {spokes.lines.map((l, i) => (
              <linearGradient key={i} id={`spoke-${i}`} gradientUnits="userSpaceOnUse" x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}>
                <stop offset="0" stopColor="#f7931a" />
                <stop offset="1" stopColor={l.tone} />
              </linearGradient>
            ))}
          </defs>
          {spokes.lines.map((l, i) => {
            const midY = (l.y1 + l.y2) / 2;
            return (
              <path key={i} d={`M ${l.x1} ${l.y1} C ${l.x1} ${midY}, ${l.x2} ${midY}, ${l.x2} ${l.y2}`} stroke={`url(#spoke-${i})`} />
            );
          })}
        </svg>
      )}
      <div className="index-map__center">Trading on Delta</div>
      {PERSONAS.map((p) => (
        <div key={p.id} className="index-map__branch" style={{ "--tone": p.tone, "--tone-rgb": p.rgb }}>
          <div className="index-map__persona" data-tone={p.tone}>
            {p.name} <em>{p.note}</em>
          </div>
          <div className="index-map__words">
            {p.pains.map((pain) => (
              <Row key={`${pain.text}-${pain.fix}`} pain={pain} index={wordIndex++} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Index() {
  const location = useLocation();
  // Coming back from a screen via "Back to map" reopens the map straight away.
  const [open, setOpen] = useState(Boolean(location.state?.openMap));
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
      <header className="index-hero">
        <p className="index-page__eyebrow">A product case study</p>
        <h1>
          Speed for pros. <span>Safety for new traders.</span>
        </h1>
        <p className="index-page__subtitle">
          Delta Exchange India's options app is already feature-rich. These are ideas for making its best features
          easier to reach and its risks easier to see, prototyped so you can try each one.
        </p>
        <div className="index-hero__actions">
          <Link to="/home" className="index-page__enter">
            Try the prototype <span aria-hidden="true">→</span>
          </Link>
          <button type="button" className="index-page__reveal" aria-expanded={open} onClick={toggle}>
            {open ? "Hide the ideas" : "See the ideas"} <span aria-hidden="true">{open ? "↑" : "↓"}</span>
          </button>
        </div>
        <p className="index-hero__stat">
          {ALL_PAINS.length} ideas across two groups of traders. {TAPPABLE} are live in the prototype.
        </p>
        <p className="index-hero__note">For the best experience, open this on a desktop.</p>
      </header>

      {open && (
        <div className="index-reveal" ref={revealRef}>
          <OneMap />

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
