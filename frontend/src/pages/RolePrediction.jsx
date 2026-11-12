
import { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

// Temporary demo prediction function.
// It does not use the trained ML model or call the backend.
function demoPredictRole(form) {
  const text = (
    form.title + " " +
    form.tagsandskills + " " +
    form.jobdescription
  ).toLowerCase();

  const categories = [
    {
      role: "Data Scientist",
      keywords: [
        "machine learning",
        "data science",
        "pandas",
        "numpy",
        "statistics"
      ]
    },
    {
      role: "Python Developer",
      keywords: ["python", "django", "flask", "fastapi"]
    },
    {
      role: "Frontend Developer",
      keywords: ["react", "javascript", "html", "css", "frontend"]
    },
    {
      role: "Backend Developer",
      keywords: ["node.js", "express", "api", "backend", "database"]
    },
    {
      role: "Java Developer",
      keywords: ["java", "spring boot", "hibernate", "j2ee"]
    },
    {
      role: "Data Analyst",
      keywords: ["power bi", "tableau", "excel", "sql", "data analysis"]
    },
    {
      role: "Cloud Engineer",
      keywords: ["aws", "azure", "gcp", "docker", "kubernetes"]
    }
  ];

  let bestRole = "Software Developer";
  let bestScore = 0;

  categories.forEach((category) => {
    const score = category.keywords.filter((keyword) =>
      text.includes(keyword)
    ).length;

    if (score > bestScore) {
      bestScore = score;
      bestRole = category.role;
    }
  });

  return {
    predicted_role: bestRole,
    demo: true
  };
}

export default function RolePrediction() {
  const [form, setForm] = useState({
    title: "",
    tagsandskills: "",
    jobdescription: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update form fields
  const update = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle prediction
  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Simulate a short prediction delay
      await new Promise((resolve) => setTimeout(resolve, 700));

      // Run temporary demo prediction locally
      const data = demoPredictRole(form);

      setResult(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Reset form
  const resetForm = () => {
    setForm({
      title: "",
      tagsandskills: "",
      jobdescription: ""
    });

    setResult(null);
    setError("");
  };

  return (
    <div className="prediction-page">

      {/* Page heading */}
      <div className="page-intro">
        <span className="section-kicker">
          CAREER INTELLIGENCE
        </span>

        <h1>Job Role Prediction</h1>

        <p>
          Discover the job category based on job title,
          required skills and job description.
        </p>
      </div>

      <div className="prediction-layout">

        {/* Prediction form */}
        <div className="prediction-form">

          <div>
            <h2>Enter Job Details</h2>

            <p className="muted">
              Provide information about the job you want to classify.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="form">

            <label htmlFor="title">Job Title</label>

            <input
              id="title"
              type="text"
              name="title"
              value={form.title}
              onChange={update}
              placeholder="e.g. Python Developer"
              required
            />

            <label htmlFor="tagsandskills">Required Skills</label>

            <textarea
              id="tagsandskills"
              name="tagsandskills"
              value={form.tagsandskills}
              onChange={update}
              placeholder="Python, Django, SQL, REST APIs..."
              rows={3}
              required
            />

            <label htmlFor="jobdescription">Job Description</label>

            <textarea
              id="jobdescription"
              name="jobdescription"
              value={form.jobdescription}
              onChange={update}
              placeholder="Describe the job responsibilities and requirements..."
              rows={5}
              required
            />

            <div className="form-actions">

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Predict Job Role →"}
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

          {/* Loading */}
          {loading && <LoadingSpinner />}

          {/* Error */}
          {error && (
            <p className="error">{error}</p>
          )}

          {/* Prediction result */}
          {result && (
            <div className="role-result">

              <div className="result-icon">✦</div>

              <div>
                <span className="section-kicker">
                  DEMO PREDICTION RESULT
                </span>

                <h2>{result.predicted_role}</h2>

                <p>
                  This result is generated using temporary
                  keyword matching, not the trained ML model.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Information panel */}
        <aside className="prediction-info">

          <div className="info-symbol">✦</div>

          <span className="section-kicker">
            HOW IT WORKS
          </span>

          <h3>
            Turn job information into career insights.
          </h3>

          <p>
            CareerMind analyzes job titles, skills and
            descriptions to identify relevant job categories.
          </p>

          <div className="info-divider" />

          <div className="info-point">
            <span>01</span>
            Enter job details
          </div>

          <div className="info-point">
            <span>02</span>
            Analyze skills and description
          </div>

          <div className="info-point">
            <span>03</span>
            Display predicted job category
          </div>

          <div className="demo-notice">
            <strong>Demo Mode</strong>

            <p>
              Actual ML predictions will be enabled after
              FastAPI backend integration.
            </p>
          </div>

        </aside>

      </div>
    </div>
  );
}
