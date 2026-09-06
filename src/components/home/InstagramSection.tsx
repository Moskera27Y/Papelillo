"use client";

import React, { useState, useEffect, useRef } from "react";
import { siteConfig } from "@/lib/config";
import { useSiteSettings } from "@/hooks/useDataService";
import { SocialIcon } from "@/components/ui/SocialIcon";

export function InstagramSection() {
  const { settings, isLoading } = useSiteSettings();
  const instagramLink = (settings as any)?.socialLinks?.find((l: any) => l.icon === "instagram" && (l.isActive ?? true)) ?? null;
  const hasInstagram = !isLoading && instagramLink?.url;
  const instagramUrl = instagramLink?.url ?? siteConfig.instagramUrl;
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
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-ink text-paper font-bold rounded-full px-8 py-4 hover:bg-opacity-90 shadow-sticker hover:shadow-sticker-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <SocialIcon icon="instagram" />
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
