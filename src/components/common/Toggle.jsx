import "./Toggle.css";

export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle">
      {label && <span className="toggle__label">{label}</span>}
      <span
        className={`toggle__track${checked ? " is-on" : ""}`}
        onClick={() => onChange?.(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
      >
        <span className="toggle__thumb" />
      </span>
    </label>
  );
}
