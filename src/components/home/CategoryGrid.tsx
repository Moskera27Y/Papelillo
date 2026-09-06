"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useActiveCategories } from "@/hooks/useDataService";
import { getBrandColorClass } from "@/lib/utils";
import { Star } from "@/components/ui/Doodles";
import { ArrowRight } from "lucide-react";

export function CategoryGrid() {
  const { categories: activeCategories, isLoading, error } = useActiveCategories();
  const categories = activeCategories ?? [];
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduceMotion(mq.matches);
    }
  }, []);

  if (categories.length === 0) return null;

  // Iconos SVG específicos y a color para cada categoría
  const iconMap: Record<string, React.ReactNode> = {
    "para-colorear": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="none">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.7-3.7a6 6 0 0 1-7.9 7.9l-6.9 6.9a24.7 24.7 0 0 1-4.9-4.9l6.9-6.9a6 6 0 0 0 7.9-7.9l-.1-.1" fill="#FF2B32" />
        <path d="M15 13.5l-1.5-1.5" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="5.5" cy="18.5" r="3" fill="#FFD000" />
      </svg>
    ),
    "actividades": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M8 21v-4a4 4 0 0 1 4-4h4" stroke="#78D64B" strokeWidth="2" strokeLinecap="round" />
        <path d="M15.5 5.5 18 8l-3 3-3-3 3-3z" fill="#78D64B" />
        <path d="M2 12h7a7 7 0 0 1 7 7" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />
        <path d="M2 6h20v2" fill="#FF2B32" />
      </svg>
    ),
    "invitaciones": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="#5274E8" stroke="#0A0A0A" strokeWidth="1.5" />
        <path d="M8 2v4" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 2v4" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 14v5" stroke="#FFD000" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
        <path d="M15 14v5" stroke="#FFD000" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
      </svg>
    ),
    "cajas-y-regalos": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="8" width="18" height="12" rx="2" fill="#FF2B32" stroke="#0A0A0A" strokeWidth="1.5" />
        <path d="M8 8V4h8v4" stroke="#FFD000" strokeWidth="2" strokeLinecap="round" fill="#FFD000" />
        <path d="M3 10l9 5 9-5" stroke="#0A0A0A" strokeWidth="1.5" fill="none" />
        <path d="M8 18v2" stroke="#78D64B" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 18v2" stroke="#5274E8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    "stickers": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" fill="#FFD000" stroke="#0A0A0A" strokeWidth="1.5" />
        <path d="M12 8v8" stroke="#FF2B32" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 12h8" stroke="#5274E8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    "juegos": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="8" r="3" fill="#5274E8" stroke="#0A0A0A" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="3" fill="#78D64B" stroke="#0A0A0A" strokeWidth="1.5" />
        <path d="M8 5a6 6 0 0 1 6 6h-2a4 4 0 1 0-4 4" stroke="#FF2B32" strokeWidth="2" fill="none" />
      </svg>
    ),
    "material-creativo": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="none">
        <path d="M12 19V5" stroke="#78D64B" strokeWidth="3" strokeLinecap="round" />
        <path d="M5 12l7-7 7 7" stroke="#0A0A0A" strokeWidth="2" fill="none" />
        <path d="M8 19h8" stroke="#FF2B32" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="19" r="1" fill="#FFD000" />
        <circle cx="8" cy="19" r="1" fill="#5274E8" />
      </svg>
    ),
    "personalizados": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="none">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.7-3.7a6 6 0 0 1-7.9 7.9l-6.9 6.9a24.7 24.7 0 0 1-4.9-4.9l6.9-6.9a6 6 0 0 0 7.9-7.9l-.1-.1" fill="#5274E8" />
        <path d="M15 13.5l-1.5-1.5" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />
        <rect x="4" y="7" width="16" height="2" rx="1" fill="#FF2B32" />
        <circle cx="19" cy="8" r="2" fill="#FFD000" />
      </svg>
    ),
  };

  // Función para obtener el icono por slug de categoría, fallback por color
  const getIcon = (category: { slug: string; color: string }): React.ReactNode => {
    if (iconMap[category.slug]) return iconMap[category.slug];
    const colorFill: Record<string, string> = {
      red: "#FF2B32",
      yellow: "#FFD000",
      green: "#78D64b",
      blue: "#5274E8",
      ink: "#0A0A0A",
    };
    const fill = colorFill[category.color] || "#FF2B32";
    return <Star className="text-current" style={{ color: fill }} />;
  };

  return (
    <section className="py-20 lg:py-28 bg-transparent relative overflow-hidden">
      {/* Partículas flotantes de fondo */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {!reduceMotion && (
          <>
            <div className="absolute top-[15%] left-[10%] w-2 h-2 bg-brand-yellow rounded-full animate-pulse-soft" style={{ animationDelay: "0.3s" }} />
            <div className="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse-soft" style={{ animationDelay: "0.7s" }} />
            <div className="absolute bottom-[25%] left-[20%] w-2.5 h-2.5 bg-brand-green rounded-full animate-pulse-soft" style={{ animationDelay: "1.1s" }} />
            <div className="absolute bottom-[40%] right-[25%] w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
            <div className="absolute top-[5%] left-[50%] w-1 h-1 bg-brand-red rounded-full animate-pulse-soft" style={{ animationDelay: "0.9s" }} />
          </>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de sección */}
        <div className="text-center mb-14">
          <div
            className={`inline-flex items-center gap-3 bg-brand-red text-paper border-3 border-ink rounded-full px-6 py-2 mb-6 shadow-sticker ${
              mounted ? "animate-drop-in" : "opacity-0"
            }`}
            style={{ animationDelay: "0.1s" }}
          >
            <Star size={16} className="text-brand-yellow" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Explora</span>
          </div>

          <h2
            className={`font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-ink leading-tight mb-4 ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.2s" }}
          >
            DESCUBRE PAPELILLO
          </h2>

          <p
            className={`text-xl md:text-2xl text-ink-muted max-w-2xl mx-auto ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            Explora nuestras categorías y encuentra lo que buscas.
          </p>
        </div>

        {/* Grid de categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories
            .sort((a, b) => a.order - b.order)
            .map((category, i) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group block animate-fade-up"
                style={{ animationDelay: `${0.3 + i * 0.08}s` }}
              >
                <div
                  className={`\
                    relative overflow-hidden rounded-3xl border-4 border-ink
                    shadow-sticker hover:shadow-sticker-lg hover:shadow-2xl
                    hover:-translate-y-1 hover:rotate-1
                    transition-all duration-300 hover:scale-[1.03]
                    ${getBrandColorClass(category.color)}
                    bg-paper
                  `}
                >
                  {/* Efecto shimmer en el borde */}
                  <div
                    className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity blur-[1px]`}
                  />

                  <div className="aspect-square flex flex-col items-center justify-center p-8 text-center relative z-10">
                    {/* Icono animado con brillo */}
                    <div
                      className={`
                        mb-4 p-4 rounded-2xl bg-white/70 shadow-sticker-sm
                        group-hover:scale-110 group-hover:shadow-sticker-lg
                        transition-all duration-300
                        ${!reduceMotion && "animate-float-paper"}
                      `}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="flex-shrink-0">
                        {getIcon(category)}
                      </div>
                    </div>

                    {/* Título de categoría */}
                    <h3
                      className={`
                        font-display text-xl sm:text-2xl lg:text-3xl font-black
                        text-ink mb-3 group-hover:scale-105
                        transition-transform duration-300
                      `}
                    >
                      {category.name}
                    </h3>

                    {/* Descripción */}
                    <p
                      className={`
                        text-base text-ink-muted
                        group-hover:text-ink
                        font-semibold
                        transition-colors duration-300
                        line-clamp-2
                      `}
                    >
                      {category.description}
                    </p>
                  </div>

                  {/* Efecto de "paper peel" en esquina inferior derecha */}
                  <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full"
                      fill={category.color === "red" ? "#FF2B32" : category.color === "yellow" ? "#FFD000" : category.color === "green" ? "#78D64b" : category.color === "blue" ? "#5274E8" : "#0A0A0A"}
                      opacity="0.15"
                    >
                      <polygon points="100,0 100,100 0,100" />
                    </svg>
                  </div>

                  {/* Hover overlay con gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Sticker "Nuevo" con efecto de brillo */}
                  {i < 3 && (
                    <div
                      className={`absolute top-3 left-3 bg-brand-red text-paper text-[10px] font-black px-2.5 py-1 rounded-full border-2 border-ink rotate-12 shadow-sticker-sm ${
                        !reduceMotion && "animate-pulse-slow"
                      }`}
                      style={{ animationDelay: `${i * 0.3}s` }}
                    >
                      NUEVO
                    </div>
                  )}
                </div>
              </Link>
            ))}
        </div>

        {/* Call to action */}
        <div
          className={`mt-16 text-center animate-fade-up ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
          style={{ animationDelay: "0.5s" }}
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 sm:gap-3 bg-ink text-paper font-black rounded-full px-8 py-3 sm:px-10 sm:py-4 text-sm sm:text-base
                       hover:bg-brand-red hover:-translate-y-1 hover:shadow-sticker-lg
                       transition-all duration-300 border-3 border-ink"
          >
            Ver todas las categorías
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
