import type { PredictionCutoffType } from "../api/contracts/dashboard";

export const DEFAULT_CUTOFF_TYPE: PredictionCutoffType = "kickoff_minus_90m";
export const FALLBACK_MATCH_ID = "arsenal-liverpool";

const VALID_CUTOFF_TYPES: PredictionCutoffType[] = [
  "sale_time",
  "stop_time",
  "kickoff_minus_90m",
  "confirmed_lineup",
];

export function isPredictionCutoffType(
  value: string | null,
): value is PredictionCutoffType {
  if (!value) {
    return false;
  }
  return VALID_CUTOFF_TYPES.includes(value as PredictionCutoffType);
}

export function resolveCutoffType(
  value: string | null,
): PredictionCutoffType {
  return isPredictionCutoffType(value) ? value : DEFAULT_CUTOFF_TYPE;
}

export function buildMatchLabPath(
  matchId: string,
  cutoffType: PredictionCutoffType = DEFAULT_CUTOFF_TYPE,
): string {
  return `/match-lab/${matchId}?cutoffType=${cutoffType}`;
}
