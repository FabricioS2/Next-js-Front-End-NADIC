"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';  // 'user' = comum, 'admin' = admin
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
    } else if (requiredRole && user.role !== requiredRole) {
      // Redireciona se o papel não corresponde
      if (user.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      setLoading(false);
    }
  }, [requiredRole, router]);

  if (loading) return <div className="loading">Verificando acesso...</div>;
  return <>{children}</>;
}