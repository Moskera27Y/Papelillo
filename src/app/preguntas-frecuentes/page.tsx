import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
};

export default function PreguntasFrecuentesPage() {
  return (
    <div className="min-h-screen bg-paper py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-8">
          Preguntas Frecuentes
        </h1>
        <div className="bg-paper-cream rounded-3xl border-2 border-ink p-8 space-y-4 text-ink-muted">
          <p>
            Esta sección está preparada para incluir las preguntas frecuentes de Papelillo.
          </p>
          <p>
            Por ahora, este es un placeholder que será reemplazado con el contenido definitivo
            cuando esté disponible.
          </p>
          <p className="text-sm">
            Edita este archivo en: <code className="bg-paper px-2 py-1 rounded">src/app/preguntas-frecuentes/page.tsx</code>
          </p>
        </div>
      </div>
    </div>
  );
}
