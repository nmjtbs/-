from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.common import PredictionCutoffType


class PredictionTarget(str, Enum):
    WDL = "wdl"
    HANDICAP = "handicap"
    TOTAL_GOALS = "total_goals"


class PredictionProbabilityItem(BaseModel):
    label: str
    value: float


class PredictionRequest(BaseModel):
    cutoffType: PredictionCutoffType
    modelVersion: Optional[str] = None
    targets: List[PredictionTarget] = Field(default_factory=lambda: [PredictionTarget.WDL])


class PredictionResponseData(BaseModel):
    matchId: str
    cutoffType: PredictionCutoffType
    modelVersion: str
    featureSnapshotId: str
    predictionGeneratedAt: str
    target: PredictionTarget
    probabilities: List[PredictionProbabilityItem]
    warnings: List[str]
