import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import BottomTabBar from "../components/common/BottomTabBar";
import Toggle from "../components/common/Toggle";
import { XIcon } from "../components/icons";
import "./ChartsZipTrade.css";

const CANDLES = [
  60, 50, 65, 40, 55, 45, 60, 35, 50, 30, 45, 40, 55, 90, 70, 95, 80, 60, 65, 55, 70, 60, 75, 65,
];

const LEFT_TOOLS = ["✛", "╱", "☰", "⌬", "⟋", "〰", "T", "🙂", "📏", "🔍", "🧲", "✎"];

const SPOT = 86048.0;
const LEVERAGE = 100;
const ORDER_TYPES = ["Market", "Limit", "Trigger"];
const QTY_UNITS = ["Lot", "BTC", "USD"];
const LOT_SIZE = 0.001;

const ASK_SIZES = [
  { price: 86052.5, size: 0.42 },
  { price: 86051.5, size: 0.18 },
  { price: 86050.5, size: 0.65 },
  { price: 86050.0, size: 0.24 },
  { price: 86049.5, size: 0.51 },
  { price: 86049.0, size: 0.12 },
  { price: 86048.5, size: 0.33 },
];
let askRunning = 0;
const ASKS = ASK_SIZES.map((row) => ({ ...row, total: (askRunning += row.size).toFixed(2) }));
const MAX_ASK_TOTAL = parseFloat(ASKS[ASKS.length - 1].total);

const BID_SIZES = [
  { price: 86047.5, size: 0.55 },
  { price: 86047.0, size: 0.3 },
  { price: 86046.5, size: 0.71 },
  { price: 86046.0, size: 0.19 },
  { price: 86045.5, size: 0.44 },
  { price: 86045.0, size: 0.27 },
  { price: 86044.5, size: 0.62 },
];
let bidRunning = 0;
const BIDS = BID_SIZES.map((row) => ({ ...row, total: (bidRunning += row.size).toFixed(2) }));
const MAX_BID_TOTAL = parseFloat(BIDS[BIDS.length - 1].total);

const RECENT_TRADES = [
  { price: 86048.5, size: 0.012, time: "18:34:50", side: "buy" },
  { price: 86047.0, size: 0.24, time: "18:34:47", side: "sell" },
  { price: 86049.0, size: 0.005, time: "18:34:41", side: "buy" },
  { price: 86046.5, size: 0.108, time: "18:34:36", side: "sell" },
  { price: 86048.0, size: 0.02, time: "18:34:30", side: "buy" },
  { price: 86045.5, size: 0.33, time: "18:34:24", side: "sell" },
  { price: 86047.5, size: 0.015, time: "18:34:19", side: "buy" },
  { price: 86044.0, size: 0.09, time: "18:34:12", side: "sell" },
  { price: 86048.5, size: 0.045, time: "18:34:05", side: "buy" },
  { price: 86046.0, size: 0.22, time: "18:33:58", side: "sell" },
  { price: 86049.5, size: 0.008, time: "18:33:52", side: "buy" },
  { price: 86045.0, size: 0.175, time: "18:33:45", side: "sell" },
  { price: 86047.0, size: 0.03, time: "18:33:39", side: "buy" },
  { price: 86043.5, size: 0.26, time: "18:33:32", side: "sell" },
  { price: 86048.0, size: 0.014, time: "18:33:26", side: "buy" },
  { price: 86046.5, size: 0.099, time: "18:33:19", side: "sell" },
  { price: 86049.0, size: 0.006, time: "18:33:12", side: "buy" },
  { price: 86044.5, size: 0.31, time: "18:33:05", side: "sell" },
];

const EXISTING_POSITION = { side: "Long", qty: 0.02, entryPrice: 85200 };

function estimateLiquidation(side, entryPrice, leverage) {
  const buffer = 0.9 / leverage;
  return side === "Long" ? entryPrice * (1 - buffer) : entryPrice * (1 + buffer);
}

// Market Pulse (inputs.md Section 14). Deterministic, no-ML classification off mock
// positioning data — same "name the state, never the direction" discipline as
// computeThesisLayer() in OptionChain.jsx. Reuses the page's existing price-change
// figure rather than a second, disconnected number.
const PRICE_CHANGE_PCT = 0.95;
const OI_USD = 79.1;
const OI_CHANGE_PCT = -4.2;
const FUNDING_RATE_PCT = 0.01;
const FUNDING_RANGE = { low: -0.01, high: 0.03 };
const LONG_LIQ_USD = 4.2;
const SHORT_LIQ_USD = 38.6;

