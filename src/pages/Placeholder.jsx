import PhoneFrame from "../components/common/PhoneFrame";
import BottomTabBar from "../components/common/BottomTabBar";
import Badge from "../components/common/Badge";

export default function Placeholder({ page }) {
  return (
    <PhoneFrame footer={<BottomTabBar />}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <Badge tone="orange">Not yet built</Badge>
        <h2 style={{ margin: 0, fontSize: "18px" }}>{page.label}</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>
          Pain point{page.painPoints.length > 1 ? "s" : ""} #{page.painPoints.join(", #")}
        </p>
      </div>
    </PhoneFrame>
  );
}
