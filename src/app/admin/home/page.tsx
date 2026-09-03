"use client";

import React, { useEffect, useState } from "react";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCard, Input, Textarea, Toast, Toggle } from "@/components/admin/AdminUI";
import { useSiteContent } from "@/hooks/useDataService";
import { updateSiteContentAction } from "@/app/actions";
import type { SiteContentEditable } from "@/types/admin";

function HomeContent() {
  const { content, isLoading } = useSiteContent();
  const [draft, setDraft] = useState<any>(content);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  if (isLoading || !content) {
    return (
      <div className="min-h-screen bg-paper-soft">
        <div className="flex flex-col lg:flex-row">
          <AdminSidebar />
          <div className="flex-1 p-6 lg:p-10">
            <div className="animate-pulse mb-8">
              <div className="h-10 bg-paper rounded w-48 mb-4"></div>
              <div className="h-4 bg-paper rounded w-3/4 mb-8"></div>
            </div>
            <AdminCard className="mb-8">
              <div className="h-96 bg-paper-soft rounded"></div>
            </AdminCard>
          </div>
        </div>
      </div>
    );
  }

  const save = async () => {
    if (!draft) return;
    try {
      await updateSiteContentAction(draft);
      setToast("Home actualizada ✓");
    } catch {
      setToast("Error al guardar ✗");
    }
    setTimeout(() => setToast(null), 2500);
  };

  const update = (key: any, value: any) => {
    setDraft((prev: any) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-paper-soft">
        <div className="flex flex-col lg:flex-row">
          <AdminSidebar />
          <div className="flex-1 p-6 lg:p-10">
            <header className="mb-8">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
                Home
              </h1>
              <p className="text-ink-muted">
                Edita el contenido de la página principal de Papelillo.
              </p>
            </header>

            {draft && (
              <>
                {/* Hero */}
                <AdminCard className="mb-8">
                  <h2 className="text-xl font-bold text-ink mb-4">Hero principal</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Título"
                      value={draft.hero?.title || ""}
                      onChange={(v) => update("hero", { ...draft.hero, title: v })}
                    />
                    <Input
                      label="Subtítulo"
                      value={draft.hero?.subtitle || ""}
                      onChange={(v) => update("hero", { ...draft.hero, subtitle: v })}
                    />
                  </div>
                  <Textarea
                    label="Descripción"
                    value={draft.hero?.description || ""}
                    onChange={(v) => update("hero", { ...draft.hero, description: v })}
                  />
                </AdminCard>

                {/* CustomHighlight */}
                <AdminCard className="mb-8">
                  <h2 className="text-xl font-bold text-ink mb-4">Resaltado</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Título"
                      value={draft.customHighlight?.title || ""}
                      onChange={(v) => update("customHighlight", { ...draft.customHighlight, title: v })}
                    />
                    <Input
                      label="Badge"
                      value={draft.customHighlight?.badge || ""}
                      onChange={(v) => update("customHighlight", { ...draft.customHighlight, badge: v })}
                    />
                  </div>
                  <Textarea
                    label="Descripción"
                    value={draft.customHighlight?.description || ""}
                    onChange={(v) => update("customHighlight", { ...draft.customHighlight, description: v })}
                  />
                </AdminCard>

                {/* About */}
                <AdminCard className="mb-8">
                  <h2 className="text-xl font-bold text-ink mb-4">Acerca de</h2>
                  <Textarea
                    label="Misión"
                    value={draft.about?.mission || ""}
                    onChange={(v) => update("about", { ...draft.about, mission: v })}
                  />
                  <Textarea
                    label="Historia"
                    value={draft.about?.history || ""}
                    onChange={(v) => update("about", { ...draft.about, history: v })}
                  />
                </AdminCard>

                {/* Footer */}
                <AdminCard className="mb-8">
                  <h2 className="text-xl font-bold text-ink mb-4">Footer</h2>
                  <Textarea
                    label="Descripción"
                    value={draft.footerDescription || ""}
                    onChange={(v) => update("footerDescription", v)}
                  />
                </AdminCard>

                {/* Branding */}
                <AdminCard className="mb-8">
                  <h2 className="text-xl font-bold text-ink mb-4">Branding</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nombre de marca"
                      value={draft.brandName || ""}
                      onChange={(v) => update("brandName", v)}
                    />
                    <Input
                      label="Tagline"
                      value={draft.tagline || ""}
                      onChange={(v) => update("tagline", v)}
                    />
                  </div>
                </AdminCard>
              </>
            )}

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-ink/10">
              <Toggle
                checked={draft?.ctaFinal?.secondaryCta?.enabled ?? false}
                onChange={(v) =>
                  update("ctaFinal", {
                    ...draft?.ctaFinal,
                    secondaryCta: { ...draft?.ctaFinal?.secondaryCta, enabled: v },
                  } as any)
                }
                label="Mostrar CTA secundaria"
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDraft(content)}
                  className="px-6 py-3 rounded-xl border-2 border-ink/20 text-ink hover:bg-paper transition"
                >
                  Revertir
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="px-6 py-3 rounded-xl bg-brand-red text-white font-bold hover:bg-red-700 transition transform hover:scale-105"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast type="success" message={toast} />}
    </AuthGuard>
  );
}

export default function HomeAdminPage() {
  return <HomeContent />;
}
