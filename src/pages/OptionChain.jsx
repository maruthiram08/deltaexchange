import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import BottomTabBar from "../components/common/BottomTabBar";
import Toggle from "../components/common/Toggle";
import { ChartLineIcon, XIcon } from "../components/icons";
import "./OptionChain.css";

const TOPBAR_ROUTES = {
  Watchlist: "/markets",
  Futures: "/markets",
  "RWA Tokens": "/markets",
  Straddle: "/straddle",
};

const ASSETS = ["BTC", "ETH", "XAUT"];
const AVAILABLE_BALANCE = 6.96;
const SPOT = 86024.7;
const FUTURES_PRICE = { BTC: 86024.7, ETH: 2762.45, XAUT: 4345.22 };
const FUTURES_LEVERAGE = 100;

const SPLIT_ROWS = [
  { strike: 85400, callOi: 0.8, putOi: 4.6, callVol: 2.1, putVol: 8.9, callDelta: 0.72, putDelta: -0.28, callTheta: -8.2, putTheta: -7.5, callBid: 979, callAsk: 993, callMark: 985.4, callIv: 35.9, putMark: 349.1, putIv: 35.1, putBid: 347, putAsk: 353 },
  { strike: 85600, callOi: 1.1, putOi: 3.3, callVol: 3.4, putVol: 6.2, callDelta: 0.66, putDelta: -0.34, callTheta: -9.4, putTheta: -8.8, callBid: 864, callAsk: 878, callMark: 870.7, callIv: 36.5, putMark: 434.1, putIv: 35.8, putBid: 432, putAsk: 437 },
  { strike: 85800, callOi: 1.6, putOi: 2.7, callVol: 4.8, putVol: 4.5, callDelta: 0.6, putDelta: -0.4, callTheta: -10.6, putTheta: -10, callBid: 769, callAsk: 777, callMark: 769.1, callIv: 37.3, putMark: 533.3, putIv: 36.7, putBid: 528, putAsk: 534.6 },
  { strike: 86000, callOi: 2.4, putOi: 3.85, callVol: 9.6, putVol: 9.1, callDelta: 0.53, putDelta: -0.47, callTheta: -11.8, putTheta: -11.5, callBid: 679, callAsk: 687, callMark: 680.6, callIv: 38.3, putMark: 644.2, putIv: 37.6, putBid: 641, putAsk: 649 },
  { spotMarker: "BTC 86024.7" },
  { strike: 86200, callOi: 3.9, putOi: 1.9, callVol: 12.3, putVol: 3.6, callDelta: 0.46, putDelta: -0.54, callTheta: -12.5, putTheta: -12, callBid: 597, callAsk: 604, callMark: 600.7, callIv: 39.2, putMark: 763.7, putIv: 38.5, putBid: 759, putAsk: 767 },
  { strike: 86400, callOi: 3.1, putOi: 1.4, callVol: 7.5, putVol: 2.4, callDelta: 0.39, putDelta: -0.61, callTheta: -11, putTheta: -10.5, callBid: 525, callAsk: 533, callMark: 528.6, callIv: 40, putMark: 892.1, putIv: 39.3, putBid: 888, putAsk: 896 },
  { strike: 86600, callOi: 5.2, putOi: 0.9, callVol: 5.9, putVol: 1.5, callDelta: 0.33, putDelta: -0.67, callTheta: -9.5, putTheta: -9, callBid: 460, callAsk: 467, callMark: 463.5, callIv: 40.8, putMark: 1026.8, putIv: 40.1, putBid: 1020, putAsk: 1034 },
  { strike: 86800, callOi: 2.0, putOi: 0.6, callVol: 2.8, putVol: 1.0, callDelta: 0.27, putDelta: -0.73, callTheta: -8, putTheta: -7.8, callBid: 404, callAsk: 411, callMark: 406.4, callIv: 41.6, putMark: 1169.3, putIv: 40.8, putBid: 1161, putAsk: 1177 },
];

const CHAIN_DATA_MODES = ["Price", "OI/Vol", "Greeks"];
const CHAIN_HEADER_LABELS = {
  Price: ["Mark", "Price / IV"],
  "OI/Vol": ["OI", "Volume"],
  Greeks: ["Delta", "Theta"],
};
const fmtM = (v) => `$${v.toFixed(2)}M`;

