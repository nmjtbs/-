import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ConfidenceMeter from "../components/ConfidenceMeter";
import CoverageBadge from "../components/CoverageBadge";
import LoadState from "../components/LoadState";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import {
  buildMatchLabPath,
  isPredictionCutoffType,
  resolveCutoffType,
} from "../routing/dashboardRoutes";
import { getMatchLabPageModel } from "../services/dashboardService";
import { ApiRequestError } from "../services/errors";
import { useAppStore } from "../store/appStore";
import type { MatchLabViewModel } from "../types/models";

export default function MatchLabPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setLayoutState = useAppStore((state) => state.setLayoutState);
  const clearLayoutState = useAppStore((state) => state.clearLayoutState);
  const [model, setModel] = useState<MatchLabViewModel | null>(null);
  const [loadState, setLoadState] = useState<{
    type: "error" | "not-found";
    message: string;
    requestId?: string;
  } | null>(null);
  const cutoffParam = searchParams.get("cutoffType");
  const cutoffType = resolveCutoffType(cutoffParam);

  useEffect(() => {
    if (!matchId) {
      clearLayoutState();
      setLoadState({ type: "not-found", message: "Missing match id" });
      return;
    }

    if (!isPredictionCutoffType(cutoffParam)) {
      navigate(buildMatchLabPath(matchId, cutoffType), { replace: true });
      return;
    }

    let cancelled = false;
    clearLayoutState();
    setModel(null);
    setLoadState(null);

    getMatchLabPageModel(matchId, { snapshotType: cutoffType })
      .then((result) => {
        if (!cancelled) {
          setModel(result.viewModel);
          setLayoutState(result.context, result.meta);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          if (reason instanceof ApiRequestError) {
            setLoadState({
              type: reason.code === "MATCH_NOT_FOUND" ? "not-found" : "error",
              message: reason.message,
              requestId: reason.requestId,
            });
            return;
          }
          setLoadState({
            type: "error",
            message: reason instanceof Error ? reason.message : "Unknown error",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clearLayoutState, cutoffParam, cutoffType, matchId, navigate, setLayoutState]);

  if (loadState) {
    return (
      <LoadState
        type={loadState.type}
        message={loadState.message}
        requestId={loadState.requestId}
      />
    );
  }

  if (!model) {
    return <LoadState type="loading" message="正在加载单场证据、盘口轨迹和模型分布..." />;
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow="Match Lab"
        title="单场证据台"
        copy="把阵容、滚动强度、赔率轨迹和模型输出放在同一张案头图里，先看证据，再看结论。"
        actions={model.headerActions}
      />

      <section className="match-lab-hero">
        <article className="hero-board">
          <div className="hero-board-top">
            <div>
              <div className="hero-meta">
                Issue {model.hero.issue} · {model.hero.subtitle}
              </div>
              <div className="hero-board-title">{model.hero.title}</div>
              <div className="tag-row">
                <span className="badge" data-tone="strong">
                  Handicap {model.hero.handicap}
                </span>
                <span className="badge" data-tone="strong">
                  {model.hero.snapshot}
                </span>
                <span className="badge" data-tone="strong">
                  Confidence {model.hero.confidence}
                </span>
              </div>
            </div>
            <CoverageBadge label="证据已加载" status="ready" />
          </div>

          <div className="hero-scoreline">{model.hero.scoreline}</div>
          <div className="hero-meta">{model.hero.scoreCopy}</div>

          <div className="hero-metrics">
            {model.hero.metrics.map((metric) => (
              <div className="hero-metric" key={metric.label}>
                <div className="metric-label">{metric.label}</div>
                <div className="metric-value">{metric.value}</div>
              </div>
            ))}
          </div>
        </article>

        <aside className="probability-card">
          <div>
            <h2 className="section-card-title">Headline Probability</h2>
            <p className="section-card-copy">{model.probability.summary}</p>
          </div>
          <div className="probability-stack">
            {model.probability.items.map((item) => (
              <div className="probability-row" key={item.label}>
                <strong>{item.label}</strong>
                <div className="probability-bar">
                  <span style={{ width: `${item.value}%` }} />
                </div>
                <span>{item.value}%</span>
              </div>
            ))}
          </div>
          <ConfidenceMeter {...model.probability.confidence} />
        </aside>
      </section>

      <div className="grid-three">
        <SectionCard
          title="Lineups & Absences"
          copy="阵容稳定性先于结论展示，避免把未确认首发伪装成强信号。"
        >
          <div className="signal-list">
            <div className="signal-item">
              <div className="signal-top">
                <strong>Predicted XI</strong>
                <CoverageBadge label="预测首发" status="warning" />
              </div>
              <div className="small">{model.lineup.predicted}</div>
            </div>
            <div className="signal-item">
              <div className="signal-top">
                <strong>Confirmed XI</strong>
                <CoverageBadge label="待更新" status="risk" />
              </div>
              <div className="small">{model.lineup.confirmed}</div>
            </div>
            <div className="signal-item">
              <div className="signal-top">
                <strong>Key Absences</strong>
                <span className="badge" data-tone="warning">
                  {model.lineup.absences.length} flags
                </span>
              </div>
              <div className="small">
                {model.lineup.absences.map((absence) => (
                  <div key={absence}>{absence}</div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Feature Factors"
          copy="让特征理由可读，而不是只扔一个模型结论。"
        >
          <div className="signal-list">
            {model.signals.map((signal) => (
              <div className="signal-item" key={signal.title}>
                <div className="signal-top">
                  <strong>{signal.title}</strong>
                  <CoverageBadge
                    label={signal.badge.label}
                    status={signal.badge.status}
                  />
                </div>
                <div className="signal-value">{signal.value}</div>
                <div className="small">{signal.copy}</div>
              </div>
            ))}
          </div>
          <table className="list-table" style={{ marginTop: "16px" }}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Value</th>
                <th>Weight</th>
                <th>Group</th>
              </tr>
            </thead>
            <tbody>
              {model.featureRows.map((row) => (
                <tr key={row[0]}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard
          title="Odds & Model Stack"
          copy="盘口轨迹和模型分布放在同一列，方便检查是否出现不一致。"
        >
          <div className="timeline-list">
            {model.oddsEvents.map(([time, title, copy]) => (
              <div className="timeline-item" key={`${time}-${title}`}>
                <div>
                  <strong>{title}</strong>
                  <div className="small">{copy}</div>
                </div>
                <span className="badge">{time}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "16px" }}>
            <ConfidenceMeter
              score={69}
              label="Model-market agreement"
              copy="当前市场与模型方向一致，但 closing snapshot 尚未最终冻结。"
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Source Trace"
        copy="让单场结论可回溯到具体源站和快照新鲜度，后续接真数据时可直接替换。"
      >
        <div className="source-list">
          {model.sources.map((source) => (
            <div className="source-item" key={source.name}>
              <div className="source-item-top">
                <strong>{source.name}</strong>
                <div className="tag-row">
                  <CoverageBadge label={source.status} status={source.status} />
                  <span className="badge">{source.freshness}</span>
                </div>
              </div>
              <div className="small">{source.copy}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}
