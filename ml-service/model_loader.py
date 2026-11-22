from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODELS_LOCAL_DIR = Path(__file__).resolve().parent / "models"

MODEL_FILENAMES = {
    "classifier": "job_classifier_best.joblib",
    "salary": "salary_random_forest_candidate.joblib",
    "clustering": "careermind_final_clustering_bundle.joblib",
}


def resolve_model_path(filename: str) -> Path:
    """Resolve a model artifact from ml-service/models/ first, then project root."""
    candidates = [
        MODELS_LOCAL_DIR / filename,
        PROJECT_ROOT / filename,
    ]
    for path in candidates:
        if path.is_file():
            return path
    searched = ", ".join(str(p) for p in candidates)
    raise FileNotFoundError(
        f"Required model artifact '{filename}' not found. Searched: {searched}"
    )


class ModelRegistry:
    """Loads and caches all three CareerMind trained model artifacts once at startup."""

    def __init__(self) -> None:
        self.classifier_path = resolve_model_path(MODEL_FILENAMES["classifier"])
        self.salary_path = resolve_model_path(MODEL_FILENAMES["salary"])
        self.clustering_path = resolve_model_path(MODEL_FILENAMES["clustering"])

        self.classifier = joblib.load(self.classifier_path)
        self.salary_model = joblib.load(self.salary_path)
        self.clustering_bundle: dict[str, Any] = joblib.load(self.clustering_path)

        # Extract authentic categories and metadata directly from loaded artifacts
        clf_estimator = self.classifier.named_steps["model"]
        self.job_categories: list[str] = [str(c) for c in clf_estimator.classes_]

        sal_prep = self.salary_model.named_steps["preprocessor"]
        self.salary_locations: list[str] = [
            str(v) for v in sal_prep.named_transformers_["location"].categories_[0]
        ]
        self.salary_experience_levels: list[str] = [
            str(v) for v in sal_prep.named_transformers_["level"].categories_[0]
        ]
        self.salary_categories: list[str] = [
            str(v) for v in sal_prep.named_transformers_["category"].categories_[0]
        ]
        self.salary_expected_features: list[str] = [
            str(c) for c in self.salary_model.feature_names_in_
        ]
        self.classifier_expected_features: list[str] = [
            str(c) for c in self.classifier.feature_names_in_
        ]

        # Validate clustering bundle keys
        required_bundle_keys = {"tfidf_vectorizer", "pca", "kmeans"}
        missing_keys = required_bundle_keys - set(self.clustering_bundle.keys())
        if missing_keys:
            raise KeyError(
                f"Clustering bundle missing required keys: {sorted(missing_keys)}"
            )

    def get_metadata(self) -> dict[str, Any]:
        kmeans = self.clustering_bundle["kmeans"]
        pca = self.clustering_bundle["pca"]
        tfidf = self.clustering_bundle["tfidf_vectorizer"]
        sal_est = self.salary_model.named_steps["model"]

        return {
            "models_loaded": True,
            "classifier": {
                "artifact": self.classifier_path.name,
                "estimator": type(self.classifier.named_steps["model"]).__name__,
                "expected_features": self.classifier_expected_features,
                "classes": self.job_categories,
                "supports_predict_proba": hasattr(self.classifier, "predict_proba"),
            },
            "salary": {
                "artifact": self.salary_path.name,
                "estimator": type(sal_est).__name__,
                "n_estimators": int(sal_est.n_estimators),
                "max_depth": int(sal_est.max_depth),
                "min_samples_leaf": int(sal_est.min_samples_leaf),
                "expected_features": self.salary_expected_features,
                "locations": self.salary_locations,
                "experience_levels": self.salary_experience_levels,
                "job_categories": self.salary_categories,
            },
            "clustering": {
                "artifact": self.clustering_path.name,
                "estimator": type(kmeans).__name__,
                "text_columns": list(
                    self.clustering_bundle.get("text_columns", ["job_title", "skills"])
                ),
                "pca_components": int(pca.n_components_),
                "selected_k": int(kmeans.n_clusters),
                "vocabulary_size": int(len(tfidf.vocabulary_)),
                "cluster_centers": [
                    [float(x), float(y)] for x, y in kmeans.cluster_centers_
                ],
            },
        }


_registry: ModelRegistry | None = None


def get_model_registry() -> ModelRegistry:
    global _registry
    if _registry is None:
        _registry = ModelRegistry()
    return _registry
