import type {
  ActionButton,
  ConfidenceModel,
  CoverageStatus,
  MatchLabHeroModel,
  MatchLabSignalModel,
  MetricTileModel,
} from "../../types/models";
import type { ApiResponse } from "./common";

export type PredictionCutoffType =
  | "sale_time"
  | "stop_time"
  | "kickoff_minus_90m"
  | "confirmed_lineup";

export interface DashboardContextContract {
  date: string;
  issueNo: string;
  competition: string;
  cutoffTime: string;
  cutoffType: PredictionCutoffType;
  coverageSummary: string;
  alertCount: number;
}

export interface CommandCenterRequestQuery {
  issueNo?: string;
  date?: string;
  cutoffType?: PredictionCutoffType;
  includeAlerts?: boolean;
}

export interface CommandCenterQueueMatchContract {
  matchId: string;
  issueMatchCode: string;
  displayTitle: string;
  metaLine: string;
  coverageLabel: string;
  coverageStatus: CoverageStatus;
  metrics: MetricTileModel[];
  confidence: ConfidenceModel;
}

export interface CommandCenterResponseData {
  context: DashboardContextContract;
  actions: ActionButton[];
  queueMatches: CommandCenterQueueMatchContract[];
  crawlHealth: Array<[string, string]>;
  timeline: Array<[string, string, string]>;
  warnings: Array<{
    title: string;
    copy: string;
    tone: "warning" | "danger";
  }>;
}

export type CommandCenterResponse = ApiResponse<CommandCenterResponseData>;

export interface MatchLabRequestQuery {
  snapshotType?: PredictionCutoffType;
}

export interface MatchLabResponseData {
  context: DashboardContextContract;
  matchId: string;
  actions: ActionButton[];
  hero: MatchLabHeroModel;
  probability: {
    summary: string;
    items: Array<{ label: string; value: number }>;
    confidence: ConfidenceModel;
  };
  lineup: {
    predicted: string;
    confirmed: string;
    absences: string[];
  };
  signals: MatchLabSignalModel[];
  featureRows: Array<[string, string, string, string]>;
  oddsEvents: Array<[string, string, string]>;
  sources: Array<{
    name: string;
    freshness: string;
    status: CoverageStatus;
    copy: string;
  }>;
}

export type MatchLabResponse = ApiResponse<MatchLabResponseData>;
