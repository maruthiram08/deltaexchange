import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import { ChevronLeftIcon } from "../components/icons";
import "./AnalyzePayoff.css";

const OI_BARS = [70, 22, 30, 18, 8, 6, 4, 8, 6, 10, 55, 9, 8, 6, 9, 5, 7, 4];

const LEGS = [
  {
    side: "B",
    name: "C-86000-230926",
    qty: "0.001 BTC",
    estPrice: 149,
    entryPrice: 636,
    targetPnl: -0.48,
    delta: 0,
    gamma: 0,
    theta: -0.32,
    vega: 0.01,
  },
  {
    side: "S",
    name: "C-86600-230926",
    qty: "0.001 BTC",
    estPrice: 0.1,
    entryPrice: 410,
    targetPnl: 0.4,
    delta: 0,
    gamma: 0,
    theta: 0.34,
    vega: -0.01,
  },
];

function ContractCell({ leg }) {
  return (
    <div className="analyze-page__contract-cell">
      <span className="analyze-page__checkbox">✓</span>
      <span className={`analyze-page__side-badge is-${leg.side === "B" ? "buy" : "sell"}`}>{leg.side}</span>
      <div>
        <div className="analyze-page__contract-name">{leg.name}</div>
        <div className="analyze-page__contract-qty">{leg.qty}</div>
      </div>
    </div>
  );
}

export default function AnalyzePayoff() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("PNL Chart");

  const totalProjectedPnl = LEGS.reduce((sum, leg) => sum + leg.targetPnl, 0);
  const totalDelta = LEGS.reduce((sum, leg) => sum + leg.delta, 0);
  const totalGamma = LEGS.reduce((sum, leg) => sum + leg.gamma, 0);
  const totalTheta = LEGS.reduce((sum, leg) => sum + leg.theta, 0);
  const totalVega = LEGS.reduce((sum, leg) => sum + leg.vega, 0);

  return (
    <PhoneFrame>
      <div className="analyze-page">
        <div className="analyze-page__header">
          <button type="button" className="analyze-page__back" onClick={() => navigate(-1)}>
            <ChevronLeftIcon size={22} />
          </button>
          <span className="analyze-page__title">Analyze</span>
        </div>

        <div className="analyze-page__stats">
          <div>
            <div className="analyze-page__stats-label">Max Profit</div>
            <div className="analyze-page__stats-value is-positive">0.37 USD</div>
          </div>
          <div>
            <div className="analyze-page__stats-label">Max Loss</div>
            <div className="analyze-page__stats-value is-negative">-0.22 USD</div>
          </div>
          <div>
            <div className="analyze-page__stats-label">Reward / Risk</div>
            <div className="analyze-page__stats-value">1.71</div>
          </div>
          <div>
            <div className="analyze-page__stats-label">Breakeven</div>
            <div className="analyze-page__stats-value">86221.36</div>
          </div>
        </div>

        <div className="analyze-page__tabs">
          {["PNL Chart", "PNL Table", "Greeks Table"].map((t) => (
            <button
              key={t}
              type="button"
              className={`analyze-page__tab${t === tab ? " is-active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="analyze-page__scroll">
          {tab === "PNL Chart" && (
            <>
              <div className="analyze-page__legend">
                <span><i className="analyze-page__swatch is-expiry" /> On Expiry Date</span>
                <span>Current Spot Price <strong>86015.20</strong></span>
                <span><i className="analyze-page__swatch is-target" /> On Target Date</span>
              </div>

              <div className="analyze-page__chart">
                <div className="analyze-page__chart-bars">
                  {OI_BARS.map((h, i) => (
                    <div
                      key={i}
                      className={`analyze-page__chart-bar${i < 9 ? " is-neg" : " is-pos"}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="analyze-page__chart-line" />
                <div className="analyze-page__chart-spotline" />
              </div>
              <div className="analyze-page__chart-axis">
                <span>83,850</span>
                <span>85,079</span>
                <span>86,308</span>
                <span>87,536</span>
                <span>88,765</span>
              </div>

              <div className="analyze-page__projected-loss">
                Projected Loss (on Target Date): $0.17 (0%)
              </div>
            </>
          )}

          {tab === "PNL Table" && (
            <div className="analyze-page__table">
              <div className="analyze-page__table-row analyze-page__table-row--header analyze-page__table-row--pnl">
                <span>Contract</span>
                <span>Est. Price</span>
                <span>Entry Price</span>
                <span>Target PNL</span>
              </div>
              {LEGS.map((leg) => (
                <div key={leg.name} className="analyze-page__table-row analyze-page__table-row--pnl">
                  <ContractCell leg={leg} />
                  <span>{leg.estPrice}</span>
                  <span>{leg.entryPrice}</span>
                  <span className={leg.targetPnl < 0 ? "is-negative" : "is-positive"}>{leg.targetPnl}</span>
                </div>
              ))}
              <div className="analyze-page__table-total">
                <span>Total Projected PNL</span>
                <span className={totalProjectedPnl < 0 ? "is-negative" : "is-positive"}>
                  {totalProjectedPnl.toFixed(2)} USD
                </span>
              </div>
              <div className="analyze-page__table-total">
                <span>Total Unrealized P&L (M2M)</span>
                <span className="is-positive">3.3 USD</span>
              </div>
            </div>
          )}

          {tab === "Greeks Table" && (
            <div className="analyze-page__table">
              <div className="analyze-page__table-row analyze-page__table-row--header analyze-page__table-row--greeks">
                <span>Contract</span>
                <span>Delta</span>
                <span>Gamma</span>
                <span>Theta</span>
                <span>Vega</span>
              </div>
              {LEGS.map((leg) => (
                <div key={leg.name} className="analyze-page__table-row analyze-page__table-row--greeks">
                  <ContractCell leg={leg} />
                  <span>{leg.delta}</span>
                  <span>{leg.gamma}</span>
                  <span>{leg.theta}</span>
                  <span>{leg.vega}</span>
                </div>
              ))}
              <div className="analyze-page__table-row analyze-page__table-row--greeks analyze-page__table-row--total">
                <span>Total</span>
                <span>{totalDelta}</span>
                <span>{totalGamma}</span>
                <span>{totalTheta.toFixed(2)}</span>
                <span>{totalVega}</span>
              </div>
            </div>
          )}

          <div className="analyze-page__slider-block">
            <div className="analyze-page__slider-row">
              <span>BTC Target Price</span>
              <span className="analyze-page__slider-value">86052</span>
            </div>
            <div className="analyze-page__reset">↺ Reset</div>
            <input type="range" className="analyze-page__slider" defaultValue={50} readOnly />
          </div>

          <div className="analyze-page__slider-block">
            <div className="analyze-page__slider-row">
              <span>Target Date</span>
              <span className="analyze-page__slider-value">
                05:30pm, 23 Sep<br /><small>22h 40m to expiry</small>
              </span>
            </div>
            <div className="analyze-page__reset">↺ Reset</div>
            <input type="range" className="analyze-page__slider" defaultValue={97} readOnly />
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
