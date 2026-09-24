import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import BottomTabBar from "../components/common/BottomTabBar";
import RiskCheck from "../components/common/RiskCheck";
import { shouldGate, markDone, leverageOr } from "../riskGate";
import { ChartLineIcon } from "../components/icons";
import "./OptionTrade.css";

const ASKS = [
  { price: "12.60", size: "18.240" },
  { price: "12.45", size: "12.005" },
  { price: "12.30", size: "9.075" },
  { price: "12.20", size: "6.149" },
  { price: "12.10", size: "4.392" },
  { price: "12.05", size: "2.773" },
  { price: "12.00", size: "2.267" },
];

const BIDS = [
  { price: "11.90", size: "3.280" },
  { price: "11.85", size: "4.236" },
  { price: "11.75", size: "5.405" },
  { price: "11.65", size: "6.835" },
  { price: "11.55", size: "8.585" },
  { price: "11.40", size: "10.725" },
  { price: "11.25", size: "13.343" },
];

export default function OptionTrade() {
  const navigate = useNavigate();
  const [side, setSide] = useState("Buy");
  const [qtyPct, setQtyPct] = useState(null);
  const [leverage, setLeverage] = useState(() => leverageOr(100));
  const [riskCheck, setRiskCheck] = useState(false);

  return (
    <PhoneFrame footer={<BottomTabBar />}>
      <div className="option-trade-page">
        <div className="option-trade-page__header">
          <div className="option-trade-page__symbol-block">
            <span className="option-trade-page__star">★</span>
            <div>
              <div className="option-trade-page__symbol">P-BTC-81400 ▾</div>
              <div className="option-trade-page__symbol-sub">Put Option · 23 Sep</div>
            </div>
          </div>
          <div className="option-trade-page__price-block">
            <div className="option-trade-page__price">$12.00</div>
            <div className="option-trade-page__price-chg">-92.77%</div>
          </div>
        </div>

        <div className="option-trade-page__cta-row">
          <Link to="/strategy-builder" className="option-trade-page__cta">
            Strategy Builder
          </Link>
          <button type="button" className="option-trade-page__cta">
            <ChartLineIcon size={12} /> Option Analytics
          </button>
          <Link to="/option-chain" className="option-trade-page__cta">
            Option Chain
          </Link>
        </div>

        <div className="option-trade-page__stats-row">
          <div>
            <div className="option-trade-page__stats-label">Index Price</div>
            <div className="option-trade-page__stats-value">$86024.7</div>
          </div>
          <div>
            <div className="option-trade-page__stats-label">24h Vol.</div>
            <div className="option-trade-page__stats-value">$31.77M</div>
          </div>
          <div>
            <div className="option-trade-page__stats-label">OI</div>
            <div className="option-trade-page__stats-value">$25.02M</div>
          </div>
        </div>

        <div className="option-trade-page__body">
          <div className="option-trade-page__book">
            <div className="option-trade-page__book-header">
              <span>Price (USD)</span>
              <span>Size (BTC)</span>
            </div>
            {ASKS.map((row) => (
              <div key={row.price} className="option-trade-page__book-row is-ask">
                <span>{row.price}</span>
                <span>{row.size}</span>
              </div>
            ))}
            <div className="option-trade-page__spot">$12.00</div>
            <div className="option-trade-page__index-row">
              <span className="option-trade-page__tag">M</span>
              <span>11.98</span>
            </div>
            {BIDS.map((row) => (
              <div key={row.price} className="option-trade-page__book-row is-bid">
                <span>{row.price}</span>
                <span>{row.size}</span>
              </div>
            ))}
          </div>

          <div className="option-trade-page__panel">
            <div className="option-trade-page__side-toggle">
              <button
                type="button"
                className={`option-trade-page__side-btn is-buy${side === "Buy" ? " is-active" : ""}`}
                onClick={() => setSide("Buy")}
              >
                Buy
              </button>
              <button
                type="button"
                className={`option-trade-page__side-btn is-sell${side === "Sell" ? " is-active" : ""}`}
                onClick={() => setSide("Sell")}
              >
                Sell
              </button>
            </div>

            <div className="option-trade-page__select-row">
              <div className="option-trade-page__select">{leverage}x ▾</div>
              <div className="option-trade-page__select">Limit ▾</div>
            </div>

            <div className="option-trade-page__field">
              <span className="option-trade-page__field-label">Limit Price USD</span>
              <span className="option-trade-page__field-link">Best Bid</span>
            </div>

            <div className="option-trade-page__field option-trade-page__field--stacked">
              <div className="option-trade-page__field-row">
                <span className="option-trade-page__field-label">Qty</span>
                <span className="option-trade-page__field-unit">Lot ▾</span>
              </div>
              <div className="option-trade-page__field-row">
                <span className="option-trade-page__field-hint">~BTC</span>
                <span className="option-trade-page__field-hint">1 Lot = 0.001 BTC</span>
              </div>
            </div>

            <div className="option-trade-page__pct-row">
              {["25%", "50%", "75%", "100%"].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`option-trade-page__pct-btn${qtyPct === p ? " is-active" : ""}`}
                  onClick={() => setQtyPct(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="option-trade-page__tpsl">
              <span className="option-trade-page__radio" /> Target/SL
            </div>

            <div className="option-trade-page__req-row">
              <span>Req. | Avbl.</span>
              <span>0 | 6.58 USD</span>
            </div>

            <button
              type="button"
              className={`option-trade-page__submit is-${side.toLowerCase()}`}
              onClick={() => (shouldGate() ? setRiskCheck(true) : navigate("/positions"))}
            >
              {side}
            </button>

            <div className="option-trade-page__checks">
              <label>
                <input type="checkbox" readOnly /> Maker Only ⓘ
              </label>
              <label>
                <input type="checkbox" readOnly /> Reduce Only ⓘ
              </label>
              <span className="option-trade-page__gtc">GTC ▾</span>
            </div>
          </div>
        </div>

        <div className="option-trade-page__bottom-tabs">
          <span className="is-active">Position</span>
          <span>Open Orders (0)</span>
        </div>

        {riskCheck && (
          <RiskCheck
            instrument="P-BTC-81400"
            side={side === "Buy" ? "Long" : "Short"}
            sideLabel={side}
            entryPrice={12}
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
