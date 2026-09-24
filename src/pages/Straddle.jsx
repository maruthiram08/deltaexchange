import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import BottomTabBar from "../components/common/BottomTabBar";
import "./Straddle.css";

const TOP_TABS = ["Options", "RWA Tokens", "Straddle", "Spot", "Analytics"];

const ROWS = [
  { strike: "79,200", price: "$1,895", vol: "$653.62K", changePct: 28.3, favorite: false },
  { strike: "79,600", price: "$1,504", vol: "$776.78K", changePct: 26.39, favorite: true },
  { strike: "80,200", price: "$945", vol: "$2.18M", changePct: -23.85, favorite: true },
  { strike: "80,000", price: "$1,033", vol: "$2.59M", changePct: -12.68, favorite: true },
  { strike: "78,200", price: "$2,721", vol: "$2.76M", changePct: 184.9, favorite: true },
  { strike: "81,000", price: "$578", vol: "$4.29M", changePct: -30.19, favorite: true },
  { strike: "80,400", price: "$804", vol: "$4.46M", changePct: -27.63, favorite: true },
  { strike: "78,000", price: "$2,891", vol: "$6.76M", changePct: 210.9, favorite: true },
  { strike: "80,600", price: "$680", vol: "$14.05M", changePct: -38.63, favorite: true },
  { strike: "80,800", price: "$605", vol: "$17.36M", changePct: -44.14, positionBadge: "S" },
];

export default function Straddle() {
  const navigate = useNavigate();

  return (
    <PhoneFrame footer={<BottomTabBar />}>
      <div className="straddle-page">
        <div className="straddle-page__topbar">
          {TOP_TABS.map((t) => (
            <span
              key={t}
              className={t === "Straddle" ? "is-active" : ""}
              onClick={() => t === "Options" && navigate("/option-chain")}
              style={{ cursor: t === "Options" ? "pointer" : "default" }}
            >
              {t}
              {t === "RWA Tokens" && <span className="straddle-page__new-badge">NEW</span>}
            </span>
          ))}
          <span className="straddle-page__search">🔍</span>
        </div>

        <div className="straddle-page__table-header">
          <span>Contract</span>
          <span>Price | Vol</span>
          <span>24h Chg.</span>
        </div>

        <div className="straddle-page__scroll">
          {ROWS.map((row) => {
            const positive = row.changePct >= 0;
            return (
              <div key={row.strike} className="straddle-page__row" onClick={() => navigate("/trade")}>
                <div className="straddle-page__left">
                  {row.positionBadge ? (
                    <span className="straddle-page__position-badge">{row.positionBadge}</span>
                  ) : (
                    <span className={`straddle-page__star${row.favorite ? " is-fav" : ""}`}>★</span>
                  )}
                  <div>
                    <div className="straddle-page__strike">{row.strike}</div>
                    <div className="straddle-page__subtitle">
                      19 Sep · MV-BTC · <span className="straddle-page__leverage">200x</span>
                    </div>
                  </div>
                </div>
                <div className="straddle-page__mid">
                  <span className="straddle-page__price">{row.price}</span>
                  <span className="straddle-page__vol">{row.vol}</span>
                </div>
                <span className={`straddle-page__chg ${positive ? "is-positive" : "is-negative"}`}>
                  {positive ? "" : ""}
                  {row.changePct}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="straddle-page__context">
          <div className="straddle-page__context-handle" />
          <div className="straddle-page__context-header">
            <span>Market Context</span>
            <span className="straddle-page__context-live">
              <i className="straddle-page__live-dot" /> Live &nbsp;|&nbsp; Updated 12:34 IST
            </span>
          </div>
          <div className="straddle-page__context-body">
            <div className="straddle-page__context-item">
              <div className="straddle-page__context-icon">₿</div>
              <div>
                <div className="straddle-page__context-label">BTC Spot</div>
                <div className="straddle-page__context-value">$80,742.20</div>
                <div className="straddle-page__context-sub is-positive">+1,124.32 (+1.42%)</div>
              </div>
            </div>
            <div className="straddle-page__context-divider" />
            <div className="straddle-page__context-item">
              <div className="straddle-page__context-label">ATM Strike ⓘ</div>
              <div className="straddle-page__context-value">80800</div>
              <div className="straddle-page__context-sub is-positive">+0.07%</div>
            </div>
            <button type="button" className="straddle-page__view-chart" onClick={() => navigate("/charts")}>
              View Chart ⧉
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
