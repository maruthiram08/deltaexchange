// SCRIPT "draft": a rewrite of the one-pager script. Only the text changes. The demos, targets and timing are the
// one-pager's, so each story still plays the same way.
//
// It starts from the "onepager" script (`extends` in scripts/index.js), so any feature left out here keeps the
// one-pager text. For a feature listed under REEL, the fields given replace the one-pager ones. Set a feature to
// `null` to drop it from this script.
//
// How the rewrite reads:
//  - Same terms as the one-pager, so nothing changes meaning. Only the framing moves: "a trader" and "they" instead of
//    "user" and "he", and shorter sentences that end on the impact.
//  - The last pain sentence is the key line, so it is the one that costs the trader something.
//  - The feature line keeps the one-pager's words.
//  - Demo captions are rewritten in the same voice. Steps stay as they are, so a caption list must match its steps.
//
// See it in the app: open  /#/watch?script=draft  (the script switcher appears in the header).

import { REEL as BASE } from "./onepager";

// Swaps the captions of a one-pager demo and keeps every step, target and hold time the same.
const captions = (id, lines) => {
  const { demo } = BASE[id];
  if (lines.length !== demo.steps.length) throw new Error(`${id}: ${demo.steps.length} steps need ${demo.steps.length} captions`);
  return { ...demo, steps: demo.steps.map((step, i) => ({ ...step, caption: lines[i] })) };
};

// Timing overrides for this script only. Anything left out uses the "onepager" value.
export const PACE = {};

// The start screen. Leave a field out to keep the one-pager wording.
export const INTRO = {
  eyebrow: "The review",
  text: "The app is already feature-rich, but some features are hard to access, resulting in **broken execution flows** & **delayed decision\u2011making**.",
  start: "Start the walkthrough",
  hint: "or pick any improvement from the list",
};

