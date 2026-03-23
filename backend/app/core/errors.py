from typing import List, Optional


class DomainError(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        *,
        status_code: int = 400,
        details: Optional[List[str]] = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or []


def match_not_found(match_id: str) -> DomainError:
    return DomainError(
        code="MATCH_NOT_FOUND",
        message="Match not found for the requested canonical matchId.",
        status_code=404,
        details=[match_id],
    )


def snapshot_not_found(match_id: str) -> DomainError:
    return DomainError(
        code="SNAPSHOT_NOT_FOUND",
        message="Point-in-time feature snapshot is unavailable for the requested match.",
        status_code=404,
        details=[match_id],
    )


def model_not_found(target: str, version: Optional[str]) -> DomainError:
    return DomainError(
        code="MODEL_NOT_FOUND",
        message="Model artifact could not be found for the requested target/version.",
        status_code=404,
        details=[target, version or "active"],
    )


def feature_validation_failed(details: List[str]) -> DomainError:
    return DomainError(
        code="FEATURE_VALIDATION_FAILED",
        message="Feature snapshot does not satisfy model requirements.",
        status_code=422,
        details=details,
    )


def invalid_cutoff_type(value: str) -> DomainError:
    return DomainError(
        code="INVALID_CUTOFF_TYPE",
        message="Unsupported cutoffType was provided.",
        status_code=422,
        details=[value],
    )


def training_run_not_found(run_id: str) -> DomainError:
    return DomainError(
        code="TRAINING_RUN_NOT_FOUND",
        message="Training run was not found.",
        status_code=404,
        details=[run_id],
    )


def unsupported_target(target: str) -> DomainError:
    return DomainError(
        code="UNSUPPORTED_TARGET",
        message="Target is not supported by the current backend bootstrap.",
        status_code=422,
        details=[target],
    )
