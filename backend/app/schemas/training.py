from enum import Enum
from typing import List, Optional

from pydantic import BaseModel

from app.schemas.common import PredictionCutoffType
from app.schemas.predictions import PredictionTarget


class DateRangeModel(BaseModel):
    startDate: str
    endDate: str


class TrainingRunStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


class TrainingRunCreateRequest(BaseModel):
    target: PredictionTarget
    cutoffType: PredictionCutoffType
    dateRange: DateRangeModel
    featureSetVersion: str


class TrainingRunStatusResponse(BaseModel):
    runId: str
    status: TrainingRunStatus
    target: PredictionTarget
    cutoffType: PredictionCutoffType
    featureSetVersion: str
    dateRange: DateRangeModel
    warnings: List[str]
    queuedAt: str
    startedAt: Optional[str] = None
    finishedAt: Optional[str] = None
    error: Optional[str] = None
