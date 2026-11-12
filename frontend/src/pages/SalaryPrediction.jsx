
import { useState } from "react";

export default function SalaryPrediction() {
  const [form, setForm] = useState({
    title: "",
    skills: "",
    experience: "",
    rating: ""
  });

  const [message, setMessage] = useState("");

  const update = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage(
      "Your details are valid. Live salary estimation will be available after regression API integration."
    );
  };

  const resetForm = () => {
    setForm({
      title: "",
      skills: "",
      experience: "",
      rating: ""
    });
    setMessage("");
  };

  return (
    <div className="salary-page">

      <div className="page-intro">
        <span className="section-kicker">
          CAREER INTELLIGENCE
        </span>

        <h1>Salary Prediction</h1>

        <p>
          Explore salary estimation using job and company
          characteristics.
        </p>
      </div>

      <div className="salary-layout">

        <div className="salary-form-card">
          <h2>Enter Job Details</h2>

          <p className="muted">
            Provide job information to prepare a salary estimate.
          </p>

          <form onSubmit={handleSubmit} className="form">

            <label htmlFor="salary-title">Job Title</label>
            <input
              id="salary-title"
              name="title"
              value={form.title}
              onChange={update}
              placeholder="e.g. Data Analyst"
              required
            />

            <label htmlFor="salary-skills">Skills and Technologies</label>
            <textarea
              id="salary-skills"
              name="skills"
              value={form.skills}
              onChange={update}
              placeholder="Python, SQL, Excel, Power BI..."
              rows={3}
              required
            />

            <label htmlFor="salary-experience">
              Experience (Years)
            </label>
            <input
              id="salary-experience"
              name="experience"
              type="number"
              min="0"
              step="0.5"
              value={form.experience}
              onChange={update}
              placeholder="e.g. 3"
              required
            />

            <label htmlFor="salary-rating">
              Company Rating (0–5)
            </label>
            <input
              id="salary-rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={update}
              placeholder="e.g. 4.2"
              required
            />

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                Estimate Salary →
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

          {message && (
            <div className="salary-message">
              {message}
            </div>
          )}
        </div>

        <aside className="salary-info">
          <div className="info-symbol">₹</div>

          <span className="section-kicker">
            SALARY INTELLIGENCE
          </span>

          <h3>
            Understand salary patterns in the job market.
          </h3>

          <p>
            CareerMind's regression model is designed to
            estimate salary outcomes from job-market data.
          </p>

          <div className="info-divider" />

          <div className="info-point">
            <span>01</span>
            Enter job information
          </div>

          <div className="info-point">
            <span>02</span>
            Provide experience and rating
          </div>

          <div className="info-point">
            <span>03</span>
            Receive salary estimation after API integration
          </div>

          <div className="demo-notice">
            <strong>Backend Integration Pending</strong>
            <p>
              No salary value is generated in demo mode.
              The actual regression model will provide the estimate.
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
}
