from __future__ import annotations

from typing import Any
import pandas as pd

from model_loader import ModelRegistry


def predict_job_category(
    registry: ModelRegistry,
    *,
    job_title: str,
    job_description: str,
    skills: str,
    location: str,
    experience_midpoint_years: float,
) -> dict[str, Any]:
    """Run Agent 1 (LinearSVC Pipeline) using its exact 3 expected input columns."""
    combined_text = " ".join(
        part.strip()
        for part in (job_title, job_description, skills)
        if part and part.strip()
    )

    input_df = pd.DataFrame(
        [
            {
                "combined_text": combined_text,
                "location": location.strip(),
                "experience_midpoint_years": float(experience_midpoint_years),
            }
        ]
    )

    predicted_category = str(registry.classifier.predict(input_df)[0])

    # LinearSVC provides raw decision function margins (not calibrated probabilities)
    raw_scores = registry.classifier.decision_function(input_df)[0]
    classes = registry.job_categories
    decision_scores = sorted(
        [
            {"category": str(cls), "decision_score": round(float(score), 4)}
            for cls, score in zip(classes, raw_scores)
        ],
        key=lambda item: item["decision_score"],
        reverse=True,
    )

    return {
        "predicted_category": predicted_category,
        "decision_scores": decision_scores,
        "top_decision_score": decision_scores[0]["decision_score"] if decision_scores else None,
        "supports_probabilities": False,
        "model_info": {
            "artifact": registry.classifier_path.name,
            "algorithm": "SVM (LinearSVC)",
            "expected_columns": registry.classifier_expected_features,
        },
        "processed_input": {
            "combined_text": combined_text,
            "location": location.strip(),
            "experience_midpoint_years": float(experience_midpoint_years),
        },
    }
