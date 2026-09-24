import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import BottomTabBar from "../components/common/BottomTabBar";
import ContractRow from "../components/common/ContractRow";
import "./Markets.css";

const TOP_TABS = ["Watchlist", "Futures", "Options", "RWA Tokens", "Straddle"];
const CATEGORY_CHIPS = ["All", "Metal Tokens", "US Stock Tokens", "Layer 1", "Smart Contract"];

const ROUTE_BY_TAB = {
  Options: "/option-chain",
  Straddle: "/straddle",
};

const FUTURES_ROWS = [
  { favorite: true, symbol: "BTCUSD", leverageBadge: "200x", subtitle: "Bitcoin Perpetual", price: "$86086", vol: "$1.35B", changePct: 0.97 },
  { favorite: true, symbol: "ETHUSD", leverageBadge: "200x", subtitle: "Ethereum Perpetual", price: "$2759.5", vol: "$902.68M", changePct: 0.91 },
  { favorite: false, symbol: "XAUTUSD", leverageBadge: "100x", feeBadge: "Fee 0.01%", subtitle: "Tether Gold Token...", price: "$4345.22", vol: "$810.98M", changePct: -0.53 },
  { favorite: true, symbol: "SOLUSD", leverageBadge: "100x", subtitle: "Solana Perpetual", price: "$117.678", vol: "$252.30M", changePct: 0.66 },
  { favorite: true, symbol: "PAXGUSD", leverageBadge: "100x", feeBadge: "Fee 0.01%", subtitle: "PAX Gold Token P...", price: "$4336.2", vol: "$182.04M", changePct: -0.51 },
  { favorite: false, symbol: "AKEUSD", leverageBadge: "20x", subtitle: "Akedo Perpetual", price: "$0.0524392", vol: "$67.14M", changePct: -3.6 },
  { favorite: false, symbol: "DOGEUSD", leverageBadge: "100x", subtitle: "Dogecoin Perpetual", price: "$0.10037", vol: "$38.95M", changePct: 7.16 },
  { favorite: false, symbol: "XRPUSD", leverageBadge: "100x", subtitle: "Ripple Perpetual", price: "$1.5431", vol: "$35.64M", changePct: 3.7 },
  { favorite: false, symbol: "MUBARAKUSD", leverageBadge: "20x", subtitle: "Mubarak Perpetual", price: "$0.06905", vol: "$27.51M", changePct: 66.07 },
  { favorite: false, symbol: "UNIUSD", leverageBadge: "100x", subtitle: "Uniswap Perpetual", price: "$9.506", vol: "$16.74M", changePct: 5 },
  { favorite: false, symbol: "AVAXUSD", leverageBadge: "100x", subtitle: "Avalanche Perpetual", price: "$10.922", vol: "$14.2M", changePct: -4.58 },
];

export default function Markets() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Futures");
  const [activeChip, setActiveChip] = useState("All");

  const handleTab = (tab) => {
    if (ROUTE_BY_TAB[tab]) {
      navigate(ROUTE_BY_TAB[tab]);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <PhoneFrame footer={<BottomTabBar />}>
      <div className="markets-page">
        <div className="markets-page__topbar">
          {TOP_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`markets-page__tab${tab === activeTab ? " is-active" : ""}`}
              onClick={() => handleTab(tab)}
            >
              {tab}
              {tab === "RWA Tokens" && <span className="markets-page__new-badge">NEW</span>}
            </button>
          ))}
          <span className="markets-page__search">🔍</span>
        </div>

        <div className="markets-page__chips">
          {CATEGORY_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`markets-page__chip${chip === activeChip ? " is-active" : ""}`}
              onClick={() => setActiveChip(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="markets-page__table-header">
          <span>Contract</span>
          <span>Price | Vol</span>
          <span>24h Chg.</span>
        </div>

        <div className="markets-page__scroll">
          {FUTURES_ROWS.map((row) => (
            <ContractRow key={row.symbol} {...row} onClick={() => navigate("/trade")} />
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
