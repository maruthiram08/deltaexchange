// The 19 pain-point-to-idea rows from the teardown doc, in one place for the mind map and the story
// pages. `built: false` marks ideas that are not in the prototype yet. A row with an entry in story/reel.js plays in the theatre at
// /watch/:id; the rest open the live screen with a guidance strip. Edit the film script in story/reel.js only.

import { REEL } from "./story/reel";

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
];

export const IDEAS = BASE.map((idea) => (REEL[idea.id] ? { ...idea, story: REEL[idea.id] } : idea));

export const findIdea = (id) => IDEAS.find((idea) => idea.id === id);
export const IDEA_COUNT = IDEAS.length;
export const LIVE_COUNT = IDEAS.filter((idea) => idea.built).length;
