// ============================================================
// PRODUCTS SERVICE — CRUD de productos.
// Semilla: src/data/products.ts (Fase 1)
// Persistencia: localStorage.
// ============================================================

import type { AdminProduct } from "@/types/admin";
import { storage } from "./storage";
import { emit } from "./events";
import { uid, nowISO } from "./ids";
import { products as seedProducts } from "@/data/products";

const KEY = "products";

function normalizeSeed(): AdminProduct[] {
  return seedProducts.map((p) => ({
    ...p,
    // Garantiza IDs únicos estables
    id: p.id || uid("p"),
    createdAt: p.createdAt || nowISO(),
    updatedAt: p.updatedAt || nowISO(),
  }));
}

let seeded = false;
export function loadProducts(): AdminProduct[] {
  const existing = storage.get<AdminProduct[] | null>(KEY, null);
  if (existing && existing.length > 0) return existing;
  if (!seeded) {
    const seed = normalizeSeed();
    storage.set<AdminProduct[]>(KEY, seed);
    seeded = true;
    return seed;
  }
  return [];
}

export function getAllProducts(): AdminProduct[] {
  return loadProducts().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getActiveProducts(): AdminProduct[] {
  return getAllProducts().filter((p) => p.isActive);
}

export function getProductById(id: string): AdminProduct | undefined {
  return getAllProducts().find((p) => p.id === id);
}

export function getProductBySlug(slug: string): AdminProduct | undefined {
  return getAllProducts().find((p) => p.slug === slug);
}

function save(list: AdminProduct[]): void {
  storage.set<AdminProduct[]>(KEY, list);
  emit("products");
}

export function createProduct(data: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">): AdminProduct {
  const product: AdminProduct = {
    ...data,
    id: uid("p"),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  const list = getAllProducts();
  list.unshift(product);
  save(list);
  return product;
}

export function updateProduct(id: string, patch: Partial<AdminProduct>): AdminProduct | null {
  const list = getAllProducts();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...patch, id: list[idx].id, updatedAt: nowISO() };
  list[idx] = updated;
  save(list);
  return updated;
}

export function deleteProduct(id: string): boolean {
  const list = getAllProducts();
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  save(next);
  return true;
}

export function duplicateProduct(id: string): AdminProduct | null {
  const original = getProductById(id);
  if (!original) return null;
  const copy: Omit<AdminProduct, "id" | "createdAt" | "updatedAt"> = {
    ...original,
    name: `${original.name} (copia)`,
    slug: `${original.slug}-copia-${Math.floor(Math.random() * 1000)}`,
    isActive: false,
  };
  return createProduct(copy);
}

export function resetToSeed(): void {
  storage.remove(KEY);
  seeded = false;
  loadProducts();
  emit("products");
}

// ---------- HELPERS DE UI ----------

export function computeProductPrice(product: AdminProduct, quantity: number): number | null {
  if (product.requiresQuote || product.price === null) return null;
  if (product.priceType === "perUnit") return product.price * Math.max(1, quantity);
  return product.price;
}
