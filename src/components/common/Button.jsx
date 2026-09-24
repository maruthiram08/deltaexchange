import "./Button.css";

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  const classes = ["btn", `btn--${variant}`, `btn--${size}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} type="button" {...rest}>
      {children}
    </button>
  );
}
