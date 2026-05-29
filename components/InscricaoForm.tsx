"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useToast } from "./ToastProvider";

export default function InscricaoForm() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get("nome") as string,
      email: formData.get("email") as string,
      senha: formData.get("senha") as string,
      instituicao: formData.get("instituicao") as string,
      categoria: formData.get("categoria") as string,
      pais: formData.get("pais") as string || "Brasil",
      telefone: formData.get("telefone") as string,
    };
    if (!data.nome || !data.email || !data.senha || !data.categoria) {
      showToast("Preencha todos os campos obrigatórios.", "error");
      setLoading(false);
      return;
    }
    try {
      await api.post("/api/inscricoes/", data);
      showToast("✅ Inscrição realizada com sucesso! Faça login para submeter artigos.", "success");
      e.currentTarget.reset();
      router.push("/login");
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Erro ao inscrever";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">Nome Completo *</label><input name="nome" className="form-input" required /></div>
        <div className="form-group"><label className="form-label">E-mail *</label><input name="email" type="email" className="form-input" required /></div>
        <div className="form-group"><label className="form-label">Senha *</label><input name="senha" type="password" className="form-input" required /></div>
        <div className="form-group"><label className="form-label">Instituição</label><input name="instituicao" className="form-input" /></div>
        <div className="form-group"><label className="form-label">Categoria *</label>
          <select name="categoria" className="form-select" required>
            <option value="">Selecione...</option>
            <option value="pesquisador">Pesquisador(a)</option>
            <option value="estudante">Estudante de Pós-Graduação</option>
            <option value="graduacao">Estudante de Graduação</option>
            <option value="profissional">Profissional da Área</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">País</label><input name="pais" className="form-input" defaultValue="Brasil" /></div>
        <div className="form-group"><label className="form-label">Telefone</label><input name="telefone" className="form-input" /></div>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>✅ Confirmar Inscrição</button>
    </form>
  );
}