import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MatchCard from "../components/MatchCard";
import CoverageBadge from "../components/CoverageBadge";
import LoadState from "../components/LoadState";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { buildMatchLabPath, DEFAULT_CUTOFF_TYPE } from "../routing/dashboardRoutes";
import { getCommandCenterPageModel } from "../services/dashboardService";
import { ApiRequestError } from "../services/errors";
import { useAppStore } from "../store/appStore";
import type { CommandCenterViewModel } from "../types/models";

export default function CommandCenterPage() {
  const navigate = useNavigate();
  const setLayoutState = useAppStore((state) => state.setLayoutState);
  const clearLayoutState = useAppStore((state) => state.clearLayoutState);
  const [model, setModel] = useState<CommandCenterViewModel | null>(null);
  const [error, setError] = useState<{ message: string; requestId?: string } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    clearLayoutState();

    getCommandCenterPageModel()
      .then((result) => {
        if (!cancelled) {
          setModel(result.viewModel);
          setLayoutState(result.context, result.meta);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          if (reason instanceof ApiRequestError) {
            setError({ message: reason.message, requestId: reason.requestId });
            return;
          }
          setError({
            message: reason instanceof Error ? reason.message : "Unknown error",
          });
        }
      });

      return () => {
        cancelled = true;
    };
  }, [clearLayoutState, setLayoutState]);

  if (error) {
    return (
      <LoadState
        type="error"
        message={error.message}
        requestId={error.requestId}
      />
    );
  }

  if (!model) {
    return <LoadState type="loading" message="正在加载今日决策队列和数据覆盖信息..." />;
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow="Command Center"
        title="今日决策台"
        copy="优先关注停售前要处理的比赛，把数据覆盖、赔率波动和阵容可用性放到同一视图里判断。"
        actions={model.headerActions}
      />

      <SectionCard
        title="Priority Queue"
        copy="按停售时间和数据可用性排序。先处理最接近 cutoff 且证据不完整的场次。"
        extra={<CoverageBadge label="3 场需人工关注" status="warning" />}
        bodyClass="queue-grid"
      >
        {model.queueMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onSelect={(matchId) => {
              navigate(buildMatchLabPath(matchId, DEFAULT_CUTOFF_TYPE));
            }}
          />
        ))}
      </SectionCard>

      <div className="grid-two">
        <SectionCard
          title="Crawl Health"
          copy="把源站健康、解析状态和映射问题收束到一个操作面板。"
        >
          <table className="list-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current State</th>
              </tr>
            </thead>
            <tbody>
              {model.crawlHealth.map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard
          title="Upcoming Cutoff Timeline"
          copy="下一批需要决策的比赛，以及当前最关键的阻塞信息。"
        >
          <div className="timeline-list">
            {model.timeline.map(([time, title, copy]) => (
              <div className="timeline-item" key={`${time}-${title}`}>
                <div>
                  <strong>{title}</strong>
                  <div className="small">{copy}</div>
                </div>
                <span className="badge">{time}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Alert Stack"
        copy="强提醒优先展示会污染训练集、破坏快照时点或直接阻断入模的告警。"
      >
        <div className="warning-list">
          {model.warnings.map((warning) => (
            <div
              className="warning-item"
              data-tone={warning.tone}
              key={warning.title}
            >
              <div>
                <strong>{warning.title}</strong>
                <div className="small">{warning.copy}</div>
              </div>
              <span
                className="badge"
                data-tone={warning.tone === "danger" ? "danger" : "warning"}
              >
                {warning.tone}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}
