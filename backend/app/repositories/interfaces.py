from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from app.schemas.dashboard import CommandCenterResponseData, MatchLabResponseData
from app.schemas.predictions import PredictionTarget
from app.schemas.training import DateRangeModel, TrainingRunStatus, TrainingRunStatusResponse


@dataclass
class ServiceResult:
    data: object
    stale: bool = False
    warnings: List[str] = field(default_factory=list)


@dataclass
class FeatureSnapshot:
    feature_snapshot_id: str
    match_id: str
    cutoff_type: str
    features: Dict[str, float]
    stale: bool = False
    warnings: List[str] = field(default_factory=list)


@dataclass
class ModelArtifact:
    target: str
    model_version: str
    trained_at: str
    feature_names: List[str]
    class_labels: List[str]
    booster_path: Optional[str] = None
    fallback_probabilities: Optional[List[float]] = None


@dataclass
class PredictionRecord:
    match_id: str
    cutoff_type: str
    target: str
    model_version: str
    feature_snapshot_id: str
    probabilities: List[float]


class DashboardReadRepository(ABC):
    @abstractmethod
    def get_command_center(self, issue_no: Optional[str], date: Optional[str], cutoff_type: str, include_alerts: bool) -> ServiceResult:
        raise NotImplementedError

    @abstractmethod
    def get_match_lab(self, match_id: str, snapshot_type: str) -> ServiceResult:
        raise NotImplementedError


class FeatureSnapshotRepository(ABC):
    @abstractmethod
    def get_feature_snapshot(self, match_id: str, cutoff_type: str) -> FeatureSnapshot:
        raise NotImplementedError


class PredictionRepository(ABC):
    @abstractmethod
    def save_prediction(self, record: PredictionRecord) -> None:
        raise NotImplementedError


class TrainingDatasetRepository(ABC):
    @abstractmethod
    def validate_dataset_request(self, target: PredictionTarget, date_range: DateRangeModel, feature_set_version: str) -> List[str]:
        raise NotImplementedError


class ModelRegistryRepository(ABC):
    @abstractmethod
    def load_model_artifact(self, target: str, model_version: Optional[str]) -> ModelArtifact:
        raise NotImplementedError


class TrainingRunStore(ABC):
    @abstractmethod
    def create(self, run: TrainingRunStatusResponse) -> None:
        raise NotImplementedError

    @abstractmethod
    def get(self, run_id: str) -> TrainingRunStatusResponse:
        raise NotImplementedError

    @abstractmethod
    def update_status(self, run_id: str, status: TrainingRunStatus, *, error: Optional[str] = None) -> TrainingRunStatusResponse:
        raise NotImplementedError
