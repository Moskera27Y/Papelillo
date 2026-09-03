import { Metadata } from "next";
import { siteContent } from "@/data/site-content";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce la historia y los valores de Papelillo.",
};

export default function NosotrosPage() {
  const { about } = siteContent;

  return (
    <div className="min-h-screen bg-paper">
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-red mb-3">
              {about.eyebrow}
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ink mb-6 leading-tight">
              {about.title}
            </h1>
            <p className="text-xl text-ink-muted">{about.intro}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {about.values.map((value, i) => (
              <div
                key={i}
                className="bg-paper rounded-3xl border-2 border-ink shadow-sticker p-6 text-center"
              >
                <Badge color={value.color} className="mb-4">
                  {value.label}
                </Badge>
                <p className="text-ink-muted">{value.text}</p>
              </div>
            ))}
          </div>

          <div className="bg-paper-cream rounded-3xl border-2 border-ink p-8 md:p-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-6 text-center">
              NUESTRA FILOSOFÍA
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 text-lg text-ink-muted">
              <p>
                Creemos que el papel puede ser mucho más que un material. Puede ser un lienzo para la imaginación,
                un puente entre ideas y emociones, un detalle que transforma un momento ordinario en algo memorable.
              </p>
              <p>
                Cada producto que creamos lleva consigo horas de diseño, prueba y cuidado. No producimos en masa
                sin pensar. Cada invitación, cada sticker, cada caja tiene una historia detrás: la tuya.
              </p>
              <p>
                Por eso trabajamos con detalle, con color, con alegría. Porque creemos que las cosas hechas con
                amor y creatividad tienen el poder de hacer sonreír, de emocionar, de conectar.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