// Max Pain / OI Support / OI Resistance — decision-support labels traders coming from
// Sensibull/Opstra-style tools expect directly on the chain (pain-points-notes.md #10).
// OI Resistance = strike with the heaviest call writing (acts as a ceiling); OI Support =
// heaviest put writing (acts as a floor); Max Pain = the strike where total option-holder
// payout across all strikes would be smallest at expiry.
function computeOiLevels(rows) {
  const strikeRows = rows.filter((r) => !r.spotMarker);
  const oiResistance = strikeRows.reduce((a, b) => (b.callOi > a.callOi ? b : a));
  const oiSupport = strikeRows.reduce((a, b) => (b.putOi > a.putOi ? b : a));
  const maxPain = strikeRows.reduce((best, candidate) => {
    const payout = strikeRows.reduce(
      (sum, r) => sum + r.callOi * Math.max(candidate.strike - r.strike, 0) + r.putOi * Math.max(r.strike - candidate.strike, 0),
      0
    );
    return payout < best.payout ? { strike: candidate.strike, payout } : best;
  }, { strike: strikeRows[0].strike, payout: Infinity }).strike;
  return { oiResistanceStrike: oiResistance.strike, oiSupportStrike: oiSupport.strike, maxPainStrike: maxPain };
}

const OI_LEVELS = computeOiLevels(SPLIT_ROWS);
const MAX_OI = Math.max(...SPLIT_ROWS.filter((r) => !r.spotMarker).flatMap((r) => [r.callOi, r.putOi]));

// Option Chain thesis layer (inputs.md Section 12). IV Rank is compared against a disclosed
// mock 30-day range (not real history) — the point is to demonstrate the decision rule, not
// to claim real historical accuracy. Skew compares the nearest OTM put/call, not a full
// volatility surface. Both limits are surfaced to the user in the panel, not hidden.
const IV_RANK_RANGE = { low: 24, high: 44 };

function computeThesisLayer(rows) {
  const strikeRows = rows.filter((r) => !r.spotMarker);
  const atmRow = strikeRows.reduce((a, b) => (Math.abs(b.strike - SPOT) < Math.abs(a.strike - SPOT) ? b : a));
  // OTM put/call are picked relative to the ATM strike itself, not raw spot — a strike can sit
  // on the spot's "below" side while still being the nearest one overall (as 86000 does here,
  // 24.7 below an 86024.7 spot), which would otherwise collide with the ATM strike.
  const belowRows = strikeRows.filter((r) => r.strike < atmRow.strike);
  const aboveRows = strikeRows.filter((r) => r.strike > atmRow.strike);
  const otmPutRow = belowRows.reduce((a, b) => (b.strike > a.strike ? b : a));
  const otmCallRow = aboveRows.reduce((a, b) => (b.strike < a.strike ? b : a));

  const atmIv = (atmRow.callIv + atmRow.putIv) / 2;
  const skew = otmPutRow.putIv - otmCallRow.callIv;
  const totalCallOi = strikeRows.reduce((sum, r) => sum + r.callOi, 0);
  const totalPutOi = strikeRows.reduce((sum, r) => sum + r.putOi, 0);
  const pcr = totalPutOi / totalCallOi;
  const ivRank = ((atmIv - IV_RANK_RANGE.low) / (IV_RANK_RANGE.high - IV_RANK_RANGE.low)) * 100;
  const strategyCall = ivRank > 60 ? "sell" : ivRank < 40 ? "buy" : "neutral";

  return {
    atmStrike: atmRow.strike, atmCallIv: atmRow.callIv, atmPutIv: atmRow.putIv, atmIv,
    otmPutStrike: otmPutRow.strike, otmPutIv: otmPutRow.putIv,
    otmCallStrike: otmCallRow.strike, otmCallIv: otmCallRow.callIv,
    skew, pcr, ivRank, strategyCall,
  };
}

const THESIS = computeThesisLayer(SPLIT_ROWS);

