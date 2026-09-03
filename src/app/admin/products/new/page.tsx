"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { productsService } from "@/services";
import type { AdminProduct } from "@/types/admin";
import { slugify } from "@/lib/utils";

const emptyProduct: Omit<AdminProduct, "id" | "createdAt" | "updatedAt"> = {
  slug: "",
  name: "",
  shortDescription: "",
  description: "",
  price: null,
  compareAtPrice: null,
  priceType: "fixed",
  currency: "COP",
  images: [],
  category: "",
  tags: [],
  specs: [],
  stock: null,
  featured: false,
  isNew: false,
  isPopular: false,
  isCustomizable: false,
  requiresQuote: false,
  isActive: true,
  customFields: [],
  subcategory: "",
  dimensions: undefined,
  features: [],
  options: [],
  minQuantity: 1,
  maxQuantity: 100,
  allowedFormats: [],
};

function NewProductContent() {
  const router = useRouter();
  const [draft, setDraft] =
    useState<Omit<AdminProduct, "id" | "createdAt" | "updatedAt">>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(patch: Partial<Omit<AdminProduct, "id" | "createdAt" | "updatedAt">>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function handleSave(activate?: boolean) {
    setError(null);
    if (!draft.name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }
    if (!draft.category) {
      setError("Selecciona una categoría.");
      return;
    }
    const finalSlug = draft.slug.trim() || slugify(draft.name);
    const existing = productsService.getProductBySlug(finalSlug);
    if (existing) {
      setError(`Ya existe un producto con el slug "${finalSlug}".`);
      return;
    }
    setSaving(true);
    try {
      const created = productsService.createProduct({
        ...draft,
        slug: finalSlug,
        isActive: activate ?? draft.isActive,
      });
      router.push(`/admin/products/${created.id}`);
    } catch {
      setError("Ocurrió un error al guardar.");
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
              Nuevo producto
            </h1>
            <p className="text-ink-muted">
              Crea un producto que luego podrás personalizar y publicar.
            </p>
          </header>

          {error && (
            <div className="bg-brand-red text-paper rounded-2xl border-2 border-ink px-4 py-3 mb-6 font-semibold">
              {error}
            </div>
          )}

          <ProductEditor value={draft} onChange={handleChange} />

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="bg-ink text-paper font-bold rounded-full px-6 py-3 shadow-sticker hover:-translate-y-0.5 transition-transform disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Crear y publicar"}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="bg-paper border-2 border-ink font-bold rounded-full px-6 py-3 shadow-sticker-sm hover:-translate-y-0.5 transition-transform disabled:opacity-50"
            >
              Guardar como borrador
            </button>
            <Link
              href="/admin/products"
              className="text-center bg-paper-soft border-2 border-ink/10 font-bold rounded-full px-6 py-3"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminNewProductPage() {
  return (
    <AuthGuard>
      <NewProductContent />
    </AuthGuard>
  );
}
