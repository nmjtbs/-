from datetime import datetime, timezone
from typing import List, Tuple

from app.core.errors import feature_validation_failed, model_not_found
from app.repositories.interfaces import FeatureSnapshot, ModelArtifact


class XGBoostRuntime:
    def _ordered_feature_vector(self, snapshot: FeatureSnapshot, artifact: ModelArtifact) -> List[float]:
        missing = [feature_name for feature_name in artifact.feature_names if feature_name not in snapshot.features]
        if missing:
            raise feature_validation_failed(missing)
        return [float(snapshot.features[feature_name]) for feature_name in artifact.feature_names]

    def predict_proba(self, snapshot: FeatureSnapshot, artifact: ModelArtifact) -> Tuple[List[float], List[str]]:
        self._ordered_feature_vector(snapshot, artifact)

        if artifact.booster_path:
            try:
                import xgboost as xgb
            except ModuleNotFoundError:
                if artifact.fallback_probabilities is not None:
                    return artifact.fallback_probabilities, ["xgboost package unavailable; served registry fallback probabilities."]
                raise model_not_found(artifact.target, artifact.model_version)

            booster = xgb.Booster()
            booster.load_model(artifact.booster_path)
            matrix = xgb.DMatrix([self._ordered_feature_vector(snapshot, artifact)], feature_names=artifact.feature_names)
            result = booster.predict(matrix)
            probabilities = [float(value) for value in result[0]]
            return probabilities, []

        if artifact.fallback_probabilities is not None:
            return artifact.fallback_probabilities, ["No booster file registered yet; served fallback probabilities from model registry metadata."]

        raise model_not_found(artifact.target, artifact.model_version)

    @staticmethod
    def generated_at() -> str:
        return datetime.now(timezone.utc).isoformat()
