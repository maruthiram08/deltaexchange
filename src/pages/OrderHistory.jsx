import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import BottomTabBar from "../components/common/BottomTabBar";
import { SearchIcon } from "../components/icons";
import "./OrderHistory.css";

// All figures below come from a real Delta Exchange order-history CSV export, not invented data.
const EXPLANATIONS = {
  cancelled_by_user: "You cancelled this order",
  immediate_execution_post_only: "Cancelled — a Maker Only order can't fill immediately",
  position_closed: "Cancelled — the position was already closed",
};

const ORDERS = [
  {
    id: "o1",
    time: "25 Sep, 12:54 AM",
    contract: "ETHUSD",
    side: "sell",
    qty: 1,
    filledRemaining: "1 / 0",
    execPrice: "2693.60",
    orderPrice: "2558.90",
    orderValue: "26.94",
    fees: "0.00",
    cashflow: "0.00",
    pnl: 0,
    orderType: "market_order",
    orderTypeLabel: "Market",
    status: "closed",
    orderId: "1561755669",
  },
  {
    id: "o2",
    time: "25 Sep, 12:54 AM",
    contract: "ETHUSD",
    side: "buy",
    qty: 1,
    filledRemaining: "1 / 0",
    execPrice: "2693.60",
    orderPrice: "2827.45",
    orderValue: "26.94",
    fees: "0.016",
    cashflow: "0.00",
    pnl: 0,
    orderType: "market_order",
    orderTypeLabel: "Market",
    status: "closed",
    orderId: "1561755560",
  },
  {
    id: "g1",
    contract: "MV-BTC-86000-220926",
    side: "buy",
    orderTypeLabel: "Market",
    status: "closed",
    fills: [
      { orderId: "1555448823", qty: 2, execPrice: "172.00", pnl: 1.892, time: "22 Sep, 4:45 PM" },
      { orderId: "1554026531", qty: 3, execPrice: "1019.00", pnl: 0.297, time: "22 Sep, 1:02 AM" },
    ],
  },
  {
    id: "o4",
    time: "22 Sep, 12:40 AM",
    contract: "DOGEUSD",
    side: "sell",
    qty: 1,
    filledRemaining: "1 / 0",
    execPrice: "0.09844",
    orderPrice: "0.08862",
    orderValue: "9.844",
    fees: "0.00",
    cashflow: "-0.0375",
    pnl: -0.0375,
    orderType: "market_order",
    orderTypeLabel: "Market",
    status: "closed",
    orderId: "1553991521",
  },
  {
    id: "o5",
    time: "22 Sep, 12:37 AM",
    contract: "DOGEUSD",
    side: "sell",
    qty: 2,
    filledRemaining: "0 / 2",
    stopPrice: "0.09556",
    orderType: "market_order",
    orderTypeLabel: "Stop Market",
    status: "cancelled",
    explanation: "cancelled_by_user",
    orderId: "1553987031",
  },
  {
    id: "o6",
    time: "22 Sep, 12:36 AM",
    contract: "DOGEUSD",
    side: "buy",
    qty: 1,
    filledRemaining: "1 / 0",
    execPrice: "0.09884",
    orderPrice: "0.10876",
    fees: "0.0058",
    cashflow: "0.00",
    pnl: 0,
    orderType: "market_order",
    orderTypeLabel: "Market",
    status: "closed",
    orderId: "1553986760",
  },
  {
    id: "o7",
    time: "22 Sep, 12:36 AM",
    contract: "DOGEUSD",
    side: "buy",
    qty: 1,
    filledRemaining: "1 / 0",
    execPrice: "0.09879",
    orderPrice: "0.09906",
    fees: "0.0058",
    cashflow: "0.00",
    pnl: 0,
    orderType: "limit_order",
    orderTypeLabel: "Limit",
    status: "closed",
    orderId: "1553986491",
  },
  {
    id: "o8",
    time: "22 Sep, 12:32 AM",
    contract: "BTCUSD",
    side: "buy",
    qty: 1,
    filledRemaining: "0 / 1",
    orderPrice: "86018.00",
    orderType: "limit_order",
    orderTypeLabel: "Limit · Maker Only",
    status: "cancelled",
    explanation: "immediate_execution_post_only",
    orderId: "1553981884",
  },
  {
    id: "o9",
    time: "22 Sep, 12:32 AM",
    contract: "BTCUSD",
    side: "sell",
    qty: 1,
    filledRemaining: "1 / 0",
    execPrice: "86019.50",
    orderPrice: "81722.00",
    fees: "0.00",
    cashflow: "-0.0155",
    pnl: -0.0155,
    orderType: "market_order",
    orderTypeLabel: "Market",
    status: "closed",
    orderId: "1553981447",
  },
  {
    id: "o10",
    time: "22 Sep, 12:30 AM",
    contract: "BTCUSD",
    side: "buy",
    qty: 1,
    filledRemaining: "1 / 0",
    execPrice: "86031.50",
    orderPrice: "90332.00",
    stopPrice: "86036.00",
    fees: "0.0508",
    cashflow: "0.00",
    pnl: 0,
    orderType: "market_order",
    orderTypeLabel: "Stop Market",
    status: "closed",
    orderId: "1553977732",
  },
  {
    id: "o11",
    time: "22 Sep, 12:33 AM",
    contract: "MUBARAKUSD",
    side: "sell",
    qty: 1,
    filledRemaining: "0 / 1",
    stopPrice: "0.04794",
    orderType: "market_order",
    orderTypeLabel: "Market",
    status: "cancelled",
    explanation: "position_closed",
    orderId: "1553967115",
  },
];

