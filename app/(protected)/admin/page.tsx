"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import api from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import AuthGuard from "@/components/AuthGuard";

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
    arquivo?: string;
}

export default function AdminPage() {
    const [inscritos, setInscritos] = useState<Inscrito[]>([]);
    const [artigos, setArtigos] = useState<Artigo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArtigo, setSelectedArtigo] = useState<Artigo | null>(null); // controle do modal
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

    const openModal = (artigo: Artigo) => {
        setSelectedArtigo(artigo);
    };

    const closeModal = () => {
        setSelectedArtigo(null);
    };

    if (loading) return <div className="loading">Carregando...</div>;

    return (
        <AuthGuard requiredRole="admin">
            <div className="main-overlay">
                <div className="admin-header">
                    <h2><span>📊</span> Painel Administrativo</h2>
                </div>
                <div
                    className="admin-content"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                    }}
                >
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
                            <table>
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Autor</th>
                                        <th>Área</th>
                                        <th>Data</th>
                                        <th>Arquivo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {artigos.map(a => (
                                        <tr
                                            key={a.id}
                                            className="clickable"
                                            onClick={() => openModal(a)}  // abre o modal com o artigo
                                        >
                                            <td>{a.titulo}</td>
                                            <td>{a.autorNome}</td>
                                            <td>{a.area}</td>
                                            <td>{new Date(a.dataSubmissao).toLocaleString()}</td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                {a.arquivo ? (
                                                    <a
                                                        href={a.arquivo}
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
                                    ))}
                                    {artigos.length === 0 && <tr><td colSpan={5}>Nenhum artigo</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modal (popup) de detalhes do artigo */}
                {selectedArtigo && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                        }}
                        onClick={closeModal} // fecha ao clicar fora
                    >
                        <div
                            style={{
                                background: 'var(--glass-bg, rgba(10,20,40,0.9))',
                                border: '1px solid var(--glass-border, rgba(255,255,255,0.2))',
                                borderRadius: '1rem',
                                padding: '2rem',
                                maxWidth: '600px',
                                width: '90%',
                                maxHeight: '80vh',        // ← limite de altura
                                overflowY: 'auto',        // ← rolagem interna quando necessário
                                color: 'var(--text-color, #fff)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                backdropFilter: 'blur(8px)',
                                position: 'relative',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeModal}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted, #aaa)',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    lineHeight: 1,
                                }}
                            >
                                ✕
                            </button>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>{selectedArtigo.titulo}</h3>
                            <p><strong>Autor:</strong> {selectedArtigo.autorNome}</p>
                            <p><strong>Área:</strong> {selectedArtigo.area}</p>
                            <p><strong>Data de Submissão:</strong> {new Date(selectedArtigo.dataSubmissao).toLocaleString()}</p>
                            <div style={{ margin: '1rem 0' }}>
                                <strong>Resumo:</strong>
                                <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', color: 'var(--text-muted, #ccc)' }}>{selectedArtigo.resumo}</p>
                            </div>
                            {selectedArtigo.palavrasChave && (
                                <p><strong>Palavras-chave:</strong> {selectedArtigo.palavrasChave}</p>
                            )}
                            {selectedArtigo.arquivo && (
                                <div style={{ marginTop: '1rem' }}>
                                    <a
                                        href={selectedArtigo.arquivo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        📄 Visualizar arquivo
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}