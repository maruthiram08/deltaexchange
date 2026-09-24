import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import BottomTabBar from "../components/common/BottomTabBar";
import RiskCheck from "../components/common/RiskCheck";
import { shouldGate, markDone, leverageOr } from "../riskGate";
import "./Trade.css";

const ASKS = [
  { price: "86080.0", size: "17.132" },
  { price: "86079.5", size: "14.005" },
  { price: "86079.0", size: "5.075" },
  { price: "86078.5", size: "4.149" },
  { price: "86078.0", size: "3.392" },
  { price: "86077.5", size: "2.773" },
  { price: "86077.0", size: "2.267" },
];

const BIDS = [
  { price: "86076.0", size: "4.280" },
  { price: "86075.5", size: "5.236" },
  { price: "86075.0", size: "6.405" },
  { price: "86074.5", size: "7.835" },
  { price: "86074.0", size: "9.585" },
  { price: "86073.5", size: "11.725" },
  { price: "86073.0", size: "14.343" },
];

export default function Trade() {
  const navigate = useNavigate();
  const [side, setSide] = useState("Long");
  const [qtyPct, setQtyPct] = useState(null);
  const [leverage, setLeverage] = useState(() => leverageOr(50));
  const [riskCheck, setRiskCheck] = useState(false);

  return (
    <PhoneFrame footer={<BottomTabBar />}>
      <div className="trade-page">
        <div className="trade-page__margin-row">
          <span className="trade-page__margin is-active">Main</span>
          <span className="trade-page__margin-pill">Cross</span>
        </div>

        <div className="trade-page__header">
          <div className="trade-page__symbol-block">
            <span className="trade-page__star">★</span>
            <div>
              <div className="trade-page__symbol">BTCUSD ▾</div>
              <div className="trade-page__symbol-sub">Bitcoin Perpetual</div>
            </div>
          </div>
          <div className="trade-page__price-block">
            <div className="trade-page__price">$86077.0 ↑</div>
            <div className="trade-page__price-chg">0.97%</div>
          </div>
        </div>

        <div className="trade-page__stats-row">
          <div>
            <div className="trade-page__stats-label">24h Vol.</div>
            <div className="trade-page__stats-value">$1347.3M</div>
          </div>
          <div>
            <div className="trade-page__stats-label">OI</div>
            <div className="trade-page__stats-value">$79.1M</div>
          </div>
          <div className="trade-page__stats-icons">
            <span>ⓘ</span>
            <span>🔔</span>
            <span>⇅</span>
            <span>⋮</span>
          </div>
        </div>

        <div className="trade-page__body">
          <div className="trade-page__book">
            <div className="trade-page__funding-label">Funding (8h) / Countdown</div>
            <div className="trade-page__funding-value">0.0100% / 02:55:19</div>

            <div className="trade-page__book-header">
              <span>Price (USD)</span>
              <span>Size (BTC)</span>
            </div>
            {ASKS.map((row) => (
              <div key={row.price} className="trade-page__book-row is-ask">
                <span>{row.price}</span>
                <span>{row.size}</span>
              </div>
            ))}
            <div className="trade-page__spot">$86077.0</div>
            <div className="trade-page__index-row">
              <span className="trade-page__tag">I</span>
              <span>86106.0</span>
              <span className="trade-page__tag" style={{ marginLeft: 10 }}>M</span>
              <span>86073.9</span>
            </div>
            {BIDS.map((row) => (
              <div key={row.price} className="trade-page__book-row is-bid">
                <span>{row.price}</span>
                <span>{row.size}</span>
              </div>
            ))}
          </div>

          <div className="trade-page__panel">
            <div className="trade-page__side-toggle">
              <button
                type="button"
                className={`trade-page__side-btn is-long${side === "Long" ? " is-active" : ""}`}
                onClick={() => setSide("Long")}
              >
                Long
              </button>
              <button
                type="button"
                className={`trade-page__side-btn is-short${side === "Short" ? " is-active" : ""}`}
                onClick={() => setSide("Short")}
              >
                Short
              </button>
            </div>

            <div className="trade-page__select-row">
              <div className="trade-page__select">{leverage}x ▾</div>
              <div className="trade-page__select">Limit ▾</div>
            </div>

            <div className="trade-page__field">
              <span className="trade-page__field-label">Limit Price USD</span>
              <span className="trade-page__field-link">Best Bid</span>
            </div>

            <div className="trade-page__field trade-page__field--stacked">
              <div className="trade-page__field-row">
                <span className="trade-page__field-label">Qty</span>
                <span className="trade-page__field-unit">Lot ▾</span>
              </div>
              <div className="trade-page__field-row">
                <span className="trade-page__field-hint">~BTC</span>
                <span className="trade-page__field-hint">1 Lot = 0.001 BTC</span>
              </div>
            </div>

            <div className="trade-page__pct-row">
              {["25%", "50%", "75%", "100%"].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`trade-page__pct-btn${qtyPct === p ? " is-active" : ""}`}
                  onClick={() => setQtyPct(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="trade-page__tpsl">
              <span className="trade-page__radio" /> Target/SL
            </div>

            <div className="trade-page__req-row">
              <span>Req. | Avbl.</span>
              <span>0 | 6.58 USD</span>
            </div>

            <button type="button" className="trade-page__submit" onClick={() => (shouldGate() ? setRiskCheck(true) : navigate("/positions"))}>
              {side}
            </button>

            <div className="trade-page__checks">
              <label>
                <input type="checkbox" readOnly /> Maker Only ⓘ
              </label>
              <label>
                <input type="checkbox" readOnly /> Reduce Only ⓘ
              </label>
              <span className="trade-page__gtc">GTC ▾</span>
            </div>

            <div className="trade-page__scalper">
              <span>◎ Scalper Active</span>
              <span className="trade-page__scalper-timer">⏳ 30 mins</span>
            </div>
          </div>
        </div>

        <div className="trade-page__bottom-tabs">
          <span className="is-active">Position</span>
          <span>Open Orders (0)</span>
        </div>

        {riskCheck && (
          <RiskCheck
            instrument="BTCUSD"
            side={side}
            entryPrice={86077}
            leverage={leverage}
            onClose={() => setRiskCheck(false)}
            onPlace={({ leverage: chosen }) => {
              setLeverage(chosen);
              markDone(chosen);
              setRiskCheck(false);
              navigate("/positions");
            }}
          />
        )}
      </div>
    </PhoneFrame>
  );
}
