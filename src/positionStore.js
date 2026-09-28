// In-memory on purpose, same pattern as riskGate.js: tracks which sides are currently
// "open" per symbol so Positions can reflect what was actually placed on Trade, instead
// of a static mock. A page reload clears it, so the demo can be replayed from a clean state.
const openSidesBySymbol = {};

// Position Mode is a real setting, not per-order state — it must survive Trade
// unmounting/remounting on navigation (e.g. Trade -> Positions -> Trade), the same way
// riskGate.js's chosenLeverage survives it. Local useState alone silently resets to the
// default on every remount, which is what caused legs to appear to "disappear."
let currentPositionMode = "one-way";

export function getPositionMode() {
  return currentPositionMode;
}

export function setPositionModeValue(mode) {
  currentPositionMode = mode;
}

export function recordOrder(symbol, side, positionMode) {
  const current = openSidesBySymbol[symbol] instanceof Set ? openSidesBySymbol[symbol] : new Set();
  if (positionMode !== "hedge") {
    // One-way: an opposite-side order nets against the existing one instead of adding to it.
    current.clear();
  }
  current.add(side);
  openSidesBySymbol[symbol] = current;
}

export function getOpenSides(symbol) {
  return openSidesBySymbol[symbol] instanceof Set ? new Set(openSidesBySymbol[symbol]) : new Set();
}
