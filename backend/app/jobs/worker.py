def execute_training_job(run_id: str, payload: dict) -> dict:
    return {"runId": run_id, "status": "queued", "payload": payload}
