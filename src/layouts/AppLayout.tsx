import { Outlet, useLocation, useNavigate } from "react-router-dom";
import CoverageBadge from "../components/CoverageBadge";
import { navItems } from "../mocks/rawData";
import {
  buildMatchLabPath,
  DEFAULT_CUTOFF_TYPE,
  FALLBACK_MATCH_ID,
  resolveCutoffType,
} from "../routing/dashboardRoutes";
import { useAppStore } from "../store/appStore";

function NavRail() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (id: string) => {
    if (id === "match-lab") {
      const pathMatch = location.pathname.match(/^\/match-lab\/([^/]+)/);
      const currentMatchId = pathMatch?.[1] ?? FALLBACK_MATCH_ID;
      const cutoffType = resolveCutoffType(
        new URLSearchParams(location.search).get("cutoffType"),
      );
      navigate(buildMatchLabPath(currentMatchId, cutoffType));
      return;
    }
    navigate("/command-center");
  };

  return (
    <aside className="nav-rail">
      <div className="brand-block">
        <span className="brand-chip">Press Box Modernism</span>
        <div className="brand-title">
          Football
          <br />
          Intelligence Desk
        </div>
        <div className="brand-copy">
          Research-first dashboard for training data, pre-match signals, and
          decision review.
        </div>
      </div>
      <div className="nav-group">
        {navItems.map((item) => {
          const isActive =
            item.id === "command-center"
              ? location.pathname.startsWith("/command-center")
              : location.pathname.startsWith("/match-lab");

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => handleNavigate(item.id)}
              type="button"
            >
              <span className="nav-item-label">{item.label}</span>
              <span className="nav-item-copy">{item.copy}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function ContextStrip() {
  const location = useLocation();
  const layoutContext = useAppStore((state) => state.layoutContext);
  const layoutMeta = useAppStore((state) => state.layoutMeta);
  const routeCutoff = resolveCutoffType(
    new URLSearchParams(location.search).get("cutoffType"),
  );
  const warningCount = layoutMeta?.warnings.length ?? 0;
  const cutoffType = layoutContext?.cutoffType ?? routeCutoff ?? DEFAULT_CUTOFF_TYPE;

  return (
    <header className="context-strip">
      <div className="context-meta">
        <span className="context-pill">{layoutContext?.date ?? "—"}</span>
        <span className="context-pill">
          Issue {layoutContext?.issueNo ?? "—"}
        </span>
        <span className="context-pill">
          {layoutContext?.competition ?? "Loading context"}
        </span>
        <span className="context-pill" data-tone="warning">
          Next stop {layoutContext?.cutoffTime ?? "—"}
        </span>
      </div>
      <div className="context-actions">
        <span className="context-pill">
          {layoutContext?.coverageSummary ?? "Awaiting page data"}
        </span>
        <span className="context-pill" data-tone="info">
          {cutoffType}
        </span>
        <span className="context-pill" data-tone="danger">
          {layoutContext?.alertCount ?? 0} alerts
        </span>
        {layoutMeta?.stale ? (
          <span className="context-pill" data-tone="warning">
            stale
          </span>
        ) : null}
        {warningCount > 0 ? (
          <span className="context-pill" data-tone="warning">
            {warningCount} warnings
          </span>
        ) : null}
      </div>
    </header>
  );
}

function ContextDrawer() {
  return (
    <aside className="drawer">
      <section className="drawer-section">
        <h3 className="drawer-title">Context Drawer</h3>
        <p className="drawer-copy">
          Keep secondary evidence close without overwhelming the main canvas.
        </p>
      </section>
      <section className="drawer-section">
        <h3 className="drawer-title">Current Focus</h3>
        <div className="source-list">
          <div className="source-item">
            <div className="source-item-top">
              <strong>Queue readiness</strong>
              <CoverageBadge label="11/14 evaluable" status="warning" />
            </div>
            <div className="small">
              Three matches still need lineup refresh or entity review.
            </div>
          </div>
          <div className="source-item">
            <div className="source-item-top">
              <strong>Model cutoff</strong>
              <span className="badge" data-tone="info">
                kickoff - 90m
              </span>
            </div>
            <div className="small">
              All visible evidence should respect the active prediction
              snapshot.
            </div>
          </div>
        </div>
      </section>
      <section className="drawer-section">
        <h3 className="drawer-title">Analyst Notes</h3>
        <div className="warning-list">
          <div className="warning-item">
            Do not promote any match with unresolved mapping into the final
            export list.
          </div>
          <div className="warning-item" data-tone="danger">
            Closing odds are informative, but only if the page timestamp is
            before the selected cutoff.
          </div>
        </div>
      </section>
    </aside>
  );
}

export default function AppLayout() {
  return (
    <div className="app-shell">
      <NavRail />
      <ContextStrip />
      <main className="workspace">
        <Outlet />
      </main>
      <ContextDrawer />
    </div>
  );
}
