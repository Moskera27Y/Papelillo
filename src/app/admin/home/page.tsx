"use client";

import React, { useEffect, useState } from "react";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCard, Input, Textarea, Toast, Toggle } from "@/components/admin/AdminUI";
import { useSiteContent } from "@/hooks/useDataService";
import { siteService } from "@/services";
import type { SiteContentEditable } from "@/types/admin";

function HomeContent() {
  const content = useSiteContent();
  const [draft, setDraft] = useState<SiteContentEditable>(content);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  const save = () => {
    siteService.updateSiteContent(draft);
    setToast("Home actualizada ✓");
    setTimeout(() => setToast(null), 2500);
  };

  const update = <K extends keyof SiteContentEditable>(key: K, value: SiteContentEditable[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
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

          <div className="space-y-6">
            <AdminCard title="Marca">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Nombre de la marca"
                  value={draft.brandName}
                  onChange={(e) => update("brandName", e.target.value)}
                />
                <Input
                  label="Tagline"
                  value={draft.tagline}
                  onChange={(e) => update("tagline", e.target.value)}
                />
              </div>
            </AdminCard>

            <AdminCard title="Hero (encabezado principal)">
              <Input
                label="Título"
                value={draft.hero.title}
                onChange={(e) => update("hero", { ...draft.hero, title: e.target.value })}
              />
              <div className="mt-4">
                <Textarea
                  label="Descripción"
                  value={draft.hero.description}
                  onChange={(e) => update("hero", { ...draft.hero, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="CTA principal - texto"
                  value={draft.hero.ctaPrimary.label}
                  onChange={(e) =>
                    update("hero", {
                      ...draft.hero,
                      ctaPrimary: { ...draft.hero.ctaPrimary, label: e.target.value },
                    })
                  }
                />
                <Input
                  label="CTA principal - link"
                  value={draft.hero.ctaPrimary.href}
                  onChange={(e) =>
                    update("hero", {
                      ...draft.hero,
                      ctaPrimary: { ...draft.hero.ctaPrimary, href: e.target.value },
                    })
                  }
                />
                <Input
                  label="CTA secundario - texto"
                  value={draft.hero.ctaSecondary.label}
                  onChange={(e) =>
                    update("hero", {
                      ...draft.hero,
                      ctaSecondary: { ...draft.hero.ctaSecondary, label: e.target.value },
                    })
                  }
                />
                <Input
                  label="CTA secundario - link"
                  value={draft.hero.ctaSecondary.href}
                  onChange={(e) =>
                    update("hero", {
                      ...draft.hero,
                      ctaSecondary: { ...draft.hero.ctaSecondary, href: e.target.value },
                    })
                  }
                />
              </div>
            </AdminCard>

            <AdminCard title="Sección personalizada (Hecho a tu manera)">
              <Input
                label="Eyebrow"
                value={draft.customHighlight.eyebrow}
                onChange={(e) =>
                  update("customHighlight", { ...draft.customHighlight, eyebrow: e.target.value })
                }
              />
              <Input
                label="Título"
                value={draft.customHighlight.title}
                className="mt-4"
                onChange={(e) =>
                  update("customHighlight", { ...draft.customHighlight, title: e.target.value })
                }
              />
              <Textarea
                label="Descripción"
                value={draft.customHighlight.description}
                className="mt-4"
                onChange={(e) =>
                  update("customHighlight", {
                    ...draft.customHighlight,
                    description: e.target.value,
                  })
                }
                rows={2}
              />
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="CTA - texto"
                  value={draft.customHighlight.cta.label}
                  onChange={(e) =>
                    update("customHighlight", {
                      ...draft.customHighlight,
                      cta: { ...draft.customHighlight.cta, label: e.target.value },
                    })
                  }
                />
                <Input
                  label="CTA - link"
                  value={draft.customHighlight.cta.href}
                  onChange={(e) =>
                    update("customHighlight", {
                      ...draft.customHighlight,
                      cta: { ...draft.customHighlight.cta, href: e.target.value },
                    })
                  }
                  help="Cambia a /crear-mi-producto para usar el nuevo configurador."
                />
              </div>
            </AdminCard>

            <AdminCard title="CTA final">
              <Input
                label="Título"
                value={draft.ctaFinal.title}
                onChange={(e) => update("ctaFinal", { ...draft.ctaFinal, title: e.target.value })}
              />
              <Textarea
                label="Descripción"
                value={draft.ctaFinal.description}
                className="mt-4"
                onChange={(e) =>
                  update("ctaFinal", { ...draft.ctaFinal, description: e.target.value })
                }
                rows={2}
              />
            </AdminCard>

            <AdminCard title="Footer">
              <Textarea
                label="Descripción del footer"
                value={draft.footerDescription}
                onChange={(e) => update("footerDescription", e.target.value)}
                rows={3}
              />
            </AdminCard>

            <div className="flex gap-3">
              <button
                onClick={save}
                className="bg-ink text-paper font-bold rounded-full px-6 py-3 shadow-sticker hover:-translate-y-0.5 transition-transform"
              >
                Guardar cambios
              </button>
              <button
                onClick={() => setDraft(content)}
                className="bg-paper-soft border-2 border-ink/10 font-bold rounded-full px-6 py-3"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast type="success" message={toast} />}
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
