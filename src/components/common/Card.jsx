import "./Card.css";

export default function Card({ inset = false, className = "", children, ...rest }) {
  const classes = ["card", inset ? "card--inset" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
