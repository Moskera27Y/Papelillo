"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { Toast } from "@/components/admin/AdminUI";
import { useProducts } from "@/hooks/useDataService";
import { updateProductAction } from "@/app/actions";
import type { AdminProduct } from "@/types/admin";
import { slugify } from "@/lib/utils";

function EditProductContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { products, isLoading } = useProducts();
  const current = products.find((p) => p.id === id);

  const [draft, setDraft] = useState<AdminProduct | null>(current ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setDraft(current ?? null);
  }, [current]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-muted">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-paper-soft flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-ink mb-2">
            Producto no encontrado
          </h2>
          <Link href="/admin/products" className="text-brand-red underline">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  function handleChange(patch: Partial<AdminProduct>) {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function handleSave() {
    if (!draft) return;
    setError(null);
    if (!draft.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!draft.category) {
      setError("Selecciona una categoría.");
      return;
    }
    const finalSlug = draft.slug.trim() || slugify(draft.name);
    setSaving(true);
    try {
      await updateProductAction({ ...draft, slug: finalSlug });
      setToast("Cambios guardados ✓");
      setTimeout(() => setToast(null), 2500);
    } catch {
      setError("Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper-soft">
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <Link href="/admin/products" className="text-sm text-ink-muted hover:text-ink mb-2 inline-block">
              ← Volver a productos
            </Link>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
              Editar producto
            </h1>
            <p className="text-ink-muted">
              ID: <code className="bg-paper-soft px-1.5 py-0.5 rounded text-xs">{draft.id}</code>
              {" · "}
              {draft.isActive ? "Activo" : "Inactivo"}
            </p>
          </header>

          {error && (
            <div className="bg-brand-red text-paper rounded-2xl border-2 border-ink px-4 py-3 mb-6 font-semibold">
              {error}
            </div>
          )}

          <ProductEditor value={draft} onChange={handleChange} isEditing />

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-ink text-paper font-bold rounded-full px-6 py-3 shadow-sticker hover:-translate-y-0.5 transition-transform disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <Link
              href="/admin/products"
              className="text-center bg-paper-soft border-2 border-ink/10 font-bold rounded-full px-6 py-3"
            >
              Volver
            </Link>
            <a
              href={`/product/${draft.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center bg-brand-yellow border-2 border-ink font-bold rounded-full px-6 py-3 shadow-sticker-sm"
            >
              Ver en el sitio ↗
            </a>
          </div>
        </div>
      </div>
      {toast && <Toast type="success" message={toast} />}
    </div>
  );
}

export default function AdminEditProductPage() {
  return (
    <AuthGuard>
      <EditProductContent />
    </AuthGuard>
  );
}
