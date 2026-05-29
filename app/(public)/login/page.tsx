"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      showToast("Login realizado com sucesso!", "success");
      router.push(callbackUrl);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "E-mail ou senha incorretos";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper" style={{ maxWidth: 500, margin: "2rem auto" }}>
      <div className="glass-card login-card">
        <span className="card-icon">🔐</span>
        <h2 className="card-title">Acesso do Participante</h2>
        <p className="card-subtitle">Entre com seu e-mail e senha cadastrados</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input type="password" className="form-input" value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>🔓 Entrar</button>
        </form>
        <p className="card-subtitle" style={{ marginTop: "1rem", fontSize: "0.75rem" }}>
          Administrador: utilize as credenciais fornecidas pelo backend.
        </p>
      </div>
    </div>
  );
}