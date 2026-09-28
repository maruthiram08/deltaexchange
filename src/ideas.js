// The 19 pain-point-to-idea rows from the teardown doc, in one place for the mind map and the story
// pages. `built: false` marks ideas that are not in the prototype yet. A row with an entry in the active walkthrough script plays in the theatre at
// /watch/:id; the rest open the live screen with a guidance strip. Edit the film scripts in story/scripts/ only.

import { resolveScript, DEFAULT_SCRIPT } from "./story/scripts";

const BASE = [
  {
    id: "reach-oi-builder",
    pain: "Reach OI and builder fast",
    fix: "Shortcuts on option page",
    to: "/option-trade",
    built: true,
    tip: "Use the Strategy Builder, Option Analytics and Option Chain buttons under the header.",
  },
  {
    id: "add-contracts",
    pain: "Add contracts in one screen",
    fix: "Basket toggle in Option Chain",
    to: "/option-chain",
    built: true,
    tip: "Turn on Basket at the top right, then tap contracts to add legs.",
  },
  {
    id: "see-max-loss",
    pain: "See max loss while building",
    fix: "Live payoff while building",
    to: "/strategy-basket",
    built: true,
    tip: "Change a strike or quantity. Max profit, max loss and the chart update instantly.",
  },
  {
    id: "review-payoff",
    pain: "Review payoff before ordering",
    fix: "Payoff on order preview",
    to: "/strategy-basket",
    built: true,
    tip: "Max profit, max loss and the payoff sit above the contracts, before Place Order.",
  },
  {
    id: "oi-support",
    pain: "Find OI support and resistance",
    fix: "OI and Max Pain tags",
    to: "/option-chain",
    built: true,
    tip: "Look at the strike column for the OI Sup, Max Pain and OI Res tags.",
  },
  {
    id: "cheap-or-rich",
    pain: "Judge premium cheap or rich",
    fix: "Cheap / expensive read",
    to: "/option-chain",
    built: true,
    tip: "Tap Strategy fit at the top right.",
  },
  {
    id: "exit-part",
    pain: "Exit part of a position",
    fix: "Add / Exit bar",
    to: "/charts",
    built: true,
    tip: "Tap the gear next to ZipTrade and turn on Simulate Open Position. The bar switches to Add and Exit.",
  },
  {
    id: "limit-orders",
    pain: "Place limit orders from charts",
    fix: "Order-type toggle",
    to: "/charts",
    built: true,
    tip: "See Market on the bottom bar. Tap it to switch between order types.",
  },
  {
    id: "change-size",
    pain: "Change size in a tap",
    fix: "Plus / minus on the bar",
    to: "/charts",
    built: true,
    tip: "Use the minus and plus on the bottom bar.",
  },
  {
    id: "atm-straddle",
    pain: "Spot the ATM straddle",
    fix: "Live BTC price on Straddles",
    to: "/straddle",
    built: true,
    tip: "Find BTC Spot and the ATM strike under Market Context.",
  },
  {
    id: "market-pulse",
    pain: "Know what moved the market",
    fix: "Market Pulse one-liner",
    to: "/charts",
    built: true,
    tip: "Tap the Short squeeze bar on Charts.",
  },
  { id: "find-straddles", pain: "Find straddles without scrolling", fix: "Shortcut to Straddles", built: false },
  { id: "algo-templates", pain: "Build a range-breakout strategy", fix: "More algo templates", built: false },
  {
    id: "liquidation-upfront",
    pain: "See liquidation before ordering",
    fix: "Liquidation up front",
    to: "/charts",
    built: true,
    tip: "Tap Long. The first-trade check shows your estimated liquidation price.",
  },
  {
    id: "first-trade-check",
    pain: "Understand first-trade leverage",
    fix: "Two-step risk check",
    to: "/charts",
    built: true,
    tip: "Tap Long. A two-step check explains what 100x risks.",
  },
  {
    id: "stop-loss",
    pain: "Set a stop-loss early",
    fix: "Stop-loss prompt",
    to: "/charts",
    built: true,
    tip: "Tap Long, then Continue. Step 2 asks where you would exit.",
  },
  {
    id: "fno-terms",
    pain: "Read familiar F&O terms",
    fix: "Familiar F&O labels",
    to: "/positions",
    built: true,
    tip: "Look for Target/SL and Unrealized P&L (M2M) on the position card.",
  },
  { id: "plain-english-algo", pain: "Turn an idea into an algo", fix: "Plain English to Algo", built: false },
  { id: "paper-test", pain: "Test an algo before going live", fix: "Paper-test nudge", built: false },
  {
    id: "order-history-mobile",
    pain: "Read order history on a phone",
    fix: "Card-based Order History",
    to: "/order-history",
    built: true,
    tip: "Tap the ↻ icon on Positions. Cancelled orders show a plain-language reason, and multi-fill orders group into one card.",
  },
  {
    id: "funding-leaderboard",
    pain: "Find the best funding-rate trade",
    fix: "Funding Rate Leaderboard",
    to: "/funding-leaderboard",
    built: true,
    tip: "Tap 'View funding leaderboard' under the funding row on Trade to see top positive and negative rates across contracts.",
  },
  {
    id: "hedge-mode",
    pain: "Hold long and short at once",
    fix: "Position Mode setting",
    to: "/trade",
    built: true,
    tip: "Tap the ⋮ icon, set Position Mode to Hedge, then place a normal order — it won't net against an existing position on Positions.",
  },
  {
    id: "execution-quality-score",
    pain: "Know what a trade will really cost",
    fix: "Execution Quality Score",
    to: "/trade",
    built: true,
    tip: "Tap ⋮ and turn on Improve Liquidity, then see estimated slippage for your size above the book, plus which side costs less right now — computed live from the order book on screen.",
  },
  {
    id: "slippage-guardrail",
    pain: "Avoid a bad market-order fill",
    fix: "Automatic Slippage Guardrail",
    to: "/trade",
    built: true,
    tip: "Tap ⋮ and turn on Improve Liquidity, switch order type to Market, set size to 100%, then submit — it warns instead of blocking, with a one-tap switch to Limit that stays in the same sheet.",
  },
  {
    id: "scaled-orders",
    pain: "Split a large order across a price range",
    fix: "Scaled Orders",
    to: "/trade",
    built: true,
    tip: "Tap ⋮ and turn on Improve Liquidity, then choose Scaled from the order type pill — set a price range, leg count, and size distribution instead of one single order.",
  },
];

// The rows with the stories of one script attached.
export const withStories = (reel) => BASE.map((idea) => (reel[idea.id] ? { ...idea, story: reel[idea.id] } : idea));

// The default script's version, used by the landing page.
export const IDEAS = withStories(resolveScript(DEFAULT_SCRIPT).reel);

export const findIdea = (id) => IDEAS.find((idea) => idea.id === id);
export const IDEA_COUNT = IDEAS.length;
export const LIVE_COUNT = IDEAS.filter((idea) => idea.built).length;
