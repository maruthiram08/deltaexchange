# Delta Exchange India: options app review and prototype

An independent product review of the Delta Exchange India options app, built as a clickable React prototype with a guided walkthrough.

**Live:** https://delta-prototype-two.vercel.app

> This is an independent case study. It is not affiliated with or endorsed by Delta Exchange. It is built from public information only, and every number and price in it is illustrative mock data.

## What is in it

- **Guided walkthrough** (`/#/watch`): a list of 19 improvements on the left and the chosen one on the right. Each starts with the trader's pain and then the idea. Fourteen also run the live prototype with a scripted cursor and captions. The other five are ideas without a prototype and end after the idea.
- **The prototype**: the options app's core screens, rebuilt as working React screens with the improvements applied. Toggles work, forms compute, and payoff charts redraw as you edit legs.
- **Landing page** (`/#/`): the entry point, with the recommended path into the walkthrough.

### Prototype screens

Home, Markets, Straddle list, Option chain, Option details, Trade (futures), Strategy templates, Strategy basket, Analyze payoff, Charts with ZipTrade, and Positions. The full list is in `src/pageRegistry.js`.

### Two design rules

1. **Describe, never predict.** Features such as Strategy Fit and Market Pulse describe current pricing and positioning. They never call a price direction.
2. **Show the data behind the verdict.** Derived numbers can be checked by tapping through to the figures that produced them.

## Run it locally

You need Node.js 20.19 or newer (or 22.12+) and npm.

```bash
git clone https://github.com/maruthiram08/deltaexchange.git
cd deltaexchange
npm install
npm run dev
```

Vite prints a local address, usually http://localhost:5173. Open it in a desktop browser at least 900px wide for the best experience. The walkthrough also works on a phone-sized window, but the prototype is a phone-sized app inside it.

Other commands:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run lint      # run oxlint
```

## Edit the walkthrough script

Everything a viewer reads or watches in the walkthrough lives in one file: **`src/story/reel.js`**.

- **Stories:** for each feature id, the pain text, an optional category tag, the feature text (`**bold**` marks highlighted words) and an optional `demo`.
- **Impact line:** the last pain sentence is shown as the key pain. Put a `|` inside a sentence to split it into a setup and an impact line, or set `punch: 2` when two pains matter. A story with no `demo` has two screens and is listed under "Ideas without a prototype".
- **Demo steps:** a start route, optional silent `prep` taps, and a list of `steps`. Each step has a CSS `target`, an `action` (`move` or `click`), a `caption` and a `hold` time.
- **Timing:** one `PACE` block at the top controls reading time, the pause before the impact line, the countdown, cursor speed and caption hold.

To add a story, add an entry to `reel.js` under the feature's id. The feature list, labels and ordering are in `src/ideas.js`.

### How the live demo works

The demo loads the running prototype in a same-origin iframe. A script finds real elements by CSS selector, glides a cursor to them, highlights them and calls `click()`. If you rename a class in a prototype screen, replay the stories that use it, because a missing selector stops the demo with a "Demo target not found" error in the console.

## Project structure

```
src/
  pages/            Landing page, walkthrough theatre and each prototype screen
  story/            reel.js (the script), StoryPlayer, GhostDemo (scripted cursor)
  ideas.js          The 19 improvements: labels, routes and guidance text
  pageRegistry.js   Every prototype screen and its route
  riskGate.js       In-memory "first leveraged trade" flag for the demo
  utils/risk.js     Liquidation and risk maths
  components/       Shared UI, including the animated landing background
  styles/tokens.css Design tokens (colors, spacing, radii)
```

## Stack

React 19, Vite, `react-router-dom` (`HashRouter`), `motion` for transitions, and plain CSS with design tokens. The animated landing background uses Vanta.js (Halo) on Three.js. It loads on demand, and it is skipped on narrow screens and for viewers who prefer reduced motion.

## Deploy

The app is static. `HashRouter` means no server rewrites are needed, so any static host works. On Vercel:

```bash
npm install -g vercel
vercel --prod
```

## Notes

- The "first leveraged trade" check is held in memory, so a page reload re-arms it and the demo can be shown again.
- Names and marks belong to their owners. Delta Exchange is referenced only to describe the product being reviewed.
