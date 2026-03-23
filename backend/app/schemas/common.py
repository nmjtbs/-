from enum import Enum
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class ApiSource(str, Enum):
    MOCK = "mock"
    BACKEND = "backend"


class PredictionCutoffType(str, Enum):
    SALE_TIME = "sale_time"
    STOP_TIME = "stop_time"
    KICKOFF_MINUS_90M = "kickoff_minus_90m"
    CONFIRMED_LINEUP = "confirmed_lineup"


class ApiMeta(BaseModel):
    requestId: str
    generatedAt: str
    version: str
    source: ApiSource
    stale: bool
    warnings: List[str]


class ApiErrorBody(BaseModel):
    code: str
    message: str
    details: Optional[List[str]] = None


class ApiSuccessResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    success: bool
    data: T
    meta: ApiMeta


class ApiErrorResponse(BaseModel):
    success: bool
    error: ApiErrorBody
    meta: ApiMeta


class ActionButton(BaseModel):
    label: str
    tone: str


class ConfidenceModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    score: int
    label: str
    copyText: str = Field(alias="copy")


class MetricTileModel(BaseModel):
    label: str
    value: str


class CoverageBadge(BaseModel):
    label: str
    status: str
