from dataclasses import dataclass

from fastapi import FastAPI

from app.api.router import router
from app.core.config import get_settings
from app.core.http import configure_http
from app.jobs.training_queue import InMemoryTrainingQueue
from app.jobs.rq_queue import RQTrainingQueue
from app.model_runtime.xgboost_runtime import XGBoostRuntime
from app.repositories.model_registry import FileModelRegistryRepository
from app.repositories.mock_dashboard import MockDashboardRepository
from app.repositories.mock_features import MockFeatureSnapshotRepository
from app.repositories.predictions import InMemoryPredictionRepository
from app.repositories.training import InMemoryTrainingRunStore, MockTrainingDatasetRepository
from app.services.dashboard_service import DashboardService
from app.services.prediction_service import PredictionService
from app.services.training_service import TrainingService


@dataclass
class AppContainer:
    dashboard_service: DashboardService
    prediction_service: PredictionService
    training_service: TrainingService


def create_container() -> AppContainer:
    settings = get_settings()
    dashboard_repo = MockDashboardRepository()
    feature_repo = MockFeatureSnapshotRepository()
    model_registry_repo = FileModelRegistryRepository(settings)
    prediction_repo = InMemoryPredictionRepository()
    dataset_repo = MockTrainingDatasetRepository()
    run_store = InMemoryTrainingRunStore()
    queue = RQTrainingQueue(redis_url=settings.redis_url) if settings.training_queue_backend == "rq" else InMemoryTrainingQueue()
    runtime = XGBoostRuntime()

    return AppContainer(
        dashboard_service=DashboardService(dashboard_repo),
        prediction_service=PredictionService(
            feature_repo=feature_repo,
            model_registry_repo=model_registry_repo,
            prediction_repo=prediction_repo,
            runtime=runtime,
        ),
        training_service=TrainingService(
            dataset_repo=dataset_repo,
            run_store=run_store,
            queue=queue,
        ),
    )


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version=settings.api_version)
    app.state.container = create_container()
    configure_http(app)
    app.include_router(router)
    return app


app = create_app()
