import type {
  AppContextModel,
  NavItemModel,
} from "../types/models";
import type {
  CommandCenterResponse,
  MatchLabResponseData,
  MatchLabResponse,
  PredictionCutoffType,
} from "../api/contracts/dashboard";

export const appContext: AppContextModel = {
  date: "2026-03-22",
  issue: "24031",
  competition: "竞彩精选",
  cutoff: "19:35",
  coverage: "11/14 场可评估",
  alerts: 3,
};

export const navItems: NavItemModel[] = [
  {
    id: "command-center",
    label: "Command Center",
    copy: "今日决策台与停售节奏",
  },
  {
    id: "match-lab",
    label: "Match Lab",
    copy: "单场证据、赔率与模型",
  },
];

const mockMeta = {
  requestId: "mock-request-001",
  generatedAt: "2026-03-22T11:15:00Z",
  version: "v1" as const,
  source: "mock" as const,
  stale: false,
  warnings: ["Lineups source delayed for 3 matches"],
};

export const rawCommandCenterResponse: CommandCenterResponse = {
  success: true,
  meta: mockMeta,
  data: {
    context: {
      date: appContext.date,
      issueNo: appContext.issue,
      competition: appContext.competition,
      cutoffTime: appContext.cutoff,
      cutoffType: "kickoff_minus_90m",
      coverageSummary: appContext.coverage,
      alertCount: appContext.alerts,
    },
    actions: [
      { label: "导出今日队列", tone: "ghost" },
      { label: "生成赛前快照", tone: "primary" },
    ],
    queueMatches: [
      {
        matchId: "arsenal-liverpool",
        issueMatchCode: "24031-001",
        displayTitle: "Arsenal vs Liverpool",
        metaLine: "EPL · 18:30 · Handicap -0.5",
        coverageLabel: "阵容待确认",
        coverageStatus: "warning",
        metrics: [
          { label: "Ready", value: "92%" },
          { label: "Drift", value: "-0.18" },
          { label: "Lineup", value: "9/11" },
        ],
        confidence: {
          score: 74,
          label: "中高信心",
          copy: "赔率与滚动强度一致，但首发门将未锁定。",
        },
      },
      {
        matchId: "milan-roma",
        issueMatchCode: "24031-002",
        displayTitle: "Milan vs Roma",
        metaLine: "Serie A · 19:00 · Handicap -0.25",
        coverageLabel: "可直接评估",
        coverageStatus: "ready",
        metrics: [
          { label: "Ready", value: "97%" },
          { label: "Drift", value: "+0.07" },
          { label: "Lineup", value: "11/11" },
        ],
        confidence: {
          score: 86,
          label: "高信心",
          copy: "数据覆盖完整，盘口与伤停方向统一。",
        },
      },
      {
        matchId: "dortmund-bayern",
        issueMatchCode: "24031-003",
        displayTitle: "Dortmund vs Bayern",
        metaLine: "Bundesliga · 19:35 · Handicap +0.25",
        coverageLabel: "映射待复核",
        coverageStatus: "risk",
        metrics: [
          { label: "Ready", value: "68%" },
          { label: "Drift", value: "-0.29" },
          { label: "Lineup", value: "7/11" },
        ],
        confidence: {
          score: 58,
          label: "谨慎",
          copy: "实体映射与 odds 快照存在冲突，需要人工复核。",
        },
      },
    ],
    crawlHealth: [
      ["source freshness", "4 个源 < 5m"],
      ["parser failures", "2 个字段告警"],
      ["unresolved mappings", "3 场待复核"],
      ["snapshot lag", "lineups 平均 11m"],
    ],
    timeline: [
      ["18:30", "Arsenal vs Liverpool", "预计首发 80%，赔率波动中"],
      ["19:00", "Milan vs Roma", "数据完整，可直接入模"],
      ["19:35", "Dortmund vs Bayern", "match mapping 低置信度"],
    ],
    warnings: [
      {
        title: "Lineups source delayed",
        copy: "Arsenal vs Liverpool 的 confirmed lineup 尚未刷新，最后更新时间 18:09。",
        tone: "warning",
      },
      {
        title: "Entity mapping conflict",
        copy: "Dortmund vs Bayern 的 lottery 映射和 odds source kickoff time 不一致。",
        tone: "danger",
      },
      {
        title: "Coverage below threshold",
        copy: "当前只有 11/14 场满足入模规则，建议先处理未映射场次。",
        tone: "warning",
      },
    ],
  },
};

