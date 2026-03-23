from typing import Dict

from app.jobs.training_queue import TrainingQueue


class RQTrainingQueue(TrainingQueue):
    def __init__(self, redis_url: str = "redis://localhost:6379/0") -> None:
        self.redis_url = redis_url

    def enqueue(self, run_id: str, payload: Dict) -> None:
        try:
            from redis import Redis
            from rq import Queue
        except ModuleNotFoundError as exc:
            raise RuntimeError("RQ queue backend is not installed.") from exc

        connection = Redis.from_url(self.redis_url)
        queue = Queue("training", connection=connection)
        queue.enqueue("app.jobs.worker.execute_training_job", run_id=run_id, payload=payload)