const STRATEGY_LABELS = { sell: "Sell Premium", buy: "Buy Premium", neutral: "Neutral" };
const STRATEGY_DESC = {
  sell: "options are pricier than usual, which historically favors selling premium over buying it.",
  buy: "options are cheaper than usual, which historically favors buying premium over selling it.",
  neutral: "IV isn't clearly rich or cheap right now — no strong edge either way.",
};
const STRATEGY_CTA = {
  sell: "View iron condor and short straddle templates",
  buy: "View long call, long put and debit spread templates",
  neutral: "Explore strategy templates",
};

const SINGLE_ROWS = [
  { strike: 85200, oi: "$122.66K", mark: 1098, markIv: 35.5, bid: 1088, bidIv: 34.8, ask: 1106, askIv: 36 },
  { strike: 85400, oi: "$605.19K", mark: 970.4, markIv: 35.9, bid: 964, bidIv: 35.4, ask: 978, askIv: 36.2 },
  { strike: 85600, oi: "$327.70K", mark: 857, markIv: 36.6, bid: 852, bidIv: 36.2, ask: 865, askIv: 36.9 },
  { strike: 85800, oi: "$385.87K", mark: 757.2, markIv: 37.4, bid: 751, bidIv: 37, ask: 760, askIv: 37.5 },
  { strike: 86000, oi: "$3.82M", mark: 669.7, markIv: 38.3, bid: 663, bidIv: 38, ask: 671, askIv: 38.4 },
  { spotMarker: "86001.0" },
  { strike: 86200, oi: "$1.78M", mark: 590.5, markIv: 39.2, bid: 584, bidIv: 38.9, ask: 592, askIv: 39.3 },
  { strike: 86400, oi: "$1.37M", mark: 519.1, markIv: 40.1, bid: 513, bidIv: 39.7, ask: 521, askIv: 40.2 },
  { strike: 86600, oi: "$547.64K", mark: 454.7, markIv: 40.8, bid: 449, bidIv: 40.4, ask: 456, askIv: 40.9 },
  { strike: 86800, oi: "$1.40M", mark: 398.6, markIv: 41.2, bid: 393, bidIv: 40.8, ask: 400, askIv: 41.6 },
];

function summarize(legs) {
  if (legs.length === 0) return null;

  const qtyOf = (l) => Number(l.qty) || 1;
  const options = legs.filter((l) => l.kind !== "future");
  const futures = legs.filter((l) => l.kind === "future");

  // Futures have no upfront premium — only options contribute to net premium paid/received.
  const netPremium = options.reduce((sum, l) => sum + (l.action === "Sell" ? l.mark : -l.mark) * qtyOf(l), 0);
  const allBuy = legs.every((l) => l.action === "Buy");
  const allSell = legs.every((l) => l.action === "Sell");

  let name = `Custom Strategy (${legs.length} legs)`;
  if (futures.length === 1 && options.length === 1) {
    const [f, o] = [futures[0], options[0]];
    if (f.action === "Buy" && o.side === "call" && o.action === "Sell") name = "Covered Call";
    else if (f.action === "Buy" && o.side === "put" && o.action === "Buy") name = "Protective Put";
    else name = `${f.action} Futures + ${o.action} ${o.side === "call" ? "Call" : "Put"}`;
  } else if (futures.length === 1 && options.length === 0) {
    name = `${futures[0].action} Futures`;
  } else if (futures.length === 0 && options.length === 1) {
    name = `${options[0].action} ${options[0].side === "call" ? "Call" : "Put"}`;
  } else if (futures.length === 0 && options.length === 2) {
    const [a, b] = options;
    if (a.strike === b.strike && a.side !== b.side && a.action === b.action) {
      name = `${a.action === "Buy" ? "Long" : "Short"} Straddle`;
    } else if (a.side === b.side && a.action !== b.action) {
      name = `${a.side === "call" ? "Call" : "Put"} Spread`;
    }
  }

  // Max Loss/Profit derived numerically from the same sampled payoff curve used for the
  // graph, rather than separate closed-form formulas — this generalizes correctly to any
  // option+futures combo (a futures leg's linear payoff doesn't fit the old call/put-only math).
  const { points } = buildPayoffSeries(legs);
  const pnls = points.map((p) => p.pnl);
  const minPnl = Math.min(...pnls, 0);
  const maxPnl = Math.max(...pnls, 0);
  const EPS = 1;
  const leftSlope = points[1].pnl - points[0].pnl;
  const rightSlope = points[points.length - 1].pnl - points[points.length - 2].pnl;
  const leftDir = -leftSlope; // extrapolated trend below the sampled window
  const rightDir = rightSlope; // extrapolated trend above the sampled window

  let maxLoss = Math.max(-minPnl, 0);
  let maxProfit = Math.max(maxPnl, 0);
  if ((Math.abs(leftSlope) > EPS && leftDir < 0) || (Math.abs(rightSlope) > EPS && rightDir < 0)) {
    maxLoss = "Unlimited";
  }
  if ((Math.abs(leftSlope) > EPS && leftDir > 0) || (Math.abs(rightSlope) > EPS && rightDir > 0)) {
    maxProfit = "Unlimited";
  }

  const pop = allSell ? 64 : allBuy ? 38 : 50;
  const futuresMargin = futures.reduce((sum, f) => sum + (f.mark * qtyOf(f)) / FUTURES_LEVERAGE, 0);
  const reqMargin = Math.max(Math.abs(netPremium), 25) + futuresMargin;
  const charges = legs.length * 0.5;

  return { name, maxLoss, maxProfit, pop, reqMargin, charges };
}

