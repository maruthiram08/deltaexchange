import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import { ChevronLeftIcon } from "../components/icons";
import "./StrategyBuilder.css";

const STRATEGY_GROUPS = [
  { stance: "Bullish", label: "Bullish Strategies", strategies: ["Bull Call Spread", "Bull Put Spread", "Bullish Condor"] },
  { stance: "Bearish", label: "Bearish Strategies", strategies: ["Bear Call Spread", "Bear Put Spread", "Bearish Condor"] },
  { stance: "Neutral", label: "Neutral Strategies", strategies: ["Short Straddle", "Short Strangle", "Long Straddle"] },
];

// Each shape is a dashed lead-in baseline followed by one or more colored
// segments (green = profit, red = loss) tracing the strategy's actual payoff —
// a rising/falling spread, a condor's stepped plateau, or a straddle/strangle's
// peak or valley. Segments share endpoints so colors meet without redrawing.
const ICON_SHAPES = {
  "Bull Call Spread": {
    baseline: "4,24 14,24",
    segments: [
      { points: "14,24 20,22.5", color: "negative" },
      { points: "20,22.5 42,8", color: "positive" },
    ],
  },
  "Bullish Condor": {
    baseline: "4,24 12,24",
    segments: [
      { points: "12,24 22,13", color: "positive" },
      { points: "22,13 27,16", color: "negative" },
      { points: "27,16 42,8", color: "positive" },
    ],
  },
  "Bear Call Spread": {
    baseline: "4,8 14,8",
    segments: [
      { points: "14,8 20,9.5", color: "positive" },
      { points: "20,9.5 42,24", color: "negative" },
    ],
  },
  "Bearish Condor": {
    baseline: "4,8 12,8",
    segments: [
      { points: "12,8 22,19", color: "negative" },
      { points: "22,19 27,16", color: "positive" },
      { points: "27,16 42,24", color: "negative" },
    ],
  },
  "Short Straddle": {
    baseline: "4,24 14,24",
    segments: [
      { points: "14,24 24,10", color: "positive" },
      { points: "24,10 42,24", color: "negative" },
    ],
  },
  "Short Strangle": {
    baseline: "4,24 12,24",
    segments: [
      { points: "12,24 20,10", color: "positive" },
      { points: "20,10 28,10", color: "positive" },
      { points: "28,10 42,24", color: "negative" },
    ],
  },
  "Long Straddle": {
    baseline: "4,10 12,10",
    segments: [
      { points: "12,10 22,24", color: "negative" },
      { points: "22,24 44,10", color: "positive" },
    ],
  },
};
// Bull/Bear Put Spread share their Call-side counterpart's shape.
ICON_SHAPES["Bull Put Spread"] = ICON_SHAPES["Bull Call Spread"];
ICON_SHAPES["Bear Put Spread"] = ICON_SHAPES["Bear Call Spread"];

function StrategyIcon({ name }) {
  const shape = ICON_SHAPES[name];
  return (
    <svg viewBox="0 0 48 32" className="strategy-builder-page__icon-svg">
      <line x1="4" y1="4" x2="4" y2="27" stroke="var(--border-subtle)" strokeWidth="1" />
      <polyline points={shape.baseline} stroke="var(--border-subtle)" strokeDasharray="2 2" fill="none" />
      {shape.segments.map((seg, i) => (
        <polyline
          key={i}
          points={seg.points}
          stroke={seg.color === "positive" ? "var(--positive)" : "var(--negative)"}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

export default function StrategyBuilder() {
  const navigate = useNavigate();

  const pickStrategy = (strategy) => navigate("/strategy-basket", { state: { strategy } });

  return (
    <PhoneFrame>
      <div className="strategy-builder-page">
        <div className="strategy-builder-page__header">
          <button type="button" className="strategy-builder-page__back" onClick={() => navigate(-1)}>
            <ChevronLeftIcon size={22} />
          </button>
          <span className="strategy-builder-page__title">Strategy Builder</span>
          <span className="strategy-builder-page__asset">BTC ▾</span>
        </div>

        <div className="strategy-builder-page__scroll">
          <div className="strategy-builder-page__heading">Choose from Pre-Built Strategies</div>

          {STRATEGY_GROUPS.map((group) => (
            <div key={group.stance} className="strategy-builder-page__group">
              <div className={`strategy-builder-page__group-label is-${group.stance.toLowerCase()}`}>{group.label}</div>
              <div className="strategy-builder-page__card-row">
                {group.strategies.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`strategy-builder-page__card is-${group.stance.toLowerCase()}`}
                    onClick={() => pickStrategy(name)}
                  >
                    <StrategyIcon name={name} />
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="strategy-builder-page__divider">
            <span />
            <span>Or</span>
            <span />
          </div>

          <button type="button" className="strategy-builder-page__add-contracts" onClick={() => navigate("/option-chain")}>
            + Add Contracts
          </button>

          <div className="strategy-builder-page__learn-more">Learn more about basket orders ⤴</div>
        </div>

        <div className="strategy-builder-page__footer">
          <span className="strategy-builder-page__footer-label">Available Margin:</span>
          <span className="strategy-builder-page__footer-value">$5.75</span>
        </div>
      </div>
    </PhoneFrame>
  );
}
