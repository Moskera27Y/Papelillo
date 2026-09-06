"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, Circle, Triangle, Pencil, Scissors } from "@/components/ui/Doodles";
import { useActiveCategories } from "@/hooks/useDataService";

// Mapeo de fallbacks de color/ícono para categorías sin imagen
function fallbackColor(index: number): string {
  const colors = ["bg-brand-yellow", "bg-brand-red", "bg-brand-green", "bg-brand-blue", "bg-paper-cream", "bg-brand-yellow"];
  return colors[index % colors.length];
}
function fallbackIcon(index: number): React.ReactNode {
  const icons = [
    <Pencil key="i0" className="w-20 h-20 text-ink" />,
    <Star key="i1" className="w-20 h-20 text-ink animate-pulse-soft" />,
    <Heart key="i2" className="w-20 h-20 text-brand-red animate-pulse-soft" />,
    <Scissors key="i3" className="w-20 h-20 text-ink" />,
    <Triangle key="i4" className="w-20 h-20 text-ink" />,
    <Circle key="i5" className="w-20 h-20 text-ink" />,
  ];
  return icons[index % icons.length];
}
function fallbackBadge(index: number): string {
  const badges = ["bg-brand-yellow", "bg-brand-red", "bg-brand-blue", "bg-brand-green", "bg-brand-red", "bg-brand-yellow"];
  return badges[index % badges.length];
}

export function Gallery() {
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);
  const { categories, isLoading } = useActiveCategories();
  // ✅ Limite a 6 para mantener el grid layout
  const active = (categories ?? []).slice(0, 6);

  useEffect(() => {
    setVisible(true);
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduceMotion(mq.matches);
      const h = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mq.addEventListener?.("change", h);
      return () => mq.removeEventListener?.("change", h);
    }
  }, []);

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
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-20 lg:py-32 bg-transparent relative overflow-hidden"
    >
      {/* Elementos decorativos animados de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {!reduceMotion && visible && (
          <React.Fragment key="deco">
            <div key="d1" className="absolute top-10 left-10 w-16 h-16 border-2 border-brand-yellow rotate-12 opacity-20 animate-spin-slow" style={{ animationDelay: "0.4s" }} />
            <div key="d2" className="absolute bottom-16 right-12 w-20 h-20 border-3 border-brand-red rounded-full opacity-15 animate-pulse-soft" style={{ animationDelay: "0.7s" }} />
            <div key="d3" className="absolute top-1/2 right-5 w-14 h-14 border-2 border-brand-green rotate-45 opacity-25 animate-wiggle-soft" style={{ animationDelay: "1s" }} />
            <svg key="d4" className="absolute bottom-1/4 left-5 w-32 h-10 opacity-15 animate-wiggle-soft" viewBox="0 0 120 20" style={{ animationDelay: "0.8s" }} aria-hidden="true">
              <path d="M5 12 Q 20 2, 35 12 T 65 12 T 95 12" stroke="#FFD000" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
            <svg key="d5" className="absolute top-1/4 right-1/4 w-28 h-8 opacity-15 animate-wiggle-soft" viewBox="0 0 120 20" style={{ animationDelay: "1.1s" }} aria-hidden="true">
              <path d="M5 10 Q 20 0, 35 10 T 65 10" stroke="#5274E8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </React.Fragment>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de sección */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 bg-brand-red border-3 border-ink rounded-full px-6 py-2 mb-6 shadow-sticker ${visible ? "animate-drop-in" : "opacity-0"}`} style={{ animationDelay: "0.1s" }}>
            <Star size={16} className="text-brand-yellow" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-paper">Galería</span>
          </div>

          <h2 className={`font-display text-4xl md:text-5xl lg:text-6xl font-black text-ink leading-tight mb-4 ${visible ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
            UN POQUITO DE NUESTRO MUNDO
          </h2>

          <p className={`text-xl md:text-2xl text-ink-muted max-w-2xl mx-auto ${visible ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.3s" }}>
            Una mirada a lo que hacemos con detalle y color.
          </p>
        </div>

        {/* ✅ Grid de categorías reales con masonry — mismas dimensiones/animaciones */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[180px] lg:auto-rows-[220px]">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-ink/10 rounded-3xl border-3 border-ink animate-pulse-soft" style={{ animationDelay: `${0.3 + i * 0.08}s` }} />
              ))
            : active.map((category, i) => {
                const hasImage = !!category.image;
                const color = fallbackColor(i);
                const badge = fallbackBadge(i);
                return (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}`}
                    className={`
                      ${hasImage ? "bg-ink" : color} relative overflow-hidden rounded-3xl border-3 border-ink
                      shadow-sticker hover:shadow-sticker-lg
                      hover:-translate-y-2 hover:scale-[1.02]
                      transition-all duration-300
                      group
                      ${visible ? "animate-fade-up" : "opacity-0"}
                    `}
                    style={{ animationDelay: `${0.3 + i * 0.08}s`, ["--drop-rotate" as string]: `${i % 2 === 0 ? -2 : 2}deg` } as React.CSSProperties}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Imagen real como fondo (object-cover) */}
                    {hasImage && (
                      <Image src={category.image} alt={category.name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}

                    {/* Overlay oscuro sutil para legibilidad sobre foto */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Fallback: icono decorativo (solo si no hay imagen) */}
                    {!hasImage && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`mb-2 transition-all duration-300 ${hoveredIndex === i ? "scale-110" : "scale-100"}`}>{fallbackIcon(i)}</div>
                        <h3 className={`font-display text-xl lg:text-2xl font-black text-ink mb-1 transition-all duration-300 ${hoveredIndex === i ? "scale-105 text-ink" : ""}`}>{category.name}</h3>
                        {category.description && <p className="text-xs text-ink-muted font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300">{category.description}</p>}
                      </div>
                    )}

                    {/* Título (sobre foto o placeholder) */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-paper">
                      <h3 className="font-display text-xl lg:text-2xl font-black text-paper mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{category.name}</h3>
                      {category.description && <p className="text-xs text-paper/80 font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{category.description}</p>}
                    </div>

                    {/* Badge de esquina */}
                    <div className={`absolute top-3 right-3 w-3 h-3 rounded-full border border-ink ${badge} ${!reduceMotion && "animate-pulse-slow"}`} style={{ animationDelay: `${i * 0.2}s` }} />

                    {/* Efecto shimmer en hover */}
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-50 transition-opacity blur-sm" />

                    {/* Paper peel decorativo */}
                    <div className="absolute bottom-0 left-0 w-10 h-10 overflow-hidden pointer-events-none">
                      <svg viewBox="0 0 100 100" className="w-full h-full opacity-10" fill="currentColor" style={{ color: hasImage ? "#FF2B32" : color.includes("red") ? "#FF2B32" : color.includes("yellow") ? "#FFD000" : color.includes("green") ? "#78D64b" : color.includes("blue") ? "#5274E8" : "#0A0A0A" }}>
                        <polygon points="0,100 0,0 100,100" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
        </div>

        {/* Call to action decorativo */}
        <div className={`mt-16 text-center ${visible ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.5s" }}>
          <div className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <span className="w-2 h-2 bg-brand-red rounded-full animate-pulse-slow" style={{ animationDelay: "0.1s" }} />
            <span className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse-slow" style={{ animationDelay: "0.3s" }} />
            <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
            <span className="w-2 h-2 bg-brand-blue rounded-full animate-pulse-slow" style={{ animationDelay: "0.7s" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
