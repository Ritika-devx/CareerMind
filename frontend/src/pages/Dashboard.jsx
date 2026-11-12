
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";

const features = [
  {
    title: "Job Role Prediction",
    description: "Identify the job category from a title, skills and description.",
    link: "/role"
  },
  {
    title: "Salary Prediction",
    description: "Estimate salary using the trained regression model.",
    link: "/salary"
  },
  {
    title: "Job Clustering",
    description: "Discover groups of similar job-market records.",
    link: "/clustering"
  },
  {
    title: "Market Insights",
    description: "Explore classification and clustering performance.",
    link: "/insights"
  }
];

export default function Dashboard() {
  return (
    <div>
      <section className="hero">
        <p className="eyebrow">WELCOME TO CAREERMIND</p>
        <h1>Make smarter career decisions with AI</h1>
        <p>
          Explore job roles, salary expectations and job-market
          patterns using machine learning.
        </p>
        <Link to="/role" className="btn hero-btn">
          Explore Role Prediction
        </Link>
      </section>

      <h2 className="section-title">Model Overview</h2>
      <div className="stats-grid">
        <StatCard title="Classification Accuracy" value="89.02%"
          description="LinearSVC test accuracy" />
        <StatCard title="Job Categories" value="19"
          description="Classification target classes" />
        <StatCard title="K-Means Groups" value="5"
          description="Selected cluster count" />
      </div>

      <h2 className="section-title">Explore Features</h2>
      <div className="feature-grid">
        {features.map(feature => (
          <Link to={feature.link} className="feature-card" key={feature.link}>
            <h3>{feature.title}</h3>
            <p className="muted">{feature.description}</p>
            <span className="feature-link">Explore →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
