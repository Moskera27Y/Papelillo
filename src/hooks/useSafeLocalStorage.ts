// ============================================================
// SAFE LOCAL STORAGE — SSR-safe wrapper (Next.js App Router)
// ============================================================
"use client";

import { useCallback, useState } from "react";

export function useSafeLocalStorage() {
  const [mounted, setMounted] = useState(false);
  useState(() => {
    setMounted(true);
  });

  const getItem = useCallback((key: string): string | null => {
    if (!mounted || typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [mounted]);

  const setItem = useCallback((key: string, value: string): void => {
    if (!mounted || typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore quota/quirks
    }
  }, [mounted]);

  return { getItem, setItem, mounted };
}
