import json
from pathlib import Path
from typing import Optional

from app.core.config import Settings
from app.core.errors import model_not_found
from app.repositories.interfaces import ModelArtifact, ModelRegistryRepository


class FileModelRegistryRepository(ModelRegistryRepository):
    def __init__(self, settings: Settings) -> None:
        self._registry_dir = settings.model_registry_dir

    def load_model_artifact(self, target: str, model_version: Optional[str]) -> ModelArtifact:
        version = model_version or "wdl-v1"
        metadata_path = self._registry_dir / f"{version}.metadata.json"
        if not metadata_path.exists():
            raise model_not_found(target, model_version)

        payload = json.loads(metadata_path.read_text(encoding="utf-8"))
        if payload["target"] != target:
            raise model_not_found(target, model_version)

        booster_path = payload.get("boosterPath")
        if booster_path:
            booster_path = str((metadata_path.parent / booster_path).resolve())

        return ModelArtifact(
            target=payload["target"],
            model_version=payload["modelVersion"],
            trained_at=payload["trainedAt"],
            feature_names=payload["featureNames"],
            class_labels=payload["classLabels"],
            booster_path=booster_path,
            fallback_probabilities=payload.get("fallbackProbabilities"),
        )
