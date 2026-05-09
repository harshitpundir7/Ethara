export default function StatCard({ icon, label, value, color = 'var(--accent)' }) {
  return (
    <div className="card stat-card card-hover-lift">
      <div className="stat-icon" style={{ background: `${color}22` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="stat-value" style={{ color }}>{value ?? 0}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
