import "./PhoneFrame.css";

export default function PhoneFrame({ children, footer }) {
  return (
    <div className="phone-frame">
      <div className="phone-frame__content">{children}</div>
      {footer}
    </div>
  );
}
