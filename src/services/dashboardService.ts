import type { ApiMeta } from "../api/contracts/common";
import type {
  CommandCenterRequestQuery,
  DashboardContextContract,
  MatchLabRequestQuery,
} from "../api/contracts/dashboard";
import { adaptCommandCenterPayload, adaptMatchLabPayload } from "../adapters/dashboardAdapters";
import { fetchCommandCenterResponse, fetchMatchLabResponse } from "./mockApi";
import { ApiRequestError } from "./errors";
import type { CommandCenterViewModel, MatchLabViewModel } from "../types/models";

export interface PageModelResult<TViewModel> {
  viewModel: TViewModel;
  context: DashboardContextContract;
  meta: ApiMeta;
}

export async function getCommandCenterPageModel(
  query?: CommandCenterRequestQuery,
): Promise<PageModelResult<CommandCenterViewModel>> {
  const response = await fetchCommandCenterResponse(query);
  if (!response.success) {
    throw new ApiRequestError({
      code: response.error.code,
      message: response.error.message,
      requestId: response.meta.requestId,
      details: response.error.details,
    });
  }

  return {
    viewModel: adaptCommandCenterPayload(response.data),
    context: response.data.context,
    meta: response.meta,
  };
}

export async function getMatchLabPageModel(
  matchId: string,
  query?: MatchLabRequestQuery,
): Promise<PageModelResult<MatchLabViewModel>> {
  const response = await fetchMatchLabResponse(matchId, query);
  if (!response.success) {
    throw new ApiRequestError({
      code: response.error.code,
      message: response.error.message,
      requestId: response.meta.requestId,
      details: response.error.details,
    });
  }

  return {
    viewModel: adaptMatchLabPayload(response.data),
    context: response.data.context,
    meta: response.meta,
  };
}
