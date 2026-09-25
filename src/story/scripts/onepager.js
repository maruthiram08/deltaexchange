// SCRIPT "onepager": the walkthrough written from the one-pager text. Everything a viewer reads or watches lives in this file.
// To try different wording, copy this file, or extend it in scripts/draft.js, then see scripts/index.js.
//
// Per feature (keyed by the id in ideas.js):
//   pain     The pain point text, shown first. Use the teardown doc's wording. Put a `|` where the key pain starts
//            inside a sentence (it is never shown), so a one-sentence pain still gets a highlighted impact line.
//   tag      Optional category chip under the pain (for example "Delayed Decision Making").
//   punch    Optional. How many of the last pain sentences are key pains (default 1). Use 2 when the doc lists two separate pains.
//   feature  The feature text, shown second and in the reel list. Wrap highlighted words in **double stars**.
//   demo     Optional. Leave it out and the story ends after the idea. The live prototype run: `start` route, optional silent `prep` taps, then `steps`.
//
// Demo step fields:
//   target   CSS selector inside the prototype.
//   has      Optional partial text to match. `child` then picks a nested selector (for example a switch in a row).
//   text     Optional exact text to match when several elements share the selector (for example a tab label).
//   pick     "last" to use the last match instead of the first.
//   action   "move" glides and highlights, "click" also taps it.
//   caption  The line shown under the phone.
//   hold     Milliseconds to stay on the step (scaled by PACE.hold).
//
// Features with no entry here still appear in the reel and open the live screen with a guidance strip.

// Timing knobs, all in one place. Raise a number to slow that part down.
export const PACE = {
  painReadMsPerChar: 80, // pain beat length = characters x this...
  painMinMs: 6500, //       ...but never shorter than this
  painLineGapMs: 2500, //   delay between pain sentences appearing
  painPunchPauseMs: 1900, // extra beat of silence before the last pain sentence, the key pain, lands
  painPunchHoldMs: 5000, //  how long the key pain line and its chip stay on screen before the idea beat
  ideaMs: 5300, //          how long the feature headline stays before the demo
  countdownFrom: 3, //      "Starting in 3, 2, 1" before each demo. Set to 0 to skip it.
  countdownStepMs: 1000, // length of each countdown number
  glideMs: 2000, //         pause on each target after the cursor arrives, before highlight or tap
  pressMs: 600, //          tap press duration
  hold: 2.0, //             multiplier on every step's `hold`
};

// The start screen shown before a feature is picked. `**bold**` marks the highlighted phrases.
export const INTRO = {
  eyebrow: "The teardown",
  text: "The app is already feature-rich, but some features are hard to access, resulting in **broken execution flows** & **delayed decision\u2011making**.",
  start: "Start the show",
  hint: "or pick any feature from the reel",
};

