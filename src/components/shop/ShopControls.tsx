"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { AdminCategory } from "@/types/admin";

// ============================================================
// TIPOS
// ============================================================

export type SortOption =
  | "recent"
  | "popular"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export interface ShopFilters {
  category: string; // slug or ""
  query: string;
  sort: SortOption;
  onlyCustomizable: boolean;
  onlyAvailable: boolean;
  priceMax: number; // 0 = sin límite
}

export const DEFAULT_FILTERS: ShopFilters = {
  category: "",
  query: "",
  sort: "recent",
  onlyCustomizable: false,
  onlyAvailable: false,
  priceMax: 0,
};

// ============================================================
// HOOK — gestiona los filtros vía URL search params
// ============================================================

export function useShopFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: ShopFilters = useMemo(() => {
    // ✅ null-safe: useSearchParams() retorna null en SSR/Edge → crash #306
    if (!searchParams) return { ...DEFAULT_FILTERS };
    return ({
      category: searchParams.get("category") || "",
      query: searchParams.get("q") || "",
      sort: (searchParams.get("sort") as SortOption) || "recent",
      onlyCustomizable: searchParams.get("custom") === "1",
      onlyAvailable: searchParams.get("available") === "1",
      priceMax: Number(searchParams.get("priceMax")) || 0,
    });
  }, [searchParams]);

  const setFilter = useCallback(
    <K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) => {
      if (!searchParams) return; // ✅ null-safe
      const params = new URLSearchParams(searchParams.toString());
      const strValue = String(value);

      if (value === "" || value === false || value === 0) {
        params.delete(key === "onlyCustomizable" ? "custom" : key === "onlyAvailable" ? "available" : key === "query" ? "q" : key);
      } else {
        const urlKey =
          key === "onlyCustomizable" ? "custom" :
          key === "onlyAvailable" ? "available" :
          key === "query" ? "q" :
          key;
        params.set(urlKey, strValue);
      }

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const resetFilters = useCallback(() => {
    if (!searchParams) return; // ✅ null-safe
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.category !== "" ||
      filters.query !== "" ||
      filters.sort !== "recent" ||
      filters.onlyCustomizable ||
      filters.onlyAvailable ||
      filters.priceMax > 0
    );
  }, [filters]);

  return { filters, setFilter, resetFilters, hasActiveFilters };
}

// ============================================================
// COMPONENTES
// ============================================================

interface ShopSearchProps {
  value: string;
  onChange: (v: string) => void;
}

