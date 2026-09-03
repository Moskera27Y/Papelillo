"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { siteContent } from "@/data/site-content";
import { useMouseTilt } from "@/hooks/useScrollReveal";

// ============================================================
// PAPELILLO — HERO ANIMADO
// Composición editorial con tarjetas flotantes, doodles
// orgánicos y micro-interacciones inspiradas en papel/stickers.
// ============================================================

export function Hero() {
  const { hero } = siteContent;
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: tiltRef, transform: tilt } = useMouseTilt(3);

  // Seguimiento del cursor para efectos parallax sutiles sobre los elementos flotantes
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduceMotion(mq.matches);
      const h = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mq.addEventListener?.("change", h);
      return () => mq.removeEventListener?.("change", h);
    }
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setCursor({ x: px, y: py });
    };
    const el = containerRef.current;
    el?.addEventListener("mousemove", onMove);
    return () => el?.removeEventListener("mousemove", onMove);
  }, [reduceMotion]);

  const p = (mult: number) => ({
    transform: reduceMotion
      ? undefined
      : `translate(${cursor.x * mult}px, ${cursor.y * mult}px)`,
    transition: "transform 0.6s cubic-bezier(.2,.7,.2,1)",
  });

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-transparent pt-14 pb-20 lg:pt-24 lg:pb-32 paper-texture"
    >
      {/* ============================================ */}
      {/*  DOODLES DE FONDO (aparecen al montar)       */}
      {/* ============================================ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Círculo grande amarillo con brillo */}
        <div
          className={`absolute -top-10 -left-10 w-44 h-44 bg-brand-yellow rounded-full opacity-25 blur-sm ${mounted ? "animate-scale-in" : "opacity-0"}`}
          style={{ animationDelay: "0.4s" }}
        />
        {/* Anillo azul giratorio */}
        <div
          className={`absolute top-20 right-12 w-52 h-52 border-3 border-brand-blue/30 rounded-full ${mounted ? "animate-spin-slow" : "opacity-0"}`}
          style={{ animationDelay: "0.5s" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-brand-blue rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-brand-red rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-brand-green rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-brand-yellow rounded-full" />
        </div>
        {/* Círculo verde */}
        <div
          className={`absolute bottom-20 -right-8 w-36 h-36 bg-brand-green rounded-full opacity-20 blur-sm ${mounted ? "animate-scale-in" : "opacity-0"}`}
          style={{ animationDelay: "0.6s" }}
        />

        {/* Estrellas animadas con brillo intermitente */}
        <svg
          className={`absolute top-28 left-[8%] opacity-0 ${mounted ? "animate-drop-in" : ""} ${!reduceMotion && "animate-float-gentle"}`}
          style={{
            animationDelay: "0.8s",
            ["--drop-rotate" as string]: "-15deg",
            ...p(12),
          }}
          width="36"
          height="36"
          viewBox="0 0 40 40"
        >
          <path
            d="M20 4l4.5 9 10 1.5-7.2 7 1.7 10L20 27l-9 4.5 1.7-10L5.5 14.5l10-1.5z"
            fill="#FFD000"
            stroke="#0A0A0A"
            strokeWidth="2"
            className={!reduceMotion && "animate-pulse-soft"}
          />
        </svg>

        {/* Corazón con latido */}
        <svg
          className={`absolute top-40 right-[12%] opacity-0 ${mounted ? "animate-drop-in" : ""} ${!reduceMotion && "animate-float-paper"}`}
          style={{
            animationDelay: "1s",
            ["--drop-rotate" as string]: "12deg",
            ["--paper-rotate" as string]: "12deg",
            ...p(-10),
          }}
          width="36"
          height="36"
          viewBox="0 0 40 40"
        >
          <path
            d="M20 35c-1.5-1.5-13-10.5-13-16.5C7 11 10.5 7 15 7c2.5 0 4.5 1 5 3 .5-2 2.5-3 5-3 4.5 0 8 4 8 11.5 0 6-11.5 15-13 16.5z"
            fill="#FF2B32"
            stroke="#0A0A0A"
            strokeWidth="2"
            className={!reduceMotion && "animate-pulse-soft"}
          />
        </svg>

        {/* Squiggle decorativo con draw-line */}
        <svg
          className={`absolute bottom-32 left-[15%] opacity-0 ${mounted ? "animate-fade-in" : ""} ${!reduceMotion && "animate-wiggle-soft"}`}
          style={{ animationDelay: "1.2s", ...p(8) }}
          width="80"
          height="24"
          viewBox="0 0 80 24"
        >
          <path
            d="M4 12 Q 20 2, 36 12 T 68 12"
            stroke="#5274E8"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="200"
            className={mounted && !reduceMotion ? "animate-draw-line" : ""}
          />
        </svg>

        {/* Triángulo */}
        <svg
          className={`absolute bottom-40 right-[18%] opacity-0 ${mounted ? "animate-drop-in" : ""} ${!reduceMotion && "animate-float-slower"}`}
          style={{
            animationDelay: "1.1s",
            ["--drop-rotate" as string]: "20deg",
            ...p(-14),
          }}
          width="32"
          height="32"
          viewBox="0 0 40 40"
        >
          <path d="M20 5 L35 35 L5 35 Z" fill="#78D64B" stroke="#0A0A0A" strokeWidth="2" />
        </svg>

        {/* Puntos decorativos animados */}
        <svg
          className={`absolute top-1/2 left-[40%] opacity-0 ${mounted ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "1.3s", ...p(5) }}
          width="20"
          height="20"
        >
          <circle cx="10" cy="10" r="3" fill="#0A0A0A" opacity="0.2" />
        </svg>

        {/* Hoja de papel pequeña */}
        <svg
          className={`absolute top-1/3 right-[40%] opacity-0 ${mounted ? "animate-sticker-peel" : ""} ${!reduceMotion && "animate-float-gentle"}`}
          style={{
            animationDelay: "1.4s",
            ["--drop-rotate" as string]: "-8deg",
            ...p(10),
          }}
          width="44"
          height="52"
          viewBox="0 0 40 48"
        >
          <rect x="4" y="4" width="32" height="40" rx="3" fill="#FFFDF9" stroke="#0A0A0A" strokeWidth="2" />
          <line x1="10" y1="14" x2="30" y2="14" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.4" />
          <line x1="10" y1="22" x2="26" y2="22" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.4" />
          <line x1="10" y1="30" x2="28" y2="30" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.4" />
        </svg>

        {/* Nuevos elementos: clips de papel pequeños */}
        <svg
          className={`absolute top-[15%] left-[30%] opacity-0 ${mounted ? "animate-drop-in" : ""} ${!reduceMotion && "animate-float-gentle"}`}
          style={{ animationDelay: "1.5s", ...p(7) }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            d="M14 3.41L12.59 2 8 6.59 8 10H12V14H8L3.41 18.59 2 17.17 6.59 12 2 7.41 3.41 6 8 10.59 8 14H4L2 15.41 3.41 17 8 12.59 12.59 17 14 15.59 12.59 14 14 14V10H12.59L12 9.41 10 11.41 8 9.41 8 6.59 9.41 5.17 10 5.83 5.41 10.41 6.83 11.83 8 10.59 10.59 8 12 6.59 10 5.41 8.59 4 7.17 9.41 3.59 10 5 12 3.41z"
            fill="#0A0A0A"
            opacity="0.15"
          />
        </svg>

        {/* Nube de pensamiento pequeña */}
       <svg
          className={`absolute bottom-[55%] left-[20%] opacity-0 ${mounted ? "animate-fade-in" : ""} ${!reduceMotion && "animate-float-gentle"}`}
          style={{ animationDelay: "1.6s", ...p(9) }}
          width="28"
          height="28"
          viewBox="0 0 40 40"
        >
          <ellipse cx="20" cy="20" rx="10" ry="6" fill="#fff" stroke="#0A0A0A" strokeWidth="2" opacity="0.8" />
          <ellipse cx="14" cy="21" rx="5" ry="3" fill="#fff" opacity="0.6" />
          <ellipse cx="26" cy="21" rx="5" ry="3" fill="#fff" opacity="0.6" />
        </svg>

        {/* Pequeña línea ondulada decorativa */}
        <svg
          className={`absolute bottom-[15%] right-[35%] opacity-0 ${mounted ? "animate-fade-in" : ""} ${!reduceMotion && "animate-draw-line"}`}
          style={{ animationDelay: "1.3s" }}
          width="80"
          height="20"
          viewBox="0 0 100 20"
        >
          <path
            d="M5 12 Q 20 2, 35 12 T 65 12 T 95 12"
            stroke="#FF2B32"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ============================================ */}
          {/*  TEXTO (staggered reveal)                    */}
          {/* ============================================ */}
          <div className="text-center lg:text-left relative z-10">
            {/* Eyebrow label */}
            <div
              className={`inline-flex items-center gap-2 bg-brand-yellow border-2 border-ink rounded-full px-4 py-1.5 shadow-sticker-sm mb-6 ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.1s" }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-ink">
                Hecho con creatividad
              </span>
            </div>

            {/* Título */}
            <h1
              className={`font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-ink leading-[1.05] mb-6 ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.25s" }}
            >
              {splitTitle(hero.title)}
            </h1>

            {/* Descripción */}
            <p
              className={`text-base md:text-lg text-ink-muted mb-8 max-w-md mx-auto lg:mx-0 ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.4s" }}
            >
              {hero.description}
            </p>

            {/* Botones */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.55s" }}
            >
              <Button href={hero.ctaPrimary.href} variant="primary" size="lg">
                <span className="flex items-center gap-2">
                  {hero.ctaPrimary.label}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Button>
              <Button href={hero.ctaSecondary.href} variant="outline" size="lg">
                {hero.ctaSecondary.label}
              </Button>
            </div>

            {/* Mini stats / confianza */}
            <div
              className={`mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start ${
                mounted ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.7s" }}
            >
              <div className="flex items-center gap-2 text-sm">
                <div className="flex -space-x-1">
                  <span className="w-2 h-2 bg-brand-red rounded-full" />
                  <span className="w-2 h-2 bg-brand-yellow rounded-full" />
                  <span className="w-2 h-2 bg-brand-green rounded-full" />
                  <span className="w-2 h-2 bg-brand-blue rounded-full" />
                </div>
                <span className="text-ink-muted font-semibold">12 productos únicos</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-ink/20" />
              <p className="text-sm text-ink-muted font-semibold">
                <span className="text-brand-green">✓</span> Personalizables
              </p>
            </div>
          </div>

          {/* ============================================ */}
          {/*  COMPOSICIÓN VISUAL (tarjetas + centro)      */}
          {/* ============================================ */}
          <div
            ref={tiltRef}
            className="relative h-[360px] sm:h-[420px] lg:h-[540px] flex items-center justify-center"
            style={{
              perspective: "1200px",
              transform: reduceMotion
                ? undefined
                : `rotateX(${tilt.rx * 0.3}deg) rotateY(${tilt.ry * 0.3}deg)`,
              transition: "transform 0.4s cubic-bezier(.2,.7,.2,1)",
            }}
          >
            {/* Tarjetas flotantes tipo sticker */}
            <FloatingCard
              delay={0.3}
              mounted={mounted}
              color="bg-brand-yellow"
              emoji="📚"
              label="Libros"
              position="top-[3%] left-[2%] sm:top-[5%] sm:left-[5%] lg:top-[8%] lg:left-[8%]"
              size="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32"
              rotation="-rotate-6"
              floatClass="animate-float-gentle"
              parallaxMult={12}
              cursor={cursor}
              reduceMotion={reduceMotion}
            />

            <FloatingCard
              delay={0.45}
              mounted={mounted}
              color="bg-brand-red"
              emoji="🎨"
              label="Color"
              position="top-[14%] right-[4%] sm:top-[15%] sm:right-[8%] lg:top-[15%] lg:right-[10%]"
              size="w-18 h-18 sm:w-20 sm:h-20 lg:w-28 lg:h-28"
              rotation="rotate-12"
              floatClass="animate-float-paper"
              parallaxMult={-12}
              cursor={cursor}
              reduceMotion={reduceMotion}
            />

            <FloatingCard
              delay={0.6}
              mounted={mounted}
              color="bg-brand-green"
              emoji="✨"
              label="Ideas"
              position="bottom-[14%] left-[4%] sm:bottom-[16%] sm:left-[6%] lg:bottom-[20%] lg:left-[12%]"
              size="w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36"
              rotation="rotate-3"
              floatClass="animate-float-gentle"
              parallaxMult={10}
              cursor={cursor}
              reduceMotion={reduceMotion}
            />

            <FloatingCard
              delay={0.75}
              mounted={mounted}
              color="bg-brand-blue"
              emoji="🎁"
              label="Regalos"
              position="bottom-[4%] right-[2%] sm:bottom-[6%] sm:right-[4%] lg:bottom-[10%] lg:right-[10%]"
              size="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32"
              rotation="-rotate-12"
              floatClass="animate-float-slower"
              parallaxMult={-14}
              cursor={cursor}
              reduceMotion={reduceMotion}
            />
            
            {/* Tarjetas pequeñas tipo sticker decorativo */}
            <StickerTag
              mounted={mounted}
              delay={1.0}
              text="✂️ Cortado a mano"
              position="top-[45%] left-[1%] lg:left-[0%]"
              rotation="-rotate-8"
              color="bg-paper"
              cursor={cursor}
              reduceMotion={reduceMotion}
            />
            <StickerTag
              mounted={mounted}
              delay={1.15}
              text="💛 Hecho con amor"
              position="top-[35%] right-[1%] sm:right-[2%] lg:right-[-2%]"
              rotation="rotate-6"
              color="bg-brand-yellow"
              cursor={cursor}
              reduceMotion={reduceMotion}
            />

            {/* Círculo central de PAPELILLO con brillo interactivo */}
            <div
              className={`relative z-10 w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-paper rounded-full border-3 border-ink shadow-sticker-lg flex items-center justify-center ${
                mounted ? "animate-scale-in" : "opacity-0"
              } ${!reduceMotion && "animate-float-paper"}`}
              style={{
                animationDelay: "0.2s",
                ["--paper-rotate" as string]: "0deg",
                transform: reduceMotion
                  ? undefined
                  : `translate(${cursor.x * -5}px, ${cursor.y * -5}px)`,
                transition: "transform 0.6s cubic-bezier(.2,.7,.2,1)",
              }}
            >
              {/* Brillo intermitente sobre el círculo */}
              <div
                className={`absolute -inset-1 rounded-full opacity-0 ${!reduceMotion && "animate-pulse-soft"}`}
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,208,0,0.3) 0%, transparent 70%)",
                  animationDelay: "0.3s",
                }}
              />
              <div className="relative text-center">
                <p className="font-display text-xl lg:text-2xl font-black text-ink mb-1 drop-shadow-sm">
                  PAPELILLO
                </p>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="w-1.5 h-0.5 bg-brand-red rounded-full animate-pulse-slow" style={{ animationDelay: "0.1s" }} />
                  <span className="w-1.5 h-0.5 bg-brand-yellow rounded-full animate-pulse-slow" style={{ animationDelay: "0.3s" }} />
                  <span className="w-1.5 h-0.5 bg-brand-green rounded-full animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
                  <span className="w-1.5 h-0.5 bg-brand-blue rounded-full animate-pulse-slow" style={{ animationDelay: "0.7s" }} />
                </div>
                <p className="text-[8px] sm:text-[10px] lg:text-xs text-ink-muted font-semibold tracking-wider">Papelería creativa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/*  MARQUEE ANIMADO                             */}
      {/* ============================================ */}
      <div
        className={`mt-16 py-4 overflow-hidden bg-ink text-paper relative ${
          mounted ? "animate-fade-in" : "opacity-0"
        }`}
        style={{ animationDelay: "0.9s" }}
        aria-hidden="true"
      >
        {/* Partículas de fondo en el marquee */}
        {!reduceMotion && (
          <>
            <div className="absolute top-0 left-[10%] w-1.5 h-1.5 bg-brand-yellow rounded-full animate-pulse-slow" style={{ animationDelay: "0.2s" }} />
            <div className="absolute bottom-0 right-[15%] w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
            <div className="absolute top-0 right-[30%] w-1 h-1 bg-brand-green rounded-full animate-pulse-slow" style={{ animationDelay: "0.8s" }} />
          </>
        )}
        <div className={`flex whitespace-nowrap ${!reduceMotion && "animate-marquee"} relative z-10`}>
          {[...hero.marqueeWords, ...hero.marqueeWords].map((word, i) => (
            <span key={i} className="mx-4 sm:mx-8 font-display text-sm sm:text-lg font-bold flex items-center gap-4 sm:gap-6">
              {word}
              <span className="inline-block w-2 h-2 bg-brand-yellow rounded-full animate-pulse-slow" style={{ animationDelay: `${0.1 + i * 0.2}s` }} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function splitTitle(title: string) {
  // Destaca ciertas palabras con el color rojo de la marca
  const highlightWords = ["IDEAS", "ESPECIALES", "MOMENTOS"];
  const words = title.split(" ");
  return (
    <>
      {words.map((word, i) => {
        const clean = word.replace(/[.,!?]/g, "").toUpperCase();
        const isHighlight = highlightWords.includes(clean);
        return (
          <span key={i}>
            {isHighlight ? (
              <span className="relative inline-block">
                <span className="relative z-10">{word}</span>
                <svg
                  className="absolute left-0 bottom-1 w-full h-3 pointer-events-none"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8 Q 25 2, 50 7 T 98 6"
                    stroke="#FF2B32"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </span>
            ) : (
              word
            )}
            {i < words.length - 1 && " "}
          </span>
        );
      })}
    </>
  );
}

interface FloatingCardProps {
  delay: number;
  mounted: boolean;
  color: string;
  emoji: string;
  label: string;
  position: string;
  size: string;
  rotation: string;
  floatClass: string;
  parallaxMult: number;
  cursor: { x: number; y: number };
  reduceMotion: boolean;
}

function FloatingCard({
  delay,
  mounted,
  color,
  emoji,
  label,
  position,
  size,
  rotation,
  floatClass,
  parallaxMult,
  cursor,
  reduceMotion,
}: FloatingCardProps) {
  return (
    <div
      className={`absolute ${position} ${size} ${color} rounded-3xl border-2 border-ink shadow-sticker flex flex-col items-center justify-center gap-1 ${rotation} sticker-hover ${
        mounted ? "animate-drop-in" : "opacity-0"
      } ${!reduceMotion && floatClass}`}
      style={{
        animationDelay: `${delay}s`,
        ["--drop-rotate" as string]: rotation.replace("rotate-", "").replace("rotate", "0deg"),
        transform: reduceMotion
          ? undefined
          : `translate(${cursor.x * parallaxMult}px, ${cursor.y * parallaxMult}px) ${rotation.replace("rotate-", "rotate(-").replace("rotate", "rotate(")
              ? (rotation.includes("-") ? rotation.replace("rotate-", "rotate(-") + ")" : rotation + ")")
              : "rotate(0deg)"}`,
        transition: "transform 0.8s cubic-bezier(.2,.7,.2,1)",
      }}
    >
      <span className="text-3xl sm:text-4xl lg:text-5xl lg:group-hover:translate-x-1 transition-transform duration-300 group-hover:scale-105">{emoji}</span>
      <span className="font-display text-xs sm:text-sm lg:text-base font-black text-ink drop-shadow-sm">{label}</span>
    </div>
  );
}

interface StickerTagProps {
  mounted: boolean;
  delay: number;
  text: string;
  position: string;
  rotation: string;
  color: string;
  cursor: { x: number; y: number };
  reduceMotion: boolean;
}

function StickerTag({ mounted, delay, text, position, rotation, color, cursor, reduceMotion }: StickerTagProps) {
  return (
    <div
      className={`absolute ${position} ${color} border-2 border-ink rounded-full px-4 py-1.5 shadow-sticker-sm ${rotation} ${
        mounted ? "animate-sticker-peel" : "opacity-0"
      } ${!reduceMotion && "animate-float-slow"}`}
      style={{
        animationDelay: `${delay}s`,
        ["--drop-rotate" as string]: rotation.replace("rotate-", "").replace("rotate", "0deg"),
        transform: reduceMotion
          ? undefined
          : `translate(${cursor.x * 8}px, ${cursor.y * 8}px)`,
        transition: "transform 0.8s cubic-bezier(.2,.7,.2,1)",
      }}
    >
      <span className="text-xs font-bold text-ink whitespace-nowrap">{text}</span>
    </div>
  );
}
