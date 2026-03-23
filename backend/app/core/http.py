import uuid
from datetime import datetime, timezone
from typing import Any, List

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.errors import DomainError
from app.schemas.common import ApiErrorBody, ApiErrorResponse, ApiMeta, ApiSuccessResponse, ApiSource


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_meta(
    request: Request,
    *,
    stale: bool = False,
    warnings: List[str] = None,
    source: ApiSource = ApiSource.BACKEND,
) -> ApiMeta:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return ApiMeta(
        requestId=request_id,
        generatedAt=utcnow_iso(),
        version="v1",
        source=source,
        stale=stale,
        warnings=warnings or [],
    )


def success_response(request: Request, data: Any, *, stale: bool, warnings: List[str]) -> dict:
    payload = ApiSuccessResponse[Any](
        success=True,
        data=data,
        meta=build_meta(request, stale=stale, warnings=warnings),
    )
    return payload.model_dump(mode="json")


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        response = await call_next(request)
        response.headers["x-request-id"] = request.state.request_id
        return response


async def domain_error_handler(request: Request, exc: DomainError) -> JSONResponse:
    payload = ApiErrorResponse(
        success=False,
        error=ApiErrorBody(code=exc.code, message=exc.message, details=exc.details or None),
        meta=build_meta(request, warnings=[]),
    )
    return JSONResponse(status_code=exc.status_code, content=payload.model_dump(mode="json"))


async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    payload = ApiErrorResponse(
        success=False,
        error=ApiErrorBody(
            code="INTERNAL_SERVER_ERROR",
            message="Unexpected server error.",
            details=[exc.__class__.__name__],
        ),
        meta=build_meta(request, warnings=[]),
    )
    return JSONResponse(status_code=500, content=payload.model_dump(mode="json"))


async def request_validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    details = []
    error_code = "REQUEST_VALIDATION_FAILED"
    error_message = "Request payload failed validation."

    for item in exc.errors():
        location = ".".join(str(part) for part in item.get("loc", []))
        details.append(f"{location}: {item.get('msg')}")
        if location.endswith("cutoffType") or location.endswith("snapshotType"):
            error_code = "INVALID_CUTOFF_TYPE"
            error_message = "Unsupported cutoffType was provided."

    payload = ApiErrorResponse(
        success=False,
        error=ApiErrorBody(code=error_code, message=error_message, details=details or None),
        meta=build_meta(request, warnings=[]),
    )
    return JSONResponse(status_code=422, content=payload.model_dump(mode="json"))


def configure_http(app: FastAPI) -> None:
    app.add_middleware(RequestIdMiddleware)
    app.add_exception_handler(DomainError, domain_error_handler)
    app.add_exception_handler(RequestValidationError, request_validation_error_handler)
    app.add_exception_handler(Exception, unhandled_error_handler)