export function ShopSearch({ value, onChange }: ShopSearchProps) {
  const [local, setLocal] = useState(value);
  const [focused, setFocused] = useState(false);

  const commit = () => {
    onChange(local.trim());
  };

  return (
    <div
      className={`relative flex items-center bg-paper rounded-full border-2 transition-all duration-200 ${
        focused ? "border-ink shadow-sticker-sm" : "border-ink/20"
      }`}
    >
      <svg
        className="w-5 h-5 text-ink-muted ml-4 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        placeholder="¿Qué estás buscando?"
        className="bg-transparent px-3 py-3 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none w-full"
        aria-label="Buscar productos"
      />
      {local && (
        <button
          type="button"
          onClick={() => {
            setLocal("");
            onChange("");
          }}
          className="mr-3 text-ink-muted hover:text-ink transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

interface ShopSortingProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
}

export function ShopSorting({ value, onChange }: ShopSortingProps) {
  const options: { value: SortOption; label: string }[] = [
    { value: "recent", label: "Más recientes" },
    { value: "popular", label: "Más populares" },
    { value: "price-asc", label: "Precio: menor a mayor" },
    { value: "price-desc", label: "Precio: mayor a menor" },
    { value: "name-asc", label: "Nombre A–Z" },
  ];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="appearance-none bg-paper border-2 border-ink/20 rounded-full px-4 py-2.5 pr-10 text-sm font-semibold text-ink focus:outline-none focus:border-ink transition-colors cursor-pointer"
        aria-label="Ordenar productos"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

interface ShopCategoryTabsProps {
  categories: AdminCategory[];
  active: string;
  onChange: (slug: string) => void;
}

export function ShopCategoryTabs({ categories, active, onChange }: ShopCategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1">
      <button
        onClick={() => onChange("")}
        className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
          active === ""
            ? "bg-ink text-paper border-ink shadow-sticker-sm"
            : "bg-paper text-ink border-ink/20 hover:border-ink"
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => {
        const colorMap: Record<string, string> = {
          red: "bg-brand-red",
          yellow: "bg-brand-yellow",
          green: "bg-brand-green",
          blue: "bg-brand-blue",
          ink: "bg-ink text-paper",
        };
        const isActive = active === cat.slug;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.slug)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-200 whitespace-nowrap ${
              isActive
                ? `${colorMap[cat.color] || "bg-ink"} text-ink border-ink shadow-sticker-sm`
                : "bg-paper text-ink border-ink/20 hover:border-ink"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}

interface ShopFilterTogglesProps {
  onlyCustomizable: boolean;
  onlyAvailable: boolean;
  priceMax: number;
  onCustomChange: (v: boolean) => void;
  onAvailableChange: (v: boolean) => void;
  onPriceChange: (v: number) => void;
}

export function ShopFilterToggles({
  onlyCustomizable,
  onlyAvailable,
  priceMax,
  onCustomChange,
  onAvailableChange,
  onPriceChange,
}: ShopFilterTogglesProps) {
  const priceRanges = [
    { label: "Todos los precios", value: 0 },
    { label: "Hasta $5.000", value: 5000 },
    { label: "Hasta $10.000", value: 10000 },
    { label: "Hasta $20.000", value: 20000 },
    { label: "Más de $20.000", value: 999999 },
  ];

  return (
    <div className="space-y-4">
      {/* Toggle personalizado */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={onlyCustomizable}
            onChange={(e) => onCustomChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-paper-cream border-2 border-ink/20 rounded-full peer-checked:bg-brand-green peer-checked:border-ink transition-all" />
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-paper border-2 border-ink/20 rounded-full peer-checked:translate-x-4 peer-checked:border-ink transition-all" />
        </div>
        <span className="text-sm font-semibold text-ink group-hover:text-brand-red transition-colors">
          Personalizable
        </span>
      </label>

      {/* Toggle disponible */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => onAvailableChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-paper-cream border-2 border-ink/20 rounded-full peer-checked:bg-brand-blue peer-checked:border-ink transition-all" />
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-paper border-2 border-ink/20 rounded-full peer-checked:translate-x-4 peer-checked:border-ink transition-all" />
        </div>
        <span className="text-sm font-semibold text-ink group-hover:text-brand-red transition-colors">
          Disponible ahora
        </span>
      </label>

      {/* Rango de precio */}
      <div>
        <p className="text-sm font-bold text-ink mb-2">Precio máximo</p>
        <select
          value={priceMax}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full bg-paper border-2 border-ink/20 rounded-xl px-3 py-2 text-sm font-semibold text-ink focus:outline-none focus:border-ink transition-colors"
          aria-label="Rango de precio máximo"
        >
          {priceRanges.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ============================================================
// MOBILE FILTERS DRAWER
// ============================================================

interface MobileFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: AdminCategory[];
  filters: ShopFilters;
  onFilterChange: <K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) => void;
  onReset: () => void;
  hasActive: boolean;
  resultCount: number;
}

export function MobileFiltersDrawer({
  open,
  onClose,
  categories,
  filters,
  onFilterChange,
  onReset,
  hasActive,
  resultCount,
}: MobileFiltersDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-ink/40 z-50 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-paper rounded-t-3xl border-t-2 border-ink max-h-[85vh] overflow-y-auto transition-transform duration-300 lg:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros de productos"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-ink/20 rounded-full" />
        </div>

        <div className="px-6 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-ink">Filtrar</h2>
            <div className="flex items-center gap-3">
              {hasActive && (
                <button
                  onClick={onReset}
                  className="text-sm font-bold text-brand-red hover:underline"
                >
                  Limpiar
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border-2 border-ink/20 flex items-center justify-center text-ink hover:border-ink transition-colors"
                aria-label="Cerrar filtros"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <p className="text-sm font-bold text-ink mb-3">Categoría</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onFilterChange("category", "")}
                className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                  filters.category === ""
                    ? "bg-ink text-paper border-ink"
                    : "bg-paper text-ink border-ink/20"
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onFilterChange("category", cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                    filters.category === cat.slug
                      ? "bg-ink text-paper border-ink"
                      : "bg-paper text-ink border-ink/20"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="mb-6 border-t border-ink/10 pt-6">
            <ShopFilterToggles
              onlyCustomizable={filters.onlyCustomizable}
              onlyAvailable={filters.onlyAvailable}
              priceMax={filters.priceMax}
              onCustomChange={(v) => onFilterChange("onlyCustomizable", v)}
              onAvailableChange={(v) => onFilterChange("onlyAvailable", v)}
              onPriceChange={(v) => onFilterChange("priceMax", v)}
            />
          </div>

          {/* Sort */}
          <div className="mb-6 border-t border-ink/10 pt-6">
            <p className="text-sm font-bold text-ink mb-3">Ordenar por</p>
            <ShopSorting
              value={filters.sort}
              onChange={(v) => onFilterChange("sort", v)}
            />
          </div>

          {/* Apply */}
          <button
            onClick={onClose}
            className="w-full bg-ink text-paper font-bold rounded-full px-6 py-4 hover:bg-opacity-90 transition-colors"
          >
            Ver {resultCount} producto{resultCount !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </>
  );
}
