
import { useState } from "react";

import RolePrediction from "./pages/RolePrediction";
import JobClustering from "./pages/JobClustering";
import SalaryPrediction from "./pages/SalaryPrediction";

// Sidebar navigation
const menu = [
  { id: "dashboard", icon: "⌂", label: "Dashboard" },
  { id: "role", icon: "◈", label: "Role Prediction" },
  { id: "salary", icon: "₹", label: "Salary Prediction" },
  { id: "clustering", icon: "◎", label: "Job Clustering" },
  { id: "insights", icon: "▥", label: "Model Insights" },
];

// Dashboard statistics
const stats = [
  {
    label: "Classification Accuracy",
    value: "89.02%",
    change: "LinearSVC model",
    icon: "◈",
    color: "purple"
  },
  {
    label: "Job Categories",
    value: "19",
    change: "Role classifications",
    icon: "▤",
    color: "blue"
  },
  {
    label: "Job Clusters",
    value: "5",
    change: "K-Means algorithm",
    icon: "◎",
    color: "orange"
  },
  {
    label: "Best Model R²",
    value: "64.22%",
    change: "Salary prediction",
    icon: "↗",
    color: "green"
  }
];

// Sidebar component
function Sidebar({ active, setActive }) {
  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brand-icon">C</div>

        <div>
          <h2>Career<span>Mind</span></h2>
          <small>INTELLIGENCE PLATFORM</small>
        </div>
      </div>

      <div className="workspace-label">WORKSPACE</div>

      <nav className="side-nav">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`nav-item ${
              active === item.id ? "active" : ""
            }`}
          >
            <span className="nav-icon">{item.icon}</span>

            {item.label}

            {active === item.id && (
              <span className="active-dot" />
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">

        <div className="help-card">
          <div className="help-icon">✦</div>
          <strong>AI-powered insights</strong>
          <p>Make informed career decisions with data.</p>
        </div>

        <div className="profile">
          <div className="avatar">CM</div>

          <div>
            <strong>CareerMind</strong>
            <small>Project Workspace</small>
          </div>

          <span className="profile-dots">•••</span>
        </div>

      </div>
    </aside>
  );
}

// Header component
function Header({ active }) {
  const current = menu.find((item) => item.id === active);

  return (
    <header className="topbar">

      <div className="breadcrumb">
        <span>Workspace</span>
        <b>/</b>
        <strong>{current?.label}</strong>
      </div>

      <div className="top-actions">
        <span className="system-status">
          <i /> ML System Ready
        </span>

        <button className="notification">♧</button>

        <div className="top-avatar">CM</div>
      </div>

    </header>
  );
}

// Statistics card
function StatCard({ item }) {
  return (
    <div className="stat-card">

      <div className="stat-top">
        <span>{item.label}</span>

        <div className={`stat-icon ${item.color}`}>
          {item.icon}
        </div>
      </div>

      <h2>{item.value}</h2>

      <p>
        <span className="status-dot" />
        {item.change}
      </p>

    </div>
  );
}

// Dashboard feature card
function Feature({
  icon,
  color,
  number,
  title,
  desc,
  action,
  onClick
}) {
  return (
    <div className="feature-card">

      <div className="feature-top">
        <div className={`feature-icon ${color}`}>
          {icon}
        </div>

        <span>{number}</span>
      </div>

      <h3>{title}</h3>

      <p>{desc}</p>

      <button onClick={onClick} className="text-btn">
        {action} <span>→</span>
      </button>

    </div>
  );
}

