import "./ContractRow.css";

export default function ContractRow({
  favorite,
  symbol,
  leverageBadge,
  feeBadge,
  subtitle,
  price,
  vol,
  changePct,
  onClick,
}) {
  const positive = changePct >= 0;
  return (
    <div
      className={`contract-row${onClick ? " is-clickable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="contract-row__left">
        {favorite !== undefined && (
          <span className={`contract-row__star${favorite ? " is-fav" : ""}`}>★</span>
        )}
        <div className="contract-row__text">
          <div className="contract-row__symbol-line">
            <span className="contract-row__symbol">{symbol}</span>
            {leverageBadge && <span className="contract-row__badge">{leverageBadge}</span>}
          </div>
          <div className="contract-row__subtitle-line">
            {feeBadge && <span className="contract-row__fee-badge">⚙ {feeBadge}</span>}
            <span className="contract-row__subtitle">{subtitle}</span>
          </div>
        </div>
      </div>
      <div className="contract-row__mid">
        <span className="contract-row__price">{price}</span>
        <span className="contract-row__vol">{vol}</span>
      </div>
      <div className="contract-row__right">
        <span className={`contract-row__chg ${positive ? "is-positive" : "is-negative"}`}>
          {positive ? "+" : ""}
          {changePct}%
        </span>
      </div>
    </div>
  );
}
