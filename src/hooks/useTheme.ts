// ============================================================
// DARK MODE — toggle persistente + prefers-color-scheme
// Pattern: Vercel/Stripe design system
// ============================================================
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSafeLocalStorage } from "@/hooks/useSafeLocalStorage";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const { getItem, setItem } = useSafeLocalStorage();
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const saved = getItem("papelillo-theme") as Theme | null;
    if (saved && ["light", "dark", "system"].includes(saved)) {
      setThemeState(saved);
    }
  }, []);

  const resolved = useMemo(() => {
    if (theme === "system") {
      if (typeof window === "undefined") return "light";
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  }, [theme]);

  // SSR-safe theme application
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.setAttribute("data-theme", resolved);
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [resolved]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    setItem("papelillo-theme", t);
  };

  const toggle = () => {
    setTheme(resolved === "dark" ? "light" : "dark");
  };

  return { theme, resolved, setTheme, toggle };
}
