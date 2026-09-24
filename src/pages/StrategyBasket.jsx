import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import { XIcon, ChartLineIcon, ChevronsUpDownIcon } from "../components/icons";
import "./StrategyBasket.css";

const SPOT = 86053.5;
const STRIKE_STEP = 200;
const LOT_SIZE = 0.001;

const DEFAULT_LEGS = [
  { id: 1, side: "Buy", optionType: "CE", strike: 86000, expiry: "230926", qty: 1, premium: 636 },
  { id: 2, side: "Sell", optionType: "CE", strike: 86600, expiry: "230926", qty: 1, premium: 410 },
];

function legPnl(leg, price) {
  const intrinsic = leg.optionType === "CE" ? Math.max(price - leg.strike, 0) : Math.max(leg.strike - price, 0);
  const diff = leg.side === "Buy" ? intrinsic - leg.premium : leg.premium - intrinsic;
  return diff * leg.qty * LOT_SIZE;
}

function buildPayoff(legs) {
  if (legs.length === 0) {
    return { points: [], maxProfit: 0, maxLoss: 0, maxProfitUnlimited: false, maxLossUnlimited: false };
  }
  const strikes = legs.map((l) => l.strike);
  const minStrike = Math.min(...strikes);
  const maxStrike = Math.max(...strikes);
  const span = Math.max(maxStrike - minStrike, STRIKE_STEP * 4);
  const priceMin = minStrike - span;
  const priceMax = maxStrike + span;
  const pricePoints = Array.from(new Set([priceMin, ...strikes, priceMax])).sort((a, b) => a - b);
  const points = pricePoints.map((price) => ({
    price,
    pnl: legs.reduce((sum, leg) => sum + legPnl(leg, price), 0),
  }));
  const pnls = points.map((p) => p.pnl);
  const maxProfit = Math.max(...pnls, 0);
  const maxLoss = Math.min(...pnls, 0);
  const EPS = 0.0001;
  const leftSlope = points[1].pnl - points[0].pnl;
  const rightSlope = points[points.length - 1].pnl - points[points.length - 2].pnl;
  const maxProfitUnlimited = leftSlope < -EPS || rightSlope > EPS;
  const maxLossUnlimited = leftSlope > EPS || rightSlope < -EPS;
  return { points, maxProfit, maxLoss, maxProfitUnlimited, maxLossUnlimited };
}

function PayoffChart({ points }) {
  const W = 320;
  const H = 140;
  const prices = points.map((p) => p.price);
  const pnls = points.map((p) => p.pnl);
  const priceMin = prices[0];
  const priceMax = prices[prices.length - 1];
  const pnlMin = Math.min(...pnls, 0);
  const pnlMax = Math.max(...pnls, 0);
  const pad = (pnlMax - pnlMin) * 0.2 || 1;
  const yMin = pnlMin - pad;
  const yMax = pnlMax + pad;

  const x = (price) => ((price - priceMin) / (priceMax - priceMin)) * W;
  const y = (pnl) => H - ((pnl - yMin) / (yMax - yMin)) * H;
  const zeroY = y(0);

  const posFill = [`${x(priceMin)},${zeroY}`, ...points.map((p) => `${x(p.price)},${y(Math.max(p.pnl, 0))}`), `${x(priceMax)},${zeroY}`].join(" ");
  const negFill = [`${x(priceMin)},${zeroY}`, ...points.map((p) => `${x(p.price)},${y(Math.min(p.pnl, 0))}`), `${x(priceMax)},${zeroY}`].join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="strategy-basket-page__chart-svg" preserveAspectRatio="none">
      <polygon points={posFill} className="strategy-basket-page__chart-fill is-positive" />
      <polygon points={negFill} className="strategy-basket-page__chart-fill is-negative" />
      <line x1="0" y1={zeroY} x2={W} y2={zeroY} className="strategy-basket-page__chart-zero" />
      {points.slice(1).map((p, i) => {
        const prev = points[i];
        const tone = (p.pnl + prev.pnl) / 2 >= 0 ? "is-positive" : "is-negative";
        return (
          <polyline
            key={p.price}
            points={`${x(prev.price)},${y(prev.pnl)} ${x(p.price)},${y(p.pnl)}`}
            className={`strategy-basket-page__chart-line ${tone}`}
          />
        );
      })}
    </svg>
  );
}

