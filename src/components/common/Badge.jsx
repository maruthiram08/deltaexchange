import "./Badge.css";

export default function Badge({ tone = "orange", children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
