// Central map of every prototype screen: its route, the component that renders it
// (Placeholder until built), and which pain-point number(s) from pain-points-notes.md
// it's relevant to — kept as bookkeeping for the page-by-page changes ahead.

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
      { id: "home", path: "/home", label: "Home", painPoints: [1, 3], component: Home },
      { id: "markets", path: "/markets", label: "Markets", painPoints: [1], component: Markets },
      { id: "straddle", path: "/straddle", label: "Straddle list", painPoints: [1, 2], component: Straddle },
    ],
  },
  {
    section: "Option Chain & Strategy Builder",
    pages: [
      { id: "option-chain", path: "/option-chain", label: "Option chain", painPoints: [3, 10], component: OptionChain },
      { id: "trade", path: "/trade", label: "Trade (futures)", painPoints: [4], component: Trade },
      { id: "option-trade", path: "/option-trade", label: "Option details (put/call)", painPoints: [4], component: OptionTrade },
      { id: "strategy-builder", path: "/strategy-builder", label: "Strategy builder — templates", painPoints: [5], component: StrategyBuilder },
      { id: "strategy-basket", path: "/strategy-basket", label: "Strategy basket (pre-built legs)", painPoints: [5], component: StrategyBasket },
      { id: "analyze-payoff", path: "/analyze-payoff", label: "Analyze payoff", painPoints: [5], component: AnalyzePayoff },
      { id: "custom-strategy", path: "/custom-strategy", label: "Custom strategy flow", painPoints: [6] },
    ],
  },
  {
    section: "Order Execution",
    pages: [
      { id: "charts", path: "/charts", label: "Charts + Zip Trade", painPoints: [8, 9], component: ChartsZipTrade },
      { id: "chart-add-order", path: "/chart-add-order", label: "Chart long-press Add Order", painPoints: [8] },
      { id: "positions", path: "/positions", label: "Positions + close flow", painPoints: [11], component: Positions },
    ],
  },
  {
    section: "Terminology",
    pages: [{ id: "terminology", path: "/terminology", label: "Jargon audit", painPoints: [7] }],
  },
];

export const ALL_PAGES = PAGE_REGISTRY.flatMap((s) => s.pages);