const money = (v) => (typeof v === "number" ? `$${v.toFixed(2)}` : v);

function LegEditControls({ qty, action, onQtyChange, onActionChange }) {
  return (
    <>
      <input
        className="option-chain-page__leg-qty"
        value={qty}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onQtyChange(e.target.value)}
      />
      <button
        type="button"
        className={`option-chain-page__leg-side is-buy${action === "Buy" ? " is-active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onActionChange("Buy");
        }}
      >
        B
      </button>
      <button
        type="button"
        className={`option-chain-page__leg-side is-sell${action === "Sell" ? " is-active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onActionChange("Sell");
        }}
      >
        S
      </button>
    </>
  );
}

const GRAPH_W = 56;
const GRAPH_H = 44;
const GRAPH_PAD = 3;

function PayoffGraph({ legs }) {
  const { points, minPrice, maxPrice, minPnl, maxPnl } = useMemo(() => buildPayoffSeries(legs), [legs]);

  const xFor = (price) => GRAPH_PAD + ((price - minPrice) / (maxPrice - minPrice)) * (GRAPH_W - GRAPH_PAD * 2);
  const yFor = (pnl) => {
    const range = maxPnl - minPnl || 1;
    return GRAPH_H - GRAPH_PAD - ((pnl - minPnl) / range) * (GRAPH_H - GRAPH_PAD * 2);
  };

  const zeroY = yFor(0);
  const spotX = xFor(Math.min(Math.max(SPOT, minPrice), maxPrice));

  return (
    <svg className="option-chain-page__payoff-svg" viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} preserveAspectRatio="none">
      <line x1={0} y1={zeroY} x2={GRAPH_W} y2={zeroY} className="option-chain-page__payoff-zero" />
      <line x1={spotX} y1={0} x2={spotX} y2={GRAPH_H} className="option-chain-page__payoff-spot" />
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1];
        const positive = p.pnl + next.pnl >= 0;
        return (
          <line
            key={i}
            x1={xFor(p.price)}
            y1={yFor(p.pnl)}
            x2={xFor(next.price)}
            y2={yFor(next.pnl)}
            className={positive ? "option-chain-page__payoff-line is-positive" : "option-chain-page__payoff-line is-negative"}
          />
        );
      })}
    </svg>
  );
}

function buildPayoffSeries(legs) {
  const strikes = legs.filter((l) => l.kind !== "future").map((l) => l.strike);
  const center = strikes.length ? (Math.max(...strikes) + Math.min(...strikes)) / 2 : SPOT;
  const span = Math.max(strikes.length ? Math.max(...strikes) - Math.min(...strikes) : 0, 1600) + 1200;
  const minPrice = center - span / 2;
  const maxPrice = center + span / 2;
  const steps = 40;

  const points = [];
  for (let i = 0; i <= steps; i++) {
    const price = minPrice + ((maxPrice - minPrice) * i) / steps;
    const pnl = legs.reduce((sum, leg) => {
      const qty = Number(leg.qty) || 1;
      if (leg.kind === "future") {
        const legPnl = (leg.action === "Buy" ? price - leg.mark : leg.mark - price) * qty;
        return sum + legPnl;
      }
      const intrinsic = leg.side === "call" ? Math.max(price - leg.strike, 0) : Math.max(leg.strike - price, 0);
      const legPnl = leg.action === "Buy" ? (intrinsic - leg.mark) * qty : (leg.mark - intrinsic) * qty;
      return sum + legPnl;
    }, 0);
    points.push({ price, pnl });
  }

  const pnls = points.map((p) => p.pnl);
  const minPnl = Math.min(...pnls, 0);
  const maxPnl = Math.max(...pnls, 0);

  return { points, minPrice, maxPrice, minPnl, maxPnl };
}

