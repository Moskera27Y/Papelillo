"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { siteContent } from "@/data/site-content";
import { useActiveProducts } from "@/hooks/useDataService";

// ============================================================
// "HECHO A TU MANERA" — sección editorial con tarjetas
// flotantes tipo papel/sticker, parallax sutil y staggered
// entry. Enlaza a productos reales cuando existen.
// ============================================================

type CardDef = {
  id: string;
  label: string;
  subtitle: string;
  emoji: string;
  color: "yellow" | "red" | "green" | "blue";
  rotation: number;
  floatDelay: number;
  floatDuration: number;
  slug?: string;
  icon: React.ReactNode;
};

// Iconos SVG a color para cada categoría
const ICON_STYLES: Record<string, { bg: string; text: string; symbol: string }> = {
  yellow: { bg: "#FFD000", text: "#0A0A0A", symbol: "#FF2B32" },
  red: { bg: "#FF2B32", text: "#FFFDF9", symbol: "#FFFDF9" },
  green: { bg: "#78D64b", text: "#0A0A0A", symbol: "#0A0A0A" },
  blue: { bg: "#5274E8", text: "#FFFDF9", symbol: "#FFD000" },
};

// Iconos SVG específicos y a color para cada categoría
const CARD_ICONS: Record<string, React.ReactNode> = {
  "invitaciones": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="#FF2B32" stroke="#0A0A0A" strokeWidth="0.5" />
      <path d="M8 2v4" stroke="#FFFDF9" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 2v4" stroke="#FFFDF9" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 10l8 4 8-4" stroke="#0A0A0A" strokeWidth="1" />
    </svg>
  ),
  "cajas": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="8" width="18" height="12" rx="2" fill="#FFD000" stroke="#0A0A0A" strokeWidth="0.5" />
      <path d="M8 8V4h8v4" stroke="#FF2B32" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 10l9 5 9-5" stroke="#0A0A0A" strokeWidth="1" />
      <circle cx="7" cy="14" r="1" fill="#5274E8" />
      <circle cx="17" cy="14" r="1" fill="#78D64b" />
    </svg>
  ),
  "rompecabezas": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="3" fill="#5274E8" stroke="#0A0A0A" strokeWidth="0.5" />
      <circle cx="16" cy="16" r="3" fill="#FF2B32" stroke="#0A0A0A" strokeWidth="0.5" />
      <path d="M8 5a6 6 0 0 1 6 6h-2a4 4 0 1 0-4 4" stroke="#FFD000" strokeWidth="1.5" />
    </svg>
  ),
  "stickers": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" fill="#FFD000" stroke="#0A0A0A" strokeWidth="0.5" />
      <path d="M12 8v8" stroke="#5274E8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 12h8" stroke="#5274E8" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="7.5" r="1" fill="#FF2B32" />
    </svg>
  ),
};

const CARDS: CardDef[] = [
  {
    id: "invitaciones",
    label: "Invitaciones",
    subtitle: "Personalizadas",
    emoji: "✉️",
    color: "yellow",
    rotation: -10,
    floatDelay: 0,
    floatDuration: 6.5,
    slug: "invitaciones-digitales",
    icon: CARD_ICONS["invitaciones"],
  },
  {
    id: "cajas",
    label: "Cajas",
    subtitle: "Con relieve",
    emoji: "📦",
    color: "red",
    rotation: 6,
    floatDelay: 0.8,
    floatDuration: 7.2,
    slug: "cajas-personalizadas-con-relieve",
    icon: CARD_ICONS["cajas"],
  },
  {
    id: "rompecabezas",
    label: "Rompecabezas",
    subtitle: "Tu imagen",
    emoji: "🧩",
    color: "green",
    rotation: 4,
    floatDelay: 1.6,
    floatDuration: 8.0,
    slug: "rompecabezas",
    icon: CARD_ICONS["rompecabezas"],
  },
  {
    id: "stickers",
    label: "Stickers",
    subtitle: "Originales",
    emoji: "✨",
    color: "blue",
    rotation: -7,
    floatDelay: 2.4,
    floatDuration: 6.0,
    slug: "stickers",
    icon: CARD_ICONS["stickers"],
  },
];

