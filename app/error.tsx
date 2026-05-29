"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="content-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div className="glass-card" style={{ textAlign: "center" }}>
        <span className="card-icon">⚠️</span>
        <h2>Ops! Algo deu errado</h2>
        <p>{error.message}</p>
        <button className="btn btn-primary" onClick={reset}>Tentar novamente</button>
      </div>
    </div>
  );
}