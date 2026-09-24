import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/common/PhoneFrame";
import BottomTabBar from "../components/common/BottomTabBar";
import ContractRow from "../components/common/ContractRow";
import Card from "../components/common/Card";
import { SearchIcon, BellIcon, ReceiptIcon, FlaskIcon, UsersIcon, CompassIcon, ChartLineIcon } from "../components/icons";
import "./Home.css";

const MARKET_TABS = ["Futures", "BTC Options", "ETH Options", "XAUT Options", "RWA Tokens"];

// Mirrors ChartsZipTrade.jsx's computeMarketState() output (BTC-only feature) — duplicated
// per this prototype's convention of each page mocking its own state independently rather
// than importing shared state across pages (see inputs.md Section 14).
const HOME_MARKET_PULSE_TAG = "🔥 Short squeeze";

const SORTS_BY_TAB = {
  Futures: { sorts: ["Top Gainers", "Top Volume", "Top OI"], default: "Top Gainers" },
  "BTC Options": { sorts: ["Top Volume", "Top OI"], default: "Top Volume" },
  "ETH Options": { sorts: ["Top Volume", "Top OI"], default: "Top Volume" },
  "XAUT Options": { sorts: ["Top Volume", "Top OI"], default: "Top Volume" },
  "RWA Tokens": { sorts: ["Top Gainers", "Top Volume"], default: "Top Gainers" },
};

const FUTURES_GAINERS = [
  { symbol: "MUBARAKUSD", subtitle: "Mubarak Perpetual", price: "$0.06809", vol: "$27.51M", changePct: 63.76 },
  { symbol: "WIFUSD", subtitle: "Dogwifhat Perpetual", price: "$0.278", vol: "$2.18M", changePct: 23.45 },
  { symbol: "COOKIEUSD", subtitle: "Cookie DAO Perpetual", price: "$0.013011", vol: "$1.15M", changePct: 19.14 },
  { symbol: "BCHUSD", subtitle: "Bitcoin Cash Perpetual", price: "$314.57", vol: "$3.25M", changePct: 16.12 },
  { symbol: "TSTUSD", subtitle: "Test Perpetual", price: "$0.01874", vol: "$386.88K", changePct: 16.04 },
  { symbol: "1000PEPEUSD", subtitle: "1000PEPE Perpetual", price: "$0.0049549", vol: "$4.05M", changePct: 15.23 },
  { symbol: "TAOUSD", subtitle: "Bittensor Perpetual", price: "$323.63", vol: "$1.44M", changePct: 12.18 },
  { symbol: "SAGAUSD", subtitle: "Saga Perpetual", price: "$0.03903", vol: "$3.66M", changePct: 11.67 },
  { symbol: "KITEUSD", subtitle: "Kite Perpetual", price: "$0.13485", vol: "$336.84K", changePct: 11.29 },
  { symbol: "FARTCOINUSD", subtitle: "Fartcoin Perpetual", price: "$0.2032", vol: "$4.9M", changePct: 11.16 },
];

