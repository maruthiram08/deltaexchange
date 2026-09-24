import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import {
  estimateLiquidation,
  formatPrice,
  liquidationMovePct,
  lossPctOfMargin,
  priceDecimals,
  stopLossChips,
  validateStopLoss,
} from "../../utils/risk";
import "./RiskCheck.css";

const SAFER_LEVERAGE = 5;

export default function RiskCheck({ instrument, side, sideLabel = side, entryPrice, leverage, onPlace, onClose }) {
  const [lev, setLev] = useState(leverage);
  const [stopText, setStopText] = useState("");
  const [step, setStep] = useState(1);
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const decimals = priceDecimals(entryPrice);
  const liquidation = estimateLiquidation(side, entryPrice, lev);
  const stop = stopText.trim() === "" ? null : Number(stopText);
  const error = stop === null ? null : validateStopLoss(side, entryPrice, liquidation, stop, decimals);
  const validStop = stop !== null && error === null;
  const chips = stopLossChips(side, entryPrice, liquidation, decimals);

  return (
    <div
      className="risk-check"
      role="dialog"
      aria-modal="true"
      aria-label="Before your first leveraged trade"
      tabIndex={-1}
      ref={dialogRef}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="risk-check__scroll">

        <div className="risk-check__body">
          <div className="risk-check__topbar">
            {step === 2 ? (
              <button type="button" className="risk-check__back" onClick={() => setStep(1)} aria-label="Back">
                ‹ Back
              </button>
            ) : (
              <span className="risk-check__eyebrow">First leveraged trade</span>
            )}
            <span className="risk-check__step">{step} of 2</span>
          </div>
        {step === 1 ? (
          <>
            <h2 className="risk-check__title">Here is what this trade risks</h2>
            <div className="risk-check__card">
              <div className="risk-check__row">
                <span>Position</span>
                <span>
                  {sideLabel} {instrument}
                </span>
              </div>
              <div className="risk-check__row">
                <span>Leverage</span>
                <span>{lev}x</span>
              </div>
              <div className="risk-check__row">
                <span>Entry</span>
                <span>{formatPrice(entryPrice, decimals)}</span>
              </div>
              <div className="risk-check__row is-accent">
                <span>Est. liquidation</span>
                <span>{formatPrice(liquidation, decimals)}</span>
              </div>
            </div>
            <p className="risk-check__fact">
              At {lev}x, a move of {liquidationMovePct(lev).toFixed(lev >= 10 ? 1 : 0)}% against you liquidates this
              position.
            </p>
          </>
        ) : (
          <>
            <h2 className="risk-check__title">Where will you exit if you're wrong?</h2>
            <p className="risk-check__recap">
              Entry {formatPrice(entryPrice, decimals)}. Liquidation {formatPrice(liquidation, decimals)}.
            </p>
            <div className="risk-check__chips">
              {chips.map((chip) => (
                <button
                  key={chip.price}
                  type="button"
                  className={`risk-check__chip${stop === chip.price ? " is-active" : ""}`}
                  onClick={() => setStopText(String(chip.price))}
                >
                  {formatPrice(chip.price, decimals)}
                  <span>{chip.movePct.toFixed(2)}%</span>
                </button>
              ))}
            </div>
            <input
              className="risk-check__input"
              inputMode="decimal"
              placeholder="Stop-loss price"
              aria-label="Stop-loss price"
              value={stopText}
              onChange={(e) => setStopText(e.target.value)}
            />
            {error && <p className="risk-check__error">{error}</p>}
            {validStop && (
              <p className="risk-check__hint">
                If it triggers, you lose about {lossPctOfMargin(entryPrice, stop, lev).toFixed(0)}% of your margin.
                Liquidation would cost about {lossPctOfMargin(entryPrice, liquidation, lev).toFixed(0)}%.
              </p>
            )}
          </>
        )}
        <p className="risk-check__disclaimer">Describes what this position risks, not where price will go.</p>
        </div>
      </div>

      <div className="risk-check__actions">
        {step === 1 ? (
          <>
            <Button className="risk-check__btn" onClick={() => setStep(2)}>
              Continue
            </Button>
            {lev > SAFER_LEVERAGE && (
              <Button variant="outline" className="risk-check__btn" onClick={() => {
                  setLev(SAFER_LEVERAGE);
                  setStopText("");
                }}>
                Try {SAFER_LEVERAGE}x instead
              </Button>
            )}
            <div className="risk-check__links is-end">
              <button type="button" className="risk-check__link is-muted" onClick={onClose}>
                Not now
              </button>
            </div>
          </>
        ) : (
          <>
            <Button
              className="risk-check__btn"
              disabled={!validStop}
              onClick={() => onPlace({ stopLoss: stop, leverage: lev })}
            >
              Place trade with stop-loss
            </Button>
            <div className="risk-check__links">
              <button type="button" className="risk-check__link" onClick={() => onPlace({ stopLoss: null, leverage: lev })}>
                Trade without stop-loss
              </button>
              <button type="button" className="risk-check__link is-muted" onClick={onClose}>
                Not now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
