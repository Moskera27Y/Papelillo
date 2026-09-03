"use client";

import React, { useState, useEffect, useRef } from "react";
import { Heart, Star, Circle, Triangle, Pencil, Scissors } from "@/components/ui/Doodles";

export function Gallery() {
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);

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

  const items = [
    {
      color: "bg-brand-yellow",
      label: "Productos",
      emoji: "📒",
      span: "lg:row-span-2",
      desc: "Libros y más",
      iconDelay: 0,
    },
    {
      color: "bg-brand-red",
      label: "Invitaciones",
      emoji: "✉️",
      span: "lg:col-span-2",
      desc: "Diseños únicas",
      iconDelay: 0.1,
    },
    {
      color: "bg-brand-green",
      label: "Cajas",
      emoji: "📦",
      span: "",
      desc: "Con relieve",
      iconDelay: 0.2,
    },
    {
      color: "bg-brand-blue",
      label: "Stickers",
      emoji: "✨",
      span: "",
      desc: "Originales",
      iconDelay: 0.3,
    },
    {
      color: "bg-paper-cream",
      label: "Procesos",
      emoji: "✂️",
      span: "lg:col-span-2",
      desc: "Hechos a mano",
      iconDelay: 0.4,
    },
    {
      color: "bg-brand-yellow",
      label: "Detalles",
      emoji: "💛",
      span: "lg:row-span-2",
      desc: "Pequeños",
      iconDelay: 0.5,
    },
  ];

  // Renderizar icono SVG decorativo por categoría
  const renderIcon = (item: any, index: number) => {
    const iconClass = `w-20 h-20 ${!reduceMotion && "animate-float-paper"}`;
    const iconStyle = { animationDelay: `${item.iconDelay}s` };

    switch (item.label) {
      case "Productos":
        return <Pencil className="w-20 h-20 text-ink" style={iconStyle} />;
      case "Invitaciones":
        return (
          <svg className={iconClass} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}>
            <rect x="6" y="8" width="28" height="20" rx="3" />
            <path d="M6 12l7-4 7 4 7 0v12a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z" fill="currentColor" opacity="0.1" />
            <path d="M13 12V8l7-4 7 4v4" stroke="#0A0A0A" strokeWidth="1.5" />
          </svg>
        );
      case "Cajas":
        return (
          <svg className={iconClass} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}>
            <rect x="7" y="12" width="26" height="18" rx="2" fill="currentColor" opacity="0.2" />
            <path d="M7 12l6-8h14l6 8" fill="currentColor" opacity="0.4" />
            <path d="M7 12v16a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V12" stroke="#0A0A0A" strokeWidth="1.5" />
            <line x1="12" y1="26" x2="28" y2="26" stroke="#0A0A0A" strokeWidth="1.5" />
          </svg>
        );
      case "Stickers":
        return <Star className="w-20 h-20 text-ink animate-pulse-soft" style={{ ...iconStyle, animationDelay: `${item.iconDelay + 0.2}s` }} />;
      case "Procesos":
        return <Scissors className="w-20 h-20 text-ink" style={iconStyle} />;
      case "Detalles":
        return <Heart className="w-20 h-20 text-brand-red animate-pulse-soft" style={{ ...iconStyle, animationDelay: `${item.iconDelay + 0.3}s` }} />;
      default:
        return <Circle className="w-20 h-20 text-ink" style={iconStyle} />;
    }
  };

  return (
    <section
      ref={ref}
      className="py-20 lg:py-32 bg-transparent relative overflow-hidden"
    >
      {/* Elementos decorativos animados de fondo */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {!reduceMotion && visible && (
          <>
            {/* Cuadrados decorativos rotativos */}
            <div
              className="absolute top-10 left-10 w-16 h-16 border-2 border-brand-yellow rotate-12 opacity-20 animate-spin-slow"
              style={{ animationDelay: "0.4s" }}
            />
            <div
              className="absolute bottom-16 right-12 w-20 h-20 border-3 border-brand-red rounded-full opacity-15 animate-pulse-soft"
              style={{ animationDelay: "0.7s" }}
            />
            <div
              className="absolute top-1/2 right-5 w-14 h-14 border-2 border-brand-green rotate-45 opacity-25 animate-wiggle-soft"
              style={{ animationDelay: "1s" }}
            />
            {/* Squiggles animados */}
            <svg
              className="absolute bottom-1/4 left-5 w-32 h-10 opacity-15 animate-wiggle-soft"
              viewBox="0 0 120 20"
              style={{ animationDelay: "0.8s" }}
              aria-hidden="true"
            >
              <path
                d="M5 12 Q 20 2, 35 12 T 65 12 T 95 12"
                stroke="#FFD000"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <svg
              className="absolute top-1/4 right-1/4 w-28 h-8 opacity-15 animate-wiggle-soft"
              viewBox="0 0 120 20"
              style={{ animationDelay: "1.1s" }}
              aria-hidden="true"
            >
              <path
                d="M5 10 Q 20 0, 35 10 T 65 10"
                stroke="#5274E8"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de sección */}
        <div className="text-center mb-16">
          <div
            className={`inline-flex items-center gap-2 bg-brand-red border-3 border-ink rounded-full px-6 py-2 mb-6 shadow-sticker ${
              visible ? "animate-drop-in" : "opacity-0"
            }`}
            style={{ animationDelay: "0.1s" }}
          >
            <Star size={16} className="text-brand-yellow" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-paper">
              Galería
            </span>
          </div>

          <h2
            className={`font-display text-4xl md:text-5xl lg:text-6xl font-black text-ink leading-tight mb-4 ${
              visible ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.2s" }}
          >
            UN POQUITO DE NUESTRO MUNDO
          </h2>

          <p
            className={`text-xl md:text-2xl text-ink-muted max-w-2xl mx-auto ${
              visible ? "animate-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            Una mirada a lo que hacemos con detalle y color.
          </p>
        </div>

        {/* Grid de tarjetas con masonry */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[180px] lg:auto-rows-[220px]">
          {items.map((item, i) => (
            <div
              key={i}
              className={`
                ${item.color} ${item.span}
                relative overflow-hidden rounded-3xl border-3 border-ink
                shadow-sticker hover:shadow-sticker-lg
                hover:-translate-y-2 hover:scale-[1.02]
                transition-all duration-300
                group cursor-pointer
                ${visible ? "animate-fade-up" : "opacity-0"}
              `}
              style={{
                animationDelay: `${0.3 + i * 0.08}s`,
                ["--drop-rotate" as string]: `${i % 2 === 0 ? -2 : 2}deg`,
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Efecto shimmer en hover */}
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-50 transition-opacity blur-sm" />

              {/* Badge de esquina */}
              <div
                className={`absolute top-3 right-3 w-3 h-3 rounded-full border border-ink ${
                  item.color === "bg-brand-red"
                    ? "bg-brand-yellow"
                    : item.color === "bg-brand-yellow"
                    ? "bg-brand-red"
                    : item.color === "bg-brand-green"
                    ? "bg-brand-blue"
                    : item.color === "bg-brand-blue"
                    ? "bg-brand-yellow"
                    : "bg-brand-red"
                } ${!reduceMotion && "animate-pulse-slow"}`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />

              {/* Icono centrado con animación */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className={`
                    mb-2 transition-all duration-300
                    ${hoveredIndex === i ? "scale-110" : "scale-100"}
                  `}
                >
                  {renderIcon(item, i)}
                </div>

                {/* Título */}
                <h3
                  className={`
                    font-display text-xl lg:text-2xl font-black text-ink
                    mb-1 transition-all duration-300
                    ${hoveredIndex === i ? "scale-105 text-ink" : ""}
                  `}
                >
                  {item.label}
                </h3>

                {/* Descripción pequeña */}
                <p
                  className={`
                    text-xs text-ink-muted font-semibold
                    opacity-0 group-hover:opacity-100
                    transition-all duration-300
                  `}
                >
                  {item.desc}
                </p>
              </div>

              {/* Efecto de "paper peel" en esquina inferior izquierda */}
              <div className="absolute bottom-0 left-0 w-10 h-10 overflow-hidden pointer-events-none">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full opacity-10"
                  fill="currentColor"
                  style={{ color: item.color.includes("red") ? "#FF2B32" : item.color.includes("yellow") ? "#FFD000" : item.color.includes("green") ? "#78D64b" : item.color.includes("blue") ? "#5274E8" : "#0A0A0A" }}
                >
                  <polygon points="0,100 0,0 100,100" />
                </svg>
              </div>

              {/* Brillo al hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Call to action decorativo */}
        <div
          className={`mt-16 text-center ${
            visible ? "animate-fade-up" : "opacity-0"
          }`}
          style={{ animationDelay: "0.5s" }}
        >
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
