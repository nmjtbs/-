from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.predictions import router as predictions_router

router = APIRouter()


@router.get("/healthz", tags=["system"])
def healthcheck() -> dict:
    return {"ok": True}


api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(predictions_router)
api_v1_router.include_router(admin_router)

router.include_router(api_v1_router)
