from copy import deepcopy
from typing import Dict, List, Optional

from app.core.errors import match_not_found
from app.repositories.interfaces import DashboardReadRepository, ServiceResult
from app.schemas.common import ActionButton, ConfidenceModel, MetricTileModel
from app.schemas.dashboard import (
    CommandCenterQueueMatch,
    CommandCenterResponseData,
    CommandCenterWarning,
    DashboardContext,
    MatchLabHeroModel,
    MatchLabLineupModel,
    MatchLabProbabilityItem,
    MatchLabProbabilityModel,
    MatchLabResponseData,
    MatchLabSignalModel,
    MatchLabSourceModel,
)


def _base_context(cutoff_type: str) -> DashboardContext:
    return DashboardContext(
        date="2026-03-22",
        issueNo="24031",
        competition="竞彩精选",
        cutoffTime="19:35",
        cutoffType=cutoff_type,
        coverageSummary="11/14 场可评估",
        alertCount=3,
    )


class MockDashboardRepository(DashboardReadRepository):
    def __init__(self) -> None:
        self._matches: Dict[str, MatchLabResponseData] = {
            "arsenal-liverpool": MatchLabResponseData(
                context=_base_context("kickoff_minus_90m"),
                matchId="arsenal-liverpool",
                actions=[
                    ActionButton(label="切换到历史对照", tone="ghost"),
                    ActionButton(label="导出单场报告", tone="primary"),
                ],
                hero=MatchLabHeroModel(
                    issue="24031-001",
                    subtitle="EPL · 2026-03-22 18:30 · Emirates Stadium",
                    title="Arsenal vs Liverpool",
                    handicap="-0.5",
                    snapshot="kickoff_minus_90m",
                    confidence="B+",
                    scoreline="52 27 21",
                    scoreCopy="胜 / 平 / 负 模型分布",
                    metrics=[
                        MetricTileModel(label="Attack Delta", value="+0.43"),
                        MetricTileModel(label="Lineup Stability", value="78%"),
                        MetricTileModel(label="Odds Drift", value="-0.18"),
                    ],
                ),
                probability=MatchLabProbabilityModel(
                    summary="市场与模型同向，但门将状态和最后一条伤停仍在影响风险折扣。",
                    items=[
                        MatchLabProbabilityItem(label="Home Win", value=52.0),
                        MatchLabProbabilityItem(label="Draw", value=27.0),
                        MatchLabProbabilityItem(label="Away Win", value=21.0),
                    ],
                    confidence=ConfidenceModel(score=74, label="中高信心", copy="可用于候选单，但不建议忽略阵容最终确认。"),
                ),
                lineup=MatchLabLineupModel(
                    predicted="Raya / White, Saliba, Gabriel, Zinchenko / Rice, Odegaard, Havertz / Saka, Jesus, Martinelli",
                    confirmed="待官方首发",
                    absences=["首发门将状态待确认", "主力中卫负荷偏高", "替补边锋伤停，轮换深度下降"],
                ),
                signals=[
                    MatchLabSignalModel(
                        title="Attack vs Defense",
                        value="+0.43",
                        copy="主队过去 5 场射正与客队被射正均值形成正向剪刀差。",
                        badge={"label": "positive", "status": "ready"},
                    ),
                    MatchLabSignalModel(
                        title="Rest / Fatigue",
                        value="2d",
                        copy="双方赛程密度接近，但客队旅途更长，疲劳略高。",
                        badge={"label": "balanced", "status": "warning"},
                    ),
                ],
                featureRows=[
                    ("team_shots_on_target_avg_last_5", "6.2", "high", "rolling form"),
                    ("opp_shots_on_target_faced_avg_last_5", "4.1", "medium", "defense exposure"),
                    ("rest_days_delta", "+1", "medium", "schedule"),
                    ("missing_starting_goalkeeper_flag", "1", "critical", "availability"),
                    ("closing_odds_delta", "-0.18", "high", "market"),
                ],
                oddsEvents=[
                    ("09:00", "Open", "1.91 / 3.50 / 4.10"),
                    ("14:15", "Home shortens", "1.84 / 3.60 / 4.35"),
                    ("18:05", "Current snapshot", "1.86 / 3.54 / 4.28"),
                ],
                sources=[
                    MatchLabSourceModel(name="lottery", freshness="2m", status="ready", copy="official issue and handicap aligned"),
                    MatchLabSourceModel(name="lineups", freshness="11m", status="warning", copy="confirmed lineup not yet available"),
                    MatchLabSourceModel(name="odds", freshness="1m", status="ready", copy="closing trajectory available"),
                ],
            ),
            "milan-roma": MatchLabResponseData(
                context=_base_context("kickoff_minus_90m"),
                matchId="milan-roma",
                actions=[
                    ActionButton(label="切换到历史对照", tone="ghost"),
                    ActionButton(label="导出单场报告", tone="primary"),
                ],
                hero=MatchLabHeroModel(
                    issue="24031-002",
                    subtitle="Serie A · 2026-03-22 19:00 · San Siro",
                    title="Milan vs Roma",
                    handicap="-0.25",
                    snapshot="kickoff_minus_90m",
                    confidence="A-",
                    scoreline="49 29 22",
                    scoreCopy="胜 / 平 / 负 模型分布",
                    metrics=[
                        MetricTileModel(label="Attack Delta", value="+0.18"),
                        MetricTileModel(label="Lineup Stability", value="92%"),
                        MetricTileModel(label="Odds Drift", value="+0.07"),
                    ],
                ),
                probability=MatchLabProbabilityModel(
                    summary="数据覆盖完整，胜平负和让球方向较一致。",
                    items=[
                        MatchLabProbabilityItem(label="Home Win", value=49.0),
                        MatchLabProbabilityItem(label="Draw", value=29.0),
                        MatchLabProbabilityItem(label="Away Win", value=22.0),
                    ],
                    confidence=ConfidenceModel(score=86, label="高信心", copy="阵容、伤停与盘口变化方向一致。"),
                ),
                lineup=MatchLabLineupModel(
                    predicted="Maignan / Calabria, Tomori, Thiaw, Hernandez / Reijnders, Bennacer / Pulisic, Loftus-Cheek, Leao / Gimenez",
                    confirmed="预计与上一轮一致",
                    absences=["轮换边后卫缺席"],
                ),
                signals=[],
                featureRows=[
                    ("team_xg_avg_last_5", "1.78", "high", "rolling form"),
                    ("opp_xga_avg_last_5", "1.32", "high", "defense exposure"),
                ],
                oddsEvents=[
                    ("09:00", "Open", "2.02 / 3.22 / 3.85"),
                    ("18:10", "Current snapshot", "1.98 / 3.25 / 3.92"),
                ],
                sources=[
                    MatchLabSourceModel(name="lottery", freshness="2m", status="ready", copy="official issue aligned"),
                    MatchLabSourceModel(name="lineups", freshness="4m", status="ready", copy="predicted lineup stable"),
                ],
            ),
        }

    def get_command_center(self, issue_no: Optional[str], date: Optional[str], cutoff_type: str, include_alerts: bool) -> ServiceResult:
        warnings: List[str] = ["Lineups source delayed for 3 matches"]
        data = CommandCenterResponseData(
            context=_base_context(cutoff_type),
            actions=[
                ActionButton(label="导出今日队列", tone="ghost"),
                ActionButton(label="生成赛前快照", tone="primary"),
            ],
            queueMatches=[
                CommandCenterQueueMatch(
                    matchId="arsenal-liverpool",
                    issueMatchCode="24031-001",
                    displayTitle="Arsenal vs Liverpool",
                    metaLine="EPL · 18:30 · Handicap -0.5",
                    coverageLabel="阵容待确认",
                    coverageStatus="warning",
                    metrics=[
                        MetricTileModel(label="Ready", value="92%"),
                        MetricTileModel(label="Drift", value="-0.18"),
                        MetricTileModel(label="Lineup", value="9/11"),
                    ],
                    confidence=ConfidenceModel(score=74, label="中高信心", copy="赔率与滚动强度一致，但首发门将未锁定。"),
                ),
                CommandCenterQueueMatch(
                    matchId="milan-roma",
                    issueMatchCode="24031-002",
                    displayTitle="Milan vs Roma",
                    metaLine="Serie A · 19:00 · Handicap -0.25",
                    coverageLabel="可直接评估",
                    coverageStatus="ready",
                    metrics=[
                        MetricTileModel(label="Ready", value="97%"),
                        MetricTileModel(label="Drift", value="+0.07"),
                        MetricTileModel(label="Lineup", value="11/11"),
                    ],
                    confidence=ConfidenceModel(score=86, label="高信心", copy="数据覆盖完整，盘口与伤停方向统一。"),
                ),
            ],
            crawlHealth=[
                ("source freshness", "4 个源 < 5m"),
                ("parser failures", "2 个字段告警"),
                ("unresolved mappings", "3 场待复核"),
                ("snapshot lag", "lineups 平均 11m"),
            ],
            timeline=[
                ("18:30", "Arsenal vs Liverpool", "预计首发 80%，赔率波动中"),
                ("19:00", "Milan vs Roma", "数据完整，可直接入模"),
            ],
            warnings=[
                CommandCenterWarning(
                    title="Lineups source delayed",
                    copy="Arsenal vs Liverpool 的 confirmed lineup 尚未刷新，最后更新时间 18:09。",
                    tone="warning",
                ),
                CommandCenterWarning(
                    title="Coverage below threshold",
                    copy="当前只有 11/14 场满足入模规则，建议先处理未映射场次。",
                    tone="warning",
                ),
            ]
            if include_alerts
            else [],
        )
        return ServiceResult(data=data, stale=False, warnings=warnings)

    def get_match_lab(self, match_id: str, snapshot_type: str) -> ServiceResult:
        if match_id not in self._matches:
            raise match_not_found(match_id)

        data = self._matches[match_id].model_copy(deep=True)
        data.context.cutoffType = snapshot_type
        data.hero.snapshot = snapshot_type
        stale = match_id == "arsenal-liverpool"
        warnings = ["Confirmed lineup unavailable for selected cutoff"] if stale else []
        return ServiceResult(data=data, stale=stale, warnings=warnings)
