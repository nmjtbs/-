from app.repositories.interfaces import DashboardReadRepository, ServiceResult


class DashboardService:
    def __init__(self, repo: DashboardReadRepository) -> None:
        self._repo = repo

    def get_command_center(self, *, issue_no: str, date: str, cutoff_type, include_alerts: bool) -> ServiceResult:
        return self._repo.get_command_center(issue_no=issue_no, date=date, cutoff_type=cutoff_type, include_alerts=include_alerts)

    def get_match_lab(self, *, match_id: str, snapshot_type) -> ServiceResult:
        return self._repo.get_match_lab(match_id=match_id, snapshot_type=snapshot_type)
