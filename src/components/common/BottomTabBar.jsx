import { useLocation, useNavigate } from "react-router-dom";
import { HomeIcon, TrendingUpIcon, TrendingUpDownIcon, ChartLineIcon, ReceiptIcon } from "../icons";
import "./BottomTabBar.css";

const TABS = [
  { key: "home", label: "Home", Icon: HomeIcon, path: "/home" },
  { key: "markets", label: "Markets", Icon: TrendingUpIcon, path: "/markets" },
  { key: "trade", label: "Trade", Icon: TrendingUpDownIcon, path: "/trade" },
  { key: "charts", label: "Charts", Icon: ChartLineIcon, path: "/charts" },
  { key: "portfolio", label: "Portfolio", Icon: ReceiptIcon, path: "/positions" },
];

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-tab-bar">
      {TABS.map(({ key, label, Icon, path }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={key}
            className={`bottom-tab-bar__item${isActive ? " is-active" : ""}`}
            onClick={() => navigate(path)}
            type="button"
          >
            <Icon className="bottom-tab-bar__icon" size={20} />
            <span className="bottom-tab-bar__label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
