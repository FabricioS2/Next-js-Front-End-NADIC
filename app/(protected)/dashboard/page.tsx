"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, User } from "@/lib/auth";
import api from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import AuthGuard from "@/components/AuthGuard";

interface Artigo {
  id: number;
  titulo: string;
  area: string;
  dataSubmissao: string;
  resumo: string;
  palavrasChave: string;
  arquivo?: string;           // ← adicionado
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [activePanel, setActivePanel] = useState<"home" | "articles">("home");
  const [artForm, setArtForm] = useState({ titulo: "", resumo: "", palavrasChave: "", area: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/login");
      return;
    }
    setUser(current);
    loadArtigos(current);
  }, []);

  const loadArtigos = async (user: User) => {
    try {
      const url = user.role === "admin" ? "/api/admin/artigos/" : "/api/artigos/";
      const res = await api.get(url);
      setArtigos(res.data);
    } catch (err) {
      console.error(err);
      setArtigos([]);
    }
  };

  const handleSubmitArtigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData();
    formData.append("titulo", artForm.titulo);
    formData.append("resumo", artForm.resumo);
    formData.append("palavrasChave", artForm.palavrasChave);
    formData.append("area", artForm.area);
    if (selectedFile) formData.append("arquivo", selectedFile);
    try {
      const res = await api.post("/api/artigos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setArtigos(prev => [res.data, ...prev]);
      showToast("📄 Artigo submetido com sucesso!", "success");
      setArtForm({ titulo: "", resumo: "", palavrasChave: "", area: "" });
      setSelectedFile(null);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Erro ao submeter", "error");
    }
  };

  // Função para construir URL do arquivo
  const getFileUrl = (relativePath: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${base}/media/${relativePath}`;
  };

  if (!user) return <div className="loading">Carregando...</div>;

  return (
    <AuthGuard requiredRole="user">
      <div className="main-overlay">
        <div className="content-wrapper">
          <div className="glass-card">
            <span className="card-icon">👋</span>
            <h2 className="card-title">Bem-vindo(a), {user.nome.split(" ")[0] || "Participante"}!</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number teal">{artigos.length}</div>
                <div className="stat-label">Meus Artigos Submetidos</div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <button
                className={`btn ${activePanel === "home" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setActivePanel("home")}
              >
                📋 Meus Artigos
              </button>
              <button
                className={`btn ${activePanel === "articles" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setActivePanel("articles")}
              >
                ✍️ Submeter Artigo
              </button>
            </div>

            {activePanel === "home" && (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Área</th>
                      <th>Data</th>
                      <th>Arquivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artigos.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center" }}>
                          Nenhum artigo submetido
                        </td>
                      </tr>
                    ) : (
                      artigos.map(a => (
                        <tr key={a.id}>
                          <td>{a.titulo}</td>
                          <td>{a.area}</td>
                          <td>{new Date(a.dataSubmissao).toLocaleString()}</td>
                          <td>
                            {a.arquivo ? (
                              <a
                                href={a.arquivo}   // ← usa a URL já retornada pelo backend
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline"
                                style={{ padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}
                              >
                                📄 Ver
                              </a>
                            ) : (
                              <span style={{ color: "var(--text-muted, #888)" }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activePanel === "articles" && (
              <form onSubmit={handleSubmitArtigo}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Título *</label>
                    <input
                      className="form-input"
                      value={artForm.titulo}
                      onChange={e => setArtForm({ ...artForm, titulo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Resumo *</label>
                    <textarea
                      className="form-textarea"
                      rows={5}
                      value={artForm.resumo}
                      onChange={e => setArtForm({ ...artForm, resumo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Palavras-chave</label>
                    <input
                      className="form-input"
                      value={artForm.palavrasChave}
                      onChange={e => setArtForm({ ...artForm, palavrasChave: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Área *</label>
                    <select
                      className="form-select"
                      value={artForm.area}
                      onChange={e => setArtForm({ ...artForm, area: e.target.value })}
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="biologia">Biologia Marinha</option>
                      <option value="ecologia">Ecologia de Recifes</option>
                      <option value="clima">Mudanças Climáticas</option>
                      <option value="conservacao">Conservação</option>
                    </select>
                  </div>
                 <div className="form-group full-width">
  <label className="form-label">Arquivo (PDF/DOCX)</label>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <label
      className="btn btn-outline"
      style={{
        cursor: 'pointer',
        margin: 0,
        padding: '0.5rem 1rem',
        background: 'var(--glass-bg, rgba(255,255,255,0.1))',
        backdropFilter: 'blur(4px)',
        border: '1px solid var(--glass-border, rgba(255,255,255,0.2))',
        borderRadius: '0.5rem',
        color: 'var(--text-color, #fff)',
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      📎 Selecionar arquivo
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
        style={{ display: 'none' }}
      />
    </label>
    {selectedFile ? (
      <span style={{ color: 'var(--text-muted, #aaa)', fontSize: '0.9rem', wordBreak: 'break-word' }}>
        {selectedFile.name}
      </span>
    ) : (
      <span style={{ color: 'var(--text-muted, #888)', fontSize: '0.85rem' }}>
        Nenhum arquivo selecionado
      </span>
    )}
  </div>
</div>
                </div>
                <button type="submit" className="btn btn-primary">
                  📤 Submeter
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}