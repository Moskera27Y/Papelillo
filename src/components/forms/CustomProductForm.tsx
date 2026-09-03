"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink, buildCustomMessage } from "@/lib/config";

interface FormData {
  nombre: string;
  email: string;
  whatsapp: string;
  tipoProducto: string;
  tematica: string;
  cantidad: string;
  fecha: string;
  descripcion: string;
  comentarios: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export function CustomProductForm() {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    email: "",
    whatsapp: "",
    tipoProducto: "",
    tematica: "",
    cantidad: "",
    fecha: "",
    descripcion: "",
    comentarios: "",
  });

  const [status, setStatus] = useState<FormStatus>("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Simulación de envío - en Fase 2 esto se conectará a un backend real
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Preparar mensaje para WhatsApp con los datos del formulario
      const message = buildCustomMessage();
      const details = `
Nombre: ${formData.nombre}
Email: ${formData.email}
WhatsApp: ${formData.whatsapp}
Tipo: ${formData.tipoProducto}
Temática: ${formData.tematica}
Cantidad: ${formData.cantidad}
Fecha deseada: ${formData.fecha}
Descripción: ${formData.descripcion}
Comentarios: ${formData.comentarios}
      `.trim();

      const whatsappLink = buildWhatsAppLink(`${message}\n\n${details}`);

      setStatus("success");

      // Redirigir a WhatsApp después de 2 segundos
      setTimeout(() => {
        window.open(whatsappLink, "_blank");
      }, 2000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-paper rounded-3xl border-2 border-ink shadow-sticker p-8 max-w-2xl mx-auto">
      <h3 className="font-display text-2xl font-bold text-ink mb-6">Solicita tu personalizado</h3>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-semibold text-ink mb-2">
            Nombre *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            required
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-ink rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-ink mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
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
          <label htmlFor="whatsapp" className="block text-sm font-semibold text-ink mb-2">
            WhatsApp *
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            required
            value={formData.whatsapp}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-ink rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label htmlFor="tipoProducto" className="block text-sm font-semibold text-ink mb-2">
            Tipo de producto *
          </label>
          <select
            id="tipoProducto"
            name="tipoProducto"
            required
            value={formData.tipoProducto}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-ink rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">Selecciona...</option>
            <option value="invitaciones">Invitaciones</option>
            <option value="cajas">Cajas</option>
            <option value="rompecabezas">Rompecabezas</option>
            <option value="pizarras">Pizarras</option>
            <option value="stickers">Stickers</option>
            <option value="tripticos">Trípticos</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="tematica" className="block text-sm font-semibold text-ink mb-2">
            Temática
          </label>
          <input
            type="text"
            id="tematica"
            name="tematica"
            value={formData.tematica}
            onChange={handleChange}
            placeholder="Ej. Cumpleaños de dinosaurios"
            className="w-full px-4 py-2 border-2 border-ink rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label htmlFor="cantidad" className="block text-sm font-semibold text-ink mb-2">
            Cantidad
          </label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            min="1"
            value={formData.cantidad}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-ink rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="fecha" className="block text-sm font-semibold text-ink mb-2">
          Fecha deseada
        </label>
        <input
          type="date"
          id="fecha"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          className="w-full px-4 py-2 border-2 border-ink rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="descripcion" className="block text-sm font-semibold text-ink mb-2">
          Descripción *
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          required
          rows={4}
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Cuéntanos tu idea con detalle..."
          className="w-full px-4 py-2 border-2 border-ink rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="comentarios" className="block text-sm font-semibold text-ink mb-2">
          Comentarios adicionales
        </label>
        <textarea
          id="comentarios"
          name="comentarios"
          rows={3}
          value={formData.comentarios}
          onChange={handleChange}
          className="w-full px-4 py-2 border-2 border-ink rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
      </div>

      {status === "idle" && (
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Enviar solicitud
        </Button>
      )}

      {status === "loading" && (
        <div className="text-center py-4">
          <p className="text-ink-muted">Enviando solicitud...</p>
        </div>
      )}

      {status === "success" && (
        <div className="bg-brand-green rounded-3xl border-2 border-ink p-6 text-center">
          <p className="font-bold text-ink mb-2">¡Solicitud enviada!</p>
          <p className="text-sm text-ink-muted">
            Te redirigiremos a WhatsApp en unos segundos para confirmar los detalles.
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
