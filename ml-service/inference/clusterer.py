from __future__ import annotations

from typing import Any
import numpy as np

from model_loader import ModelRegistry


def predict_job_cluster(
    registry: ModelRegistry,
    *,
    job_title: str,
    skills: str,
) -> dict[str, Any]:
    """Run Agent 3 (TF-IDF -> float32 dense -> PCA(2) -> K-Means(K=7))."""
    bundle = registry.clustering_bundle
    combined_text = f"{job_title.strip()} {skills.strip()}".strip()

    tfidf_matrix = bundle["tfidf_vectorizer"].transform([combined_text])
    dense_matrix = tfidf_matrix.toarray().astype(np.float32, copy=False)
    pca_coords = bundle["pca"].transform(dense_matrix)
    cluster_id = int(bundle["kmeans"].predict(pca_coords)[0])

    centers = bundle["kmeans"].cluster_centers_
    distances_to_centers = [
        {
            "cluster_id": int(idx),
            "distance": round(float(np.linalg.norm(pca_coords[0] - center)), 5),
            "center": [round(float(center[0]), 5), round(float(center[1]), 5)],
        }
        for idx, center in enumerate(centers)
    ]

    return {
        "cluster_id": cluster_id,
        "pca_coordinates": [
            round(float(pca_coords[0][0]), 6),
            round(float(pca_coords[0][1]), 6),
        ],
        "cluster_distances": distances_to_centers,
        "combined_text": combined_text,
        "model_info": {
            "artifact": registry.clustering_path.name,
            "algorithm": "K-Means",
            "selected_k": int(bundle["kmeans"].n_clusters),
            "pca_components": int(bundle["pca"].n_components_),
        },
    }
