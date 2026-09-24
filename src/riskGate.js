// In-memory on purpose: a page reload re-arms the check, so the demo can be shown again.
let armed = true;
let chosenLeverage = null;

export const shouldGate = () => armed;
export const markDone = (leverage) => {
  armed = false;
  if (leverage) chosenLeverage = leverage;
};
export const rearm = () => {
  armed = true;
  chosenLeverage = null;
};
export const leverageOr = (fallback) => chosenLeverage ?? fallback;
