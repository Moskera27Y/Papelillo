"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 relative overflow-hidden">
      {/* Fondo animado con gradiente cálido */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/30 via-brand-red/30 to-brand-green/30 animate-gradient-x" />

      {/* Elementos decorativos flotantes */}
      <div className="absolute top-20 left-16 w-32 h-32 bg-brand-yellow/40 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 right-16 w-36 h-36 bg-brand-blue/30 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-brand-green/50 rounded-full blur-2xl animate-pulse-soft" style={{ animationDelay: "0.3s" }} />
      <div className="absolute bottom-1/3 left-1/4 w-28 h-28 bg-brand-red/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "0.5s" }} />

      <div className="relative z-10 text-center max-w-md animate-fade-up">
        <div
          className="w-20 h-20 bg-brand-yellow rounded-full border-2 border-ink flex items-center justify-center mx-auto mb-6 animate-bounce"
          style={{ animationDuration: "2s" }}
        >
          <svg
            className="w-10 h-10 text-ink"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9V3.343l1.5 1.5A6.35 6.35 0 0121 9v6.155a2.85 2.85 0 01-2.85 2.85H5.85A2.85 2.85 0 013 15.155V9a6.35 6.35 0 012.5-4.157V3"
            />
          </svg>
        </div>

        <h1 className="font-display text-4xl font-bold text-ink mb-4">
          Ups, algo salió mal
        </h1>
        <p className="text-ink-muted mb-8">
          No te preocupes, esto pasa. Puedes recargar la página o volver al inicio.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-ink text-paper font-bold rounded-full px-6 py-2 hover:scale-105 transition-transform animate-pulse-soft"
            style={{ animationDelay: "0.2s" }}
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="border-2 border-ink text-ink font-bold rounded-full px-6 py-2 hover:bg-brand-red hover:text-paper transition-all hover:scale-105 animate-pulse-soft"
            style={{ animationDelay: "0.4s" }}
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
