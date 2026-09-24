import "./Slider.css";

export default function Slider({ value, min = 0, max = 100, step = 1, onChange }) {
  return (
    <input
      className="slider"
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange?.(Number(e.target.value))}
    />
  );
}
