from typing import List

from app.repositories.interfaces import PredictionRecord, PredictionRepository


class InMemoryPredictionRepository(PredictionRepository):
    def __init__(self) -> None:
        self.records: List[PredictionRecord] = []

    def save_prediction(self, record: PredictionRecord) -> None:
        self.records.append(record)
