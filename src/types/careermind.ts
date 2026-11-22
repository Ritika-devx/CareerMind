export type PageId =
  | 'dashboard'
  | 'classification'
  | 'salary'
  | 'clustering'
  | 'performance'
  | 'explorer';

export interface JobInputDraft {
  job_title: string;
  job_description: string;
  skills: string;
  location: string;
  experience_level: string;
  experience_min_years: number;
  experience_max_years: number;
  experience_midpoint_years: number;
  job_category?: string;
}

export interface DashboardData {
  dataset: {
    total_records: number;
    unique_categories: number;
    unique_job_titles: number;
    unique_locations: number;
    categories: string[];
    locations: string[];
    experience_levels: string[];
    salary_summary: {
      mean_inr: number;
      min_inr: number;
      max_inr: number;
    };
  };
  metrics: {
    classification: {
      agent: string;
      selected_model: string;
      selection_metric: string;
      test_metrics: {
        Model: string;
        Accuracy: number;
        Precision_macro: number;
        Recall_macro: number;
        F1_macro: number;
      };
      cross_validation_macro_f1_mean: number;
      cross_validation_macro_f1_std: number;
      dataset_rows: number;
      dataset_type: string;
    };
    salary: {
      agent: string;
      selected_model: string;
      test_r2: number;
      test_mae_inr: number;
      test_rmse_inr: number;
      target: string;
      target_unit: string;
      dataset_type: string;
    };
    clustering: {
      agent: string;
      dataset_type: string;
      deployable_model: string;
      input_features: string[];
      pca_components: number;
      selected_k: number;
      silhouette_full_dataset: number;
      coverage: number;
      dataset_rows: number;
      label_usage: string;
    };
  };
  model_metadata: {
    models_loaded: boolean;
    classifier: {
      artifact: string;
      estimator: string;
      expected_features: string[];
      classes: string[];
      supports_predict_proba: boolean;
    };
    salary: {
      artifact: string;
      estimator: string;
      n_estimators: number;
      max_depth: number;
      min_samples_leaf: number;
      expected_features: string[];
      locations: string[];
      experience_levels: string[];
      job_categories: string[];
    };
    clustering: {
      artifact: string;
      estimator: string;
      text_columns: string[];
      pca_components: number;
      selected_k: number;
      vocabulary_size: number;
      cluster_centers: number[][];
    };
  } | null;
}

export interface ClassificationResponse {
  predicted_category: string;
  decision_scores: Array<{ category: string; decision_score: number }>;
  top_decision_score: number | null;
  supports_probabilities: boolean;
  model_info: {
    artifact: string;
    algorithm: string;
    expected_columns: string[];
  };
  processed_input: {
    combined_text: string;
    location: string;
    experience_midpoint_years: number;
  };
  submitted: {
    job_title: string;
    job_description: string;
    skills: string;
    location: string;
    experience_midpoint_years: number;
  };
}

export interface SalaryPredictionResponse {
  predicted_salary_inr: number;
  formatted_salary_inr: string;
  monthly_equivalent_inr: number;
  formatted_monthly_inr: string;
  category_source: 'predicted' | 'manual_override';
  effective_job_category: string;
  classification_step: {
    predicted_category: string;
    top_decision_score: number | null;
    decision_scores: Array<{ category: string; decision_score: number }>;
    supports_probabilities: boolean;
  };
  model_info: {
    artifact: string;
    algorithm: string;
    expected_columns: string[];
  };
  used_features: Record<string, string | number>;
  disclaimer: string;
}

export interface ClusterProfile {
  cluster_id: number;
  job_count: number;
  top_job_title: string;
  top_location: string;
  average_experience: number;
  average_salary_inr: number;
  most_common_category: string;
  common_skills: string;
  skills_list: string[];
  category_mix: Record<string, number>;
}

export interface ClusteringResponse {
  cluster_id: number;
  pca_coordinates: [number, number];
  cluster_distances: Array<{
    cluster_id: number;
    distance: number;
    center: [number, number];
  }>;
  combined_text: string;
  model_info: {
    artifact: string;
    algorithm: string;
    selected_k: number;
    pca_components: number;
  };
  profile: ClusterProfile;
  submitted: {
    job_title: string;
    skills: string;
  };
}

export interface ClustersOverviewResponse {
  clusters: ClusterProfile[];
  cluster_centers: number[][];
  summary: DashboardData['metrics']['clustering'];
  algorithm_comparison: Array<{
    Algorithm: string;
    Parameters: string;
    Clusters: number;
    Silhouette: number;
    Noise_points: number;
    Coverage: number;
  }>;
}

export interface ModelMetricsResponse {
  classification: {
    summary: DashboardData['metrics']['classification'];
    comparison: Array<{
      Model: string;
      Accuracy: number;
      Precision_macro: number;
      Recall_macro: number;
      F1_macro: number;
    }>;
  };
  salary: {
    summary: DashboardData['metrics']['salary'];
    comparison_improved: Array<{
      Model: string;
      Train_R2: number;
      Test_R2: number;
      Test_MAE: number;
      Test_RMSE: number;
    }>;
    comparison_baseline: Array<{
      Model: string;
      MAE_INR: number;
      MSE_INR2: number;
      RMSE_INR: number;
      R2: number;
    }>;
  };
  clustering: {
    summary: DashboardData['metrics']['clustering'];
    algorithm_comparison: ClustersOverviewResponse['algorithm_comparison'];
    kmeans_experiments: Array<{
      Features: string;
      PCA_components: number;
      K: number;
      Clusters: number;
      Silhouette: number;
      Coverage: number;
    }>;
    hierarchical_experiments: Array<{
      Algorithm: string;
      Parameters: string;
      Clusters: number;
      Silhouette: number;
      Noise_points: number;
      Coverage: number;
    }>;
    dbscan_experiments: Array<{
      Algorithm: string;
      Parameters: string;
      Clusters: number;
      Silhouette: number | null;
      Noise_points: number;
      Coverage: number;
    }>;
  };
}

export interface JobRecord {
  job_id: string;
  job_title: string;
  job_description: string;
  skills: string;
  experience_min_years: number;
  experience_max_years: number;
  experience_midpoint_years: number;
  experience_level: string;
  location: string;
  job_category: string;
  minimum_annual_salary_inr: number;
  maximum_annual_salary_inr: number;
  average_annual_salary_inr: number;
  currency: string;
  salary_period: string;
}

export interface JobsExplorerResponse {
  overview: {
    total_records: number;
    columns: string[];
    unique_categories: number;
    unique_job_titles: number;
    unique_locations: number;
    unique_experience_levels: number;
    categories: string[];
    locations: string[];
    experience_levels: string[];
    salary_summary: {
      mean_inr: number;
      min_inr: number;
      max_inr: number;
    };
    distributions: {
      by_category: Array<{ name: string; count: number }>;
      by_title_top_15: Array<{ name: string; count: number }>;
      by_location: Array<{ name: string; count: number }>;
      by_experience_level: Array<{ name: string; count: number }>;
    };
  };
  total_filtered: number;
  page: number;
  limit: number;
  total_pages: number;
  items: JobRecord[];
}

export interface RecentPredictionItem {
  id: string;
  agent: 'classification' | 'salary' | 'clustering';
  title: string;
  summary: string;
  meta: string;
  timestamp: string;
}
