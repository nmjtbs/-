from app.model_runtime.xgboost_runtime import XGBoostRuntime
from app.repositories.interfaces import (
    FeatureSnapshotRepository,
    ModelRegistryRepository,
    PredictionRecord,
    PredictionRepository,
    ServiceResult,
)
from app.schemas.predictions import PredictionProbabilityItem, PredictionRequest, PredictionResponseData, PredictionTarget
from app.core.errors import unsupported_target


class PredictionService:
    def __init__(
        self,
        *,
        feature_repo: FeatureSnapshotRepository,
        model_registry_repo: ModelRegistryRepository,
        prediction_repo: PredictionRepository,
        runtime: XGBoostRuntime,
    ) -> None:
        self._feature_repo = feature_repo
        self._model_registry_repo = model_registry_repo
        self._prediction_repo = prediction_repo
        self._runtime = runtime

    def predict_match(self, *, match_id: str, payload: PredictionRequest) -> ServiceResult:
        target = payload.targets[0] if payload.targets else PredictionTarget.WDL
        if target != PredictionTarget.WDL:
            raise unsupported_target(target.value)

        snapshot = self._feature_repo.get_feature_snapshot(match_id=match_id, cutoff_type=payload.cutoffType.value)
        artifact = self._model_registry_repo.load_model_artifact(target=target.value, model_version=payload.modelVersion)
        probabilities, runtime_warnings = self._runtime.predict_proba(snapshot, artifact)
        combined_warnings = list(snapshot.warnings) + runtime_warnings

        self._prediction_repo.save_prediction(
            PredictionRecord(
                match_id=match_id,
                cutoff_type=payload.cutoffType.value,
                target=target.value,
                model_version=artifact.model_version,
                feature_snapshot_id=snapshot.feature_snapshot_id,
                probabilities=probabilities,
            )
        )

        data = PredictionResponseData(
            matchId=match_id,
            cutoffType=payload.cutoffType,
            modelVersion=artifact.model_version,
            featureSnapshotId=snapshot.feature_snapshot_id,
            predictionGeneratedAt=self._runtime.generated_at(),
            target=target,
            probabilities=[
                PredictionProbabilityItem(label=label, value=round(probability, 4))
                for label, probability in zip(artifact.class_labels, probabilities)
            ],
            warnings=combined_warnings,
        )
        return ServiceResult(data=data, stale=snapshot.stale, warnings=combined_warnings)
