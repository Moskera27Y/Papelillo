"use client";

import React, { useEffect, useState } from "react";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCard, Input, Select, Toggle, Toast } from "@/components/admin/AdminUI";
import { useSiteSettings } from "@/hooks/useDataService";
import { siteService } from "@/services";
import type { SiteSettings, SocialLink } from "@/types/admin";

const ICON_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "pinterest", label: "Pinterest" },
  { value: "youtube", label: "YouTube" },
];

function SocialContent() {
  const settings = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const save = () => {
    siteService.updateSiteSettings(draft);
    setToast("Redes actualizadas ✓");
    setTimeout(() => setToast(null), 2500);
  };

  const addLink = () => {
    setDraft((prev) => ({
      ...prev,
      social: [
        ...prev.social,
        {
          id: `soc-${Date.now()}`,
          name: "Nueva red",
          url: "",
          icon: "instagram",
          isActive: false,
          order: prev.social.length + 1,
        },
      ],
    }));
  };

  const updateLink = (id: string, patch: Partial<SocialLink>) => {
    setDraft((prev) => ({
      ...prev,
      social: prev.social.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  };

  const removeLink = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      social: prev.social.filter((l) => l.id !== id),
    }));
  };

  return (
    <div className="min-h-screen bg-paper-soft">
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
              Redes sociales
            </h1>
            <p className="text-ink-muted">
              Administra los enlaces a tus redes sociales. Solo se mostrarán las que tengan URL y estén activas.
            </p>
          </header>

          <AdminCard>
            <div className="space-y-4">
              {draft.social.map((link) => (
                <div
                  key={link.id}
                  className="bg-paper-soft rounded-2xl border-2 border-ink/10 p-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Nombre"
                      value={link.name}
                      onChange={(e) => updateLink(link.id, { name: e.target.value })}
                    />
                    <Select
                      label="Icono"
                      value={link.icon}
                      onChange={(e) => updateLink(link.id, { icon: e.target.value })}
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Input
                    label="URL"
                    value={link.url}
                    className="mt-4"
                    onChange={(e) => updateLink(link.id, { url: e.target.value })}
                    placeholder="https://instagram.com/papelillo"
                  />
                  <div className="flex items-center justify-between mt-4">
                    <Toggle
                      label="Activa"
                      checked={link.isActive}
                      onChange={(x) => updateLink(link.id, { isActive: x })}
                    />
                    <button
                      onClick={() => removeLink(link.id)}
                      className="text-sm font-bold bg-brand-red text-paper rounded-full px-4 py-1.5"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={addLink}
                className="bg-ink text-paper font-bold rounded-full px-5 py-2.5"
              >
                + Agregar red social
              </button>
            </div>

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

export default function AdminSocialPage() {
  return (
    <AuthGuard>
      <SocialContent />
    </AuthGuard>
  );
}
