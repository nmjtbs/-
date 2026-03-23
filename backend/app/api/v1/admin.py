from fastapi import APIRouter, Request

from app.core.http import success_response
from app.schemas.training import TrainingRunCreateRequest
from app.services.training_service import TrainingService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/training-runs")
def create_training_run(payload: TrainingRunCreateRequest, request: Request) -> dict:
    service: TrainingService = request.app.state.container.training_service
    result = service.create_training_run(payload)
    return success_response(request=request, data=result.data, stale=False, warnings=result.warnings)


@router.get("/training-runs/{runId}")
def get_training_run(runId: str, request: Request) -> dict:
    service: TrainingService = request.app.state.container.training_service
    result = service.get_training_run(runId)
    return success_response(request=request, data=result.data, stale=False, warnings=result.warnings)