function createMatchLabResponse(
  generatedAt: string,
  cutoffType: PredictionCutoffType,
  data: Omit<MatchLabResponseData, "context">,
): MatchLabResponse {
  return {
    success: true,
    meta: {
      ...mockMeta,
      requestId: `mock-match-lab-${data.matchId}`,
      generatedAt,
      stale: data.matchId === "arsenal-liverpool",
      warnings:
        data.matchId === "arsenal-liverpool"
          ? ["Confirmed lineup unavailable for selected cutoff"]
          : [],
    },
    data: {
      context: {
        date: appContext.date,
        issueNo: appContext.issue,
        competition: appContext.competition,
        cutoffTime: appContext.cutoff,
        cutoffType,
        coverageSummary: appContext.coverage,
        alertCount: appContext.alerts,
      },
      ...data,
    },
  };
}

export const rawMatchLabResponseById: Record<string, MatchLabResponse> = {
  "arsenal-liverpool": createMatchLabResponse("2026-03-22T11:16:00Z", "kickoff_minus_90m", {
    matchId: "arsenal-liverpool",
    actions: [
      { label: "切换到历史对照", tone: "ghost" },
      { label: "导出单场报告", tone: "primary" },
    ],
    hero: {
      issue: "24031-001",
      subtitle: "EPL · 2026-03-22 18:30 · Emirates Stadium",
      title: "Arsenal vs Liverpool",
      handicap: "-0.5",
      snapshot: "kickoff_minus_90m",
      confidence: "B+",
      scoreline: "52 27 21",
      scoreCopy: "胜 / 平 / 负 模型分布",
      metrics: [
        { label: "Attack Delta", value: "+0.43" },
        { label: "Lineup Stability", value: "78%" },
        { label: "Odds Drift", value: "-0.18" },
      ],
    },
    probability: {
      summary:
        "市场与模型同向，但门将状态和最后一条伤停仍在影响风险折扣。",
      items: [
        { label: "Home Win", value: 52 },
        { label: "Draw", value: 27 },
        { label: "Away Win", value: 21 },
      ],
      confidence: {
        score: 74,
        label: "中高信心",
        copy: "可用于候选单，但不建议忽略阵容最终确认。",
      },
    },
    lineup: {
      predicted:
        "Raya / White, Saliba, Gabriel, Zinchenko / Rice, Odegaard, Havertz / Saka, Jesus, Martinelli",
      confirmed: "待官方首发",
      absences: [
        "首发门将状态待确认",
        "主力中卫负荷偏高",
        "替补边锋伤停，轮换深度下降",
      ],
    },
    signals: [
      {
        title: "Attack vs Defense",
        value: "+0.43",
        copy: "主队过去 5 场射正与客队被射正均值形成正向剪刀差。",
        badge: { label: "positive", status: "ready" },
      },
      {
        title: "Rest / Fatigue",
        value: "2d",
        copy: "双方赛程密度接近，但客队旅途更长，疲劳略高。",
        badge: { label: "balanced", status: "warning" },
      },
      {
        title: "Lineup Stability",
        value: "78%",
        copy: "主队预计首发中有 8 人连续两场保持稳定。",
        badge: { label: "watch", status: "warning" },
      },
    ],
    featureRows: [
      ["team_shots_on_target_avg_last_5", "6.2", "high", "rolling form"],
      ["opp_shots_on_target_faced_avg_last_5", "4.1", "medium", "defense exposure"],
      ["rest_days_delta", "+1", "medium", "schedule"],
      ["missing_starting_goalkeeper_flag", "1", "critical", "availability"],
      ["closing_odds_delta", "-0.18", "high", "market"],
    ],
    oddsEvents: [
      ["09:00", "Open", "1.91 / 3.50 / 4.10"],
      ["14:15", "Home shortens", "1.84 / 3.60 / 4.35"],
      ["17:40", "Goalkeeper rumor", "1.88 / 3.56 / 4.22"],
      ["18:05", "Current snapshot", "1.86 / 3.54 / 4.28"],
    ],
    sources: [
      {
        name: "lottery",
        freshness: "2m",
        status: "ready",
        copy: "issue, seq, handicap, official schedule",
      },
      {
        name: "odds",
        freshness: "1m",
        status: "ready",
        copy: "1x2, asian handicap, over/under",
      },
      {
        name: "lineups",
        freshness: "19m",
        status: "warning",
        copy: "predicted XI only, confirmed missing",
      },
      {
        name: "stats",
        freshness: "4m",
        status: "ready",
        copy: "team rolling form and player minutes",
      },
    ],
  }),
  "milan-roma": createMatchLabResponse("2026-03-22T11:17:00Z", "kickoff_minus_90m", {
    matchId: "milan-roma",
    actions: [
      { label: "切换到历史对照", tone: "ghost" },
      { label: "导出单场报告", tone: "primary" },
    ],
    hero: {
      issue: "24031-002",
      subtitle: "Serie A · 2026-03-22 19:00 · San Siro",
      title: "Milan vs Roma",
      handicap: "-0.25",
      snapshot: "kickoff_minus_90m",
      confidence: "A-",
      scoreline: "46 31 23",
      scoreCopy: "胜 / 平 / 负 模型分布",
      metrics: [
        { label: "Attack Delta", value: "+0.22" },
        { label: "Lineup Stability", value: "88%" },
        { label: "Odds Drift", value: "+0.07" },
      ],
    },
    probability: {
      summary: "主队略占优，且盘口和阵容稳定性支持这一判断。",
      items: [
        { label: "Home Win", value: 46 },
        { label: "Draw", value: 31 },
        { label: "Away Win", value: 23 },
      ],
      confidence: {
        score: 82,
        label: "高信心",
        copy: "阵容、盘口与近期状态在同一方向上强化主队优势。",
      },
    },
    lineup: {
      predicted:
        "Maignan / Calabria, Tomori, Thiaw, Hernandez / Reijnders, Bennacer / Pulisic, Loftus-Cheek, Leao / Giroud",
      confirmed: "已确认首发",
      absences: ["替补中锋出战成疑", "轮换边后卫停赛 1 场"],
    },
    signals: [
      {
        title: "Attack vs Defense",
        value: "+0.22",
        copy: "主队机会创造强于客队近 5 场防线承压水平。",
        badge: { label: "positive", status: "ready" },
      },
      {
        title: "Rest / Fatigue",
        value: "3d",
        copy: "主队休息时间略优，没有明显赛程负担。",
        badge: { label: "stable", status: "ready" },
      },
      {
        title: "Lineup Stability",
        value: "88%",
        copy: "核心 11 人近 3 场延续性很高。",
        badge: { label: "strong", status: "ready" },
      },
    ],
    featureRows: [
      ["team_xg_avg_last_5", "1.74", "high", "rolling form"],
      ["opp_xga_avg_last_5", "1.38", "medium", "defense exposure"],
      ["rest_days_delta", "+1", "medium", "schedule"],
      ["missing_top_scorer_flag", "0", "high", "availability"],
      ["market_consensus_delta", "+0.07", "medium", "market"],
    ],
    oddsEvents: [
      ["09:15", "Open", "2.08 / 3.18 / 3.72"],
      ["13:10", "Roma money", "2.12 / 3.14 / 3.60"],
      ["17:20", "Lineup confirms", "2.05 / 3.20 / 3.84"],
      ["18:20", "Current snapshot", "2.03 / 3.22 / 3.92"],
    ],
    sources: [
      {
        name: "lottery",
        freshness: "1m",
        status: "ready",
        copy: "issue, seq, handicap, official schedule",
      },
      {
        name: "odds",
        freshness: "1m",
        status: "ready",
        copy: "1x2, asian handicap, over/under",
      },
      {
        name: "lineups",
        freshness: "2m",
        status: "ready",
        copy: "confirmed XI loaded",
      },
      {
        name: "stats",
        freshness: "3m",
        status: "ready",
        copy: "team rolling form and player minutes",
      },
    ],
  }),
};