function protectionNote(order) {
  if (order.orderType !== "market_order" || !order.execPrice || !order.orderPrice) return null;
  const exec = parseFloat(order.execPrice);
  const ord = parseFloat(order.orderPrice);
  const pct = (Math.abs(exec - ord) / exec) * 100;
  if (pct < 2) return null;
  return `Order price is ~${pct.toFixed(1)}% from the executed price — possibly an existing price-protection band (unconfirmed; see liquidity-slippage-improvements.md).`;
}

function OrderCard({ order, expanded, onToggle }) {
  const isGroup = Boolean(order.fills);
  const note = protectionNote(order);
  const explanation = order.explanation ? EXPLANATIONS[order.explanation] ?? order.explanation : null;

  return (
    <div className="order-history-page__card">
      <button type="button" className="order-history-page__card-top" onClick={onToggle}>
        <span className={`order-history-page__side-badge is-${order.side}`}>{order.side === "buy" ? "B" : "S"}</span>
        <span className="order-history-page__symbol">{order.contract}</span>
        {isGroup && <span className="order-history-page__fills-tag">{order.fills.length} fills</span>}
        <span className={`order-history-page__status is-${order.status}`}>
          {order.status === "closed" ? "Filled" : "Cancelled"}
        </span>
        <span className="order-history-page__chevron">{expanded ? "︿" : "﹀"}</span>
      </button>

      <div className="order-history-page__card-secondary">
        <span>{order.orderTypeLabel}</span>
        <span>{order.execPrice ? `@ ${order.execPrice}` : "—"}</span>
        <span>{isGroup ? order.fills[0].time : order.time}</span>
      </div>

      {explanation && <div className="order-history-page__explanation">ⓘ {explanation}</div>}

      {expanded && (
        <div className="order-history-page__detail">
          {isGroup ? (
            order.fills.map((f) => (
              <div key={f.orderId} className="order-history-page__fill-row">
                <span>
                  {f.qty} @ {f.execPrice}
                </span>
                <span className={f.pnl >= 0 ? "is-positive" : "is-negative"}>
                  {f.pnl >= 0 ? "+" : ""}
                  {f.pnl}
                </span>
                <span>{f.time}</span>
              </div>
            ))
          ) : (
            <>
              <div className="order-history-page__grid">
                <div>
                  <div className="order-history-page__label">Order Price</div>
                  <div className="order-history-page__value">{order.orderPrice ?? "—"}</div>
                </div>
                <div>
                  <div className="order-history-page__label">Stop Price</div>
                  <div className="order-history-page__value">{order.stopPrice ?? "—"}</div>
                </div>
                <div>
                  <div className="order-history-page__label">Filled/Remaining</div>
                  <div className="order-history-page__value">{order.filledRemaining}</div>
                </div>
              </div>
              <div className="order-history-page__grid">
                <div>
                  <div className="order-history-page__label">Order Value</div>
                  <div className="order-history-page__value">{order.orderValue ?? "—"}</div>
                </div>
                <div>
                  <div className="order-history-page__label">Trading Fees</div>
                  <div className="order-history-page__value">{order.fees ?? "—"}</div>
                </div>
                <div>
                  <div className="order-history-page__label">Cashflow</div>
                  <div className="order-history-page__value">{order.cashflow ?? "—"}</div>
                </div>
              </div>
              <div className="order-history-page__grid">
                <div>
                  <div className="order-history-page__label">Realised P&L</div>
                  <div
                    className={`order-history-page__value${order.pnl > 0 ? " is-positive" : order.pnl < 0 ? " is-negative" : ""}`}
                  >
                    {order.pnl ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="order-history-page__label">Order ID</div>
                  <div className="order-history-page__value">{order.orderId}</div>
                </div>
              </div>
            </>
          )}
          {note && <div className="order-history-page__note">ⓘ {note}</div>}
        </div>
      )}
    </div>
  );
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = ORDERS.filter((o) => {
    if (statusFilter !== "All" && o.status !== statusFilter) return false;
    if (query && !o.contract.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <PhoneFrame footer={<BottomTabBar />}>
      <div className="order-history-page">
        <div className="order-history-page__header">
          <button type="button" className="order-history-page__back" onClick={() => navigate("/positions")}>
            ‹
          </button>
          <span>Transaction Logs</span>
        </div>

        <div className="order-history-page__tabs">
          <span className="is-active">Order History</span>
          <span>Fill History</span>
          <span>Transfer History</span>
        </div>

        <div className="order-history-page__actions-row">
          <div className="order-history-page__search">
            <SearchIcon size={12} />
            <input placeholder="Search symbol" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {["All", "closed", "cancelled"].map((s) => (
            <button
              key={s}
              type="button"
              className={`order-history-page__chip${statusFilter === s ? " is-active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "All" ? "All" : s === "closed" ? "Filled" : "Cancelled"}
            </button>
          ))}
        </div>

        <div className="order-history-page__list">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId((id) => (id === order.id ? null : order.id))}
            />
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
