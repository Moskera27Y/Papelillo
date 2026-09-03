"use client";

import React, { useState, useMemo, Suspense, useEffect } from "react";
import { useActiveProducts, useActiveCategories } from "@/hooks/useDataService";
import { useShopFilters, ShopSearch, ShopSorting, ShopCategoryTabs, ShopFilterToggles, MobileFiltersDrawer } from "@/components/shop/ShopControls";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/shop/ProductSkeleton";
import type { AdminProduct } from "@/types/admin";
import type { Product } from "@/types";

// ============================================================
// FILTROS Y ORDENAMIENTO EN MEMORIA
// ============================================================

function applyFilters(
  products: AdminProduct[],
  filters: {
    category: string;
    query: string;
    sort: string;
    onlyCustomizable: boolean;
    onlyAvailable: boolean;
    priceMax: number;
  }
): AdminProduct[] {
  let list = [...products];

  if (filters.category) {
    list = list.filter((p) => p.category === filters.category);
  }

  if (filters.onlyCustomizable) {
    list = list.filter((p) => p.isCustomizable);
  }

  if (filters.onlyAvailable) {
    list = list.filter((p) => p.stock === null || p.stock > 0);
  }

  if (filters.priceMax > 0 && filters.priceMax < 999999) {
    list = list.filter((p) => p.price !== null && p.price <= filters.priceMax);
  } else if (filters.priceMax >= 999999) {
    list = list.filter((p) => p.price !== null && p.price > 20000);
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  // Sort
  switch (filters.sort) {
    case "price-asc":
      list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
      break;
    case "price-desc":
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case "popular":
      list.sort((a, b) => Number(b.isPopular) - Number(a.isPopular) || Number(b.featured) - Number(a.featured));
      break;
    case "name-asc":
      list.sort((a, b) => a.name.localeCompare(b.name, "es"));
      break;
    case "recent":
    default:
      list.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }

  return list;
}

// ============================================================
// VACÍO / ERROR
// ============================================================

function EmptyState({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return (
    <div className="text-center py-20 px-6">
      {/* Papelillo doodle: hoja de papel con una carita */}
      <div className="inline-block mb-6">
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
          <rect
            x="20"
            y="10"
            width="80"
            height="100"
            rx="12"
            fill="#FFF8D6"
            stroke="#0A0A0A"
            strokeWidth="3"
          />
          <rect
            x="20"
            y="10"
            width="80"
            height="100"
            rx="12"
            fill="none"
            stroke="#FFD000"
            strokeWidth="3"
            strokeDasharray="6 4"
            opacity="0.5"
            transform="translate(4, 4)"
          />
          {/* Ojitos */}
          <circle cx="48" cy="55" r="4" fill="#0A0A0A" />
          <circle cx="72" cy="55" r="4" fill="#0A0A0A" />
          {/* Boquita triste */}
          <path
            d="M45 78 Q60 70 75 78"
            stroke="#0A0A0A"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Estrellita */}
          <path
            d="M95 25 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z"
            fill="#FFD000"
            stroke="#0A0A0A"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <h3 className="font-display text-2xl md:text-3xl font-bold text-ink mb-3">
        {hasFilters
          ? "No encontramos productos con esos filtros."
          : "Estamos preparando nuevas creaciones."}
      </h3>
      <p className="text-ink-muted max-w-md mx-auto mb-6">
        {hasFilters
          ? "Intenta cambiar la categoría, el rango de precio o la búsqueda. ¡Tenemos muchas cosas bonitas!"
          : "Pronto tendrás productos disponibles para explorar."}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 bg-ink text-paper font-bold rounded-full px-6 py-3 hover:bg-opacity-90 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-20 px-6">
      <div className="inline-block mb-6">
        <div className="w-20 h-20 bg-brand-red rounded-full border-2 border-ink shadow-sticker flex items-center justify-center">
          <svg className="w-10 h-10 text-paper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
      <h3 className="font-display text-2xl font-bold text-ink mb-3">
        No pudimos cargar los productos
      </h3>
      <p className="text-ink-muted max-w-md mx-auto mb-6">
        Algo salió mal al cargar el catálogo. Inténtalo nuevamente.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-ink text-paper font-bold rounded-full px-6 py-3 hover:bg-opacity-90 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Intentar nuevamente
      </button>
    </div>
  );
}

// ============================================================
// CONTENIDO PRINCIPAL DEL SHOP
// ============================================================

function ShopContent() {
  const { products: activeProducts, isLoading: productsLoading, error: productsError } = useActiveProducts();
  const { categories: activeCategories, isLoading: catsLoading, error: catsError } = useActiveCategories();
  const products = activeProducts ?? [];
  const categories = activeCategories ?? [];
  const { filters, setFilter, resetFilters, hasActiveFilters } = useShopFilters();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const isLoading = productsLoading || catsLoading;
  const error = productsError || catsError;

  // Simular una pequeña carga inicial
  useEffect(() => {}, []);

  const filtered = useMemo(
    () => applyFilters(products, filters),
    [products, filters]
  );

  const activeCategoryName = useMemo(() => {
    if (!filters.category) return "";
    return categories.find((c) => c.slug === filters.category)?.name || "";
  }, [filters.category, categories]);

  return (
    <div className="min-h-screen bg-paper">
      {/* ============================================ */}
      {/*  HERO HEADER                                 */}
      {/* ============================================ */}
      <section className="relative pt-10 pb-8 lg:pt-16 lg:pb-12 bg-paper-soft border-b border-ink/5 overflow-hidden">
        {/* Doodles decorativos */}
        <svg
          className="absolute top-6 right-8 opacity-30 animate-wiggle-soft hidden md:block"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          aria-hidden="true"
        >
          <path
            d="M20 4l4.5 9 10 1.5-7.2 7 1.7 10L20 27l-9 4.5 1.7-10L5.5 14.5l10-1.5z"
            fill="#FFD000"
            stroke="#0A0A0A"
            strokeWidth="1.5"
          />
        </svg>
        <svg
          className="absolute bottom-6 left-8 opacity-25 animate-float-gentle hidden md:block"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path
            d="M16 28c-1.2-1.1-10-9.3-10-14.5C6 8.4 9.4 5 13.5 5c2 0 3.8 1 4.5 2.5C18.7 6 20.5 5 22.5 5 26.6 5 30 8.4 30 13.5c0 5.2-8.8 13.4-10 14.5L16 28z"
            fill="#FF2B32"
            stroke="#0A0A0A"
            strokeWidth="1.5"
            transform="translate(-2, -2)"
          />
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red mb-3 animate-fade-in">
              Catálogo completo
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-ink mb-4 animate-fade-up">
              TODO PAPELILLO
            </h1>
            <p className="text-lg md:text-xl text-ink-muted max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Pequeñas cosas que hacen grandes tus días.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <ShopSearch
              value={filters.query}
              onChange={(v) => setFilter("query", v)}
            />
          </div>

          {/* Category tabs (desktop) */}
          <div className="hidden md:block animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <ShopCategoryTabs
              categories={categories}
              active={filters.category}
              onChange={(slug) => setFilter("category", slug)}
            />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/*  CONTROLES + GRID                            */}
      {/* ============================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Left: count + mobile filter button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 bg-paper border-2 border-ink rounded-full px-4 py-2.5 text-sm font-bold text-ink hover:shadow-sticker-sm hover:-translate-y-0.5 transition-all"
              aria-label="Abrir filtros"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-brand-red rounded-full" />
              )}
            </button>

            <p className="text-sm text-ink-muted">
              {isLoading ? (
                <span className="skeleton skeleton-text inline-block w-32 h-4 align-middle" />
              ) : (
                <>
                  <span className="font-bold text-ink">{filtered.length}</span> producto
                  {filtered.length !== 1 ? "s" : ""}
                  {activeCategoryName && (
                    <>
                      {" "}en{" "}
                      <span className="font-bold text-ink">{activeCategoryName}</span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Right: sort (desktop) + reset */}
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="hidden lg:inline-flex items-center gap-1.5 text-sm font-bold text-brand-red hover:underline"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar
              </button>
            )}
            <div className="hidden lg:block">
              <ShopSorting
                value={filters.sort}
                onChange={(v) => setFilter("sort", v)}
              />
            </div>
          </div>
        </div>

        {/* Category tabs mobile */}
        <div className="md:hidden mb-6 -mx-4 px-4">
          <ShopCategoryTabs
            categories={categories}
            active={filters.category}
            onChange={(slug) => setFilter("category", slug)}
          />
        </div>

        {/* Main grid layout */}
        <div className="flex gap-8">
          {/* Sidebar filters (desktop only) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-paper-cream rounded-3xl border-2 border-ink/10 p-6 space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold text-ink mb-1">Filtrar</h3>
                <p className="text-xs text-ink-muted">Encuentra justo lo que buscas.</p>
              </div>
              <ShopFilterToggles
                onlyCustomizable={filters.onlyCustomizable}
                onlyAvailable={filters.onlyAvailable}
                priceMax={filters.priceMax}
                onCustomChange={(v) => setFilter("onlyCustomizable", v)}
                onAvailableChange={(v) => setFilter("onlyAvailable", v)}
                onPriceChange={(v) => setFilter("priceMax", v)}
              />
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="w-full text-sm font-bold text-brand-red hover:underline text-center pt-2 border-t border-ink/10"
                >
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : error ? (
              <ErrorState onRetry={() => window.location.reload()} />
            ) : filtered.length === 0 ? (
              <EmptyState
                hasFilters={hasActiveFilters || !!filters.category}
                onReset={resetFilters}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filtered.map((product, idx) => (
                  <div
                    key={product.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}
                  >
                    <ProductCard product={product as unknown as Product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Filters Drawer */}
      <MobileFiltersDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        categories={categories}
        filters={filters}
        onFilterChange={setFilter}
        onReset={resetFilters}
        hasActive={hasActiveFilters}
        resultCount={filtered.length}
      />
    </div>
  );
}

// ============================================================
// PÁGINA PRINCIPAL (envuelta en Suspense para searchParams)
// ============================================================

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-paper">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="skeleton skeleton-text w-64 h-10 mx-auto mb-4" />
            <div className="skeleton skeleton-text w-96 h-5 mx-auto" />
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}


