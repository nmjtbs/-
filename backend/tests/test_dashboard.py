from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_command_center_returns_success_envelope():
    response = client.get("/api/v1/dashboard/command-center")
    body = response.json()

    assert response.status_code == 200
    assert body["success"] is True
    assert body["data"]["context"]["cutoffType"] == "kickoff_minus_90m"
    assert "requestId" in body["meta"]


def test_match_lab_not_found_returns_domain_error():
    response = client.get("/api/v1/dashboard/matches/unknown-id/lab")
    body = response.json()

    assert response.status_code == 404
    assert body["success"] is False
    assert body["error"]["code"] == "MATCH_NOT_FOUND"
