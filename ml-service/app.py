from __future__ import annotations

import os
from typing import Any

from flask import Flask, jsonify, request

from model_loader import get_model_registry
from inference import predict_job_category, predict_salary, predict_job_cluster

app = Flask(__name__)

# Load all three models once at service startup
registry = get_model_registry()


@app.get("/health")
def health() -> tuple[Any, int]:
    return (
        jsonify(
            {
                "status": "ok",
                "service": "careermind-ml-service",
                "models_loaded": True,
                "artifacts": {
                    "classifier": registry.classifier_path.name,
                    "salary": registry.salary_path.name,
                    "clustering": registry.clustering_path.name,
                },
            }
        ),
        200,
    )


@app.get("/metadata")
def metadata() -> tuple[Any, int]:
    return jsonify(registry.get_metadata()), 200


@app.post("/predict/classify")
def classify_endpoint() -> tuple[Any, int]:
    data = request.get_json(silent=True) or {}
    job_title = str(data.get("job_title", "")).strip()
    job_description = str(data.get("job_description", "")).strip()
    skills = str(data.get("skills", "")).strip()
    location = str(data.get("location", "")).strip()
    exp_mid = data.get("experience_midpoint_years")

    if not any([job_title, job_description, skills]):
        return jsonify({"error": "Provide at least one of job_title, job_description, or skills."}), 400
    if not location:
        return jsonify({"error": "location is required."}), 400
    if exp_mid is None:
        return jsonify({"error": "experience_midpoint_years is required."}), 400

    try:
        exp_mid_val = float(exp_mid)
    except (TypeError, ValueError):
        return jsonify({"error": "experience_midpoint_years must be a valid number."}), 400

    result = predict_job_category(
        registry,
        job_title=job_title,
        job_description=job_description,
        skills=skills,
        location=location,
        experience_midpoint_years=exp_mid_val,
    )
    return jsonify(result), 200


@app.post("/predict/salary")
def salary_endpoint() -> tuple[Any, int]:
    data = request.get_json(silent=True) or {}
    required_str = [
        "job_title",
        "job_description",
        "skills",
        "job_category",
        "location",
        "experience_level",
    ]
    for field in required_str:
        if not str(data.get(field, "")).strip():
            return jsonify({"error": f"{field} is required."}), 400

    try:
        exp_min = float(data["experience_min_years"])
        exp_max = float(data["experience_max_years"])
        exp_mid = float(
            data.get("experience_midpoint_years", (exp_min + exp_max) / 2.0)
        )
    except (KeyError, TypeError, ValueError):
        return (
            jsonify(
                {
                    "error": "Valid numeric experience_min_years, experience_max_years, and experience_midpoint_years are required."
                }
            ),
            400,
        )

    result = predict_salary(
        registry,
        job_title=str(data["job_title"]),
        job_description=str(data["job_description"]),
        skills=str(data["skills"]),
        job_category=str(data["job_category"]),
        location=str(data["location"]),
        experience_level=str(data["experience_level"]),
        experience_midpoint_years=exp_mid,
        experience_min_years=exp_min,
        experience_max_years=exp_max,
    )
    return jsonify(result), 200


@app.post("/predict/cluster")
def cluster_endpoint() -> tuple[Any, int]:
    data = request.get_json(silent=True) or {}
    job_title = str(data.get("job_title", "")).strip()
    skills = str(data.get("skills", "")).strip()

    if not job_title and not skills:
        return jsonify({"error": "Provide job_title or skills for clustering."}), 400

    result = predict_job_cluster(
        registry,
        job_title=job_title,
        skills=skills,
    )
    return jsonify(result), 200


if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", "5001"))
    app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)
