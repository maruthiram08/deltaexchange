import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./PhoneFrame.css";

export default function PhoneFrame({ children, footer }) {
  const location = useLocation();
  const [dismissedKey, setDismissedKey] = useState(null);
  const tip = location.state?.tip;
  const showTip = tip && dismissedKey !== location.key;

  return (
    <div className="phone-frame">
      {showTip && (
        <div className="phone-frame__tip" role="status">
          <div className="phone-frame__tip-body">
            <strong>{tip.fix}</strong>
            <span>{tip.text}</span>
          </div>
          <div className="phone-frame__tip-actions">
            <Link to="/" state={{ openMap: true }}>Back to map</Link>
            <button type="button" onClick={() => setDismissedKey(location.key)} aria-label="Dismiss tip">
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="phone-frame__content">{children}</div>
      {footer}
    </div>
  );
}
