from fastapi import APIRouter, Request

from app.core.http import success_response
from app.schemas.predictions import PredictionRequest
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.post("/matches/{matchId}")
def predict_match(matchId: str, payload: PredictionRequest, request: Request) -> dict:
    service: PredictionService = request.app.state.container.prediction_service
    result = service.predict_match(match_id=matchId, payload=payload)
    return success_response(request=request, data=result.data, stale=result.stale, warnings=result.warnings)
