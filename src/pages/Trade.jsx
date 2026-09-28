import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import BottomTabBar from "../components/common/BottomTabBar";
import RiskCheck from "../components/common/RiskCheck";
import Toggle from "../components/common/Toggle";
import { XIcon } from "../components/icons";
import { shouldGate, markDone, leverageOr } from "../riskGate";
import { recordOrder, getPositionMode, setPositionModeValue } from "../positionStore";
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

// Best price first, matching the order a market order actually consumes the book in —
// asks are listed worst-to-best on screen (closest to spot last), so reverse them.
const ASK_LEVELS = [...ASKS].reverse();
const BID_LEVELS = BIDS;

const ALL_ORDER_TYPES = ["Market", "Limit", "Scaled"];
const BASE_ORDER_TYPES = ["Market", "Limit"];
const QTY_BY_PCT = { "25%": 8, "50%": 20, "75%": 35, "100%": 60 };
const GUARDRAIL_THRESHOLD_PCT = 0.0005;

// walk-the-book: consume levels until qty is filled, return the volume-weighted fill price.
function walkBook(levels, qty) {
  let remaining = qty;
  let cost = 0;
  for (const lvl of levels) {
    if (remaining <= 0) break;
    const price = parseFloat(lvl.price);
    const size = parseFloat(lvl.size);
    const take = Math.min(remaining, size);
    cost += take * price;
    remaining -= take;
  }
  const filled = qty - remaining;
  return { vwap: filled > 0 ? cost / filled : null, complete: remaining <= 0 };
}

