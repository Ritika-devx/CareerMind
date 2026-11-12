
import StatCard from "../components/StatCard";

export default function Insights() {
  return (
    <div>
      <h1>Model Insights</h1>
      <p className="page-subtitle">
        Performance summary from CareerMind's classification
        and clustering experiments.
      </p>

      <h2 className="section-title">Classification</h2>
      <div className="stats-grid">
        <StatCard title="Accuracy" value="89.02%"
          description="Test set" />
        <StatCard title="Macro F1" value="86.60%"
          description="Across 19 role categories" />
        <StatCard title="Weighted F1" value="88.96%"
          description="Test set" />
      </div>

      <h2 className="section-title">Clustering</h2>
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Silhouette Score</th>
              <th>Davies-Bouldin Index</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>K-Means</td><td>0.4746</td><td>0.6956</td></tr>
            <tr><td>Hierarchical</td><td>0.4730</td><td>0.6377</td></tr>
            <tr><td>DBSCAN</td><td>0.4584</td><td>0.4621</td></tr>
          </tbody>
        </table>
        <p className="muted">
          These scores were obtained using different sample sizes
          and evaluation conditions, so they are not directly comparable.
        </p>
      </div>
    </div>
  );
}
