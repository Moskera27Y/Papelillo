"use client";

import React, { useState } from "react";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCard, Input, Select, Toggle, EmptyState, Toast } from "@/components/admin/AdminUI";
import { useCategories } from "@/hooks/useDataService";
import { updateCategoryAction, createCategoryAction, deleteCategoryAction, toggleCategoryActiveAction } from "@/app/actions";
import { slugify } from "@/lib/utils";
import type { AdminCategory } from "@/types/admin";

function CategoriesContent() {
  const { categories, isLoading } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2500);
  };

  const handleToggle = async (c: AdminCategory) => {
    await toggleCategoryActiveAction(c.id);
    showToast(c.isActive ? "Categoría desactivada." : "Categoría activada.");
  };

  const handleDelete = async (c: AdminCategory) => {
    if (!confirm(`¿Eliminar la categoría "${c.name}"?`)) return;
    await deleteCategoryAction(c.id);
    showToast("Categoría eliminada.");
  };

  const handleSaved = () => {
    setEditingId(null);
    setIsCreating(false);
    showToast("Cambios guardados.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-soft">
        <div className="flex flex-col lg:flex-row">
          <AdminSidebar />
          <div className="flex-1 p-6 lg:p-10">
            <div className="space-y-6">
              <div className="h-10 bg-paper rounded w-48 animate-pulse mb-4" />
              <div className="h-4 bg-paper rounded w-64 animate-pulse mb-4" />
              <div className="h-12 bg-paper rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-soft">
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-10">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
                Categorías
              </h1>
              <p className="text-ink-muted">
                {categories.length} categoría{categories.length === 1 ? "" : "s"} ·{" "}
                {categories.filter((c) => c.isActive).length} activa
                {categories.filter((c) => c.isActive).length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              onClick={() => {
                setIsCreating(true);
                setEditingId(null);
              }}
              className="inline-flex items-center justify-center bg-ink text-paper font-bold rounded-full px-6 py-3 shadow-sticker hover:-translate-y-0.5 transition-transform"
            >
              + Nueva categoría
            </button>
          </header>

          {(editingId || isCreating) && (
            <CategoryForm
              category={editingId ? categories.find((c) => c.id === editingId) ?? null : null}
              onCancel={() => {
                setEditingId(null);
                setIsCreating(false);
              }}
              onSaved={handleSaved}
            />
          )}

          <AdminCard>
            {categories.length === 0 ? (
              <EmptyState
                title="Sin categorías"
                description="Crea la primera categoría para organizar tus productos."
              />
            ) : (
              <ul className="divide-y divide-ink/10">
                {categories.map((c) => (
                  <li
                    key={c.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl border-2 border-ink flex items-center justify-center font-display font-bold text-lg shrink-0 ${
                        c.color === "red"
                          ? "bg-brand-red"
                          : c.color === "yellow"
                          ? "bg-brand-yellow"
                          : c.color === "green"
                          ? "bg-brand-green"
                          : c.color === "blue"
                          ? "bg-brand-blue text-paper"
                          : "bg-ink text-paper"
                      }`}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display text-lg font-bold text-ink">
                          {c.name}
                        </p>
                        {c.isActive ? (
                          <span className="bg-brand-green text-paper text-xs font-bold rounded-full px-2 py-0.5">
                            Activa
                          </span>
                        ) : (
                          <span className="bg-ink/20 text-xs font-bold rounded-full px-2 py-0.5">
                            Inactiva
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-ink-muted truncate">
                        {c.description || "Sin descripción"}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Slug: <code>{c.slug}</code> · Orden: {c.order}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setIsCreating(false);
                        }}
                        className="text-xs font-bold bg-paper-soft border-2 border-ink rounded-full px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggle(c)}
                        className="text-xs font-bold bg-paper-soft border-2 border-ink rounded-full px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors"
                      >
                        {c.isActive ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="text-xs font-bold bg-brand-red text-paper rounded-full px-3 py-1.5"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>
      </div>
      {toast && <Toast type="success" message={toast} />}
    </div>
  );
}

function CategoryForm({
  category,
  onCancel,
  onSaved,
}: {
  category: AdminCategory | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [color, setColor] = useState<AdminCategory["color"]>(category?.color ?? "red");
  const [order, setOrder] = useState(category?.order ?? 1);
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [image, setImage] = useState(category?.image ?? "");

  async function save() {
    if (!name.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }
    const finalSlug = slug.trim() || slugify(name);
    const data = {
      name: name.trim(),
      slug: finalSlug,
      description,
      color,
      order,
      isActive,
      image,
    };
    if (category) {
      await updateCategoryAction(category.id, data);
    } else {
      await createCategoryAction(data);
    }
    onSaved();
  }

  return (
    <AdminCard title={category ? "Editar categoría" : "Nueva categoría"} className="mb-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Nombre *"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!category) setSlug(slugify(e.target.value));
          }}
        />
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
        />
      </div>
      <div className="mt-4">
        <Input
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <Select
          label="Color"
          value={color}
          onChange={(e) => setColor(e.target.value as AdminCategory["color"])}
        >
          <option value="red">Rojo</option>
          <option value="yellow">Amarillo</option>
          <option value="green">Verde</option>
          <option value="blue">Azul</option>
          <option value="ink">Negro</option>
        </Select>
        <Input
          type="number"
          label="Orden"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value) || 0)}
        />
        <Toggle label="Activa" checked={isActive} onChange={setIsActive} />
      </div>
      <div className="mt-4">
        <Input
          label="Imagen (URL)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://…"
        />
      </div>
      <div className="flex gap-2 mt-6">
        <button
          onClick={save}
          className="bg-ink text-paper font-bold rounded-full px-6 py-2.5 shadow-sticker-sm"
        >
          {category ? "Guardar cambios" : "Crear categoría"}
        </button>
        <button
          onClick={onCancel}
          className="bg-paper-soft border-2 border-ink/10 font-bold rounded-full px-6 py-2.5"
        >
          Cancelar
        </button>
      </div>
    </AdminCard>
  );
}

export default function AdminCategoriesPage() {
  return (
    <AuthGuard>
      <CategoriesContent />
    </AuthGuard>
  );
}
