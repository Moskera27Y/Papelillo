// ============================================================
// WISHLIST HOOK — client-side + localStorage fallback + sync API
// ============================================================
"use client";

import { useEffect, useState, useCallback } from "react";

const KEY = "papelillo_wishlist";

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      setItems(JSON.parse(stored));
    }
    setLoaded(true);
  }, []);

  const sync = useCallback(
    (newItems: WishlistItem[]) => {
      setItems(newItems);
      localStorage.setItem(KEY, JSON.stringify(newItems));
    },
    []
  );

  const add = useCallback(
    async (productId: string) => {
      const newItem: WishlistItem = {
        id: crypto.randomUUID(),
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