const COLOR_MAP: Record<string, string> = {
  yellow: "bg-brand-yellow",
  red: "bg-brand-red",
  green: "bg-brand-green",
  blue: "bg-brand-blue",
};

const LABEL_COLORS: Record<string, string> = {
  yellow: "text-ink",
  red: "text-paper",
  green: "text-ink",
  blue: "text-paper",
};

export function CustomHighlight() {
  const { customHighlight } = siteContent;
  const { products: activeProducts, isLoading } = useActiveProducts();
  const products = activeProducts ?? [];
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  // Detectar entrada al viewport
  useEffect(() => {
    setVisible(true);
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduceMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mq.addEventListener?.("change", handler);
      return () => mq.removeEventListener?.("change", handler);
    }
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  // Parallax sutil basado en scroll
  useEffect(() => {
    if (reduceMotion) return;
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.top < vh && rect.bottom > 0) {
        const progress = (vh - rect.top) / (vh + rect.height);
        setScrollY(progress);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduceMotion]);

  // Mouse tracking para parallax 3D
  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: MouseEvent) => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setCursor({ x: px, y: py });
    };
    const el = sectionRef.current;
    el?.addEventListener("mousemove", onMove);
    return () => el?.removeEventListener("mousemove", onMove);
  }, [reduceMotion]);

  // Verificar qué productos están disponibles
  const getCardLink = (card: CardDef): string | null => {
    if (!card.slug) return null;
    return products.find((p) => p.slug === card.slug && p.isActive)
      ? `/product/${card.slug}`
      : null;
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-40 bg-paper-soft relative overflow-hidden"
    >
      {/* Acentos radiales animados */}
      {!reduceMotion && (
        <>
          <div
            className="absolute -top-32 -left-32 w-80 h-80 bg-brand-red rounded-full opacity-10 blur-3xl"
            style={{ animation: "pulse 6s cubic-bezier(.2,.7,.2,1) infinite" }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-80 h-80 bg-brand-yellow rounded-full opacity-10 blur-3xl"
            style={{ animation: "pulse 8s cubic-bezier(.2,.7,.2,1) infinite", animationDelay: "1s" }}
          />
        </>
      )}

      {/* Doodles de fondo animados */}
      <div className="absolute top-12 left-12 opacity-20" style={{ animationDelay: "0.3s" }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#FF2B32" strokeWidth="3" strokeDasharray="4 4" className={!reduceMotion && "animate-spin-slow"} />
          <path d="M24 6 L24 24 L38 24" stroke="#FFD000" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      <div className="absolute top-16 right-16 opacity-15" style={{ animationDelay: "0.4s" }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#5274E8" strokeWidth="2" />
          <path d="M20 10 L28 20 L20 30 L12 20 Z" fill="#78D64b" />
        </svg>
      </div>

      <div className="absolute bottom-12 left-1/4 opacity-20" style={{ animationDelay: "0.5s" }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <path d="M18 3 C25 3 31 9 31 16 C31 23 25 29 18 29 C11 29 5 23 5 16 C5 9 11 3 18 3 Z" fill="none" stroke="#FFD000" strokeWidth="2" />
          <path d="M18 10 C21 10 24 12 24 16 C24 20 21 24 18 24 C15 24 12 20 12 16 C12 12 15 10 18 10 Z" fill="#FF2B32" />
        </svg>
      </div>

      <div className="absolute bottom-16 right-1/3 opacity-15" style={{ animationDelay: "0.6s" }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <circle cx="22" cy="22" r="20" fill="none" stroke="#78D64b" strokeWidth="2" />
          <circle cx="22" cy="22" r="10" fill="#FF2B32" />
          <circle cx="22" cy="22" r="4" fill="#FFFDF9" />
        </svg>
      </div>

      {/* Partículas flotantes */}
      {!reduceMotion && (
        <>
          <div className="absolute top-[20%] left-[30%] w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-[35%] right-[25%] w-2 h-2 bg-brand-yellow rounded-full animate-pulse-slow" style={{ animationDelay: "0.7s" }} />
          <div className="absolute bottom-[30%] left-[15%] w-1 h-1 bg-brand-green rounded-full animate-pulse-slow" style={{ animationDelay: "0.9s" }} />
          <div className="absolute bottom-[45%] right-[35%] w-2 h-2 bg-brand-blue rounded-full animate-pulse-slow" style={{ animationDelay: "1.1s" }} />
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Texto */}
          <div>
            <p
              className={`text-sm font-black uppercase tracking-[0.3em] text-brand-red mb-3 inline-block bg-brand-red/10 px-4 py-1.5 rounded-full border border-brand-red/30 ${
                visible ? "animate-fade-up" : "opacity-0"
              }`}
            >
              {customHighlight.eyebrow}
            </p>

            <h2
              className={`font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-ink leading-tight mb-6 ${
                visible ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.15s" }}
            >
              {customHighlight.title}
            </h2>

            <p
              className={`text-lg md:text-xl text-ink-muted mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed ${
                visible ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.25s" }}
            >
              {customHighlight.description}
            </p>

            <div
              className={visible ? "animate-fade-up" : "opacity-0"}
              style={{ animationDelay: "0.35s" }}
            >
              <Button
                href={customHighlight.cta.href}
                variant="primary"
                size="lg"
                className="group relative overflow-hidden bg-ink text-paper hover:bg-brand-red hover:scale-105 hover:shadow-sticker-lg transition-all duration-300 border-3 border-ink font-black"
              >
                <span className="flex items-center gap-3 relative z-10">
                  {customHighlight.cta.label}
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
                {/* Shimmer effect */}
                <div className="absolute -inset-1 -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute -inset-8 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm animate-pulse-soft" />
                </div>
              </Button>
            </div>

            {/* Testimonio mejorado */}
            <div
              className={`mt-12 flex items-start gap-4 max-w-md ${
                visible ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.5s" }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-brand-yellow via-brand-red to-brand-green border-3 border-ink rounded-2xl flex items-center justify-center shadow-sticker-sm flex-shrink-0 animate-float-paper" style={{ animationDelay: "0.1s" }}>
                <span className="text-2xl">💛</span>
              </div>
              <p className="text-lg text-ink italic font-medium leading-relaxed">
                "Cada producto es una pequeña pieza de arte hecha a tu medida."
              </p>
            </div>
          </div>

          {/* Collage de tarjetas tipo sticker */}
          <div className="relative h-[380px] sm:h-[420px] lg:h-[560px] flex items-center justify-center">
            {CARDS.map((card, i) => {
              const link = getCardLink(card);
              const parallaxOffset = reduceMotion
                ? 0
                : (scrollY - 0.5) * (i % 2 === 0 ? 20 : -15);
              const rotateParallax = reduceMotion
                ? 0
                : (scrollY - 0.5) * (i % 2 === 0 ? 2 : -2);

              const positions = [
                "top-[4%] left-[4%] sm:left-[8%]",
                "top-[18%] right-[4%] sm:right-[6%]",
                "bottom-[14%] left-[2%] sm:left-[5%]",
                "bottom-[3%] right-[5%] sm:right-[10%]",
              ];

              const sizes = [
                "w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44",
                "w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40",
                "w-40 h-40 sm:w-44 sm:h-44 lg:w-48 lg:h-48",
                "w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36",
              ];

              const labelColor = LABEL_COLORS[card.color] || "text-ink";
              const iconStyle = ICON_STYLES[card.color] || ICON_STYLES.yellow;

              const Wrapper = link ? Link : "div";
              const wrapperProps = link
                ? { href: link, className: "block" }
                : {};

              return (
                <Wrapper
                  key={card.id}
                  {...wrapperProps}
                >
                  <div
                    className={`absolute ${positions[i]} ${sizes[i]} ${COLOR_MAP[card.color]} rounded-3xl border-3 border-ink shadow-sticker flex flex-col items-center justify-center p-5 cursor-pointer transition-all duration-500 hover:shadow-sticker-lg hover:-translate-y-2 hover:scale-[1.05] group ${
                      visible ? "animate-drop-in" : "opacity-0"
                    } ${!reduceMotion && "animate-float-gentle"}`}
                    style={{
                      animationDelay: `${0.4 + i * 0.15}s`,
                      animationDuration: `${card.floatDuration}s`,
                      ["--drop-rotate" as string]: `${card.rotation}deg`,
                      transform: reduceMotion
                        ? undefined
                        : `translate(${cursor.x * (i % 2 === 0 ? 12 : -10)}px, ${cursor.y * (i % 2 === 0 ? 12 : -10)}px) translateY(${parallaxOffset}px) rotate(${card.rotation + rotateParallax}deg)`,
                    }}
                    onMouseEnter={(e) => {
                      if (reduceMotion) return;
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.transform = `translate(${cursor.x * (i % 2 === 0 ? 12 : -10)}px, ${cursor.y * (i % 2 === 0 ? 12 : -10)}px) translateY(${parallaxOffset - 10}px) rotate(${card.rotation * 0.3}deg) scale(1.08)`;
                    }}
                    onMouseLeave={(e) => {
                      if (reduceMotion) return;
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.transform = reduceMotion
                        ? undefined
                        : `translate(${cursor.x * (i % 2 === 0 ? 12 : -10)}px, ${cursor.y * (i % 2 === 0 ? 12 : -10)}px) translateY(${parallaxOffset}px) rotate(${card.rotation + rotateParallax}deg)`;
                    }}
                  >
                    {/* Icono SVG a color dentro de un círculo */}
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-2 sm:mb-3 border-2 border-ink shadow-sticker-sm transition-transform duration-300 group-hover:scale-110`}
                      style={{ backgroundColor: iconStyle.bg }}
                    >
                      {React.cloneElement(card.icon as React.ReactElement, { width: 22, height: 22 })}
                    </div>

                    {/* Título de categoría */}
                    <h3 className={`font-display text-lg sm:text-xl lg:text-2xl font-black ${labelColor} mb-1 group-hover:scale-105 transition-transform duration-300`}>
                      {card.label}
                    </h3>

                    {/* Subtítulo */}
                    <p className={`text-sm font-semibold opacity-80 group-hover:opacity-100 transition-all duration-300 ${labelColor === "text-paper" ? "text-paper/80" : "text-ink/70"}`}>
                      {card.subtitle}
                    </p>

                    {/* Detalle de color en bottom */}
                    <div className="mt-3 w-full h-1.5 rounded-full overflow-hidden bg-ink/10">
                      <div
                        className="h-full w-2/3 rounded-full transition-all duration-300 group-hover:w-full"
                        style={{ backgroundColor: iconStyle.symbol }}
                      />
                    </div>
                  </div>
                </Wrapper>
              );
            })}

            {/* Centro con squiggle animado */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 relative z-20 ${
                visible ? "animate-scale-in" : "opacity-0"
              }`}
              style={{ animationDelay: "0.9s" }}
            >
              <div className="flex items-center gap-2 sm:gap-3 bg-paper border-3 border-ink rounded-full px-4 py-2 sm:px-6 sm:py-3 shadow-sticker-lg animate-pulse-slow">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-red animate-pulse-slow" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 17.27L18.18 21l-3.71-8.02L22 11.5l-4.55-.39L12 3 7.55 7.42 2 11.5l7.53 6.47z" />
                </svg>
                <span className="font-display text-xs sm:text-sm font-bold text-ink tracking-wider">
                  TU IDEA, TU ESTILO
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
