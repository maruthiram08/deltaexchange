import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import BottomTabBar from "../components/common/BottomTabBar";
import "./FundingLeaderboard.css";

// Illustrative mock data — no exchange (Binance/Bybit/OKX) ships a native cross-pair
// funding leaderboard today; third-party tools like Coinglass and Sharpe.ai do, but only
// across many exchanges at once. This ranks Delta's own contracts only.
const ANNUALIZE = 1095; // rate% per 8h * (24/8) * 365

const RAW = [
  { symbol: "PENDLEUSD", rate: 0.085, oi: "$4.1M" },
  { symbol: "DOGEUSD", rate: 0.062, oi: "$18.2M" },
  { symbol: "SOLUSD", rate: 0.041, oi: "$62.5M" },
  { symbol: "BTCUSD", rate: 0.01, oi: "$79.1M" },
  { symbol: "ETHUSD", rate: 0.0035, oi: "$31.4M" },
  { symbol: "XRPUSD", rate: -0.018, oi: "$9.8M" },
  { symbol: "UNIUSD", rate: -0.034, oi: "$3.2M" },
  { symbol: "MUBARAKUSD", rate: -0.051, oi: "$1.1M" },
];

const FUNDING = RAW.map((r) => ({ ...r, apr: r.rate * ANNUALIZE }));

export default function FundingLeaderboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("positive");

  const rows = FUNDING.filter((r) => (tab === "positive" ? r.rate > 0 : r.rate < 0)).sort((a, b) =>
    tab === "positive" ? b.rate - a.rate : a.rate - b.rate,
  );

  return (
    <PhoneFrame footer={<BottomTabBar />}>
      <div className="funding-board-page">
        <div className="funding-board-page__header">
          <button type="button" className="funding-board-page__back" onClick={() => navigate("/trade")}>
            ‹
          </button>
          <span>Funding Rate Leaderboard</span>
        </div>
        <div className="funding-board-page__sub">Delta contracts only · Funding every 8h</div>

        <div className="funding-board-page__toggle">
          <button
            type="button"
            className={tab === "positive" ? "is-active" : ""}
            onClick={() => setTab("positive")}
          >
            Top Positive
          </button>
          <button
            type="button"
            className={tab === "negative" ? "is-active" : ""}
            onClick={() => setTab("negative")}
          >
            Top Negative
          </button>
        </div>

        <div className="funding-board-page__list-header">
          <span>Contract</span>
          <span>Rate (8h)</span>
          <span>APR</span>
          <span>OI</span>
        </div>

        <div className="funding-board-page__list">
          {rows.map((r) => (
            <div key={r.symbol} className="funding-board-page__row">
              <span className="funding-board-page__symbol">{r.symbol}</span>
              <span className={`funding-board-page__rate ${r.rate >= 0 ? "is-positive" : "is-negative"}`}>
                {r.rate >= 0 ? "+" : ""}
                {r.rate.toFixed(3)}%
              </span>
              <span className={`funding-board-page__apr ${r.apr >= 0 ? "is-positive" : "is-negative"}`}>
                {r.apr >= 0 ? "+" : ""}
                {r.apr.toFixed(1)}%
              </span>
              <span className="funding-board-page__oi">{r.oi}</span>
            </div>
          ))}
        </div>

        <div className="funding-board-page__note">
          ⓘ A funding-rate arbitrage (cash-and-carry) trade profits from a consistently high
          positive or negative rate, paid every 8 hours — longs pay shorts on positive rates,
          shorts pay longs on negative ones.
        </div>
      </div>
    </PhoneFrame>
  );
}
