// ============================================================
// WISHLIST HOOK — SSR-safe (usesMounted guard + localStorage)
// ============================================================
"use client";

import { useEffect, useState, useCallback } from "react";

const KEY = "papelillo_wishlist";

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
}

function safeUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback para SSR/Edge sin crypto
  return "______" + Math.random().toString(36).slice(2, 12) + "_" + Date.now().toString(36);
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setItems(JSON.parse(stored) as WishlistItem[]);
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  const sync = useCallback(
    (newItems: WishlistItem[]) => {
      setItems(newItems);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(KEY, JSON.stringify(newItems));
        } catch {
          // ignore quota errors
        }
      }
    },
    []
  );

  const add = useCallback(
    async (productId: string) => {
      const newItem: WishlistItem = {
        id: safeUUID(),
        productId,
        createdAt: new Date().toISOString(),
      };
      sync([...items, newItem]);
      // sync to API (best-effort, no await throw)
      try {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      } catch {}
    },
    [items, sync]
  );

  const remove = useCallback(
    async (productId: string) => {
      const newItems = items.filter((i) => i.productId !== productId);
      sync(newItems);
      try {
        await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      } catch {}
    },
    [items, sync]
  );

  const has = useCallback((productId: string) => items.some((i) => i.productId === productId), [items]);

  return { items, add, remove, has, loaded, count: items.length };
}
