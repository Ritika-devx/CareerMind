
import { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

// Temporary demo clustering logic.
// This does NOT use your trained K-Means model.
function demoClusterJob(form) {
  const rating = Number(form.aggregaterating);
  const experience = Number(form.averageexperience);
  const reviews = Number(form.reviewscount);

  // Simple demonstration rules to assign one of five clusters.
  // These rules are not the actual K-Means decision boundaries.
  let cluster;

  if (experience <= 2 && rating >= 4) {
    cluster = 1;
  } else if (experience <= 3 && reviews < 100) {
    cluster = 2;
  } else if (experience <= 5) {
    cluster = 3;
  } else if (experience <= 8) {
    cluster = 4;
  } else {
    cluster = 5;
  }

  return {
    cluster: cluster,
    demo: true
  };
}

export default function JobClustering() {
  const [form, setForm] = useState({
    reviewscount: "",
    aggregaterating: "",
    minimumexperience: "",
    maximumexperience: "",
    averageexperience: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    setResult(null);
    setError("");

    const minExp = Number(form.minimumexperience);
    const maxExp = Number(form.maximumexperience);
    const avgExp = Number(form.averageexperience);
    const rating = Number(form.aggregaterating);

    if (minExp > maxExp) {
      setError("Maximum experience must be greater than or equal to minimum experience.");
      return;
    }

    if (avgExp < minExp || avgExp > maxExp) {
      setError("Average experience should be between minimum and maximum experience.");
      return;
    }

    if (rating < 0 || rating > 5) {
      setError("Rating must be between 0 and 5.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const data = demoClusterJob(form);
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setForm({
      reviewscount: "",
      aggregaterating: "",
      minimumexperience: "",
      maximumexperience: "",
      averageexperience: ""
    });

    setResult(null);
    setError("");
  };

  return (
    <div className="clustering-page">

      {/* Page heading */}
      <div className="page-intro">
        <span className="section-kicker">
          CAREER INTELLIGENCE
        </span>

        <h1>Job Clustering</h1>

        <p>
          Explore job groups based on experience, ratings
          and review information.
        </p>
      </div>

      {/* Cluster overview */}
      <div className="cluster-overview">

        <div className="cluster-stat">
          <span className="cluster-stat-number">5</span>
          <span>Job Clusters</span>
        </div>

        <div className="cluster-stat">
          <span className="cluster-stat-number">K-Means</span>
          <span>Primary Algorithm</span>
        </div>

        <div className="cluster-stat">
          <span className="cluster-stat-number">5</span>
          <span>Input Features</span>
        </div>

      </div>

      <div className="clustering-layout">

        {/* Input form */}
        <div className="clustering-form">

          <h2>Enter Job Information</h2>

          <p className="muted">
            Enter the numerical features to explore a demo cluster assignment.
          </p>

          <form onSubmit={handleSubmit} className="form">

            <label htmlFor="reviewscount">
              Review Count
            </label>

            <input
              id="reviewscount"
              type="number"
              name="reviewscount"
              min="0"
              value={form.reviewscount}
              onChange={update}
              placeholder="e.g. 250"
              required
            />

            <label htmlFor="aggregaterating">
              Aggregate Rating (0–5)
            </label>

            <input
              id="aggregaterating"
              type="number"
              name="aggregaterating"
              min="0"
              max="5"
              step="0.1"
              value={form.aggregaterating}
              onChange={update}
              placeholder="e.g. 4.2"
              required
            />

            <div className="experience-grid">

              <div>
                <label htmlFor="minimumexperience">
                  Minimum Experience
                </label>

                <input
                  id="minimumexperience"
                  type="number"
                  name="minimumexperience"
                  min="0"
                  step="0.1"
                  value={form.minimumexperience}
                  onChange={update}
                  placeholder="e.g. 1"
                  required
                />
              </div>

              <div>
                <label htmlFor="maximumexperience">
                  Maximum Experience
                </label>

                <input
                  id="maximumexperience"
                  type="number"
                  name="maximumexperience"
                  min="0"
                  step="0.1"
                  value={form.maximumexperience}
                  onChange={update}
                  placeholder="e.g. 5"
                  required
                />
              </div>

            </div>

            <label htmlFor="averageexperience">
              Average Experience
            </label>

            <input
              id="averageexperience"
              type="number"
              name="averageexperience"
              min="0"
              step="0.1"
              value={form.averageexperience}
              onChange={update}
              placeholder="e.g. 3"
              required
            />

            <div className="form-actions">

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Find Job Cluster →"}
              </button>

              <button
                type="button"
                className="reset-btn"
                onClick={resetForm}
              >
                Reset
              </button>

            </div>

          </form>

          {loading && <LoadingSpinner />}

          {error && (
            <p className="error">{error}</p>
          )}

          {/* Result */}
          {result && (
            <div className="cluster-result">

              <span className="section-kicker">
                DEMO CLUSTER RESULT
              </span>

              <div className="cluster-result-number">
                {result.cluster}
              </div>

              <h2>Cluster {result.cluster}</h2>

              <p>
                This job has been assigned to Cluster {result.cluster}
                using temporary demonstration rules.
              </p>

              <small>
                This is not an actual K-Means prediction.
              </small>

            </div>
          )}

        </div>

        {/* Information panel */}
        <aside className="clustering-info">

          <div className="info-symbol">✦</div>

          <span className="section-kicker">
            ABOUT CLUSTERING
          </span>

          <h3>
            Discover patterns in the job market.
          </h3>

          <p>
            Clustering groups similar job records based on
            their numerical characteristics.
          </p>

          <div className="info-divider" />

          <h4>Features used by the model</h4>

          <div className="cluster-feature">
            <span>01</span>
            Review Count
          </div>

          <div className="cluster-feature">
            <span>02</span>
            Aggregate Rating
          </div>

          <div className="cluster-feature">
            <span>03</span>
            Minimum Experience
          </div>

          <div className="cluster-feature">
            <span>04</span>
            Maximum Experience
          </div>

          <div className="cluster-feature">
            <span>05</span>
            Average Experience
          </div>

          <div className="demo-notice">
            <strong>Demo Mode</strong>

            <p>
              Actual cluster assignments will be available
              after integrating the trained K-Means model.
            </p>
          </div>

        </aside>

      </div>
    </div>
  );
}