export const REEL = {
  "reach-oi-builder": {
    pain: "User clicks on a BTC option from home page. He lands on Option details page. User wants to check OI data or build a strategy. None of them is accesible in one-click.",
    tag: "Delayed Decision Making",
    feature: "Add **shortcuts** to Option Chain, Analytics & Strategy Builder in Option page",
    demo: {
      start: "/home",
      steps: [
        { target: ".home-page__market-tab", text: "BTC Options", action: "click", caption: "A trader opens the BTC Options tab on Home.", hold: 1400 },
        { target: ".contract-row", action: "click", caption: "Taps a contract.", hold: 1200 },
        { target: ".option-trade-page__symbol-block", action: "move", caption: "The option's details page opens.", hold: 1800 },
        { target: ".option-trade-page__cta-row", action: "move", caption: "Strategy Builder, Option Analytics and Option Chain sit right under the header.", hold: 2400 },
        { target: 'a.option-trade-page__cta[href$="/option-chain"]', action: "click", caption: "One tap and the chain is open.", hold: 1200 },
        { target: ".option-chain-page__header-row", action: "move", caption: "OI data is one tap away.", hold: 2200 },
      ],
    },
  },
  "market-pulse": {
    pain: "User doesn't know what moved the market - | new bets, forced closes or a squeeze.",
    feature: "Show **Market Pulse**, a one-line read on what is moving the market",
    demo: {
      start: "/charts",
      steps: [
        { target: ".charts-page__market-pulse-chip", action: "move", caption: "BTC is up 0.95%. A chip names what is moving it.", hold: 1800 },
        { target: ".charts-page__market-pulse-chip", action: "click", caption: "One tap opens the evidence.", hold: 1200 },
        { target: ".charts-page__market-pulse-badge", action: "move", caption: "Short squeeze: forced covering, not fresh buying.", hold: 2200 },
        { target: ".charts-page__modal-row", pick: "first", action: "move", caption: "Open interest fell 4.2% as price rose.", hold: 2000 },
        { target: ".charts-page__modal-row", pick: "last", action: "move", caption: "$38.6M of shorts were liquidated.", hold: 2000 },
        { target: ".charts-page__market-pulse-disclaimer", action: "move", caption: "It describes positioning. It never predicts price.", hold: 2400 },
      ],
    },
  },
  "add-contracts": {
    pain: "Building a custom strategy requires the user to switch from Option Chain, Click on Strategy builder. He lands back again on Option Chain page to add option contracts. Multiple Page Switches",
    tag: "Broken Execution Flow",
    feature: "In-Line **Basket Toggle** inside the Options tab.",
    demo: {
      start: "/option-chain",
      steps: [
        { target: ".toggle__track", action: "click", caption: "Turn Basket on, right inside the Options tab.", hold: 1600 },
        { target: ".is-call.is-clickable", pick: "first", action: "click", caption: "Tap a contract to add it as a leg.", hold: 1400 },
        { target: ".is-call.is-clickable", pick: "last", action: "click", caption: "Tap another. No trip to the builder.", hold: 1400 },
        { target: ".option-chain-page__summary", action: "move", caption: "Both legs are in the basket, on the same screen.", hold: 2400 },
      ],
    },
  },
  "see-max-loss": {
    pain: "User has created a multi-leg strategy. His trading system allows a max loss of 1k, but the strategy he created exceeds the cap. He won't realise it until he reaches the Analyse Payoff screen.",
    tag: "Forced Rework & High Error Rate",
    feature: "Live **Strategy Payoff Drawer** in Options page to preview max loss, max profit and margin live while building a strategy.",
    demo: {
      start: "/option-chain",
      prep: [
        { target: ".toggle__track" },
        { target: ".is-call.is-clickable", pick: "first" },
        { target: ".is-call.is-clickable", pick: "last" },
      ],
      steps: [
        { target: ".option-chain-page__summary-stats", action: "move", caption: "Max loss, max profit and POP sit right under the chain.", hold: 2400 },
        { target: ".option-chain-page__payoff-graph", action: "move", caption: "The payoff chart is live too.", hold: 2000 },
        { target: ".option-chain-page__leg-side.is-sell", action: "click", caption: "Flip a leg to Sell and the numbers change at once.", hold: 2200 },
        { target: ".option-chain-page__summary-footer", action: "move", caption: "Required margin updates with it, before any order is placed.", hold: 2400 },
      ],
    },
  },
  "review-payoff": {
    pain: "Users create a multi-leg strategy & reach the Strategy Order Preview screen. It only shows a list of contracts. Max loss, max profit and payoff sit on another screen. They are hidden behind the analyse payoff screen.",
    tag: "Friction at Conversion",
    feature: "Enhanced **Strategy Order Preview Screen** to surface critical data points.",
    demo: {
      start: "/strategy-basket",
      steps: [
        { target: ".strategy-basket-page__chart-card", action: "move", caption: "The payoff chart is on the order preview itself.", hold: 2200 },
        { target: ".strategy-basket-page__payoff-stats", action: "move", caption: "Max profit and max loss sit right above the contracts.", hold: 2400 },
        { target: ".strategy-basket-page__strategies-header", action: "move", caption: "Then the list of contracts.", hold: 1800 },
        { target: ".strategy-basket-page__place-btn", action: "move", caption: "All of it is visible before Place Order.", hold: 2400 },
      ],
    },
  },
  "cheap-or-rich": {
    pain: "User wants to trade options. OC data shows numbers but not whether premiums look cheap or expensive. He has to figure it out on his own by analysing data.",
    tag: "Analysis Fatigue",
    feature: "**Strategy Fit** - one tap shows whether option prices look cheap or expensive, and which strategies suit",
    demo: {
      start: "/option-chain",
      steps: [
        { target: ".option-chain-page__thesis-inline", action: "move", caption: "Strategy fit sits at the top right of the chain.", hold: 1800 },
        { target: ".option-chain-page__thesis-inline", action: "click", caption: "One tap.", hold: 1200 },
        { target: ".option-chain-page__thesis-badge", action: "move", caption: "It names the call: Sell Premium.", hold: 2000 },
        { target: ".option-chain-page__thesis-text", pick: "first", action: "move", caption: "And says why, in plain words.", hold: 2600 },
        { target: ".option-chain-page__thesis-cta", action: "move", caption: "With templates that suit it.", hold: 2200 },
        { target: ".option-chain-page__thesis-disclaimer", action: "move", caption: "It reflects current pricing, not a price prediction.", hold: 2400 },
      ],
    },
  },
  "oi-support": {
    pain: "User wants to sell a strangle & needs OI support and resistance. He has to scan & compare every strike to identify S/R strikes.",
    tag: "Cognitive Load",
    feature: "**Text labels** for OI Support/Resistance, Max pain in Option Chain",
    demo: {
      start: "/option-chain",
      steps: [
        { target: ".option-chain-page__oi-tag.is-support", action: "move", caption: "OI Sup marks the support strike.", hold: 2000 },
        { target: ".option-chain-page__oi-tag.is-maxpain", action: "move", caption: "Max Pain marks the strike where most premium expires worthless.", hold: 2400 },
        { target: ".option-chain-page__oi-tag.is-resistance", action: "move", caption: "OI Res marks the resistance strike.", hold: 2000 },
      ],
    },
  },
  "limit-orders": {
    pain: "User identified a BO trade opportunity & wants to place a Limit order on the retest. Zip-Trade bar currently allows market orders only. For placing other order types, either he has to switch to the Trade tab or use the hidden workflow from Charts.",
    tag: "Friction at Conversion",
    feature: "Add **Order-Type toggle** to the Zip-Trade bar.",
    demo: {
      start: "/charts",
      steps: [
        { target: ".charts-page__zip-order-type", action: "move", caption: "The bar shows the order type. It says Market.", hold: 1800 },
        { target: ".charts-page__zip-order-type", action: "click", caption: "Tap it to switch.", hold: 1800 },
        { target: ".charts-page__ziptrade-bar", action: "move", caption: "Now it is a Limit order, placed from the chart.", hold: 2400 },
      ],
    },
  },
  "exit-part": {
    pain: "User already has a position and wants to exit partial qty at TP1. TradingView charts & Zip-Trade action bar lack partial exit functionality with limit order. As a result, the user needs to switch to the Positions tab or rely on a hidden workaround using TradingView Charts.",
    tag: "Broken Execution Flow",
    feature: "**Dynamic Zip-trade Action Bar** - surfaces add, exit CTAs when user holds a position",
    demo: {
      start: "/charts",
      prep: [
        { target: ".charts-page__ziptrade-settings" },
        { target: ".charts-page__settings-row", has: "Simulate Open Position", child: ".toggle__track" },
        { target: ".charts-page__modal-header button" },
      ],
      steps: [
        { target: ".charts-page__ziptrade-bar", action: "move", caption: "With an open position, the bar becomes Add and Exit.", hold: 2400 },
        { target: ".charts-page__zip-btn.is-exit", action: "click", caption: "Tap Exit.", hold: 1600 },
        { target: ".charts-page__modal-pct-row", action: "move", caption: "Close part of the position, right from the chart.", hold: 2600 },
      ],
    },
  },
  "liquidation-upfront": {
    pain: "User is about to place an order or even maybe his first trade. But he can't see the current leverage before execution. But he can't see the liquidation price before execution.",
    feature: "Show the **current leverage label** in the Zip-Trade bar & **Est. liquidation price** before the user places an order.",
    demo: {
      start: "/charts",
      prep: [
        { target: ".charts-page__ziptrade-settings" },
        { target: ".charts-page__settings-row", has: "Simulate First-time Trader", child: ".toggle__track" },
        { target: ".charts-page__modal-header button" },
      ],
      steps: [
        { target: ".charts-page__zip-leverage", action: "move", caption: "Current leverage is on the bar: 100x.", hold: 2000 },
        { target: ".charts-page__zip-btn.is-long", action: "click", caption: "Tap Long.", hold: 1600 },
        { target: ".charts-page__modal-row", pick: "last", action: "move", caption: "The confirm screen shows the estimated liquidation price.", hold: 2800 },
      ],
    },
  },
  "change-size": {
    pain: "You are about to place an order and want to adjust the position size. You have to type it in every time.",
    tag: "Execution Friction",
    feature: "Add **increment/decrement buttons** to adjust quantity on the Zip Trade bar",
    demo: {
      start: "/charts",
      steps: [
        { target: ".charts-page__zip-qty-stepper", action: "move", caption: "Minus and plus sit on the bottom bar.", hold: 1800 },
        { target: '.charts-page__zip-qty-stepper button[aria-label="Increase quantity"]', action: "click", caption: "One tap adds a lot.", hold: 1400 },
        { target: '.charts-page__zip-qty-stepper button[aria-label="Increase quantity"]', action: "click", caption: "Another.", hold: 1400 },
        { target: '.charts-page__zip-qty-stepper button[aria-label="Decrease quantity"]', action: "click", caption: "And one back. No typing.", hold: 2000 },
      ],
    },
  },
  "atm-straddle": {
    pain: "User is in the Straddles tab, trying to find the ATM straddle. He needs to switch screens to check the index price. Also, because of the instrument naming choice, it is difficult to spot the ATM straddle.",
    tag: "Delayed Execution Flow",
    punch: 2, // two separate pains: no index price on screen, and the instrument naming
    feature: "Show the **live BTC price** in the Straddles tab & change naming",
    demo: {
      start: "/straddle",
      steps: [
        { target: ".straddle-page__row", action: "move", caption: "Straddles are named by strike, so the ATM one hides in a long list.", hold: 2400 },
        { target: ".straddle-page__context-item", pick: "first", action: "move", caption: "The live BTC price is right here. No screen switch.", hold: 2400 },
        { target: ".straddle-page__context-item", pick: "last", action: "move", caption: "The ATM strike sits beside it.", hold: 2200 },
        { target: ".straddle-page__row", pick: "last", action: "move", caption: "So the ATM straddle, 80,800, is easy to spot.", hold: 2600 },
      ],
    },
  },
  "first-trade-check": {
    pain: "User is about to execute his first order with leverage. Nothing explains the risk of high leverage.",
    tag: "Premature Account Blowout",
    feature: "**Warn before first leveraged trade.**",
    demo: {
      start: "/charts",
      steps: [
        { target: ".charts-page__zip-btn.is-long", action: "click", caption: "A first-time trader taps Long at 100x.", hold: 1800 },
        { target: ".risk-check__card", action: "move", caption: "A check explains what this trade risks.", hold: 2400 },
        { target: ".risk-check__row.is-accent", action: "move", caption: "Including where the position gets liquidated.", hold: 2400 },
        { target: ".risk-check__fact", action: "move", caption: "In plain words, with no price prediction.", hold: 2600 },
      ],
    },
  },
  "stop-loss": {
    pain: "User places his first order without a stop-loss. Underlying may move aggressively against his position, and he may lose his capital.",
    tag: "Premature Account Blowout",
    feature: "Nudge user to put **stop-loss** in the first few sessions",
    demo: {
      start: "/charts",
      steps: [
        { target: ".charts-page__zip-btn.is-long", action: "click", caption: "A first-time trader taps Long.", hold: 1600 },
        { target: ".risk-check__btn", pick: "first", action: "click", caption: "Continue past the risk check.", hold: 1800 },
        { target: ".risk-check__chips", action: "move", caption: "Step two asks where he would exit, with ready-made levels.", hold: 2600 },
        { target: ".risk-check__input", action: "move", caption: "Or he can type his own stop-loss.", hold: 2400 },
      ],
    },
  },
  "fno-terms": {
    pain: "Users exploring the app are quickly confused by terms like \"UPL @ Mark,\" \"Notional,\" or \"Realised CF\", | which create immediate confusion.",
    feature: "**Adoption of familiar FnO lingo**",
    // No demo on purpose: this one is a wording change, so the story ends after the idea.
  },
  "find-straddles": {
    pain: "User wants to trade a straddle or look at derivatives data. But both of them are hidden behind long scrolling in the Markets Tab.",
    feature: "**Increase Feature Discoverability**",
  },
  "algo-templates": {
    pain: "User wants to build a 7:30 pm range breakout strategy. Current template library has limited basic setups. User can't build it himself & left in frustration.",
    tag: "Feature Abandonment",
    feature: "Add more ready-made strategies to the **Template Library** of Algo builder",
  },
  "plain-english-algo": {
    pain: "User has a strategy idea but does not know which blocks to use. They can't code, so they are stuck.",
    tag: "Feature Abandonment",
    feature: "**Plain English to Algo Strategy**",
  },
  "paper-test": {
    // DRAFT pain: the teardown doc gives none for this row. Replace with your own wording.
    pain: "User builds an algo and takes it live with real money before ever seeing it run. A wrong rule costs real capital.",
    tag: "Premature Account Blowout",
    feature: "**Nudge users to test on paper** or do a forward test before taking an algo live.",
  },
};
