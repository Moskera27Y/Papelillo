"use client";

import React, { useState, useEffect, useRef } from "react";
import { siteConfig } from "@/lib/config";

export function InstagramSection() {
  const hasInstagram = siteConfig.instagramUrl !== "";
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-paper-cream relative overflow-hidden">
      {/* Grid decorativo de fondo */}
      <svg
        className={`absolute inset-0 w-full h-full opacity-0 transition-opacity duration-700 pointer-events-none ${
          visible ? "opacity-[0.04]" : ""
        }`}
        aria-hidden="true"
      >
        <defs>
          <pattern id="ig-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0A0A0A" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ig-grid)" />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p
          className={`text-xs font-bold uppercase tracking-[0.3em] text-brand-red mb-3 ${
            visible ? "animate-fade-up" : "opacity-0"
          }`}
        >
          @papelillo
        </p>
        <h2
          className={`font-display text-4xl md:text-5xl font-bold text-ink mb-4 ${
            visible ? "animate-fade-up" : "opacity-0"
          }`}
          style={{ animationDelay: "0.05s" }}
        >
          DESCUBRE MÁS PAPELILLO
        </h2>
        <p
          className={`text-lg text-ink-muted mb-8 max-w-2xl mx-auto ${
            visible ? "animate-fade-up" : "opacity-0"
          }`}
          style={{ animationDelay: "0.1s" }}
        >
          Síguenos en Instagram para ver más creaciones y procesos.
        </p>

        {/* Mockup de posts de Instagram */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-10 ${
            visible ? "" : "opacity-0"
          }`}
        >
          {[
            { color: "bg-brand-yellow", emoji: "✉️", rotation: "-rotate-2" },
            { color: "bg-brand-red", emoji: "📦", rotation: "rotate-1" },
            { color: "bg-brand-green", emoji: "✨", rotation: "-rotate-1" },
            { color: "bg-brand-blue", emoji: "🎁", rotation: "rotate-2" },
          ].map((item, i) => (
            <div
              key={i}
              className={`${item.color} aspect-square rounded-2xl border-2 border-ink shadow-sticker flex items-center justify-center ${item.rotation} ${
                visible ? "animate-drop-in" : "opacity-0"
              } hover:shadow-sticker-lg hover:scale-105 hover:rotate-0 transition-all duration-300`}
              style={{
                animationDelay: `${0.15 + i * 0.1}s`,
                ["--drop-rotate" as string]: item.rotation.replace("rotate", "").replace("(", "").replace(")", "") + "deg",
              }}
            >
              <span className="text-5xl">{item.emoji}</span>
            </div>
          ))}
        </div>

        {hasInstagram ? (
          <div className={visible ? "animate-fade-up" : "opacity-0"} style={{ animationDelay: "0.6s" }}>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-ink text-paper font-bold rounded-full px-8 py-4 hover:bg-opacity-90 shadow-sticker hover:shadow-sticker-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Ver Instagram
            </a>
          </div>
        ) : (
          <div
            className={`inline-block bg-paper/70 rounded-3xl border-2 border-ink/20 p-6 ${
              visible ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.6s" }}
          >
            <p className="text-ink-muted text-sm">
              Configura tu cuenta de Instagram en{" "}
              <code className="bg-paper-cream px-2 py-1 rounded text-xs font-mono">src/lib/config.ts</code>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
