from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_training_run_lifecycle_bootstrap():
    create_response = client.post(
        "/api/v1/admin/training-runs",
        json={
            "target": "wdl",
            "cutoffType": "kickoff_minus_90m",
            "dateRange": {"startDate": "2025-01-01", "endDate": "2025-12-31"},
            "featureSetVersion": "v1",
        },
    )
    create_body = create_response.json()

    assert create_response.status_code == 200
    run_id = create_body["data"]["runId"]

    status_response = client.get(f"/api/v1/admin/training-runs/{run_id}")
    status_body = status_response.json()

    assert status_response.status_code == 200
    assert status_body["data"]["status"] == "queued"
