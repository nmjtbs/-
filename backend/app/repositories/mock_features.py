from typing import Dict

from app.core.errors import snapshot_not_found
from app.repositories.interfaces import FeatureSnapshot, FeatureSnapshotRepository


class MockFeatureSnapshotRepository(FeatureSnapshotRepository):
    def __init__(self) -> None:
        self._snapshots: Dict[str, Dict[str, float]] = {
            "arsenal-liverpool": {
                "team_shots_on_target_avg_last_5": 6.2,
                "opp_shots_on_target_faced_avg_last_5": 4.1,
                "rest_days_delta": 1.0,
                "missing_starting_goalkeeper_flag": 1.0,
                "closing_odds_delta": -0.18,
            },
            "milan-roma": {
                "team_shots_on_target_avg_last_5": 5.4,
                "opp_shots_on_target_faced_avg_last_5": 4.7,
                "rest_days_delta": 0.0,
                "missing_starting_goalkeeper_flag": 0.0,
                "closing_odds_delta": 0.07,
            },
        }

    def get_feature_snapshot(self, match_id: str, cutoff_type: str) -> FeatureSnapshot:
        if match_id not in self._snapshots:
            raise snapshot_not_found(match_id)

        return FeatureSnapshot(
            feature_snapshot_id=f"{match_id}:{cutoff_type}",
            match_id=match_id,
            cutoff_type=cutoff_type,
            features=self._snapshots[match_id],
            stale=match_id == "arsenal-liverpool",
            warnings=["Feature snapshot generated from mock repository"],
        )
