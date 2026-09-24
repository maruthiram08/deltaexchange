// Central map of every prototype screen: its route and the component that renders it.

import Home from "./pages/Home";
import Markets from "./pages/Markets";
import Straddle from "./pages/Straddle";
import Trade from "./pages/Trade";
import OptionTrade from "./pages/OptionTrade";
import ChartsZipTrade from "./pages/ChartsZipTrade";
import Positions from "./pages/Positions";
import OptionChain from "./pages/OptionChain";
import StrategyBuilder from "./pages/StrategyBuilder";
import StrategyBasket from "./pages/StrategyBasket";
import AnalyzePayoff from "./pages/AnalyzePayoff";

export const PAGE_REGISTRY = [
  {
    section: "Home & Discovery",
    pages: [
      { id: "home", path: "/home", label: "Home", component: Home },
      { id: "markets", path: "/markets", label: "Markets", component: Markets },
      { id: "straddle", path: "/straddle", label: "Straddle list", component: Straddle },
    ],
  },
  {
    section: "Option Chain & Strategy Builder",
    pages: [
      { id: "option-chain", path: "/option-chain", label: "Option chain", component: OptionChain },
      { id: "trade", path: "/trade", label: "Trade (futures)", component: Trade },
      { id: "option-trade", path: "/option-trade", label: "Option details", component: OptionTrade },
      { id: "strategy-builder", path: "/strategy-builder", label: "Strategy templates", component: StrategyBuilder },
      { id: "strategy-basket", path: "/strategy-basket", label: "Strategy basket", component: StrategyBasket },
      { id: "analyze-payoff", path: "/analyze-payoff", label: "Analyze payoff", component: AnalyzePayoff },
    ],
  },
  {
    section: "Order Execution",
    pages: [
      { id: "charts", path: "/charts", label: "Charts + ZipTrade", component: ChartsZipTrade },
      { id: "positions", path: "/positions", label: "Positions", component: Positions },
    ],
  },
];

export const ALL_PAGES = PAGE_REGISTRY.flatMap((s) => s.pages);