function classifyFunding(rate, range) {
  if (rate > range.high) return "High";
  if (rate < range.low) return "Low";
  return "Normal";
}

function computeMarketState({ priceChangePct, oiChangePct, longLiqUsd, shortLiqUsd }) {
  const materiallyElevated = (a, b) => a > 0 && a > b * 1.5;
  if (priceChangePct > 0 && oiChangePct < 0 && materiallyElevated(shortLiqUsd, longLiqUsd)) {
    return {
      key: "short-squeeze",
      label: "Short squeeze",
      headline: `Short squeeze — $${shortLiqUsd.toFixed(1)}M shorts liquidated`,
      why: "Price is rising with falling open interest and elevated short liquidations — consistent with forced short-covering, not confirmed fresh buying.",
    };
  }
  if (priceChangePct < 0 && oiChangePct < 0 && materiallyElevated(longLiqUsd, shortLiqUsd)) {
    return {
      key: "long-liquidation",
      label: "Long liquidation",
      headline: `Long liquidation — $${longLiqUsd.toFixed(1)}M longs liquidated`,
      why: "Price is falling with falling open interest and elevated long liquidations — consistent with forced deleveraging, not confirmed fresh selling.",
    };
  }
  if (Math.sign(priceChangePct) === Math.sign(oiChangePct) && Math.abs(priceChangePct) > 0.3 && Math.abs(oiChangePct) > 1) {
    return {
      key: "derivatives-led",
      label: "Derivatives-led move",
      headline: "Derivatives-led move — fresh leverage building with price",
      why: "Price and open interest are moving together — new positions are being added in this direction, not just existing ones repricing.",
    };
  }
  return {
    key: "none",
    label: "No unusual positioning",
    headline: "No unusual positioning",
    why: "Open interest and liquidation levels are within a normal range for current price action.",
  };
}

const MARKET_STATE = computeMarketState({
  priceChangePct: PRICE_CHANGE_PCT,
  oiChangePct: OI_CHANGE_PCT,
  longLiqUsd: LONG_LIQ_USD,
  shortLiqUsd: SHORT_LIQ_USD,
});
const FUNDING_LABEL = classifyFunding(FUNDING_RATE_PCT, FUNDING_RANGE);

