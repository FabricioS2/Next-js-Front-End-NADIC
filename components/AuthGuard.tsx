"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default function AuthGuard({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
    } else if (requireAdmin && user.role !== "admin") {
      router.push("/dashboard");
    } else {
      setLoading(false);
    }
  }, [requireAdmin, router]);

  if (loading) return <div className="loading">Verificando acesso...</div>;
  return <>{children}</>;
}