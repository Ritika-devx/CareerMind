# CareerMind — AI-Powered Job Market Intelligence System

CareerMind is a full-stack academic machine learning web application built for **24CSE0316 — Artificial Intelligence & Machine Learning**. It integrates three pre-trained scikit-learn models across a separated Python ML inference service, Node.js/Express REST API backend, and React + Vite dashboard frontend.

---

## Architecture

```
careermind/
├── ml-service/                  # Python Flask ML Inference Service (port 5001)
│   ├── app.py                   # Flask API (/health, /metadata, /predict/*)
│   ├── model_loader.py          # Singleton loader for the 3 .joblib models
│   ├── requirements.txt
│   └── inference/
│       ├── classifier.py        # Agent 1: LinearSVC pipeline
│       ├── salary_predictor.py  # Agent 2: Improved RandomForestRegressor pipeline
│       └── clusterer.py         # Agent 3: TF-IDF -> float32 -> PCA(2) -> K-Means(K=7)
├── backend/                     # Node.js + Express REST Backend
│   ├── app.ts                   # Express app factory
│   ├── server.ts                # Standalone backend entrypoint (port 4000)
│   ├── routes/api.ts            # REST endpoints (/api/*)
│   ├── controllers/careerMindController.ts
│   └── services/
│       ├── dataService.ts       # In-memory CSV/JSON dataset & results loader
│       └── mlClient.ts          # HTTP client to Python Flask ML service
├── src/                         # React + Vite Frontend
│   ├── components/              # Sidebar, TopBar, ClusterScatterSvg
│   ├── pages/                   # Dashboard, Classification, Salary, Clustering, Performance, Explorer
│   ├── services/api.ts
│   ├── types/careermind.ts
│   └── index.css                # Plain CSS design system
├── server.ts                    # Unified entrypoint (port 3000: manages ML service, Express API, Vite)
├── public/assets/aistudio/      # Uploaded master dataset, evaluation CSVs/JSONs, notebooks
├── job_classifier_best.joblib
├── salary_random_forest_candidate.joblib
└── careermind_final_clustering_bundle.joblib
```

---

## Integrated Trained Models

1. **Agent 1 — Job Classification (`job_classifier_best.joblib`)**
   - Algorithm: `SVM (LinearSVC)` inside a `Pipeline` (`TfidfVectorizer` + `OneHotEncoder` + `StandardScaler`).
   - Metrics: Accuracy `95.17%`, Macro F1 `95.16%`, 5-Fold CV Macro F1 `94.80%`.
   - Expected columns: `combined_text` (`job_title + job_description + skills`), `location`, `experience_midpoint_years`.

2. **Agent 2 — Salary Prediction (`salary_random_forest_candidate.joblib`)**
   - Algorithm: `RandomForestRegressor` (`n_estimators=150, max_depth=20, min_samples_leaf=3`).
   - Metrics: Test R² `0.815366`, Test MAE `₹140,272.22`, Test RMSE `₹194,442.11`.
   - Expected 9 columns: `job_title`, `job_description`, `skills`, `job_category`, `location`, `experience_level`, `experience_midpoint_years`, `experience_min_years`, `experience_max_years`.
   - Workflow: Runs Agent 1 first to obtain `job_category` (unless manually overridden), then invokes Agent 2.

3. **Agent 3 — Job Clustering (`careermind_final_clustering_bundle.joblib`)**
   - Bundle: `TfidfVectorizer` (3,033 vocabulary) + `PCA(n_components=2)` + `KMeans(n_clusters=7)`.
   - Metrics: Full-dataset Silhouette `0.7111`, Coverage `100%`.
   - Inputs: `job_title` + `skills` → TF-IDF → dense `float32` → PCA → K-Means cluster ID (`0`–`6`), mapped to `cluster_profiles` and `cluster_category_mix_posthoc` CSVs.

---

## Installation & Running Locally

### Prerequisites
- Node.js 20+ and npm
- Python 3.11+

### 1. Install Dependencies

```bash
# Node/Frontend/Backend dependencies
npm install

# Python ML Service dependencies (must match scikit-learn==1.6.1 & numpy>=2.0)
pip install -r ml-service/requirements.txt
```

### 2. Option A — Unified Startup (Recommended)
Starts the Python Flask ML service (`127.0.0.1:5001`), Express API (`/api/*`), and Vite React frontend together on port `3000`:

```bash
npm run dev
```

Open `http://localhost:3000`.

### 3. Option B — Run All Three Services Separately

1. **Terminal 1 — Python ML Service (port 5001):**
   ```bash
   ML_PORT=5001 python3 ml-service/app.py
   ```

2. **Terminal 2 — Express Backend (port 4000):**
   ```bash
   ML_SERVICE_URL=http://127.0.0.1:5001 BACKEND_PORT=4000 npx tsx backend/server.ts
   ```

3. **Terminal 3 — React Vite Frontend (port 3000, proxying `/api` or run via `server.ts`):**
   For single-port local execution with Vite middleware, set `ML_SERVICE_URL=http://127.0.0.1:5001` and run `npm run dev` on port `3000` (it will automatically detect and reuse your already-running Flask ML service on `5001`).

---

## REST API Endpoints

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verifies Express backend, dataset load, and Python ML service status |
| `GET` | `/api/dashboard` | Returns verified dataset KPIs, dropdown options, and model summary metrics |
| `POST` | `/api/classify` | Classifies job posting via `job_classifier_best.joblib` |
| `POST` | `/api/predict-salary` | Chains Classification → Improved Random Forest salary regressor |
| `POST` | `/api/cluster` | Predicts K-Means cluster ID + PCA coordinates + mapped profile |
| `GET` | `/api/model-metrics` | Returns evaluation metrics and model comparison CSV/JSON data |
| `GET` | `/api/clusters` | Returns all 7 cluster profiles, category mixes, and PCA centers |
| `GET` | `/api/jobs` | Queries `careermind_master_dataset_v2.csv` with search, filters, and pagination |
