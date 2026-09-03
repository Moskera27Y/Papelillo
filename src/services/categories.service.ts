// ============================================================
// CATEGORIES SERVICE — CRUD de categorías.
// ============================================================

import type { AdminCategory } from "@/types/admin";
import { storage } from "./storage";
import { emit } from "./events";
import { uid, nowISO } from "./ids";
import { categories as seedCategories } from "@/data/categories";

const KEY = "categories";

function normalizeSeed(): AdminCategory[] {
  return seedCategories.map((c) => ({
    ...c,
    id: c.id || uid("cat"),
  }));
}

export function loadCategories(): AdminCategory[] {
  // SSR-safe: return seed on server, load from storage on client
  const existing = storage.get<AdminCategory[] | null>(KEY, null);
  if (existing && existing.length > 0) return existing;
  // Si no hay nada en storage (primera visita), usa el seed
  return normalizeSeed();
}

export function getAllCategories(): AdminCategory[] {
  return loadCategories().sort((a, b) => a.order - b.order);
}

export function getActiveCategories(): AdminCategory[] {
  return getAllCategories().filter((c) => c.isActive);
}

export function getCategoryById(id: string): AdminCategory | undefined {
  return getAllCategories().find((c) => c.id === id);
}

function save(list: AdminCategory[]): void {
  storage.set<AdminCategory[]>(KEY, list);
  emit("categories");
}

export function createCategory(
  data: Omit<AdminCategory, "id">
): AdminCategory {
  const cat: AdminCategory = { ...data, id: uid("cat") };
  const list = getAllCategories();
  list.push(cat);
  save(list);
  return cat;
}

export function updateCategory(
  id: string,
  patch: Partial<AdminCategory>
): AdminCategory | null {
  const list = getAllCategories();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch, id: list[idx].id };
  save(list);
  return list[idx];
}

export function deleteCategory(id: string): boolean {
  const list = getAllCategories();
  const next = list.filter((c) => c.id !== id);
  if (next.length === list.length) return false;
  save(next);
  return true;
}

export function resetToSeed(): void {
  storage.remove(KEY);
  loadCategories();
  emit("categories");
}
