import { Metadata } from "next";
import { siteContent } from "@/data/site-content";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Personalizados",
  description: "Crea productos únicos con tu estilo. Invitaciones, cajas, rompecabezas y más.",
};

export default function PersonalizadosPage() {
  const { personalized } = siteContent;

  return (
    <div className="min-h-screen bg-paper">
      <section className="py-16 lg:py-24 bg-paper-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ink mb-6 leading-tight">
            {personalized.heroTitle}
          </h1>
          <p className="text-xl text-ink-muted max-w-2xl mx-auto mb-10">
            {personalized.heroDescription}
          </p>
          <Button href="/contacto" variant="primary" size="lg">
            Quiero personalizar
          </Button>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink text-center mb-16">
            CÓMO FUNCIONA
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {personalized.process.map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-yellow rounded-full border-2 border-ink shadow-sticker mb-4">
                  <span className="font-display text-2xl font-bold">{step.step}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-ink mb-2">{step.title}</h3>
                <p className="text-ink-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-paper-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink text-center mb-12">
            LO QUE PODEMOS CREAR JUNTOS
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { label: "Invitaciones", color: "bg-brand-red" },
              { label: "Cajas", color: "bg-brand-yellow" },
              { label: "Rompecabezas", color: "bg-brand-green" },
              { label: "Pizarras", color: "bg-brand-blue" },
              { label: "Stickers", color: "bg-brand-yellow" },
              { label: "Etiquetas", color: "bg-brand-red" },
              { label: "Trípticos", color: "bg-brand-green" },
              { label: "Y mucho más", color: "bg-paper" },
            ].map((item, i) => (
              <div
                key={i}
                className={`${item.color} rounded-3xl border-2 border-ink shadow-sticker aspect-square flex items-center justify-center p-4`}
              >
                <p className="font-display text-lg md:text-xl font-bold text-ink text-center">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
