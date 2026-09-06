"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
  label?: string;
  pageTitle?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Error Boundary REAL que muestra el error TÉCNICO EXACTO
 * (stack trace + mensaje), en lugar de "Ups, algo salió mal".
 * Usa React.Component porque los hooks no pueden capturar errors de render.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Loggear el error real al cliente (no se oculta)
    if (typeof window !== "undefined") {
      window.__PAPELILLO_LAST_RENDER_ERROR__ = {
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        timestamp: new Date().toISOString(),
      };
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      const error = this.state.error;
      if (this.props.fallback) {
        return <>{this.props.fallback(error, this.reset)}</>;
      }

      // Renderiza el error TÉCNICO EXACTO (no mensaje genérico)
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6">
          <div className="max-w-3xl w-full bg-brand-red/5 border-2 border-brand-red rounded-3xl p-6 text-ink">
            <h1 className="font-display text-2xl font-bold text-brand-red mb-4">
              ⚠️ Error de renderizado
            </h1>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-bold">Tipo:</span>{" "}
                <code className="bg-ink/10 px-2 py-1 rounded">{error.name}</code>
              </div>
              <div>
                <span className="font-bold">Mensaje:</span>
                <pre className="bg-ink text-paper p-3 rounded-xl overflow-x-auto whitespace-pre-wrap text-xs mt-1">
                  {error.message}
                </pre>
              </div>
              <details className="mt-3">
                <summary className="font-bold cursor-pointer text-ink-muted">
                  Stack completo (click para expandir)
                </summary>
                <pre className="bg-ink/10 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap text-xs mt-2 text-ink">
                  {error.stack?.split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </pre>
              </details>
            </div>
            <button
              onClick={() => {
                this.reset();
                window.location.reload();
              }}
              className="mt-4 bg-ink text-paper font-bold rounded-full px-5 py-2 hover:bg-opacity-90 transition-colors"
            >
              Recargar y reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Hook para leer el último error capturado (para debugging en consola)
export function useLastError(): { message: string; stack?: string; componentStack?: string } | null {
  if (typeof window !== "undefined" && (window as any).__PAPELILLO_LAST_RENDER_ERROR__) {
    return (window as any).__PAPELILLO_LAST_RENDER_ERROR__;
  }
  return null;
}
