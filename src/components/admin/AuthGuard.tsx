"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useDataService";

/**
 * Wrapper que redirige a /admin/login si no hay sesión activa.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-ink-muted text-sm">Cargando…</div>
      </div>
    );
  }

  return <>{children}</>;
}
