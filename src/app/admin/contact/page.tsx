"use client";

import React, { useEffect, useState } from "react";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCard, Input, Textarea, Toast } from "@/components/admin/AdminUI";
import { useSiteSettings } from "@/hooks/useDataService";
import { updateSiteSettingsAction } from "@/app/actions";
import type { SiteSettings } from "@/types/admin";

function ContactContent() {
  const { settings, isLoading } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-paper-soft">
        <div className="flex flex-col lg:flex-row">
          <AdminSidebar />
          <div className="flex-1 p-6 lg:p-10">
            <div className="space-y-6">
              <div className="h-10 bg-paper rounded w-48 animate-pulse mb-4" />
              <div className="h-4 bg-paper rounded w-64 animate-pulse" />
              <div className="h-64 bg-paper rounded-3xl border-2 border-ink/10 animate-pulse mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const save = async () => {
    await updateSiteSettingsAction(draft);
    setToast("Contacto actualizado ✓");
    setTimeout(() => setToast(null), 2500);
  };

  const update = (patch: Partial<SiteSettings["contact"]>) => {
    setDraft((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...patch },
    }));
  };

  return (
    <div className="min-h-screen bg-paper-soft">
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
              Contacto
            </h1>
            <p className="text-ink-muted">
              Edita la información de contacto que aparece en la página.
            </p>
          </header>

          <AdminCard>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={draft.contact.email}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="hola@papelillo.com"
              />
              <Input
                label="WhatsApp (con código de país, sin +)"
                value={draft.contact.whatsapp}
                onChange={(e) => update({ whatsapp: e.target.value })}
                placeholder="573001234567"
              />
            </div>
            <Input
              label="Mensaje por defecto de WhatsApp"
              value={draft.contact.whatsappDefaultMessage}
              className="mt-4"
              onChange={(e) => update({ whatsappDefaultMessage: e.target.value })}
            />
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <Input
                label="Teléfono (opcional)"
                value={draft.contact.phone ?? ""}
                onChange={(e) => update({ phone: e.target.value })}
              />
              <Input
                label="Ciudad (opcional)"
                value={draft.contact.city ?? ""}
                onChange={(e) => update({ city: e.target.value })}
              />
            </div>
            <Input
              label="Dirección (opcional)"
              value={draft.contact.address ?? ""}
              className="mt-4"
              onChange={(e) => update({ address: e.target.value })}
            />
            <Input
              label="Horarios (opcional)"
              value={draft.contact.hours ?? ""}
              className="mt-4"
              onChange={(e) => update({ hours: e.target.value })}
              placeholder="Lun-Vie 9am-6pm"
            />
            <Textarea
              label="Texto de contacto (opcional)"
              value={draft.contact.contactText ?? ""}
              className="mt-4"
              onChange={(e) => update({ contactText: e.target.value })}
              rows={3}
              placeholder="Un mensaje especial para la sección de contacto…"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={save}
                className="bg-ink text-paper font-bold rounded-full px-6 py-3 shadow-sticker hover:-translate-y-0.5 transition-transform"
              >
                Guardar cambios
              </button>
              <button
                onClick={() => setDraft(settings)}
                className="bg-paper-soft border-2 border-ink/10 font-bold rounded-full px-6 py-3"
              >
                Descartar
              </button>
            </div>
          </AdminCard>
        </div>
      </div>
      {toast && <Toast type="success" message={toast} />}
    </div>
  );
}

export default function AdminContactPage() {
  return (
    <AuthGuard>
      <ContactContent />
    </AuthGuard>
  );
}
