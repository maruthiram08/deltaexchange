import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import BottomTabBar from "../components/common/BottomTabBar";
import { XIcon, SearchIcon, ChartLineIcon } from "../components/icons";
import "./Positions.css";

export default function Positions() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [closePct, setClosePct] = useState("100%");

  return (
    <PhoneFrame footer={<BottomTabBar />}>
      <div className="positions-page">
        <div className="positions-page__margin-row">
          <span className="positions-page__margin">Main</span>
          <span className="positions-page__margin-pill">Cross</span>
        </div>

        <div className="positions-page__tabs">
          <span>Balances</span>
          <span className="is-active">Positions (1)</span>
          <span>Orders</span>
          <span>Stop Orders</span>
          <span className="positions-page__history">↻</span>
        </div>

        <div className="positions-page__upnl-card">
          <div>
            <div className="positions-page__label">Total Unrealized P&L (M2M)</div>
            <div className="positions-page__upnl-value">
              <span className="positions-page__currency">₹ ▾</span> {expanded ? "-214.87" : "-220.31"}
            </div>
          </div>
          <span className="positions-page__healthy">Healthy ›</span>
        </div>

        <div className="positions-page__actions-row">
          <button type="button" className="positions-page__chip">
            <SearchIcon size={12} /> Search
          </button>
          <button type="button" className="positions-page__chip">☰ Sort</button>
          <button type="button" className="positions-page__close-all">Close All</button>
        </div>

        <div className="positions-page__card">
          <div className="positions-page__card-top">
            <span className="positions-page__side-badge">L</span>
            <span className="positions-page__symbol">PENDLEUSD</span>
            <span className="positions-page__mini-chart">
              <ChartLineIcon size={13} />
            </span>
            <span className="positions-page__pct">{expanded ? "-96.70" : "-99.15"} %</span>
            <span className="positions-page__share">⤴</span>
          </div>

          <div className="positions-page__grid">
            <div>
              <div className="positions-page__label">Quantity</div>
              <div className="positions-page__value is-positive">+20 <span>Lots</span></div>
            </div>
            <div>
              <div className="positions-page__label">Mark Price</div>
              <div className="positions-page__value">{expanded ? "2.4878" : "2.4846"}</div>
            </div>
            <div>
              <div className="positions-page__label">UPL (M2M)</div>
              <div className="positions-page__value is-negative">-₹{expanded ? "214.88" : "220.32"}</div>
            </div>
          </div>

          {expanded && (
            <>
              <div className="positions-page__grid">
                <div>
                  <div className="positions-page__label">Notional</div>
                  <div className="positions-page__value">₹4,233.85</div>
                </div>
                <div>
                  <div className="positions-page__label">Entry Price</div>
                  <div className="positions-page__value">2.6142</div>
                </div>
                <div>
                  <div className="positions-page__label">Realized CF ⓘ</div>
                  <div className="positions-page__value">₹5.49</div>
                </div>
              </div>
              <div className="positions-page__grid">
                <div>
                  <div className="positions-page__label">Est. Liq. Price ⓘ</div>
                  <div className="positions-page__value">2.0903 <span>(15.97%)</span></div>
                </div>
                <div>
                  <div className="positions-page__label">Margin</div>
                  <div className="positions-page__value">₹222.21</div>
                </div>
              </div>
            </>
          )}

          <div className="positions-page__btn-row">
            <button type="button" className="positions-page__btn is-add" onClick={() => navigate("/trade")}>
              Add
            </button>
            <button type="button" className="positions-page__btn is-close" onClick={() => setShowClose(true)}>
              Close
            </button>
            <button type="button" className="positions-page__btn">+ Target/SL</button>
            <button type="button" className="positions-page__btn is-icon" onClick={() => setExpanded((e) => !e)}>
              {expanded ? "︿" : "﹀"}
            </button>
          </div>
        </div>

        {showClose && (
          <div className="positions-page__overlay">
            <div className="positions-page__modal">
              <div className="positions-page__modal-header">
                <span>
                  Close <span className="is-positive">Long</span> PENDLEUSD
                </span>
                <button type="button" onClick={() => setShowClose(false)}>
                  <XIcon size={16} />
                </button>
              </div>

              <div className="positions-page__modal-toggle">
                <button type="button" className="is-active">Market</button>
                <button type="button">Limit</button>
              </div>

              <div className="positions-page__modal-row">
                <span>Entry Price</span>
                <span>2.6142</span>
              </div>
              <div className="positions-page__modal-row">
                <span>Mark Price</span>
                <span>2.4848</span>
              </div>
              <div className="positions-page__modal-row">
                <span>Breakeven Price ↺</span>
                <span>⊗ 2.6141</span>
              </div>

              <div className="positions-page__modal-field">
                <span>20</span>
                <span className="positions-page__field-unit">Lots</span>
              </div>

              <div className="positions-page__modal-pct-row">
                {["10%", "25%", "50%", "75%", "100%"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={p === closePct ? "is-active" : ""}
                    onClick={() => setClosePct(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <label className="positions-page__reduce-only">
                <input type="checkbox" defaultChecked readOnly /> Reduce Only
              </label>

              <div className="positions-page__modal-note">
                ⓘ If available USD balance is less than margin required for open PENDLEUSD
                orders, all such orders maybe cancelled.
              </div>

              <div className="positions-page__modal-footer">
                <div>
                  <div className="positions-page__label">Expected Loss</div>
                  <div className="positions-page__value is-negative">-2.59 USD</div>
                </div>
                <button type="button" className="positions-page__confirm" onClick={() => setShowClose(false)}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
