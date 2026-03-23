from typing import Dict, List, Optional

from app.core.errors import training_run_not_found
from app.repositories.interfaces import TrainingDatasetRepository, TrainingRunStore
from app.schemas.predictions import PredictionTarget
from app.schemas.training import DateRangeModel, TrainingRunStatus, TrainingRunStatusResponse


class MockTrainingDatasetRepository(TrainingDatasetRepository):
    def validate_dataset_request(self, target: PredictionTarget, date_range: DateRangeModel, feature_set_version: str) -> List[str]:
        warnings: List[str] = []
        if feature_set_version != "v1":
            warnings.append("Feature set version is not the default v1 baseline.")
        return warnings


class InMemoryTrainingRunStore(TrainingRunStore):
    def __init__(self) -> None:
        self._runs: Dict[str, TrainingRunStatusResponse] = {}

    def create(self, run: TrainingRunStatusResponse) -> None:
        self._runs[run.runId] = run

    def get(self, run_id: str) -> TrainingRunStatusResponse:
        run = self._runs.get(run_id)
        if run is None:
            raise training_run_not_found(run_id)
        return run

    def update_status(self, run_id: str, status: TrainingRunStatus, *, error: Optional[str] = None) -> TrainingRunStatusResponse:
        run = self.get(run_id)
        run.status = status
        run.error = error
        self._runs[run_id] = run
        return run
