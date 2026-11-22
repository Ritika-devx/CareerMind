from __future__ import annotations

from typing import Any
import pandas as pd

from model_loader import ModelRegistry


def predict_salary(
    registry: ModelRegistry,
    *,
    job_title: str,
    job_description: str,
    skills: str,
    job_category: str,
    location: str,
    experience_level: str,
    experience_midpoint_years: float,
    experience_min_years: float,
    experience_max_years: float,
) -> dict[str, Any]:
    """Run Agent 2 (Improved RandomForestRegressor Pipeline) using its 9 expected columns."""
    input_df = pd.DataFrame(
        [
            {
                "job_title": job_title.strip(),
                "job_description": job_description.strip(),
                "skills": skills.strip(),
                "job_category": job_category.strip(),
                "location": location.strip(),
                "experience_level": experience_level.strip(),
                "experience_midpoint_years": float(experience_midpoint_years),
                "experience_min_years": float(experience_min_years),
                "experience_max_years": float(experience_max_years),
            }
        ]
    )

    predicted_salary_inr = float(registry.salary_model.predict(input_df)[0])

    return {
        "predicted_salary_inr": round(predicted_salary_inr, 2),
        "model_info": {
            "artifact": registry.salary_path.name,
            "algorithm": "RandomForestRegressor",
            "expected_columns": registry.salary_expected_features,
        },
        "used_features": input_df.to_dict(orient="records")[0],
    }
