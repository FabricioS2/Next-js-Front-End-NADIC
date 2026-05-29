"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import api from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

interface Inscrito {
  id: number;
  nome: string;
  email: string;
  instituicao: string;
  categoria: string;
  dataCriacao: string;
}

interface Artigo {
  id: number;
  titulo: string;
  autorNome: string;
  area: string;
  dataSubmissao: string;
  resumo: string;
  palavrasChave: string;
}

export default function AdminPage() {
  const [inscritos, setInscritos] = useState<Inscrito[]>([]);
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const router = useRouter();

  const loadData = async () => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    try {
      const [inscRes, artRes] = await Promise.all([
        api.get("/api/admin/inscricoes/"),
        api.get("/api/admin/artigos/"),
      ]);
      setInscritos(inscRes.data);
      setArtigos(artRes.data);
    } catch (err) {
      showToast("Erro ao carregar dados", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearAll = async () => {
    if (confirm("Tem certeza que deseja apagar TODOS os dados?")) {
      try {
        await api.delete("/api/admin/limpar-dados/");
        showToast("Dados removidos com sucesso", "success");
        loadData();
      } catch {
        showToast("Erro ao limpar dados", "error");
      }
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="main-overlay">
      <div className="admin-header">
        <h2><span>📊</span> Painel Administrativo</h2>
      </div>
      <div className="admin-content">
        <div className="glass-card">
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-number">{inscritos.length}</div><div className="stat-label">Inscritos</div></div>
            <div className="stat-card"><div className="stat-number teal">{artigos.length}</div><div className="stat-label">Artigos</div></div>
          </div>
        </div>

        <div className="glass-card">
          <h3>📋 Últimos Inscritos</h3>
          <div className="table-wrapper">
            <table><thead><tr><th>Nome</th><th>E-mail</th><th>Instituição</th><th>Categoria</th><th>Data</th></tr></thead>
            <tbody>
              {inscritos.map(i => (
                <tr key={i.id}><td>{i.nome}</td><td>{i.email}</td><td>{i.instituicao || "-"}</td><td>{i.categoria}</td><td>{new Date(i.dataCriacao).toLocaleString()}</td></tr>
              ))}
              {inscritos.length === 0 && <tr><td colSpan={5}>Nenhum inscrito</td></tr>}
            </tbody></table>
          </div>
        </div>

        <div className="glass-card">
          <h3>📄 Artigos Submetidos</h3>
          <div className="table-wrapper">
            <table><thead><tr><th>Título</th><th>Autor</th><th>Área</th><th>Data</th></tr></thead>
            <tbody>
              {artigos.map(a => (
                <tr key={a.id} className="clickable" onClick={() => alert(`Resumo: ${a.resumo}\nPalavras-chave: ${a.palavrasChave || "N/A"}`)}>
                  <td>{a.titulo}</td><td>{a.autorNome}</td><td>{a.area}</td><td>{new Date(a.dataSubmissao).toLocaleString()}</td>
                </tr>
              ))}
              {artigos.length === 0 && <tr><td colSpan={4}>Nenhum artigo</td></tr>}
            </tbody></table>
          </div>
        </div>

      </div>
    </div>
  );
}