export default function Trade() {
  const navigate = useNavigate();
  const [side, setSide] = useState("Long");
  const [qtyPct, setQtyPct] = useState("25%");
  const [leverage, setLeverage] = useState(() => leverageOr(50));
  const [riskCheck, setRiskCheck] = useState(false);
  const [positionMode, setPositionModeState] = useState(() => getPositionMode());
  const setPositionMode = (mode) => {
    setPositionModeValue(mode);
    setPositionModeState(mode);
  };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [orderType, setOrderType] = useState("Limit");
  const [orderTypeOpen, setOrderTypeOpen] = useState(false);
  const [legCount, setLegCount] = useState(10);
  const [distribution, setDistribution] = useState("Flat");
  const [guardrail, setGuardrail] = useState(null);
  const [liquidityMode, setLiquidityMode] = useState(false);

  const orderTypes = liquidityMode ? ALL_ORDER_TYPES : BASE_ORDER_TYPES;

  const bestAsk = parseFloat(ASK_LEVELS[0].price);
  const bestBid = parseFloat(BID_LEVELS[0].price);
  const illustrativeQty = QTY_BY_PCT[qtyPct] ?? QTY_BY_PCT["25%"];

  const buyFill = walkBook(ASK_LEVELS, illustrativeQty);
  const sellFill = walkBook(BID_LEVELS, illustrativeQty);
  const buySlipUsd = buyFill.vwap != null ? (buyFill.vwap - bestAsk) * illustrativeQty : null;
  const sellSlipUsd = sellFill.vwap != null ? (bestBid - sellFill.vwap) * illustrativeQty : null;
  const currentFill = side === "Long" ? buyFill : sellFill;
  const currentSlipUsd = side === "Long" ? buySlipUsd : sellSlipUsd;
  const otherSlipUsd = side === "Long" ? sellSlipUsd : buySlipUsd;
  const currentBest = side === "Long" ? bestAsk : bestBid;
  const currentSlipPct = currentFill.vwap != null ? (Math.abs(currentFill.vwap - currentBest) / currentBest) * 100 : null;
  const cheaperSide =
    currentSlipUsd != null && otherSlipUsd != null
      ? currentSlipUsd <= otherSlipUsd
        ? side
        : side === "Long"
          ? "Short"
          : "Long"
      : null;
  const savingsUsd = currentSlipUsd != null && otherSlipUsd != null ? Math.abs(currentSlipUsd - otherSlipUsd) : null;
  const reqUsd = (illustrativeQty * currentBest) / leverage;

  const placeOrder = () => {
    recordOrder("BTCUSD", side, positionMode);
    navigate("/positions");
  };

  // Hedge Mode demos are about the position-mode mechanic, not leverage risk — the
  // first-time-user risk check is an unrelated gate that just adds friction here.
  const gated = () => positionMode !== "hedge" && shouldGate();

  const submitOrder = () => {
    if (liquidityMode && orderType === "Market" && (!currentFill.complete || currentSlipPct > GUARDRAIL_THRESHOLD_PCT)) {
      setGuardrail({
        pct: currentSlipPct,
        complete: currentFill.complete,
        step: "warning",
      });
      return;
    }
    if (gated()) {
      setRiskCheck(true);
    } else {
      placeOrder();
    }
  };

  const confirmLimitFromGuardrail = () => {
    setGuardrail(null);
    if (gated()) {
      setRiskCheck(true);
    } else {
      placeOrder();
    }
  };

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
            <button type="button" className="trade-page__more" onClick={() => setSettingsOpen(true)}>
              ⋮
            </button>
          </div>
        </div>

        {liquidityMode && orderType !== "Scaled" && (
          <div className="trade-page__eqs trade-page__eqs--full">
            <div className="trade-page__eqs-row">
              <span>Est. slippage ({illustrativeQty} BTC {side.toLowerCase()})</span>
              <span className={currentSlipUsd != null && currentSlipUsd > 0 ? "is-negative" : ""}>
                {currentFill.complete && currentSlipUsd != null
                  ? `~$${currentSlipUsd.toFixed(2)} (${currentSlipPct.toFixed(4)}%)`
                  : "not enough visible depth"}
              </span>
            </div>
            {cheaperSide && cheaperSide !== side && savingsUsd != null && (
              <div className="trade-page__eqs-row trade-page__eqs-compare">
                <span>
                  {cheaperSide === "Long" ? "Buying" : "Selling"} costs ~${savingsUsd.toFixed(2)} less right now
                </span>
              </div>
            )}
          </div>
        )}

        <div className="trade-page__body">
          <div className="trade-page__book">
            <div className="trade-page__funding-label">Funding (8h) / Countdown</div>
            <div className="trade-page__funding-value">0.0100% / 02:55:19</div>
            <button
              type="button"
              className="trade-page__funding-link"
              onClick={() => navigate("/funding-leaderboard")}
            >
              View funding leaderboard ›
            </button>

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
              <button type="button" className="trade-page__select is-btn" onClick={() => setOrderTypeOpen(true)}>
                {orderType} ▾
              </button>
            </div>

            {orderType !== "Market" && orderType !== "Scaled" && (
              <div className="trade-page__field">
                <span className="trade-page__field-label">Limit Price USD</span>
                <span className="trade-page__field-link">Best Bid</span>
              </div>
            )}

            {orderType === "Scaled" ? (
              <>
                <div className="trade-page__field">
                  <span className="trade-page__field-label">Lowest price</span>
                  <span className="trade-page__field-unit">USDT</span>
                </div>
                <div className="trade-page__field">
                  <span className="trade-page__field-label">Highest price</span>
                  <span className="trade-page__field-unit">USDT</span>
                </div>
                <div className="trade-page__field">
                  <span className="trade-page__field-label">Order quantity (2–50)</span>
                  <div className="trade-page__stepper">
                    <button type="button" onClick={() => setLegCount((n) => Math.max(2, n - 1))}>
                      −
                    </button>
                    <span>{legCount}</span>
                    <button type="button" onClick={() => setLegCount((n) => Math.min(50, n + 1))}>
                      +
                    </button>
                  </div>
                </div>
                <div className="trade-page__field">
                  <span className="trade-page__field-label">Total quantity</span>
                  <span className="trade-page__field-unit">BTC</span>
                </div>
                <div className="trade-page__scaled-dist-label">
                  Size distribution <span className="trade-page__scaled-info">ⓘ</span>
                </div>
                <div className="trade-page__pct-row">
                  {["Flat", "Ascending", "Descending"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`trade-page__dist-btn${distribution === d ? " is-active" : ""}`}
                      onClick={() => setDistribution(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="trade-page__req-row">
                  <span>Avg</span>
                  <span>–</span>
                </div>
              </>
            ) : (
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
            )}

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
              <span>{liquidityMode ? `${reqUsd.toFixed(2)} | 125000.00` : "0 | 6.58"} USD</span>
            </div>

            <button type="button" className="trade-page__submit" onClick={submitOrder}>
              {orderType === "Scaled" ? `${side} · Scaled` : side}
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
              placeOrder();
            }}
          />
        )}

        {settingsOpen && (
          <div className="trade-page__overlay">
            <div className="trade-page__modal">
              <div className="trade-page__modal-header">
                <span>Trade settings</span>
                <button type="button" onClick={() => setSettingsOpen(false)}>
                  <XIcon size={16} />
                </button>
              </div>

              <div className="trade-page__modal-section">
                <div className="trade-page__modal-label">Position Mode</div>
                <div className="trade-page__modal-toggle">
                  <button
                    type="button"
                    className={positionMode === "one-way" ? "is-active" : ""}
                    onClick={() => setPositionMode("one-way")}
                  >
                    One-way
                  </button>
                  <button
                    type="button"
                    className={positionMode === "hedge" ? "is-active" : ""}
                    onClick={() => setPositionMode("hedge")}
                  >
                    Hedge
                  </button>
                </div>
                <div className="trade-page__modal-note">
                  {positionMode === "hedge"
                    ? "Hedge: hold Long and Short on the same contract at once, tracked as two separate positions."
                    : "One-way: an opposite-side order nets against your existing position instead of opening a new one."}
                </div>
              </div>

              <div className="trade-page__modal-section">
                <Toggle
                  checked={liquidityMode}
                  onChange={(v) => {
                    setLiquidityMode(v);
                    if (!v && orderType === "Scaled") setOrderType("Limit");
                  }}
                  label="Improve Liquidity"
                />
                <div className="trade-page__modal-note">
                  Shows predicted slippage, warns on risky market orders, and enables scaled order entry.
                </div>
              </div>
            </div>
          </div>
        )}

        {orderTypeOpen && (
          <div className="trade-page__overlay" onClick={() => setOrderTypeOpen(false)}>
            <div className="trade-page__modal" onClick={(e) => e.stopPropagation()}>
              <div className="trade-page__modal-header">
                <span>Order type</span>
                <button type="button" onClick={() => setOrderTypeOpen(false)}>
                  <XIcon size={16} />
                </button>
              </div>
              <div className="trade-page__order-type-list">
                {orderTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`trade-page__order-type-item${orderType === t ? " is-active" : ""}`}
                    onClick={() => {
                      setOrderType(t);
                      setOrderTypeOpen(false);
                    }}
                  >
                    <div>
                      <div className="trade-page__order-type-name">{t}</div>
                      <div className="trade-page__order-type-desc">
                        {t === "Market" && "Fill immediately at the best available price."}
                        {t === "Limit" && "Fill only at your chosen price or better."}
                        {t === "Scaled" && "Split a large order across a price range."}
                      </div>
                    </div>
                    {orderType === t && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {guardrail && guardrail.step === "warning" && (
          <div className="trade-page__overlay">
            <div className="trade-page__modal">
              <div className="trade-page__modal-header">
                <span>{guardrail.complete ? "Spread is wide right now" : "Not enough visible depth"}</span>
                <button type="button" onClick={() => setGuardrail(null)}>
                  <XIcon size={16} />
                </button>
              </div>
              <div className="trade-page__modal-note trade-page__guardrail-note">
                {guardrail.complete
                  ? `This market order is estimated at ~${guardrail.pct.toFixed(4)}% slippage.`
                  : "This size can't be filled reliably at a good price with what's currently visible in the book."}
              </div>
              <div className="trade-page__guardrail-actions">
                <button
                  type="button"
                  className="trade-page__guardrail-btn is-limit"
                  onClick={() => {
                    setOrderType("Limit");
                    setGuardrail((g) => ({ ...g, step: "limit-price" }));
                  }}
                >
                  Switch to Limit
                </button>
                <button
                  type="button"
                  className="trade-page__guardrail-btn is-anyway"
                  onClick={() => {
                    setGuardrail(null);
                    if (gated()) setRiskCheck(true);
                    else placeOrder();
                  }}
                >
                  Place anyway
                </button>
              </div>
            </div>
          </div>
        )}

        {guardrail && guardrail.step === "limit-price" && (
          <div className="trade-page__overlay">
            <div className="trade-page__modal">
              <div className="trade-page__modal-header">
                <span>Set your limit price</span>
                <button type="button" onClick={() => setGuardrail(null)}>
                  <XIcon size={16} />
                </button>
              </div>
              <div className="trade-page__modal-note">
                Order type switched to Limit — it fills only at your chosen price or better, so this warning
                won't come up again for this order.
              </div>
              <div className="trade-page__field">
                <span className="trade-page__field-label">Limit Price USD</span>
                <span className="trade-page__field-link">Best Bid</span>
              </div>
              <button type="button" className="trade-page__submit" onClick={confirmLimitFromGuardrail}>
                Place {side} order
              </button>
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
