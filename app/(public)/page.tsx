"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

export default function HomePage() {
  const [activePanel, setActivePanel] = useState<"home" | "register">("home");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    instituicao: "",
    categoria: "",
    pais: "Brasil",
    telefone: "",
  });
  const { showToast } = useToast();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nome, email, senha, categoria } = form;
    if (!nome || !email || !senha || !categoria) {
      showToast("⚠️ Preencha todos os campos obrigatórios.", "error");
      return;
    }
    try {
      await api.post("/api/inscricoes/", form);
      showToast("✅ Inscrição realizada com sucesso! Faça login.", "success");
      setForm({
        nome: "",
        email: "",
        senha: "",
        instituicao: "",
        categoria: "",
        pais: "Brasil",
        telefone: "",
      });
      router.push("/login");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Erro ao inscrever";
      showToast(`❌ ${msg}`, "error");
    }
  };

  return (
    <div className="main-overlay">
      <div className="content-wrapper">
        {activePanel === "home" && (
          <div className="panel active">
            <div className="glass-card card-destaque">
              <span className="card-icon">🪸</span>
              <h2 className="card-title">Bem-vindo ao Simpósio Coral Vivo 2026</h2>
              <p className="card-subtitle">
                O maior evento científico sobre branqueamento de corais da América Latina
              </p>
              <p style={{ lineHeight: 1.8, color: "var(--text-muted)" }}>
                O <strong style={{ color: "#fff" }}>branqueamento de corais</strong> é um dos fenômenos mais
                alarmantes dos oceanos contemporâneos...
              </p>
            </div>

            <div className="glass-card">
              <h3 style={{ fontFamily: "var(--font-heading)", color: "#fff", marginBottom: "0.5rem" }}>
                🔬 Como ocorre o branqueamento?
              </h3>
              <p className="card-subtitle">Entenda o processo que ameaça os recifes de coral</p>
              <div className="bleaching-diagram">
                <div className="diagram-step">
                  <span className="diagram-icon">🌡️</span>
                  <span className="diagram-label">Aumento da temperatura</span>
                  <small style={{ color: "var(--text-muted)", display: "block", marginTop: "0.3rem" }}>
                    +1°C a +2°C acima da média
                  </small>
                </div>
                <span className="diagram-arrow">→</span>
                <div className="diagram-step">
                  <span className="diagram-icon">😰</span>
                  <span className="diagram-label">Estresse do coral</span>
                  <small style={{ color: "var(--text-muted)", display: "block", marginTop: "0.3rem" }}>
                    Expulsão das zooxantelas
                  </small>
                </div>
                <span className="diagram-arrow">→</span>
                <div className="diagram-step">
                  <span className="diagram-icon">🦴</span>
                  <span className="diagram-label">Branqueamento visível</span>
                  <small style={{ color: "var(--text-muted)", display: "block", marginTop: "0.3rem" }}>
                    Tecido transparente expõe esqueleto
                  </small>
                </div>
                <span className="diagram-arrow">→</span>
                <div className="diagram-step">
                  <span className="diagram-icon">💀</span>
                  <span className="diagram-label">Mortalidade</span>
                  <small style={{ color: "var(--text-muted)", display: "block", marginTop: "0.3rem" }}>
                    Sem retorno das algas em 6-8 semanas
                  </small>
                </div>
              </div>

              {/* Seção de imagens - mantenha ou remova conforme necessário */}
              <div style={{ marginTop: "2rem" }}>
                <h4 style={{ fontFamily: "var(--font-heading)", color: "#fff", marginBottom: "1rem", textAlign: "center" }}>
                  🪸 Antes e depois: o impacto visível do branqueamento
                </h4>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                }}>
                  <div style={{
                    background: "var(--glass-bg-light)",
                    borderRadius: "var(--radius-sm)",
                    padding: "1rem",
                    textAlign: "center",
                    border: "1px solid var(--ocean-border)",
                  }}>
                    <Image
                      src="/images/corais-vivos.jpg"
                      alt="Recife de coral saudável"
                      width={600}
                      height={400}
                      style={{ borderRadius: "8px", width: "100%", height: "auto", objectFit: "cover" }}
                      priority
                    />
                    <p style={{ color: "var(--coral-healthy)", marginTop: "0.8rem", fontWeight: 600 }}>
                      🌊 Coral saudável – cores vivas
                    </p>
                  </div>
                  <div style={{
                    background: "var(--glass-bg-light)",
                    borderRadius: "var(--radius-sm)",
                    padding: "1rem",
                    textAlign: "center",
                    border: "1px solid var(--ocean-border)",
                  }}>
                    <Image
                      src="/images/corais-brancos.jpg"
                      alt="Coral branqueado"
                      width={600}
                      height={400}
                      style={{ borderRadius: "8px", width: "100%", height: "auto", objectFit: "cover" }}
                    />
                    <p style={{ color: "var(--bleached)", marginTop: "0.8rem", fontWeight: 600 }}>
                      💀 Coral branqueado – perda total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontFamily: "var(--font-heading)", color: "#fff", marginBottom: "0.5rem" }}>
                📊 O impacto em números
              </h3>
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-number">50%</div><div className="stat-label">dos corais da Grande Barreira perdidos</div></div>
                <div className="stat-card"><div className="stat-number teal">75%</div><div className="stat-label">dos recifes mundiais em risco até 2050</div></div>
                <div className="stat-card"><div className="stat-number">500M</div><div className="stat-label">de pessoas dependem dos recifes</div></div>
              </div>
            </div>

            <div className="info-grid">
              {[
                { icon: "🪸🐠", title: "O que são zooxantelas?", text: "Microalgas que fornecem até 90% da energia do coral." },
                { icon: "🌊⚠️", title: "Causas do branqueamento", text: "Aquecimento global, acidificação oceânica..." },
                { icon: "⏳🔁", title: "Recuperação possível?", text: "Se as condições voltarem ao normal em 2 a 8 semanas..." },
                { icon: "🇧🇷🌴", title: "Recifes brasileiros", text: "O Brasil possui os únicos recifes do Atlântico Sul." },
              ].map((item, idx) => (
                <div className="info-card" key={idx}>
                  <span className="info-icon">{item.icon}</span>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
              <button className="btn btn-primary" onClick={() => setActivePanel("register")}>
                📝 Inscrever-se Agora
              </button>
            </div>
          </div>
        )}

        {activePanel === "register" && (
          <div className="panel active">
            <div className="glass-card">
              <span className="card-icon">📝</span>
              <h2 className="card-title">Inscrição no Evento</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label" htmlFor="nome">Nome Completo *</label><input className="form-input" id="nome" value={form.nome} onChange={handleChange} required /></div>
                  <div className="form-group"><label className="form-label" htmlFor="email">E-mail *</label><input className="form-input" type="email" id="email" value={form.email} onChange={handleChange} required /></div>
                  <div className="form-group"><label className="form-label" htmlFor="senha">Senha *</label><input className="form-input" type="password" id="senha" value={form.senha} onChange={handleChange} required /></div>
                  <div className="form-group"><label className="form-label" htmlFor="instituicao">Instituição</label><input className="form-input" id="instituicao" value={form.instituicao} onChange={handleChange} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="categoria">Categoria *</label>
                    <select className="form-select" id="categoria" value={form.categoria} onChange={handleChange} required>
                      <option value="">Selecione...</option>
                      <option value="pesquisador">Pesquisador(a)</option>
                      <option value="estudante">Estudante de Pós-Graduação</option>
                      <option value="graduacao">Estudante de Graduação</option>
                      <option value="profissional">Profissional da Área</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label" htmlFor="pais">País</label><input className="form-input" id="pais" value={form.pais} onChange={handleChange} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="telefone">Telefone</label><input className="form-input" id="telefone" value={form.telefone} onChange={handleChange} /></div>
                </div>
                <button type="submit" className="btn btn-primary">✅ Confirmar Inscrição</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}