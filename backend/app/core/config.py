import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    app_name: str
    app_env: str
    api_version: str
    model_registry_dir: Path
    training_queue_backend: str
    redis_url: str


def get_settings() -> Settings:
    project_root = Path(__file__).resolve().parents[2]
    return Settings(
        app_name="football-intelligence-backend",
        app_env=os.getenv("APP_ENV", "local"),
        api_version="v1",
        model_registry_dir=Path(os.getenv("MODEL_REGISTRY_DIR", str(project_root / "models" / "mock"))),
        training_queue_backend=os.getenv("TRAINING_QUEUE_BACKEND", "memory"),
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    )