export default function ChartsZipTrade() {
  const navigate = useNavigate();
  const location = useLocation();
  const [priceTab, setPriceTab] = useState("Traded Price");
  const [showMarketPulse, setShowMarketPulse] = useState(Boolean(location.state?.openMarketPulse));
  const [bookView, setBookView] = useState("both");
  const [ziptradeOn, setZiptradeOn] = useState(true);
  const [showZipSettings, setShowZipSettings] = useState(false);
  const [zipPanelBelowChart, setZipPanelBelowChart] = useState(true);
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [hasOpenPosition, setHasOpenPosition] = useState(false);
  const [showAddAction, setShowAddAction] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [zipOrderType, setZipOrderType] = useState("Market");
  const [zipQty, setZipQty] = useState(1);
  const [zipQtyUnit, setZipQtyUnit] = useState("Lot");
  const [showExitSheet, setShowExitSheet] = useState(false);
  const [closePct, setClosePct] = useState("100%");

  const shortPrice = 86047;
  const longPrice = 86048;

  const cycleOrderType = () => {
    const idx = ORDER_TYPES.indexOf(zipOrderType);
    setZipOrderType(ORDER_TYPES[(idx + 1) % ORDER_TYPES.length]);
  };

  const cycleQtyUnit = () => {
    const idx = QTY_UNITS.indexOf(zipQtyUnit);
    setZipQtyUnit(QTY_UNITS[(idx + 1) % QTY_UNITS.length]);
  };

  const qtyBtc = zipQty * LOT_SIZE;
  const zipQtyDisplay =
    zipQtyUnit === "Lot"
      ? `${zipQty} Lot${zipQty > 1 ? "s" : ""}`
      : zipQtyUnit === "BTC"
        ? `${qtyBtc.toFixed(3)} BTC`
        : `$${(qtyBtc * SPOT).toFixed(2)}`;

  const handleZipOrder = (side, price) => {
    if (skipConfirm) {
      navigate("/positions");
    } else {
      setPendingOrder({ side, price });
    }
  };

  const cancelPendingOrder = () => {
    setPendingOrder(null);
    setShowAddAction(false);
  };

  const addPrice = EXISTING_POSITION.side === "Long" ? longPrice : shortPrice;
  const exitPnl =
    (EXISTING_POSITION.side === "Long" ? SPOT - EXISTING_POSITION.entryPrice : EXISTING_POSITION.entryPrice - SPOT) *
    EXISTING_POSITION.qty;

  return (
    <PhoneFrame footer={<BottomTabBar />}>
      <div className="charts-page">
        <div className="charts-page__header">
          <span className="charts-page__star">★</span>
          <div>
            <div className="charts-page__symbol">BTCUSD ▾</div>
            <div className="charts-page__symbol-sub">Bitcoin Perpetual</div>
          </div>
          <div className="charts-page__price-block">
            <div className="charts-page__price">${SPOT} ↑</div>
            <div className="charts-page__price-chg">0.95%</div>
          </div>
        </div>

        <div className="charts-page__subtabs">
          {["Traded Price", "Order Book", "Recent Trades"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`charts-page__subtab${tab === priceTab ? " is-active" : ""}`}
              onClick={() => setPriceTab(tab)}
            >
              {tab}
              {tab === "Traded Price" && " ▾"}
            </button>
          ))}
          <div className="charts-page__zip-controls">
            <button
              type="button"
              className={`charts-page__ziptrade${ziptradeOn ? " is-active" : ""}`}
              onClick={() => setZiptradeOn((v) => !v)}
            >
              ⚡ ZipTrade
            </button>
            <button
              type="button"
              className="charts-page__ziptrade-settings"
              onClick={() => setShowZipSettings(true)}
              aria-label="ZipTrade settings"
            >
              ⚙
            </button>
          </div>
        </div>

        {priceTab === "Traded Price" && (
          <>
            <div className="charts-page__toolbar">
              {["+", "15m", "⧗", "fx", "▤", "▢", "⬡", "⤢", "📷"].map((icon, i) => (
                <span key={i}>{icon}</span>
              ))}
            </div>

            <div className="charts-page__chart-area">
              <div className="charts-page__chart-tools">
                {LEFT_TOOLS.map((t, i) => (
                  <span key={i}>{t}</span>
                ))}
              </div>
              <div className="charts-page__chart">
                <div className="charts-page__chart-label">
                  BTCUSD · 15 · Delta
                  <div className="charts-page__chart-label-price">86,048.0 0.0 (0.00%)</div>
                </div>
                <div className="charts-page__candles">
                  {CANDLES.map((h, i) => (
                    <div
                      key={i}
                      className={`charts-page__candle${i % 2 === 0 ? " is-down" : " is-up"}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="charts-page__tv-badge">TV</div>
              </div>
            </div>

            <div className="charts-page__time-axis">
              <span>09:00</span>
              <span>12:00</span>
              <span>15:00</span>
              <span>18:00</span>
              <span>21:...</span>
            </div>
            <div className="charts-page__time-meta">
              <span>18:34:50 UTC+5:30</span>
              <span className="charts-page__time-toggle">% log auto</span>
            </div>
          </>
        )}

        {priceTab === "Order Book" && (
          <div className="charts-page__book-panel">
            <div className="charts-page__book-controls">
              <div className="charts-page__book-agg-icons">
                <button type="button" className={bookView === "both" ? "is-active" : ""} onClick={() => setBookView("both")}>
                  ☰
                </button>
                <button type="button" className={bookView === "asks" ? "is-active" : ""} onClick={() => setBookView("asks")}>
                  ▲
                </button>
                <button type="button" className={bookView === "bids" ? "is-active" : ""} onClick={() => setBookView("bids")}>
                  ▼
                </button>
              </div>
              <div className="charts-page__book-step">0.1 ▾</div>
            </div>

            <div className="charts-page__book-header">
              <span>Price (USD)</span>
              <span>Size (BTC)</span>
              <span>Total (BTC)</span>
            </div>

            {bookView !== "bids" &&
              ASKS.slice()
                .reverse()
                .map((row) => (
                  <div key={row.price} className="charts-page__book-row is-ask">
                    <div className="charts-page__book-depth" style={{ width: `${(row.total / MAX_ASK_TOTAL) * 100}%` }} />
                    <span>{row.price.toFixed(1)}</span>
                    <span>{row.size.toFixed(3)}</span>
                    <span>{row.total}</span>
                  </div>
                ))}

            <div className="charts-page__book-spot">
              {SPOT.toFixed(1)}
              <span className="charts-page__book-mark">M {(SPOT - 0.5).toFixed(1)}</span>
            </div>

            {bookView !== "asks" &&
              BIDS.map((row) => (
                <div key={row.price} className="charts-page__book-row is-bid">
                  <div className="charts-page__book-depth" style={{ width: `${(row.total / MAX_BID_TOTAL) * 100}%` }} />
                  <span>{row.price.toFixed(1)}</span>
                  <span>{row.size.toFixed(3)}</span>
                  <span>{row.total}</span>
                </div>
              ))}
          </div>
        )}

        {priceTab === "Recent Trades" && (
          <div className="charts-page__trades-panel">
            <div className="charts-page__trades-header">
              <span>Price (USD)</span>
              <span>Size (BTC)</span>
              <span>Time</span>
            </div>
            {RECENT_TRADES.map((t, i) => (
              <div key={i} className={`charts-page__trades-row${t.side === "buy" ? " is-buy" : " is-sell"}`}>
                <span>
                  {t.side === "buy" ? "↗" : "↘"} {t.price.toFixed(1)}
                </span>
                <span>{t.size.toFixed(3)}</span>
                <span>
                  {t.time}/{t.side === "buy" ? "B" : "S"}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className={`charts-page__market-pulse-card is-${MARKET_STATE.key}`}
          onClick={() => setShowMarketPulse(true)}
        >
          <span className="charts-page__market-pulse-dot" />
          <span className="charts-page__market-pulse-text">{MARKET_STATE.headline}</span>
          <span className="charts-page__market-pulse-arrow">›</span>
        </button>

        {ziptradeOn && zipPanelBelowChart && (
          <>
            <div className="charts-page__zip-meta-row">
              <span className="charts-page__zip-leverage">{LEVERAGE}x</span>
              <button type="button" className="charts-page__zip-order-type" onClick={cycleOrderType}>
                {zipOrderType} ▾
              </button>
            </div>

            <div className="charts-page__ziptrade-bar">
              {hasOpenPosition && !showAddAction ? (
                <>
                  <button
                    type="button"
                    className={`charts-page__zip-btn ${EXISTING_POSITION.side === "Long" ? "is-long" : "is-short"}`}
                    onClick={() => setShowAddAction(true)}
                  >
                    <div>Add Position</div>
                    <div>{addPrice}</div>
                  </button>
                  <button type="button" className="charts-page__zip-btn is-exit" onClick={() => setShowExitSheet(true)}>
                    Exit Position
                  </button>
                </>
              ) : (
                <>
                  {hasOpenPosition && (
                    <button
                      type="button"
                      className="charts-page__zip-back"
                      onClick={() => setShowAddAction(false)}
                      aria-label="Back"
                    >
                      ‹
                    </button>
                  )}
                  <button type="button" className="charts-page__zip-btn is-short" onClick={() => handleZipOrder("Short", shortPrice)}>
                    <div>Short</div>
                    <div>{shortPrice}</div>
                  </button>
                  <div className="charts-page__zip-qty-stepper">
                    <button type="button" onClick={() => setZipQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                      −
                    </button>
                    <div>
                      <div>{zipQtyDisplay}</div>
                      <button type="button" className="charts-page__zip-qty-unit" onClick={cycleQtyUnit}>
                        {zipQtyUnit} ▾
                      </button>
                    </div>
                    <button type="button" onClick={() => setZipQty((q) => q + 1)} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                  <button type="button" className="charts-page__zip-btn is-long" onClick={() => handleZipOrder("Long", longPrice)}>
                    <div>Long</div>
                    <div>{longPrice}</div>
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {showZipSettings && (
          <div className="charts-page__overlay">
            <div className="charts-page__modal">
              <div className="charts-page__modal-header">
                <span>ZipTrade Settings</span>
                <button type="button" onClick={() => setShowZipSettings(false)}>
                  <XIcon size={16} />
                </button>
              </div>

              <div className="charts-page__settings-row">
                <div>
                  <div className="charts-page__settings-title">Long / Short Panel below Chart</div>
                  <div className="charts-page__settings-subtext">Place orders directly below chart</div>
                </div>
                <Toggle checked={zipPanelBelowChart} onChange={setZipPanelBelowChart} />
              </div>

              <div className="charts-page__settings-row">
                <div>
                  <div className="charts-page__settings-title">Skip Order Confirmation</div>
                  <div className="charts-page__settings-subtext">Orders execute instantly without confirmation</div>
                </div>
                <Toggle checked={skipConfirm} onChange={setSkipConfirm} />
              </div>

              <div className="charts-page__settings-row">
                <div>
                  <div className="charts-page__settings-title">Simulate Open Position (Demo)</div>
                  <div className="charts-page__settings-subtext">Preview the Add/Exit bar for an existing BTCUSD position</div>
                </div>
                <Toggle
                  checked={hasOpenPosition}
                  onChange={(v) => {
                    setHasOpenPosition(v);
                    setShowAddAction(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {pendingOrder && (
          <div className="charts-page__overlay">
            <div className="charts-page__modal">
              <div className="charts-page__modal-header">
                <span>Confirm {pendingOrder.side}</span>
                <button type="button" onClick={cancelPendingOrder}>
                  <XIcon size={16} />
                </button>
              </div>
              <div className="charts-page__confirm-text">
                Confirm {pendingOrder.side} BTCUSD at {pendingOrder.price}?
              </div>
              <div className="charts-page__modal-row">
                <span>Order Type</span>
                <span>{zipOrderType}</span>
              </div>
              <div className="charts-page__modal-row">
                <span>Leverage</span>
                <span>{LEVERAGE}x</span>
              </div>
              <div className="charts-page__modal-row">
                <span>Est. Liquidation</span>
                <span>{estimateLiquidation(pendingOrder.side, pendingOrder.price, LEVERAGE).toFixed(0)}</span>
              </div>
              <div className="charts-page__confirm-actions">
                <button type="button" className="charts-page__confirm-cancel" onClick={cancelPendingOrder}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="charts-page__confirm-ok"
                  onClick={() => {
                    setPendingOrder(null);
                    navigate("/positions");
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {showExitSheet && (
          <div className="charts-page__overlay">
            <div className="charts-page__modal">
              <div className="charts-page__modal-header">
                <span>
                  Exit <span className={EXISTING_POSITION.side === "Long" ? "is-positive" : "is-negative"}>{EXISTING_POSITION.side}</span>{" "}
                  BTCUSD
                </span>
                <button type="button" onClick={() => setShowExitSheet(false)}>
                  <XIcon size={16} />
                </button>
              </div>

              <div className="charts-page__modal-toggle">
                <button type="button" className="is-active">
                  Market
                </button>
                <button type="button">Limit</button>
              </div>

              <div className="charts-page__modal-row">
                <span>Entry Price</span>
                <span>{EXISTING_POSITION.entryPrice}</span>
              </div>
              <div className="charts-page__modal-row">
                <span>Mark Price</span>
                <span>{SPOT.toFixed(1)}</span>
              </div>
              <div className="charts-page__modal-row">
                <span>Est. PNL</span>
                <span className={exitPnl >= 0 ? "is-positive" : "is-negative"}>
                  {exitPnl >= 0 ? "+" : ""}
                  {exitPnl.toFixed(2)} USD
                </span>
              </div>

              <div className="charts-page__modal-field">
                <span>{EXISTING_POSITION.qty}</span>
                <span className="charts-page__field-unit">BTC</span>
              </div>

              <div className="charts-page__modal-pct-row">
                {["25%", "50%", "75%", "100%"].map((p) => (
                  <button key={p} type="button" className={p === closePct ? "is-active" : ""} onClick={() => setClosePct(p)}>
                    {p}
                  </button>
                ))}
              </div>

              <div className="charts-page__modal-footer">
                <div>
                  <div className="charts-page__settings-subtext">Closing</div>
                  <div>{closePct}</div>
                </div>
                <button
                  type="button"
                  className="charts-page__confirm-ok"
                  onClick={() => {
                    setShowExitSheet(false);
                    navigate("/positions");
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {showMarketPulse && (
          <div className="charts-page__overlay" onClick={() => setShowMarketPulse(false)}>
            <div className="charts-page__modal" onClick={(e) => e.stopPropagation()}>
              <div className="charts-page__modal-header">
                <span>Market Pulse</span>
                <button type="button" onClick={() => setShowMarketPulse(false)}>
                  <XIcon size={16} />
                </button>
              </div>

              <div className={`charts-page__market-pulse-badge is-${MARKET_STATE.key}`}>{MARKET_STATE.label}</div>

              <div className="charts-page__modal-row">
                <span>Open Interest</span>
                <span>
                  ${OI_USD.toFixed(1)}M ({OI_CHANGE_PCT > 0 ? "+" : ""}
                  {OI_CHANGE_PCT.toFixed(1)}%)
                </span>
              </div>
              <div className="charts-page__modal-row">
                <span>Funding (8h)</span>
                <span>
                  {FUNDING_RATE_PCT.toFixed(4)}% · {FUNDING_LABEL}
                </span>
              </div>
              <div className="charts-page__modal-row">
                <span>Long liquidations</span>
                <span>${LONG_LIQ_USD.toFixed(1)}M</span>
              </div>
              <div className="charts-page__modal-row">
                <span>Short liquidations</span>
                <span>${SHORT_LIQ_USD.toFixed(1)}M</span>
              </div>

              <div className="charts-page__market-pulse-why">{MARKET_STATE.why}</div>

              <div className="charts-page__market-pulse-disclaimer">
                Describes current positioning, not a price prediction.
              </div>
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
