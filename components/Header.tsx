"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logout, User } from "@/lib/auth";
import { useToast } from "./ToastProvider";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    showToast("👋 Você saiu da sua conta.", "info");
    router.push("/");
  };

  // Regras de visibilidade dos links
  const showInicio = !(user?.role === "admin" || pathname === "/dashboard");
  const showMeuPainel = !(user?.role === "admin"); // admin não vê "Meu Painel"
  const showAdmin = user?.role === "admin";

  return (
    <header className="header">
      <div className="header-logo">
        <div className="logo-icon">🪸</div>
        <div>
          <div className="header-title">Simpósio Coral Vivo</div>
          <div className="header-subtitle">Branqueamento de Corais · 2026</div>
        </div>
      </div>
      <nav className="nav-tabs">
        {showInicio && (
          <Link href="/" className={`nav-tab ${pathname === "/" ? "active" : ""}`}>
            🏠 Início
          </Link>
        )}
        {!user && pathname !== "/login" && (
          <Link href="/login" className="nav-tab">🔐 Entrar</Link>
        )}
        {user && showMeuPainel && (
          <Link href="/dashboard" className={`nav-tab ${pathname === "/dashboard" ? "active" : ""}`}>
            📊 Meu Painel
          </Link>
        )}
        {user && showAdmin && (
          <Link href="/admin" className={`nav-tab ${pathname === "/admin" ? "active" : ""}`}>
            🔒 Admin
          </Link>
        )}
        {user && (
          <button className="nav-tab logout-tab" onClick={handleLogout}>
            🚪 Sair
          </button>
        )}
      </nav>
    </header>
  );
}