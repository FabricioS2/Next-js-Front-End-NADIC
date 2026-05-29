export default function Loading() {
  return (
    <div className="content-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div className="glass-card" style={{ textAlign: "center" }}>
        <span className="card-icon">⏳</span>
        <h2>Carregando...</h2>
      </div>
    </div>
  );
}