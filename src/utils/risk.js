// Indicative math shared by every order screen. It is a simplified model (liquidation sits
// 90% of the way to zero margin), not a real risk-engine calculation.
const LIQ_BUFFER = 0.9;

export function estimateLiquidation(side, entryPrice, leverage) {
  const buffer = LIQ_BUFFER / leverage;
  return side === "Long" ? entryPrice * (1 - buffer) : entryPrice * (1 + buffer);
}

export const liquidationMovePct = (leverage) => (LIQ_BUFFER / leverage) * 100;

export const priceDecimals = (entryPrice) => (entryPrice >= 1000 ? 0 : 2);

export const formatPrice = (value, decimals) =>
  value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const lossPctOfMargin = (entryPrice, exitPrice, leverage) =>
  (Math.abs(entryPrice - exitPrice) / entryPrice) * leverage * 100;

// A stop-loss only means something between entry and liquidation.
export function validateStopLoss(side, entryPrice, liquidation, stop, decimals) {
  if (!Number.isFinite(stop)) return "Enter a price.";
  const [lo, hi] = side === "Long" ? [liquidation, entryPrice] : [entryPrice, liquidation];
  if (stop <= lo || stop >= hi) {
    return `Stop-loss must sit between ${formatPrice(lo, decimals)} and ${formatPrice(hi, decimals)}.`;
  }
  return null;
}

export function stopLossChips(side, entryPrice, liquidation, decimals) {
  const factor = 10 ** decimals;
  return [0.25, 0.5, 0.75].map((f) => {
    const price = Math.round((entryPrice + (liquidation - entryPrice) * f) * factor) / factor;
    return { price, movePct: ((price - entryPrice) / entryPrice) * 100 };
  });
}
