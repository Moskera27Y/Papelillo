"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Usuario o contraseña incorrectos.");
        setLoading(false);
        return;
      }
      router.replace("/admin");
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 relative overflow-hidden">
      {/* Doodles decorativos */}
      <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-brand-yellow opacity-60 blur-2xl" />
      <div className="absolute bottom-20 right-16 w-32 h-32 rounded-full bg-brand-red opacity-60 blur-2xl" />
      <div className="absolute top-1/3 right-20 w-20 h-20 rounded-full bg-brand-green opacity-60 blur-2xl" />
      <div className="absolute bottom-1/3 left-20 w-28 h-28 rounded-full bg-brand-blue opacity-60 blur-2xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-full bg-brand-red border-2 border-ink shadow-sticker items-center justify-center mb-4">
            <span className="font-display font-bold text-paper text-2xl">P</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-ink mb-2">Papelillo</h1>
          <p className="text-ink-muted">Panel administrativo</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-paper rounded-3xl border-2 border-ink shadow-sticker-lg p-8"
        >
          <h2 className="font-display text-2xl font-bold text-ink mb-6">Iniciar sesión</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-ink mb-2">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 border-2 border-ink rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="admin"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ink mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border-2 border-ink rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-brand-red text-paper rounded-2xl border-2 border-ink px-4 py-2 text-sm font-semibold">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </div>

          <div className="mt-6 bg-paper-soft rounded-2xl border-2 border-ink/10 p-4 text-xs text-ink-muted">
            <p className="font-semibold text-ink mb-1">Credenciales por defecto</p>
            <p>
              Usuario: <code className="bg-paper px-1.5 py-0.5 rounded">admin</code>
            </p>
            <p>
              Contraseña: <code className="bg-paper px-1.5 py-0.5 rounded">papelillo2026</code>
            </p>
            <p className="mt-1 opacity-80">
              Puedes cambiarlas desde <strong>Configuración</strong> una vez adentro.
            </p>
          </div>
        </form>

        <p className="text-center text-xs text-ink-muted mt-6">
          <a href="/" className="hover:text-ink underline">
            ← Volver al sitio
          </a>
        </p>
      </div>
    </div>
  );
}
