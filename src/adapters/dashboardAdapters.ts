import type {
  CommandCenterResponseData,
  MatchLabResponseData,
} from "../api/contracts/dashboard";
import type {
  CommandCenterViewModel,
  MatchLabViewModel,
} from "../types/models";

export function adaptCommandCenterPayload(
  payload: CommandCenterResponseData,
): CommandCenterViewModel {
  return {
    headerActions: payload.actions,
    queueMatches: payload.queueMatches.map((match) => ({
      id: match.matchId,
      issue: match.issueMatchCode,
      title: match.displayTitle,
      subtitle: match.metaLine,
      coverage: {
        label: match.coverageLabel,
        status: match.coverageStatus,
      },
      metrics: match.metrics,
      confidence: match.confidence,
    })),
    crawlHealth: payload.crawlHealth,
    timeline: payload.timeline,
    warnings: payload.warnings,
  };
}

export function adaptMatchLabPayload(payload: MatchLabResponseData): MatchLabViewModel {
  return {
    id: payload.matchId,
    headerActions: payload.actions,
    hero: payload.hero,
    probability: payload.probability,
    lineup: payload.lineup,
    signals: payload.signals,
    featureRows: payload.featureRows,
    oddsEvents: payload.oddsEvents,
    sources: payload.sources,
  };
}
