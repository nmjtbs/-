# Football Intelligence Backend

FastAPI backend skeleton for dashboard APIs, XGBoost prediction runtime, and async training entrypoints.

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
uvicorn app.main:app --reload --app-dir .
```

## Key routes

- `GET /healthz`
- `GET /api/v1/dashboard/command-center`
- `GET /api/v1/dashboard/matches/{matchId}/lab`
- `POST /api/v1/predictions/matches/{matchId}`
- `POST /api/v1/admin/training-runs`
- `GET /api/v1/admin/training-runs/{runId}`
