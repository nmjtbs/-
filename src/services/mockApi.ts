import type {
  CommandCenterRequestQuery,
  CommandCenterResponse,
  MatchLabRequestQuery,
  MatchLabResponse,
} from "../api/contracts/dashboard";
import { rawCommandCenterResponse, rawMatchLabResponseById } from "../mocks/rawData";
import { resolveCutoffType } from "../routing/dashboardRoutes";

async function simulateLatency(delayMs = 120): Promise<void> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}

export async function fetchCommandCenterResponse(
  query?: CommandCenterRequestQuery,
): Promise<CommandCenterResponse> {
  await simulateLatency();
  if (!rawCommandCenterResponse.success) {
    return rawCommandCenterResponse;
  }

  const cutoffType =
    query?.cutoffType ?? rawCommandCenterResponse.data.context.cutoffType;
  return {
    ...rawCommandCenterResponse,
    data: {
      ...rawCommandCenterResponse.data,
      context: {
        ...rawCommandCenterResponse.data.context,
        cutoffType,
      },
    },
  };
}

export async function fetchMatchLabResponse(
  matchId: string,
  query?: MatchLabRequestQuery,
): Promise<MatchLabResponse> {
  await simulateLatency();
  const payload = rawMatchLabResponseById[matchId];
  if (!payload) {
    return {
      success: false,
      error: {
        code: "MATCH_NOT_FOUND",
        message: `Match payload not found for id: ${matchId}`,
      },
      meta: {
        requestId: `mock-match-lab-missing-${matchId}`,
        generatedAt: new Date().toISOString(),
        version: "v1",
        source: "mock",
        stale: false,
        warnings: [],
      },
    };
  }

  const cutoffType = resolveCutoffType(query?.snapshotType ?? null);
  if (!payload.success) {
    return payload;
  }

  return {
    ...payload,
    success: true,
    data: {
      ...payload.data,
      context: {
        ...payload.data.context,
        cutoffType,
      },
      hero: {
        ...payload.data.hero,
        snapshot: cutoffType,
      },
    },
  };
}
