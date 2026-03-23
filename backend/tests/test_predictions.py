from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_prediction_endpoint_returns_wdl_probabilities():
    response = client.post(
        "/api/v1/predictions/matches/arsenal-liverpool",
        json={"cutoffType": "kickoff_minus_90m"},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["success"] is True
    assert body["data"]["target"] == "wdl"
    assert len(body["data"]["probabilities"]) == 3


def test_prediction_endpoint_rejects_unknown_match():
    response = client.post(
        "/api/v1/predictions/matches/unknown-id",
        json={"cutoffType": "kickoff_minus_90m"},
    )
    body = response.json()

    assert response.status_code == 404
    assert body["error"]["code"] == "SNAPSHOT_NOT_FOUND"


def test_prediction_endpoint_rejects_invalid_cutoff_type():
    response = client.post(
        "/api/v1/predictions/matches/arsenal-liverpool",
        json={"cutoffType": "bad_cutoff"},
    )
    body = response.json()

    assert response.status_code == 422
    assert body["error"]["code"] == "INVALID_CUTOFF_TYPE"
