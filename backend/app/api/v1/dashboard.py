from typing import Optional

from fastapi import APIRouter, Query, Request

from app.core.http import success_response
from app.schemas.common import PredictionCutoffType
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/command-center")
def get_command_center(
    request: Request,
    issueNo: Optional[str] = Query(default=None),
    date: Optional[str] = Query(default=None),
    cutoffType: PredictionCutoffType = Query(default=PredictionCutoffType.KICKOFF_MINUS_90M),
    includeAlerts: bool = Query(default=True),
) -> dict:
    service: DashboardService = request.app.state.container.dashboard_service
    result = service.get_command_center(
        issue_no=issueNo,
        date=date,
        cutoff_type=cutoffType,
        include_alerts=includeAlerts,
    )
    return success_response(request=request, data=result.data, stale=result.stale, warnings=result.warnings)


@router.get("/matches/{matchId}/lab")
def get_match_lab(
    matchId: str,
    request: Request,
    snapshotType: PredictionCutoffType = Query(default=PredictionCutoffType.KICKOFF_MINUS_90M),
) -> dict:
    service: DashboardService = request.app.state.container.dashboard_service
    result = service.get_match_lab(match_id=matchId, snapshot_type=snapshotType)
    return success_response(request=request, data=result.data, stale=result.stale, warnings=result.warnings)
