"use client";

import React, { useEffect, useState } from "react";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCard, Input, Textarea, Select, Toast } from "@/components/admin/AdminUI";
import { useSiteContent } from "@/hooks/useDataService";
import { updateSiteContentAction } from "@/app/actions";
import type { SiteContentEditable } from "@/types/admin";

function AboutContent() {
  const { content, isLoading } = useSiteContent();
  const [draft, setDraft] = useState<any>(content);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  if (isLoading || !content || !draft) {
    return (
      <div className="min-h-screen bg-paper-soft">
        <div className="flex flex-col lg:flex-row">
          <AdminSidebar />
          <div className="flex-1 p-6 lg:p-10">
            <div className="space-y-6">
              <div className="h-10 bg-paper rounded w-48 animate-pulse mb-4" />
              <div className="h-4 bg-paper rounded w-64 animate-pulse" />
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="h-12 bg-paper rounded animate-pulse" />
                <div className="h-12 bg-paper rounded animate-pulse" />
              </div>
              <div className="h-64 bg-paper rounded-3xl border-2 border-ink/10 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const save = async () => {
    if (!draft) return;
    try {
      await updateSiteContentAction(draft);
      setToast("Nosotros actualizado ✓");
    } catch {
      setToast("Error al guardar ✗");
    }
    setTimeout(() => setToast(null), 2500);
  };

  const addValue = () => {
    setDraft((prev: any) => ({
      ...prev,
      about: {
        ...prev.about,
        values: [
          ...prev.about.values,
          { id: `val-${Date.now()}`, label: "Nuevo valor", color: "red", text: "" },
        ],
      },
    }));
  };

  const updateValue = (
    idx: number,
    patch: Partial<SiteContentEditable["about"]["values"][number]>
  ) => {
    setDraft((prev: any) => {
      const values = [...prev.about.values];
      values[idx] = { ...values[idx], ...patch };
      return { ...prev, about: { ...prev.about, values } };
    });
  };

  const removeValue = (idx: number) => {
    setDraft((prev: any) => ({
      ...prev,
      about: {
        ...prev.about,
        values: prev.about.values.filter((_: any, i: number) => i !== idx),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-paper-soft">
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
              Nosotros
            </h1>
            <p className="text-ink-muted">
              Edita la historia, misión, visión y valores de Papelillo.
            </p>
          </header>

          <div className="space-y-6">
            <AdminCard title="Información general">
              <Input
                label="Eyebrow"
                value={draft.about.eyebrow}
                onChange={(e) =>
                  setDraft((prev: any) => ({
                    ...prev,
                    about: { ...prev.about, eyebrow: e.target.value },
                  }))
                }
              />
              <Input
                label="Título"
                value={draft.about.title}
                className="mt-4"
                onChange={(e) =>
                  setDraft((prev: any) => ({
                    ...prev,
                    about: { ...prev.about, title: e.target.value },
                  }))
                }
              />
              <Textarea
                label="Introducción"
                value={draft.about.intro}
                className="mt-4"
                onChange={(e) =>
                  setDraft((prev: any) => ({
                    ...prev,
                    about: { ...prev.about, intro: e.target.value },
                  }))
                }
                rows={3}
              />
              <Textarea
                label="Historia (opcional)"
                value={draft.about.story ?? ""}
                className="mt-4"
                onChange={(e) =>
                  setDraft((prev: any) => ({
                    ...prev,
                    about: { ...prev.about, story: e.target.value },
                  }))
                }
                rows={4}
              />
              <Textarea
                label="Misión (opcional)"
                value={draft.about.mission ?? ""}
                className="mt-4"
                onChange={(e) =>
                  setDraft((prev: any) => ({
                    ...prev,
                    about: { ...prev.about, mission: e.target.value },
                  }))
                }
                rows={3}
              />
              <Textarea
                label="Visión (opcional)"
                value={draft.about.vision ?? ""}
                className="mt-4"
                onChange={(e) =>
                  setDraft((prev: any) => ({
                    ...prev,
                    about: { ...prev.about, vision: e.target.value },
                  }))
                }
                rows={3}
              />
            </AdminCard>

            <AdminCard title="Valores">
              <div className="space-y-4">
                {draft.about.values.map((v: any, idx: number) => (
                  <div
                    key={v.id ?? idx}
                    className="bg-paper-soft rounded-2xl border-2 border-ink/10 p-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre"
                        value={v.label}
                        onChange={(e) => updateValue(idx, { label: e.target.value })}
                      />
                      <Select
                        label="Color"
                        value={v.color}
                        onChange={(e) =>
                          updateValue(idx, {
                            color: e.target.value as "red" | "yellow" | "green" | "blue",
                          })
                        }
                      >
                        <option value="red">Rojo</option>
                        <option value="yellow">Amarillo</option>
                        <option value="green">Verde</option>
                        <option value="blue">Azul</option>
                      </Select>
                    </div>
                    <Textarea
                      label="Descripción"
                      value={v.text}
                      className="mt-4"
                      onChange={(e) => updateValue(idx, { text: e.target.value })}
                      rows={2}
                    />
                    <button
                      onClick={() => removeValue(idx)}
                      className="mt-3 text-sm font-bold bg-brand-red text-paper rounded-full px-4 py-1.5"
                    >
                      Eliminar valor
                    </button>
                  </div>
                ))}
                <button
                  onClick={addValue}
                  className="bg-ink text-paper font-bold rounded-full px-5 py-2.5"
                >
                  + Agregar valor
                </button>
              </div>
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

export default function AdminAboutPage() {
  return (
    <AuthGuard>
      <AboutContent />
    </AuthGuard>
  );
}
