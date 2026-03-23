import uuid
from datetime import datetime, timezone

from app.jobs.training_queue import TrainingQueue
from app.repositories.interfaces import ServiceResult, TrainingDatasetRepository, TrainingRunStore
from app.schemas.training import TrainingRunCreateRequest, TrainingRunStatus, TrainingRunStatusResponse


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class TrainingService:
    def __init__(
        self,
        *,
        dataset_repo: TrainingDatasetRepository,
        run_store: TrainingRunStore,
        queue: TrainingQueue,
    ) -> None:
        self._dataset_repo = dataset_repo
        self._run_store = run_store
        self._queue = queue

    def create_training_run(self, payload: TrainingRunCreateRequest) -> ServiceResult:
        run_id = str(uuid.uuid4())
        warnings = self._dataset_repo.validate_dataset_request(
            target=payload.target,
            date_range=payload.dateRange,
            feature_set_version=payload.featureSetVersion,
        )
        run = TrainingRunStatusResponse(
            runId=run_id,
            status=TrainingRunStatus.QUEUED,
            target=payload.target,
            cutoffType=payload.cutoffType,
            featureSetVersion=payload.featureSetVersion,
            dateRange=payload.dateRange,
            warnings=warnings,
            queuedAt=_utcnow_iso(),
        )
        self._run_store.create(run)
        self._queue.enqueue(
            run_id,
            {
                "target": payload.target.value,
                "cutoffType": payload.cutoffType.value,
                "dateRange": payload.dateRange.model_dump(),
                "featureSetVersion": payload.featureSetVersion,
            },
        )
        return ServiceResult(data=run, stale=False, warnings=warnings)

    def get_training_run(self, run_id: str) -> ServiceResult:
        run = self._run_store.get(run_id)
        return ServiceResult(data=run, stale=False, warnings=run.warnings)
