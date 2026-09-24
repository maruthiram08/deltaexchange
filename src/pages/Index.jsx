import { Link } from "react-router-dom";
import { PAGE_REGISTRY } from "../pageRegistry";
import Badge from "../components/common/Badge";
import "./Index.css";

export default function Index() {
  return (
    <div className="index-page">
      <h1>Delta Exchange — Options Trader Prototype</h1>
      <p className="index-page__subtitle">
        A single interconnected prototype — navigate it like a real app via the bottom tabs.
        This sitemap is a dev reference; pain-point tags map to <code>pain-points-notes.md</code>.
      </p>
      <Link to="/home" className="index-page__enter">
        Enter prototype →
      </Link>
      {PAGE_REGISTRY.map((section) => (
        <div key={section.section} className="index-page__section">
          <h2>{section.section}</h2>
          <div className="index-page__grid">
            {section.pages.map((page) => (
              <Link key={page.id} to={page.path} className="index-page__card">
                {!page.component && (
                  <div className="index-page__card-badges">
                    <Badge tone="orange">Not yet built</Badge>
                  </div>
                )}
                <span className="index-page__label">{page.label}</span>
                <span className="index-page__points">
                  #{page.painPoints.join(", #")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
