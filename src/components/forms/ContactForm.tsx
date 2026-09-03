"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  });

  const [status, setStatus] = useState<FormStatus>("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Simulación de envío - en Fase 2 esto se conectará a Resend u otro servicio
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("success");

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "" });
        setStatus("idle");
      }, 3000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-paper rounded-3xl border-2 border-ink shadow-sticker p-8 max-w-2xl mx-auto">
      <h3 className="font-display text-2xl font-bold text-ink mb-6">Envíanos un mensaje</h3>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="contact-nombre" className="block text-sm font-semibold text-ink mb-2">
            Nombre *
          </label>
          <input
            type="text"
            id="contact-nombre"
            name="nombre"
            required
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-ink rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-semibold text-ink mb-2">
            Email *
          </label>
          <input
            type="email"
            id="contact-email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-ink rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="contact-telefono" className="block text-sm font-semibold text-ink mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            id="contact-telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-ink rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label htmlFor="contact-asunto" className="block text-sm font-semibold text-ink mb-2">
            Asunto *
          </label>
          <input
            type="text"
            id="contact-asunto"
            name="asunto"
            required
            value={formData.asunto}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-ink rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="contact-mensaje" className="block text-sm font-semibold text-ink mb-2">
          Mensaje *
        </label>
        <textarea
          id="contact-mensaje"
          name="mensaje"
          required
          rows={5}
          value={formData.mensaje}
          onChange={handleChange}
          className="w-full px-4 py-2 border-2 border-ink rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
      </div>

      {status === "idle" && (
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Enviar mensaje
        </Button>
      )}

      {status === "loading" && (
        <div className="text-center py-4">
          <p className="text-ink-muted">Enviando mensaje...</p>
        </div>
      )}

      {status === "success" && (
        <div className="bg-brand-green rounded-3xl border-2 border-ink p-6 text-center">
          <p className="font-bold text-ink mb-2">¡Mensaje enviado!</p>
          <p className="text-sm text-ink-muted">
            Te responderemos lo antes posible.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-brand-red rounded-3xl border-2 border-ink p-6 text-center">
          <p className="font-bold text-paper mb-2">Error al enviar</p>
          <p className="text-sm text-paper">
            Por favor, intenta de nuevo o contáctanos directamente por WhatsApp.
          </p>
        </div>
      )}
    </form>
  );
}
