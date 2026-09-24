import "./TopTabs.css";

export default function TopTabs({ tabs, active, onSelect, scrollable = true }) {
  return (
    <div className={`top-tabs${scrollable ? " top-tabs--scrollable" : ""}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`top-tabs__item${tab.key === active ? " is-active" : ""}`}
          onClick={() => onSelect?.(tab.key)}
        >
          {tab.label}
          {tab.badge && <span className="top-tabs__badge">{tab.badge}</span>}
        </button>
      ))}
    </div>
  );
}