export default function StrategyBasket() {
  const navigate = useNavigate();
  const location = useLocation();
  const strategyName = location.state?.strategy ?? "Bull Call Spread";
  const [legs, setLegs] = useState(location.state?.legs ?? DEFAULT_LEGS);

  const { points, maxProfit, maxLoss, maxProfitUnlimited, maxLossUnlimited } = useMemo(() => buildPayoff(legs), [legs]);

  const toggleOptionType = (id) =>
    setLegs((prev) => prev.map((l) => (l.id === id ? { ...l, optionType: l.optionType === "CE" ? "PE" : "CE" } : l)));

  const toggleSide = (id) =>
    setLegs((prev) => prev.map((l) => (l.id === id ? { ...l, side: l.side === "Buy" ? "Sell" : "Buy" } : l)));

  const adjustStrike = (id, delta) =>
    setLegs((prev) => prev.map((l) => (l.id === id ? { ...l, strike: l.strike + delta } : l)));

  const adjustQty = (id, delta) =>
    setLegs((prev) => prev.map((l) => (l.id === id ? { ...l, qty: Math.max(1, l.qty + delta) } : l)));

  const removeLeg = (id) => setLegs((prev) => prev.filter((l) => l.id !== id));

  const addLeg = () => {
    const nextId = legs.reduce((max, l) => Math.max(max, l.id), 0) + 1;
    const nearestStrike = Math.round(SPOT / STRIKE_STEP) * STRIKE_STEP;
    setLegs((prev) => [...prev, { id: nextId, side: "Buy", optionType: "CE", strike: nearestStrike, expiry: "230926", qty: 1, premium: 300 }]);
  };

  const maxProfitLabel = maxProfitUnlimited ? "Unlimited" : `$${maxProfit.toFixed(2)}`;
  const maxLossLabel = maxLossUnlimited ? "Unlimited" : `-$${Math.abs(maxLoss).toFixed(2)}`;

  return (
    <PhoneFrame>
      <div className="strategy-basket-page">
        <div className="strategy-basket-page__header">
          <div className="strategy-basket-page__asset">BTC ▾</div>
          <div className="strategy-basket-page__price">
            86053.5 <span>(0.93%)</span>
          </div>
          <button type="button" className="strategy-basket-page__contracts-btn" onClick={() => navigate("/option-chain")}>
            + Contracts
          </button>
          <button type="button" className="strategy-basket-page__close" onClick={() => navigate("/strategy-builder")}>
            <XIcon size={16} />
          </button>
        </div>

        <div className="strategy-basket-page__prebuilt-row">
          <span>Pre-Built Strategies ▾</span>
          <span className="strategy-basket-page__strategy-badge">{strategyName}</span>
        </div>

        <div className="strategy-basket-page__scroll">
          {points.length > 1 && (
            <div className="strategy-basket-page__chart-card">
              <PayoffChart points={points} />
              <div className="strategy-basket-page__chart-axis">
                <span>{Math.round(points[0].price).toLocaleString()}</span>
                <span>{Math.round(points[points.length - 1].price).toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="strategy-basket-page__payoff-stats">
            <div>
              <div className="strategy-basket-page__payoff-stats-label">Max Profit</div>
              <div className="strategy-basket-page__payoff-stats-value is-positive">{maxProfitLabel}</div>
            </div>
            <div>
              <div className="strategy-basket-page__payoff-stats-label">Max Loss</div>
              <div className="strategy-basket-page__payoff-stats-value is-negative">{maxLossLabel}</div>
            </div>
          </div>

          <div className="strategy-basket-page__strategies-header">
            <span>Strategies ({legs.length})</span>
            <button type="button" className="strategy-basket-page__add-new" onClick={addLeg}>
              + Add New
            </button>
          </div>

          {legs.map((leg) => (
            <div key={leg.id} className="strategy-basket-page__leg-row">
              <div className="strategy-basket-page__leg-top">
                <span className="strategy-basket-page__checkbox is-checked">✓</span>
                <button
                  type="button"
                  className={`strategy-basket-page__side-badge is-${leg.side === "Buy" ? "buy" : "sell"}`}
                  onClick={() => toggleSide(leg.id)}
                  aria-label="Toggle buy/sell"
                >
                  {leg.side[0]}
                </button>

                <button type="button" className="strategy-basket-page__type-toggle" onClick={() => toggleOptionType(leg.id)}>
                  {leg.optionType} <ChevronsUpDownIcon size={11} />
                </button>

                <div className="strategy-basket-page__strike-stepper">
                  <button type="button" onClick={() => adjustStrike(leg.id, -STRIKE_STEP)} aria-label="Decrease strike">
                    −
                  </button>
                  <span>{leg.strike}</span>
                  <button type="button" onClick={() => adjustStrike(leg.id, STRIKE_STEP)} aria-label="Increase strike">
                    +
                  </button>
                </div>

                <button type="button" className="strategy-basket-page__leg-remove" onClick={() => removeLeg(leg.id)} aria-label="Remove leg">
                  <XIcon size={13} />
                </button>
              </div>

              <div className="strategy-basket-page__leg-bottom">
                <span className="strategy-basket-page__leg-premium">Premium {leg.premium}</span>
                <div className="strategy-basket-page__qty-stepper">
                  <span className="strategy-basket-page__qty-label">Qty</span>
                  <button type="button" onClick={() => adjustQty(leg.id, -1)} aria-label="Decrease quantity">
                    −
                  </button>
                  <span>{leg.qty}</span>
                  <button type="button" onClick={() => adjustQty(leg.id, 1)} aria-label="Increase quantity">
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="strategy-basket-page__footer">
          <div className="strategy-basket-page__margin-row">
            <span>Order Margin ↺</span>
            <span>$1.13</span>
          </div>
          <div className="strategy-basket-page__margin-row">
            <span>Available Margin</span>
            <span>$6.96</span>
          </div>
          <div className="strategy-basket-page__cta-row">
            <Link to="/analyze-payoff" className="strategy-basket-page__analyse-btn">
              <ChartLineIcon size={14} /> Analyse Payoff
            </Link>
            <button type="button" className="strategy-basket-page__place-btn" onClick={() => navigate("/positions")}>
              Place Order ({legs.length})
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