export default function OptionChain() {
  const navigate = useNavigate();
  const [asset, setAsset] = useState("BTC");
  const [assetOpen, setAssetOpen] = useState(false);
  const [viewMode, setViewMode] = useState("split");
  const [chainDataMode, setChainDataMode] = useState("Price");
  const [basketOn, setBasketOn] = useState(false);
  const [legs, setLegs] = useState(() => new Map());
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showThesisData, setShowThesisData] = useState(false);

  const toggleBasket = (next) => {
    setBasketOn(next);
    if (!next) setLegs(new Map());
  };

  const handleContractClick = (key, meta) => {
    if (!basketOn) {
      navigate("/option-trade");
      return;
    }
    setLegs((prev) => {
      const next = new Map(prev);
      if (next.has(key)) next.delete(key);
      else next.set(key, { ...meta, action: "Buy", qty: "1" });
      return next;
    });
  };

  const updateLeg = (key, patch) => {
    setLegs((prev) => {
      const next = new Map(prev);
      const existing = next.get(key);
      if (existing) next.set(key, { ...existing, ...patch });
      return next;
    });
  };

  const removeLeg = (key) => {
    setLegs((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  };

  const reviewBasket = () => {
    // The basket page only models option legs, so a futures leg is not carried over.
    const basketLegs = Array.from(legs.values())
      .filter((l) => l.kind !== "future")
      .map((l, i) => ({
        id: i + 1,
        side: l.action,
        optionType: l.side === "call" ? "CE" : "PE",
        strike: l.strike,
        expiry: "230926",
        qty: Math.max(1, Number(l.qty) || 1),
        premium: Math.round(l.mark),
      }));
    navigate("/strategy-basket", { state: { strategy: summary?.name, legs: basketLegs } });
  };

  const legsArray = useMemo(() => Array.from(legs.values()), [legs]);
  const summary = useMemo(() => summarize(legsArray), [legsArray]);
  const showHintPane = basketOn && legs.size === 0;
  const showSummary = basketOn && legs.size > 0;
  const insufficientBalance = summary ? summary.reqMargin > AVAILABLE_BALANCE : false;

  const futuresKey = `future-${asset}`;
  const futuresLeg = legs.get(futuresKey);

  const toggleFuturesLeg = () => {
    setLegs((prev) => {
      const next = new Map(prev);
      if (next.has(futuresKey)) next.delete(futuresKey);
      else {
        next.set(futuresKey, {
          kind: "future",
          symbol: `${asset}USD`,
          mark: FUTURES_PRICE[asset],
          action: "Buy",
          qty: "1",
        });
      }
      return next;
    });
  };

  const renderLegCell = (key, strike, side, mark, bid, ask) => {
    const leg = legs.get(key);
    if (leg) {
      return (
        <div className="option-chain-page__leg-edit" onClick={() => removeLeg(key)}>
          <LegEditControls
            qty={leg.qty}
            action={leg.action}
            onQtyChange={(v) => updateLeg(key, { qty: v })}
            onActionChange={(a) => updateLeg(key, { action: a })}
          />
        </div>
      );
    }
    return (
      <span className="is-call is-clickable" onClick={() => handleContractClick(key, { strike, side, mark })}>
        ${bid}<br /><span className="is-ask">${ask}</span>
      </span>
    );
  };

  const renderDataCell = (row, side) => {
    const oiProps = {
      className: `option-chain-page__oi-cell is-${side}`,
      style: { "--oi": (side === "call" ? row.callOi : row.putOi) / MAX_OI },
    };
    if (chainDataMode === "OI/Vol") {
      const oi = side === "call" ? row.callOi : row.putOi;
      const vol = side === "call" ? row.callVol : row.putVol;
      return (
        <span {...oiProps}>
          {fmtM(oi)}<br /><span className="option-chain-page__iv">{fmtM(vol)}</span>
        </span>
      );
    }
    if (chainDataMode === "Greeks") {
      const delta = side === "call" ? row.callDelta : row.putDelta;
      const theta = side === "call" ? row.callTheta : row.putTheta;
      return (
        <span {...oiProps}>
          {delta.toFixed(2)}<br /><span className="option-chain-page__iv">{theta.toFixed(1)}</span>
        </span>
      );
    }
    const mark = side === "call" ? row.callMark : row.putMark;
    const iv = side === "call" ? row.callIv : row.putIv;
    return (
      <span {...oiProps}>
        ${mark}<br /><span className="option-chain-page__iv">{iv}%</span>
      </span>
    );
  };

  return (
    <PhoneFrame footer={<BottomTabBar />}>
      <div className="option-chain-page">
        <div className="option-chain-page__topbar">
          {["Watchlist", "Futures", "Options", "RWA Tokens", "Straddle"].map((t) => (
            <span
              key={t}
              className={t === "Options" ? "is-active" : ""}
              onClick={() => TOPBAR_ROUTES[t] && navigate(TOPBAR_ROUTES[t])}
              style={{ cursor: TOPBAR_ROUTES[t] ? "pointer" : "default" }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="option-chain-page__row">
          <div className="option-chain-page__asset-dropdown">
            <button type="button" className="option-chain-page__asset-btn" onClick={() => setAssetOpen((o) => !o)}>
              {asset} ▾
            </button>
            {assetOpen && (
              <div className="option-chain-page__asset-list">
                {ASSETS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`option-chain-page__asset-item${a === asset ? " is-active" : ""}`}
                    onClick={() => {
                      setAsset(a);
                      setAssetOpen(false);
                    }}
                  >
                    {a}
                    {a === "XAUT" && <span className="option-chain-page__new-badge">NEW</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="option-chain-page__analytics-icon-btn" onClick={() => setShowAnalytics(true)} aria-label="Option Analytics">
            <ChartLineIcon size={16} />
          </button>
          <Toggle checked={basketOn} onChange={toggleBasket} label="Basket" />
        </div>

        {basketOn && (
          <div className="option-chain-page__row">
            {futuresLeg ? (
              <div className="option-chain-page__futures-leg" onClick={() => removeLeg(futuresKey)}>
                <span className="option-chain-page__futures-label">
                  {asset}USD Futures · ${futuresLeg.mark}
                </span>
                <LegEditControls
                  qty={futuresLeg.qty}
                  action={futuresLeg.action}
                  onQtyChange={(v) => updateLeg(futuresKey, { qty: v })}
                  onActionChange={(a) => updateLeg(futuresKey, { action: a })}
                />
              </div>
            ) : (
              <button type="button" className="option-chain-page__futures-chip" onClick={toggleFuturesLeg}>
                + Futures ({asset})
              </button>
            )}
          </div>
        )}

        <div className="option-chain-page__expiry-row">
          <div className="option-chain-page__expiry-stack">
            <span className="option-chain-page__expiry">23 Sep ▾</span>
            <span className="option-chain-page__countdown">
              Expires in <strong>22h : 40m</strong>
            </span>
          </div>
          <button type="button" className="option-chain-page__thesis-inline" onClick={() => setShowAnalytics(true)}>
            <span className="option-chain-page__thesis-inline-label">Strategy fit</span>
            <span className={`option-chain-page__thesis-inline-value is-${THESIS.strategyCall}`}>
              {STRATEGY_LABELS[THESIS.strategyCall]} ›
            </span>
          </button>
        </div>

        <div className="option-chain-page__cp-row">
          {viewMode === "split" ? (
            <button type="button" className="option-chain-page__cp-btn" onClick={() => setViewMode("calls")}>
              ‹ CALL
            </button>
          ) : (
            <button type="button" className="option-chain-page__cp-cancel" onClick={() => setViewMode("split")}>
              Cancel
            </button>
          )}
          <div className="option-chain-page__mode-tabs">
            {CHAIN_DATA_MODES.map((m) => (
              <button
                key={m}
                type="button"
                className={m === chainDataMode ? "is-active" : ""}
                onClick={() => setChainDataMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
          {viewMode === "split" && (
            <button type="button" className="option-chain-page__cp-btn" onClick={() => setViewMode("puts")}>
              PUT ›
            </button>
          )}
        </div>

        {viewMode === "split" ? (
          <>
            <div className="option-chain-page__header-row">
              <span>BID<br />ASK</span>
              <span>
                {CHAIN_HEADER_LABELS[chainDataMode][0]}<br />
                {CHAIN_HEADER_LABELS[chainDataMode][1]}
              </span>
              <span>Strike ▲</span>
              <span>
                {CHAIN_HEADER_LABELS[chainDataMode][0]}<br />
                {CHAIN_HEADER_LABELS[chainDataMode][1]}
              </span>
              <span>BID<br />ASK</span>
            </div>

            <div className="option-chain-page__scroll">
              {SPLIT_ROWS.map((row, i) =>
                row.spotMarker ? (
                  <div key={i} className="option-chain-page__spot-row">{row.spotMarker}</div>
                ) : (
                  <div key={row.strike} className="option-chain-page__data-row">
                    {renderLegCell(`${row.strike}-call`, row.strike, "call", row.callMark, row.callBid, row.callAsk)}
                    {renderDataCell(row, "call")}
                    <span className="option-chain-page__strike">
                      {row.strike}
                      {row.strike === OI_LEVELS.maxPainStrike && (
                        <span className="option-chain-page__oi-tag is-maxpain">Max Pain</span>
                      )}
                      {row.strike === OI_LEVELS.oiSupportStrike && (
                        <span className="option-chain-page__oi-tag is-support">OI Sup</span>
                      )}
                      {row.strike === OI_LEVELS.oiResistanceStrike && (
                        <span className="option-chain-page__oi-tag is-resistance">OI Res</span>
                      )}
                    </span>
                    {renderDataCell(row, "put")}
                    {renderLegCell(`${row.strike}-put`, row.strike, "put", row.putMark, row.putBid, row.putAsk)}
                  </div>
                )
              )}
            </div>
          </>
        ) : (
          <>
            <div className="option-chain-page__header-row option-chain-page__header-row--single">
              <span>Strike</span>
              <span>Type</span>
              <span>OI</span>
              <span>Mark</span>
              <span>Bid / Ask</span>
            </div>
            <div className="option-chain-page__scroll">
              {SINGLE_ROWS.map((row, i) => {
                if (row.spotMarker) {
                  return <div key={i} className="option-chain-page__spot-row">{row.spotMarker}</div>;
                }
                const side = viewMode === "calls" ? "call" : "put";
                const key = `${row.strike}-${side}`;
                return (
                  <div key={row.strike} className="option-chain-page__data-row option-chain-page__data-row--single">
                    <span className="option-chain-page__strike">{row.strike}</span>
                    <span className="is-call">{side === "call" ? "C" : "P"}</span>
                    <span>{row.oi}</span>
                    <span>
                      ${row.mark}<br /><span className="option-chain-page__iv">{row.markIv}%</span>
                    </span>
                    <span className="option-chain-page__single-bidask">
                      {renderLegCell(key, row.strike, side, row.mark, row.bid, row.ask)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {showHintPane && (
          <div className="option-chain-page__hint-pane">
            Tap any option contract or add futures above to build your basket
          </div>
        )}

        {showSummary && summary && (
          <div className="option-chain-page__summary">
            <div className="option-chain-page__summary-header">
              <span>{summary.name}</span>
              <button type="button" className="option-chain-page__summary-clear" onClick={() => setLegs(new Map())}>
                Clear
              </button>
            </div>
            <div className="option-chain-page__summary-stats">
              <div>
                <div className="option-chain-page__summary-label">Max Loss</div>
                <div className="option-chain-page__summary-value is-negative">{money(summary.maxLoss)}</div>
              </div>
              <div>
                <div className="option-chain-page__summary-label">Max Profit</div>
                <div className="option-chain-page__summary-value is-positive">{money(summary.maxProfit)}</div>
              </div>
              <div>
                <div className="option-chain-page__summary-label">POP</div>
                <div className="option-chain-page__summary-value">{summary.pop}%</div>
              </div>
              <div className="option-chain-page__payoff-graph">
                <PayoffGraph legs={legsArray} />
              </div>
            </div>
            {insufficientBalance && (
              <div className="option-chain-page__summary-warning">
                ⚠ Insufficient cash balance: {money(summary.reqMargin)} ›
              </div>
            )}
            <div className="option-chain-page__summary-footer">
              <div className="option-chain-page__summary-meta">
                <span>Est. balance: {money(AVAILABLE_BALANCE)}</span>
                <span className={insufficientBalance ? "is-negative" : ""}>Req margin: {money(summary.reqMargin)}</span>
                <span>Charges: {money(summary.charges)}</span>
              </div>
              <button type="button" className="option-chain-page__review-btn" onClick={reviewBasket}>
                Review basket ({legs.size})
              </button>
            </div>
          </div>
        )}

        {showAnalytics && (
          <div className="option-chain-page__overlay" onClick={() => setShowAnalytics(false)}>
            <div className="option-chain-page__thesis-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="option-chain-page__thesis-header">
                <span>Option analytics</span>
                <button type="button" onClick={() => setShowAnalytics(false)} aria-label="Close">
                  <XIcon size={16} />
                </button>
              </div>

              <div className="option-chain-page__thesis-card">
                <div className="option-chain-page__thesis-label">Strategy fit</div>
                <div className={`option-chain-page__thesis-badge is-${THESIS.strategyCall}`}>
                  {STRATEGY_LABELS[THESIS.strategyCall]}
                </div>
                <div className="option-chain-page__thesis-text">
                  IV rank is at the {Math.round(THESIS.ivRank)}th percentile — {STRATEGY_DESC[THESIS.strategyCall]}
                </div>
                <button
                  type="button"
                  className="option-chain-page__thesis-cta"
                  onClick={() => navigate("/strategy-builder")}
                >
                  {STRATEGY_CTA[THESIS.strategyCall]} ›
                </button>
              </div>

              <div className="option-chain-page__thesis-card">
                <div className="option-chain-page__thesis-label">Directional lean · not conclusive</div>
                <div className="option-chain-page__thesis-text">
                  {THESIS.skew > 0
                    ? "Puts are pricier than calls — pricing leans toward downside protection."
                    : THESIS.skew < 0
                    ? "Calls are pricier than puts — pricing leans toward upside demand."
                    : "Puts and calls are similarly priced — no clear lean."}
                </div>
              </div>

              <button
                type="button"
                className="option-chain-page__thesis-toggle"
                onClick={() => setShowThesisData((v) => !v)}
              >
                Data and what this doesn't account for
                <span>{showThesisData ? "▴" : "▾"}</span>
              </button>

              {showThesisData && (
                <div className="option-chain-page__thesis-data">
                  <div>
                    <span>ATM strike {THESIS.atmStrike}</span>
                    <span>Call {THESIS.atmCallIv}% · Put {THESIS.atmPutIv}%</span>
                  </div>
                  <div>
                    <span>OTM put {THESIS.otmPutStrike}</span>
                    <span>{THESIS.otmPutIv}%</span>
                  </div>
                  <div>
                    <span>OTM call {THESIS.otmCallStrike}</span>
                    <span>{THESIS.otmCallIv}%</span>
                  </div>
                  <div>
                    <span>Put/Call ratio</span>
                    <span>{THESIS.pcr.toFixed(2)}</span>
                  </div>
                  <div>
                    <span>IV rank range assumed (30d)</span>
                    <span>{IV_RANK_RANGE.low}%–{IV_RANK_RANGE.high}%</span>
                  </div>
                  <ul>
                    <li>IV rank uses a mocked 30-day range, not full historical data</li>
                    <li>Skew compares 2 strikes, not the full volatility surface</li>
                    <li>No order-flow data — open interest alone can't tell buyers from writers</li>
                    <li>Not backtested on BTC specifically; based on general options theory</li>
                  </ul>
                </div>
              )}

              <div className="option-chain-page__thesis-disclaimer">
                Reflects current options pricing, not a price prediction. Use alongside your own analysis.
              </div>
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
