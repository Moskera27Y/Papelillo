"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Botón flotante que aparece al hacer scroll hacia abajo.
 * Permite volver al inicio de la página con animación suave.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener?.("change", handler);

    const toggle = () => setVisible(window.scrollY > 400);
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });

    return () => {
      window.removeEventListener("scroll", toggle);
      mq.removeEventListener?.("change", handler);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => {
        if (reduceMotion) {
          window.scrollTo(0, 0);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      className={cn(
        "fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full",
        "bg-ink text-paper border-2 border-ink shadow-sticker",
        "flex items-center justify-center",
        "hover:bg-brand-red hover:-translate-y-1",
        "transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2",
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        reduceMotion ? "transition-none" : "animate-fade-up"
      )}
      aria-label="Volver arriba"
      style={{ animationDelay: "0.2s" }}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 10l7-7m0 0l7 7m-7-7v14"
        />
      </svg>
    </button>
  );
}
