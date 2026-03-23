export type CoverageStatus = "ready" | "warning" | "risk";
export type ButtonTone = "primary" | "ghost";

export interface ActionButton {
  label: string;
  tone: ButtonTone;
}

export interface CoverageIndicator {
  label: string;
  status: CoverageStatus;
}

export interface ConfidenceModel {
  score: number;
  label: string;
  copy: string;
}

export interface MetricTileModel {
  label: string;
  value: string;
}

export interface QueueMatchViewModel {
  id: string;
  issue: string;
  title: string;
  subtitle: string;
  coverage: CoverageIndicator;
  metrics: MetricTileModel[];
  confidence: ConfidenceModel;
}

export interface CommandCenterViewModel {
  headerActions: ActionButton[];
  queueMatches: QueueMatchViewModel[];
  crawlHealth: Array<[string, string]>;
  timeline: Array<[string, string, string]>;
  warnings: Array<{
    title: string;
    copy: string;
    tone: "warning" | "danger";
  }>;
}

export interface MatchLabHeroModel {
  issue: string;
  subtitle: string;
  title: string;
  handicap: string;
  snapshot: string;
  confidence: string;
  scoreline: string;
  scoreCopy: string;
  metrics: MetricTileModel[];
}

export interface MatchLabSignalModel {
  title: string;
  value: string;
  copy: string;
  badge: CoverageIndicator;
}

export interface MatchLabViewModel {
  id: string;
  headerActions: ActionButton[];
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

export interface AppContextModel {
  date: string;
  issue: string;
  competition: string;
  cutoff: string;
  coverage: string;
  alerts: number;
}

export interface LoadStateModel {
  type: "loading" | "error" | "empty" | "not-found";
  message: string;
  requestId?: string;
}

export interface NavItemModel {
  id: "command-center" | "match-lab";
  label: string;
  copy: string;
}