// Main Dashboard
function Dashboard({ setActive }) {
  return (
    <div className="dashboard-page">

      {/* Welcome banner */}
      <section className="welcome-banner">

        <div className="welcome-content">

          <div className="welcome-tag">
            <span /> CAREER INTELLIGENCE, REIMAGINED
          </div>

          <h1>
            Discover your next<br />
            career <span>possibility.</span>
          </h1>

          <p>
            Turn job market data into meaningful insights.
            Explore job roles, estimate salaries and discover
            career patterns powered by machine learning.
          </p>

          <button
            className="primary-btn"
            onClick={() => setActive("role")}
          >
            Explore predictions <span>→</span>
          </button>

        </div>

        <div className="hero-art">

          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />

          <div className="hero-core">
            <div className="core-symbol">✦</div>
            <span>AI</span>
          </div>

          <div className="floating-chip chip-one">
            ⌁ &nbsp; Machine Learning
          </div>

          <div className="floating-chip chip-two">
            ✧ &nbsp; Career Insights
          </div>

          <div className="floating-chip chip-three">
            ↗ &nbsp; Data Intelligence
          </div>

        </div>
      </section>

      {/* Model performance cards */}
      <div className="section-heading dashboard-section-heading">

        <div>
          <span className="section-kicker">OVERVIEW</span>
          <h2>Model performance</h2>
          <p>A snapshot of CareerMind's ML models.</p>
        </div>

        <span className="updated-label">
          ● Experiment results
        </span>

      </div>

      <div className="stats-grid">
        {stats.map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
      </div>

      {/* Performance charts */}
      <div className="dashboard-chart-grid">

        {/* Classification chart */}
        <section className="dashboard-chart-card">

          <div className="chart-heading">

            <div>
              <span className="section-kicker">
                CLASSIFICATION
              </span>

              <h3>Model evaluation</h3>
            </div>

            <span className="chart-label">
              LinearSVC
            </span>

          </div>

          <div className="metric-bar-list">

            <div className="metric-bar-item">

              <div className="metric-bar-info">
                <span>Accuracy</span>
                <strong>89.02%</strong>
              </div>

              <div className="metric-track">
                <div
                  className="metric-fill purple-fill"
                  style={{ width: "89.02%" }}
                />
              </div>

            </div>

            <div className="metric-bar-item">

              <div className="metric-bar-info">
                <span>Macro F1-Score</span>
                <strong>86.60%</strong>
              </div>

              <div className="metric-track">
                <div
                  className="metric-fill blue-fill"
                  style={{ width: "86.60%" }}
                />
              </div>

            </div>

            <div className="metric-bar-item">

              <div className="metric-bar-info">
                <span>Weighted F1-Score</span>
                <strong>88.96%</strong>
              </div>

              <div className="metric-track">
                <div
                  className="metric-fill green-fill"
                  style={{ width: "88.96%" }}
                />
              </div>

            </div>

          </div>

          <div className="chart-footer">
            <span>19 job categories</span>

            <button onClick={() => setActive("insights")}>
              View details →
            </button>
          </div>

        </section>

        {/* Clustering chart */}
        <section className="dashboard-chart-card">

          <div className="chart-heading">

            <div>
              <span className="section-kicker">
                CLUSTERING
              </span>

              <h3>K-Means evaluation</h3>
            </div>

            <span className="chart-label">
              5 Clusters
            </span>

          </div>

          <div className="cluster-visual">

            <div className="cluster-circle">
              <strong>5</strong>
              <span>Clusters</span>
            </div>

            <div className="cluster-details">

              <div>
                <span className="cluster-dot dot-purple" />

                <p>
                  Silhouette Score
                  <strong>0.4746</strong>
                </p>
              </div>

              <div>
                <span className="cluster-dot dot-blue" />

                <p>
                  Davies-Bouldin
                  <strong>0.6956</strong>
                </p>
              </div>

              <div>
                <span className="cluster-dot dot-green" />

                <p>
                  Inertia
                  <strong>44,938.73</strong>
                </p>
              </div>

            </div>

          </div>

          <div className="chart-footer">
            <span>K-Means algorithm</span>

            <button onClick={() => setActive("clustering")}>
              Explore clusters →
            </button>
          </div>

        </section>

      </div>

      {/* Platform features */}
      <div className="section-heading features-heading">

        <div>
          <span className="section-kicker">
            EXPLORE PLATFORM
          </span>

          <h2>What would you like to discover?</h2>

          <p>Choose an intelligent tool to get started.</p>
        </div>

      </div>

      <div className="feature-grid">

        <Feature
          icon="◈"
          color="purple"
          number="01"
          title="Job Role Prediction"
          desc="Identify job categories using job titles, skills and descriptions."
          action="Predict a role"
          onClick={() => setActive("role")}
        />

        <Feature
          icon="₹"
          color="green"
          number="02"
          title="Salary Prediction"
          desc="Explore estimated salary outcomes using job-market characteristics."
          action="Estimate salary"
          onClick={() => setActive("salary")}
        />

        <Feature
          icon="◎"
          color="orange"
          number="03"
          title="Job Clustering"
          desc="Discover groups of similar jobs through unsupervised learning."
          action="Explore clusters"
          onClick={() => setActive("clustering")}
        />

        <Feature
          icon="▥"
          color="blue"
          number="04"
          title="Model Insights"
          desc="Understand model evaluation, performance metrics and experiments."
          action="View insights"
          onClick={() => setActive("insights")}
        />

      </div>

      {/* Recent experiments */}
      <section className="recent-experiments">

        <div className="section-heading">

          <div>
            <span className="section-kicker">
              MODEL DEVELOPMENT
            </span>

            <h2>Experiment summary</h2>

            <p>
              Overview of the selected machine learning approaches.
            </p>
          </div>

          <button
            className="text-btn"
            onClick={() => setActive("insights")}
          >
            View all →
          </button>

        </div>

        <div className="experiment-row">

          <div className="experiment-icon purple">◈</div>

          <div className="experiment-description">
            <strong>LinearSVC</strong>
            <span>Job role classification</span>
          </div>

          <strong className="experiment-result">89.02%</strong>

          <span className="experiment-status">
            Selected
          </span>

        </div>

        <div className="experiment-row">

          <div className="experiment-icon orange">◎</div>

          <div className="experiment-description">
            <strong>K-Means</strong>
            <span>Job market clustering</span>
          </div>

          <strong className="experiment-result">
            5 Clusters
          </strong>

          <span className="experiment-status">
            Selected
          </span>

        </div>

        <div className="experiment-row">

          <div className="experiment-icon blue">▤</div>

          <div className="experiment-description">
            <strong>Hierarchical Clustering</strong>
            <span>Alternative clustering evaluation</span>
          </div>

          <strong className="experiment-result">
            5 Clusters
          </strong>

          <span className="experiment-status neutral-status">
            Evaluated
          </span>

        </div>

      </section>

    </div>
  );
}

// Model Insights page
function Insights() {

  const classificationMetrics = [
    { label: "Accuracy", value: "89.02%" },
    { label: "Macro F1-Score", value: "86.60%" },
    { label: "Weighted F1-Score", value: "88.96%" }
  ];

  const clusteringMetrics = [
    { label: "Silhouette Score", value: "0.4746" },
    { label: "Davies-Bouldin Index", value: "0.6956" },
    { label: "Inertia", value: "44,938.73" }
  ];

  const models = [
    {
      name: "LinearSVC",
      task: "Classification",
      result: "89.02% Accuracy",
      status: "Selected"
    },
    {
      name: "K-Means",
      task: "Clustering",
      result: "5 Clusters",
      status: "Selected"
    },
    {
      name: "Hierarchical Clustering",
      task: "Clustering",
      result: "5 Clusters",
      status: "Evaluated"
    },
    {
      name: "DBSCAN",
      task: "Clustering",
      result: "2 Clusters + Noise",
      status: "Evaluated"
    }
  ];

  return (
    <div className="insights-page">

      <div className="page-intro">

        <span className="section-kicker">
          EXPERIMENTS & EVALUATION
        </span>

        <h1>Model Insights</h1>

        <p>
          Understand the performance of CareerMind's
          classification and clustering models.
        </p>

      </div>

      {/* Classification metrics */}
      <section className="insight-section">

        <div className="insight-heading">

          <div>
            <span className="section-kicker">
              SUPERVISED LEARNING
            </span>

            <h2>Classification Performance</h2>

            <p>Final tuned LinearSVC model evaluation.</p>
          </div>

          <span className="model-tag">LinearSVC</span>

        </div>

        <div className="insight-metric-grid">

          {classificationMetrics.map((item) => (
            <div
              className="insight-metric-card"
              key={item.label}
            >
              <span>{item.label}</span>
              <h3>{item.value}</h3>
            </div>
          ))}

        </div>

      </section>

      {/* Clustering metrics */}
      <section className="insight-section">

        <div className="insight-heading">

          <div>
            <span className="section-kicker">
              UNSUPERVISED LEARNING
            </span>

            <h2>Clustering Performance</h2>

            <p>Evaluation of the K-Means clustering model.</p>
          </div>

          <span className="model-tag">K-Means</span>

        </div>

        <div className="insight-metric-grid">

          {clusteringMetrics.map((item) => (
            <div
              className="insight-metric-card"
              key={item.label}
            >
              <span>{item.label}</span>
              <h3>{item.value}</h3>
            </div>
          ))}

        </div>

        <p className="metric-note">
          Silhouette score was calculated on a sample of
          5,000 records. Clustering evaluation metrics
          should be interpreted according to their respective
          calculation scopes.
        </p>

      </section>

      {/* Model comparison */}
      <section className="insights-panel">

        <div className="insight-heading">

          <div>
            <span className="section-kicker">
              MODEL COMPARISON
            </span>

            <h2>Experiment Summary</h2>

            <p>
              Models evaluated during CareerMind development.
            </p>
          </div>

        </div>

        <div className="table-scroll">

          <table>

            <thead>
              <tr>
                <th>Model</th>
                <th>Task</th>
                <th>Result</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {models.map((model) => (
                <tr key={model.name}>
                  <td>{model.name}</td>
                  <td>{model.task}</td>
                  <td>{model.result}</td>

                  <td>
                    <span className="model-status">
                      {model.status}
                    </span>
                  </td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

        <p className="metric-note">
          Classification and clustering metrics measure
          different aspects of model performance and
          should not be directly compared.
        </p>

      </section>

    </div>
  );
}

// Main App
export default function App() {

  const [active, setActive] = useState("dashboard");

  return (
    <div className="app-shell">

      <Sidebar
        active={active}
        setActive={setActive}
      />

      <main className="main-area">

        <Header active={active} />

        <div className="page-content">

          {/* Dashboard */}
          {active === "dashboard" && (
            <Dashboard setActive={setActive} />
          )}

          {/* Role Prediction */}
          {active === "role" && (
            <RolePrediction />
          )}

          {/* Salary Prediction */}
          {active === "salary" && (
            <SalaryPrediction />
          )}

          {/* Job Clustering */}
          {active === "clustering" && (
            <JobClustering />
          )}

          {/* Model Insights */}
          {active === "insights" && (
            <Insights />
          )}

          {/* Footer */}
          <footer className="footer">
            <span>© 2026 CareerMind</span>
            <span>AI-Powered Job Market Intelligence</span>
          </footer>

        </div>

      </main>

    </div>
  );
}
