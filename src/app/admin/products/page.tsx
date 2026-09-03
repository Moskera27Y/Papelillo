"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCard, AdminBadge, Input, Select, EmptyState, Toast } from "@/components/admin/AdminUI";
import { useProducts, useCategories } from "@/hooks/useDataService";
import {
  toggleProductActiveAction,
  duplicateProductAction,
  deleteProductAction,
} from "@/app/actions";
import { formatPrice } from "@/lib/utils";
import type { AdminProduct } from "@/types/admin";

function ProductRow({
  product,
  categoryMap,
  onAction,
}: {
  product: AdminProduct;
  categoryMap: Record<string, string>;
  onAction: (msg: string, type: "success" | "error") => void;
}) {
  const handleToggle = async () => {
    try {
      await toggleProductActiveAction(product.id);
      onAction(
        product.isActive ? "Producto desactivado." : "Producto activado.",
        "success"
      );
    } catch {
      onAction("Error al actualizar el estado.", "error");
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateProductAction(product.id);
      onAction("Producto duplicado.", "success");
    } catch {
      onAction("Error al duplicar.", "error");
    }
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    deleteProductAction(product.id)
      .then(() => onAction("Producto eliminado.", "success"))
      .catch(() => onAction("Error al eliminar.", "error"));
  };

  return (
    <tr className="border-b border-ink/10 hover:bg-paper-soft transition-colors">
      <td className="py-3 pr-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-paper-soft border-2 border-ink flex items-center justify-center text-xs font-bold text-ink-muted shrink-0">
            {product.images.length > 0 ? (
              <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span>{product.name.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/products/${product.id}`}
              className="font-semibold text-ink hover:text-brand-red"
            >
              {product.name}
            </Link>
            <p className="text-xs text-ink-muted truncate max-w-[240px]">
              {product.shortDescription}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-3 hidden md:table-cell">
        <span className="text-sm">{categoryMap[product.category] || product.category}</span>
      </td>
      <td className="py-3 pr-3">
        <span className="text-sm font-semibold">
          {formatPrice(product.price, product.priceType, product.compareAtPrice)}
        </span>
      </td>
      <td className="py-3 pr-3 hidden lg:table-cell">
        <span className="text-sm">
          {product.stock === null ? "—" : product.stock}
        </span>
      </td>
      <td className="py-3 pr-3 hidden lg:table-cell">
        {product.isCustomizable ? (
          <AdminBadge className="bg-brand-green text-ink">Sí</AdminBadge>
        ) : (
          <span className="text-sm text-ink-muted">No</span>
        )}
      </td>
      <td className="py-3 pr-3">
        {product.isActive ? (
          <AdminBadge className="bg-brand-green text-paper">Activo</AdminBadge>
        ) : (
          <AdminBadge className="bg-ink/20 text-ink">Inactivo</AdminBadge>
        )}
      </td>
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/products/${product.id}`}
            className="text-xs font-bold bg-paper-soft hover:bg-ink hover:text-paper rounded-full px-3 py-1.5 border-2 border-ink transition-colors"
          >
            Editar
          </Link>
          <button
            onClick={handleToggle}
            className="text-xs font-bold bg-paper-soft hover:bg-ink hover:text-paper rounded-full px-3 py-1.5 border-2 border-ink transition-colors"
          >
            {product.isActive ? "Desactivar" : "Activar"}
          </button>
          <button
            onClick={handleDuplicate}
            className="text-xs font-bold bg-paper-soft hover:bg-ink hover:text-paper rounded-full px-3 py-1.5 border-2 border-ink transition-colors"
            title="Duplicar"
          >
            ⎘
          </button>
          <button
            onClick={handleDelete}
            className="text-xs font-bold bg-brand-red text-paper hover:bg-opacity-90 rounded-full px-3 py-1.5 border-2 border-ink transition-colors"
            title="Eliminar"
          >
            ✕
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProductsListContent() {
  const products = useProducts();
  const categories = useCategories();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.slug] = c.name;
    });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
    if (statusFilter === "active") list = list.filter((p) => p.isActive);
    if (statusFilter === "inactive") list = list.filter((p) => !p.isActive);
    return list;
  }, [products, query, categoryFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-paper-soft">
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-10">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
                Productos
              </h1>
              <p className="text-ink-muted">
                {products.length} producto{products.length === 1 ? "" : "s"} en total ·{" "}
                {products.filter((p) => p.isActive).length} activo
                {products.filter((p) => p.isActive).length === 1 ? "" : "s"}
              </p>
            </div>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center bg-ink text-paper font-bold rounded-full px-6 py-3 shadow-sticker hover:-translate-y-0.5 transition-transform"
            >
              + Nuevo producto
            </Link>
          </header>

          <AdminCard>
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <Input
                label="Buscar"
                placeholder="Nombre, slug, descripción…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Select
                label="Categoría"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Estado"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </Select>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="No se encontraron productos"
                description="Ajusta los filtros o crea uno nuevo."
                action={
                  <Link
                    href="/admin/products/new"
                    className="inline-block bg-ink text-paper font-bold rounded-full px-6 py-2.5"
                  >
                    + Crear producto
                  </Link>
                }
              />
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b-2 border-ink text-left">
                      <th className="py-3 pr-3 text-xs uppercase tracking-wider font-bold">
                        Producto
                      </th>
                      <th className="py-3 pr-3 text-xs uppercase tracking-wider font-bold hidden md:table-cell">
                        Categoría
                      </th>
                      <th className="py-3 pr-3 text-xs uppercase tracking-wider font-bold">
                        Precio
                      </th>
                      <th className="py-3 pr-3 text-xs uppercase tracking-wider font-bold hidden lg:table-cell">
                        Stock
                      </th>
                      <th className="py-3 pr-3 text-xs uppercase tracking-wider font-bold hidden lg:table-cell">
                        Personalizable
                      </th>
                      <th className="py-3 pr-3 text-xs uppercase tracking-wider font-bold">
                        Estado
                      </th>
                      <th className="py-3 text-xs uppercase tracking-wider font-bold text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <ProductRow
                        key={p.id}
                        product={p}
                        categoryMap={categoryMap}
                        onAction={(msg, type) => {
                          setToast({ msg, type });
                          setTimeout(() => setToast(null), 2500);
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        </div>
      </div>
      {toast && <Toast type={toast.type} message={toast.msg} />}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <AuthGuard>
      <ProductsListContent />
    </AuthGuard>
  );
}
