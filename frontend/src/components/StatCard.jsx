
export default function StatCard({ title, value, description }) {
  return (
    <div className="stat-card">
      <p className="muted">{title}</p>
      <h2>{value}</h2>
      <p className="muted">{description}</p>
    </div>
  );
}