export const REEL = {
  "reach-oi-builder": {
    pain: "A trader taps a BTC option and lands on the Option details page. They want to check OI data or build a strategy. None of it is accessible in one click.",
    feature: "Add **shortcuts** to Option Chain, Analytics & Strategy Builder in Option page",
    demo: captions("reach-oi-builder", [
      "A trader browses BTC options on Home.",
      "Taps a contract.",
      "The option page opens.",
      "Strategy Builder, Option Analytics and Option Chain sit right under the header.",
      "One tap opens the chain.",
      "OI data, one tap away.",
    ]),
  },

  "add-contracts": {
    pain: "Building a custom strategy requires a trader to switch from Option Chain to the builder, and back again to Option Chain, to add option contracts. Multiple page switches.",
    feature: "In-Line **Basket Toggle** inside the Options tab",
    demo: captions("add-contracts", [
      "Turn Basket on, right inside the Options tab.",
      "Tap a contract to add it as a leg.",
      "Tap another. Still the same screen.",
      "Both legs are in the basket, without leaving the chain.",
    ]),
  },

  "see-max-loss": {
    pain: "A trader creates a multi-leg strategy. Their trading system allows a max loss of 1k, but the strategy exceeds the cap. They won't realise it until they reach the Analyse Payoff screen.",
    feature: "Live **Strategy Payoff Drawer** in Options page to preview max loss, max profit and margin live while building a strategy",
    demo: captions("see-max-loss", [
      "Max loss, max profit and POP sit right under the chain.",
      "The payoff chart updates live.",
      "Flip a leg to Sell and the numbers change at once.",
      "Required margin moves with it, before any order is placed.",
    ]),
  },

  "review-payoff": {
    pain: "A trader creates a multi-leg strategy and reaches the Strategy Order Preview screen. It only shows a list of contracts. Max loss, max profit and payoff are hidden behind the Analyse Payoff screen.",
    feature: "Enhanced **Strategy Order Preview Screen** to surface critical data points",
    demo: captions("review-payoff", [
      "The payoff chart is on the order preview itself.",
      "Max profit and max loss sit right above the contracts.",
      "Then the list of contracts.",
      "All of it is in view before Place Order.",
    ]),
  },

  "cheap-or-rich": {
    pain: "A trader wants to trade options. Option chain data shows numbers but not whether premiums look cheap or expensive. They have to figure it out on their own by analysing data.",
    feature: "**Strategy Fit** - one tap shows whether option prices look cheap or expensive, and which strategies suit",
    demo: captions("cheap-or-rich", [
      "Strategy Fit sits at the top right of the chain.",
      "One tap.",
      "It names the call: Sell Premium.",
      "And gives the reason in plain words.",
      "With templates that suit it.",
      "It reflects current pricing, not a price prediction.",
    ]),
  },

  "oi-support": {
    pain: "A trader wants to sell a strangle and needs OI support and resistance. They have to scan and compare every strike to identify the support and resistance strikes.",
    feature: "**Text labels** for OI Support/Resistance, Max pain in Option Chain",
    demo: captions("oi-support", [
      "OI Sup marks the support strike.",
      "Max Pain marks the strike where most premium expires worthless.",
      "OI Res marks the resistance strike.",
    ]),
  },

  "limit-orders": {
    pain: "A trader identifies a BO trade opportunity and wants to place a Limit order on the retest. The Zip-Trade bar currently allows market orders only. For other order types, they have to switch to the Trade tab or use the hidden workflow from Charts.",
    feature: "Add **Order-Type toggle** to the Zip-Trade bar",
    demo: captions("limit-orders", [
      "The bar shows the order type. Right now it says Market.",
      "Tap it to switch.",
      "It is a Limit order now, placed from the chart.",
    ]),
  },

  "exit-part": {
    pain: "A trader already has a position and wants to exit partial qty at TP1. TradingView charts and the Zip-Trade action bar lack partial exit functionality with a limit order. As a result, they need to switch to the Positions tab or rely on a hidden workaround using TradingView Charts.",
    feature: "**Dynamic Zip-trade Action Bar** - surfaces add, exit CTAs when the trader holds a position",
    demo: captions("exit-part", [
      "With an open position, the bar becomes Add and Exit.",
      "Tap Exit.",
      "Close part of the position, right from the chart.",
    ]),
  },

  "liquidation-upfront": {
    pain: "A trader is about to place an order, or maybe their first trade. They can't see the current leverage before execution. They can't see the liquidation price before execution.",
    punch: 2,
    feature: "Show the **current leverage label** in the Zip-Trade bar & **Est. liquidation price** before the trader places an order",
    demo: captions("liquidation-upfront", [
      "Current leverage is on the bar: 100x.",
      "Tap Long.",
      "The confirm screen shows the estimated liquidation price.",
    ]),
  },

  "change-size": {
    pain: "A trader is about to place an order and wants to adjust the position size. They have to type it in every time.",
    feature: "Add **increment/decrement buttons** to adjust quantity on the Zip Trade bar",
    demo: captions("change-size", [
      "Minus and plus sit on the bottom bar.",
      "One tap adds a lot.",
      "Another.",
      "And one back, all without typing.",
    ]),
  },

  "atm-straddle": {
    pain: "A trader is in the Straddles tab, trying to find the ATM straddle. They need to switch screens to check the index price. Also, because of the instrument naming choice, it is difficult to spot the ATM straddle.",
    punch: 2,
    feature: "Show the **live BTC price** in the Straddles tab & change naming",
    demo: captions("atm-straddle", [
      "Straddles are named by strike, so the ATM one hides in a long list.",
      "The live BTC price sits right here, on the same screen.",
      "The ATM strike sits beside it.",
      "So the ATM straddle, 80,800, is easy to spot.",
    ]),
  },

  "market-pulse": {
    pain: "A trader sees BTC move. They don't know what moved the market. New bets, forced closes or a squeeze?",
    feature: "Show **Market Pulse**, a one-line read on what is moving the market",
    demo: captions("market-pulse", [
      "BTC is up 0.95%. A chip names what is moving it.",
      "One tap opens the evidence.",
      "Short squeeze: forced covering, not fresh buying.",
      "Open interest fell 4.2% as price rose.",
      "$38.6M of shorts were liquidated.",
      "It describes positioning. It never predicts price.",
    ]),
  },

  "first-trade-check": {
    pain: "A trader is about to execute their first order with leverage. Nothing explains the risk of high leverage.",
    feature: "**Warn before first leveraged trade.**",
    demo: captions("first-trade-check", [
      "A first-time trader taps Long at 100x.",
      "A check explains what this trade risks.",
      "Including where the position gets liquidated.",
      "In plain words. It describes risk and predicts nothing.",
    ]),
  },

  "stop-loss": {
    pain: "A trader places their first order without a stop-loss. The underlying may move aggressively against their position, and they may lose their capital.",
    feature: "Nudge user to put **stop-loss** in the first few sessions",
    demo: captions("stop-loss", [
      "A first-time trader taps Long.",
      "Continue past the risk check.",
      "Step two asks where they would exit, with ready-made levels.",
      "Or they can type their own stop-loss.",
    ]),
  },

  // The five below are ideas without a prototype, so they have no demo.
  "fno-terms": {
    pain: "Users exploring the app are quickly confused by terms like \"UPL @ Mark\", \"Notional\" or \"Realised CF\". They create immediate confusion.",
    feature: "**Adoption of familiar FnO lingo**",
  },

  "find-straddles": {
    pain: "A trader wants to trade a straddle or look at derivatives data. But both of them are hidden behind long scrolling in the Markets tab.",
    feature: "**Increase Feature Discoverability**",
  },

  "algo-templates": {
    pain: "A trader wants to build a 7:30 pm range breakout strategy. The current template library has limited basic setups. They can't build it themselves and are left in frustration.",
    feature: "Add more ready-made strategies to the **Template Library** of Algo builder",
  },

  "plain-english-algo": {
    pain: "A trader has a strategy idea but does not know which blocks to use. They can't code, so they are stuck.",
    feature: "**Plain English to Algo Strategy**",
  },

  "paper-test": {
    // The pain here is still my draft. The teardown doc gives none for this row.
    pain: "A trader builds an algo and takes it live with real money. They have never watched it run, so a wrong rule costs real capital.",
    feature: "**Nudge users to test on paper** or do a forward test before taking an algo live",
  },
};
