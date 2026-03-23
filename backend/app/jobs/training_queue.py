from abc import ABC, abstractmethod
from typing import Dict, List


class TrainingQueue(ABC):
    @abstractmethod
    def enqueue(self, run_id: str, payload: Dict) -> None:
        raise NotImplementedError


class InMemoryTrainingQueue(TrainingQueue):
    def __init__(self) -> None:
        self.jobs: List[Dict] = []

    def enqueue(self, run_id: str, payload: Dict) -> None:
        self.jobs.append({"runId": run_id, "payload": payload})