const BTC_OPTIONS_VOLUME = [
  { symbol: "P-BTC-81400", subtitle: "23 Sep · $25.02M", price: "$12", vol: "$31.77M", changePct: -92.77 },
  { symbol: "C-BTC-89600", subtitle: "23 Sep · $8.3M", price: "$84", vol: "$30.4M", changePct: -59.02 },
  { symbol: "P-BTC-83000", subtitle: "23 Sep · $7.43M", price: "$27", vol: "$25.82M", changePct: -91.15 },
  { symbol: "P-BTC-81200", subtitle: "23 Sep · $20.49M", price: "$10.1", vol: "$25.71M", changePct: -90 },
  { symbol: "C-BTC-93000", subtitle: "25 Sep · $6.91M", price: "$84", vol: "$24.64M", changePct: -33.33 },
  { symbol: "P-BTC-82000", subtitle: "23 Sep · $9.98M", price: "$17", vol: "$24.34M", changePct: -92.38 },
  { symbol: "P-BTC-80600", subtitle: "23 Sep · $10M", price: "$5.1", vol: "$23.93M", changePct: -94.57 },
  { symbol: "P-BTC-80000", subtitle: "23 Sep · $9.42M", price: "$2", vol: "$21.04M", changePct: -97.75 },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Futures");
  const [activeSort, setActiveSort] = useState(SORTS_BY_TAB.Futures.default);

  const handleTab = (tab) => {
    setActiveTab(tab);
    setActiveSort(SORTS_BY_TAB[tab].default);
  };

  const rows = activeTab === "BTC Options" ? BTC_OPTIONS_VOLUME : FUTURES_GAINERS;
  const showSeeAll = activeTab === "BTC Options";

  return (
    <PhoneFrame footer={<BottomTabBar />}>
      <div className="home-page">
        <div className="home-page__topbar">
          <span className="home-page__icon">◎</span>
          <div className="home-page__search" onClick={() => navigate("/trade")}>
            <SearchIcon size={14} />
            <span>XRPUSD 🔥</span>
          </div>
          <span className="home-page__icon">⌗</span>
          <span className="home-page__icon" onClick={() => navigate("/positions")}>
            <ReceiptIcon size={18} />
          </span>
          <span className="home-page__icon">
            <BellIcon size={18} />
          </span>
        </div>

        <div className="home-page__scroll">
          <Card className="home-page__account">
            <div className="home-page__account-row">
              <span className="home-page__account-label">Account Value ›</span>
              <button className="home-page__add-funds" type="button">
                +Add Funds
              </button>
            </div>
            <div className="home-page__account-masked">₹★★★★ $★★★★ 🙈</div>
            <Card inset className="home-page__account-sub">
              <div>
                <div className="home-page__account-label">M2M ›</div>
                <div className="home-page__upnl">
                  -₹201.28 <span>-$2.36</span>
                </div>
              </div>
              <div className="home-page__divider" />
              <div onClick={() => navigate("/positions")} style={{ cursor: "pointer" }}>
                <div className="home-page__account-label">Positions / Orders ›</div>
                <div className="home-page__positions">1 / 0</div>
              </div>
            </Card>
          </Card>

          <div className="home-page__quick-actions">
            {[
              { Icon: FlaskIcon, label: "Research" },
              { Icon: UsersIcon, label: "Marketplace", tag: "ALGO" },
              { Icon: CompassIcon, label: "Algo Hub" },
              { Icon: ChartLineIcon, label: "Strategy", tag: "NEW", path: "/strategy-builder" },
              { icon: "🎧", label: "Live Chat" },
              { icon: "⋮", label: "More" },
            ].map((a) => (
              <div
                key={a.label}
                className="home-page__quick-action"
                onClick={() => a.path && navigate(a.path)}
                style={{ cursor: a.path ? "pointer" : "default" }}
              >
                <div className="home-page__quick-action-icon">
                  {a.Icon ? <a.Icon size={20} /> : a.icon}
                  {a.tag && <span className="home-page__quick-action-tag">{a.tag}</span>}
                </div>
                <span>{a.label}</span>
              </div>
            ))}
          </div>

          <div className="home-page__banner">
            <div>
              <div className="home-page__banner-title">
                <span className="home-page__banner-title-accent">Gold Token</span> Options
              </div>
              <div className="home-page__banner-sub">Daily expiries at 9:30 PM IST</div>
            </div>
            <div className="home-page__banner-icon">🥇</div>
          </div>
          <div className="home-page__dots">
            <span className="is-active" />
            <span />
            <span />
            <span />
          </div>

          <div className="home-page__mini-cards">
            <Card
              className="home-page__mini-card"
              onClick={() => navigate("/charts", { state: { openMarketPulse: true } })}
              style={{ cursor: "pointer" }}
            >
              <div className="home-page__mini-card-top">
                <span>BTCUSD</span>
                <span className="home-page__mini-card-chg">▲ 1.05%</span>
              </div>
              <div className="home-page__mini-card-price">$86147.0</div>
              <div className="home-page__mini-card-pulse">{HOME_MARKET_PULSE_TAG} ›</div>
            </Card>
            <Card className="home-page__mini-card">
              <div className="home-page__mini-card-top">
                <span>ETHUSD</span>
                <span className="home-page__mini-card-chg">▲ 1.04%</span>
              </div>
              <div className="home-page__mini-card-price">$2762.45</div>
            </Card>
          </div>

          <div className="home-page__distribution">
            <div className="home-page__distribution-label">Price Change Distribution</div>
            <div className="home-page__distribution-bar">
              <div className="home-page__distribution-neg" style={{ width: "14%" }} />
              <div className="home-page__distribution-pos" style={{ width: "86%" }} />
            </div>
            <div className="home-page__distribution-legend">
              <span>Decliners: 29</span>
              <span>Advancers: 184</span>
            </div>
          </div>

          <div className="home-page__market-tabs">
            {MARKET_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`home-page__market-tab${tab === activeTab ? " is-active" : ""}`}
                onClick={() => handleTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="home-page__sort-row">
            {SORTS_BY_TAB[activeTab].sorts.map((sort) => (
              <button
                key={sort}
                type="button"
                className={`home-page__sort-chip${sort === activeSort ? " is-active" : ""}`}
                onClick={() => setActiveSort(sort)}
              >
                {sort}
              </button>
            ))}
          </div>

          <div className="home-page__table-header">
            <span>Contract</span>
            <span>Price | Vol</span>
            <span>24h Chg.</span>
          </div>

          <div>
            {rows.map((row) => (
              <ContractRow
                key={row.symbol}
                {...row}
                onClick={() => navigate(activeTab === "Futures" ? "/trade" : "/option-trade")}
              />
            ))}
            {showSeeAll && (
              <button className="home-page__see-all" type="button" onClick={() => navigate("/option-chain")}>
                See all ›
              </button>
            )}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
