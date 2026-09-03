"use client";

import React, { useState, useEffect } from "react";
import { siteConfig, buildWhatsAppLink } from "@/lib/config";
import { messagesService } from "@/services";

export default function ContactoClientPage() {
  const whatsappHref = buildWhatsAppLink();
  const hasWhatsApp = siteConfig.whatsappNumber !== "";
  const hasEmail = siteConfig.email !== "";

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Auto-focus en el nombre después del primer render
  useEffect(() => {
    const t = setTimeout(() => {
      const el = document.getElementById("contact-name");
      if (el) (el as HTMLInputElement).focus();
    }, 200);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.message.trim()) {
      setError("Por favor, completa tu nombre y mensaje.");
      return;
    }
    setIsSubmitting(true);
    try {
      messagesService.createMessage({
        name: form.name,
        email: form.email,
        message: form.message,
      });
      setIsSubmitted(true);
    } catch (err) {
      setError("No se pudo enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red mb-3">
              Contáctanos
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ink mb-6">
              HABLEMOS
            </h1>
            <p className="text-xl text-ink-muted">
              Estamos aquí para ayudarte con tus ideas y proyectos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* WhatsApp */}
            <div className="bg-brand-green rounded-3xl border-2 border-ink shadow-sticker p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.822 0 00-3.48-8.413Z" />
              </svg>
              <h3 className="font-display text-2xl font-bold mb-2">WhatsApp</h3>
              {hasWhatsApp ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-ink text-paper font-bold rounded-full px-6 py-3 hover:bg-opacity-90 transition-all shadow-sticker hover:-translate-y-0.5"
                >
                  Escríbenos
                </a>
              ) : (
                <p className="text-sm text-ink-muted">
                  Configura WhatsApp en <code className="bg-paper px-2 py-1 rounded">src/lib/config.ts</code>
                </p>
              )}
            </div>

            {/* Email */}
            <div className="bg-brand-yellow rounded-3xl border-2 border-ink shadow-sticker p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="font-display text-2xl font-bold mb-2">Email</h3>
              {hasEmail ? (
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-block bg-ink text-paper font-bold rounded-full px-6 py-3 hover:bg-opacity-90 transition-all shadow-sticker hover:-translate-y-0.5 break-all"
                >
                  {siteConfig.email}
                </a>
              ) : (
                <p className="text-sm text-ink-muted">
                  Configura el email en <code className="bg-paper px-2 py-1 rounded">src/lib/config.ts</code>
                </p>
              )}
            </div>

            {/* Instagram */}
            <div className="bg-brand-red rounded-3xl border-2 border-ink shadow-sticker p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              <h3 className="font-display text-2xl font-bold mb-2">Instagram</h3>
              {siteConfig.instagramUrl ? (
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-ink text-paper font-bold rounded-full px-6 py-3 hover:bg-opacity-90 transition-all shadow-sticker hover:-translate-y-0.5"
                >
                  Síguenos
                </a>
              ) : (
                <p className="text-sm text-ink-muted">
                  Configura Instagram en <code className="bg-paper px-2 py-1 rounded">src/lib/config.ts</code>
                </p>
              )}
            </div>

            {/* Ubicación */}
            <div className="bg-brand-blue rounded-3xl border-2 border-ink shadow-sticker p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="font-display text-2xl font-bold mb-2">Ubicación</h3>
              {siteConfig.address ? (
                <p className="text-ink">{siteConfig.address}</p>
              ) : (
                <p className="text-sm text-ink-muted">
                  Configura la dirección en <code className="bg-paper px-2 py-1 rounded">src/lib/config.ts</code>
                </p>
              )}
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="max-w-2xl mx-auto mt-16">
            <div className="bg-paper-cream rounded-3xl border-2 border-ink/10 shadow-paper p-8">
              <h2 className="font-display text-3xl font-bold text-ink mb-6 text-center">
                O envíanos un mensaje
              </h2>

              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-brand-green rounded-full border-2 border-ink flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-paper" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-2">
                    ¡Gracias por escribirnos!
                  </h3>
                  <p className="text-ink-muted mb-6">
                    Hemos recibido tu mensaje y te responderemos pronto por email o WhatsApp.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setForm({ name: "", email: "", message: "" });
                    }}
                    className="text-brand-red font-bold hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-brand-red/10 border-2 border-brand-red/30 rounded-2xl p-4 text-sm text-brand-red">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-bold text-ink mb-2">
                        Nombre
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-ink/10 rounded-2xl bg-paper focus:border-brand-red focus:outline-none transition-colors"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-bold text-ink mb-2">
                        Email (opcional)
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-ink/10 rounded-2xl bg-paper focus:border-brand-red focus:outline-none transition-colors"
                        placeholder="juan@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-bold text-ink mb-2">
                      Mensaje
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-ink/10 rounded-2xl bg-paper focus:border-brand-red focus:outline-none transition-colors resize-none"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-ink text-paper font-bold rounded-full px-8 py-4 hover:bg-opacity-90 transition-all shadow-sticker hover:shadow-sticker-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.071 1.404 5.78 3.657 7.539l.707-.707z"></path>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      "Enviar mensaje"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
