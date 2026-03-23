from typing import List, Tuple

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import ActionButton, ConfidenceModel, CoverageBadge, MetricTileModel, PredictionCutoffType


class DashboardContext(BaseModel):
    date: str
    issueNo: str
    competition: str
    cutoffTime: str
    cutoffType: PredictionCutoffType
    coverageSummary: str
    alertCount: int


class CommandCenterWarning(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str
    copyText: str = Field(alias="copy")
    tone: str


class CommandCenterQueueMatch(BaseModel):
    matchId: str
    issueMatchCode: str
    displayTitle: str
    metaLine: str
    coverageLabel: str
    coverageStatus: str
    metrics: List[MetricTileModel]
    confidence: ConfidenceModel


class CommandCenterResponseData(BaseModel):
    context: DashboardContext
    actions: List[ActionButton]
    queueMatches: List[CommandCenterQueueMatch]
    crawlHealth: List[Tuple[str, str]]
    timeline: List[Tuple[str, str, str]]
    warnings: List[CommandCenterWarning]


class MatchLabHeroModel(BaseModel):
    issue: str
    subtitle: str
    title: str
    handicap: str
    snapshot: str
    confidence: str
    scoreline: str
    scoreCopy: str
    metrics: List[MetricTileModel]


class MatchLabSignalModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str
    value: str
    copyText: str = Field(alias="copy")
    badge: CoverageBadge


class MatchLabProbabilityItem(BaseModel):
    label: str
    value: float


class MatchLabProbabilityModel(BaseModel):
    summary: str
    items: List[MatchLabProbabilityItem]
    confidence: ConfidenceModel


class MatchLabLineupModel(BaseModel):
    predicted: str
    confirmed: str
    absences: List[str]


class MatchLabSourceModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    freshness: str
    status: str
    copyText: str = Field(alias="copy")


class MatchLabResponseData(BaseModel):
    context: DashboardContext
    matchId: str
    actions: List[ActionButton]
    hero: MatchLabHeroModel
    probability: MatchLabProbabilityModel
    lineup: MatchLabLineupModel
    signals: List[MatchLabSignalModel]
    featureRows: List[Tuple[str, str, str, str]]
    oddsEvents: List[Tuple[str, str, str]]
    sources: List[MatchLabSourceModel]
