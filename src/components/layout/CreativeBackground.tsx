"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// ============================================================
// CREATIVE BACKGROUND — Fondo "mesa de trabajo creativo".
// Elementos de papelería (notas adhesivas, stickers, clips,
// estrellas, corazones, lápices) que flotan con movimientos
// orgánicos y parallax sutil.
// Respeta prefers-reduced-motion.
// ============================================================

type ItemKind =
  | "note"
  | "sticker"
  | "star"
  | "heart"
  | "clip"
  | "pencil"
  | "leaf"
  | "tape"
  | "squiggle"
  | "triangle"
  | "circle";

interface FloatingItem {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
  size: number;
  rotation: number;
  floatDuration: number;
  delay: number;
  color: string;
  opacity: number;
  parallaxFactor: number;
  layer: number; // depth layer 0-2
}

// Colores de la marca Papelillo
const COLORS = [
  "#FF2B32", // red
  "#FFD000", // yellow
  "#78D64B", // green
  "#5274E8", // blue
  "#0A0A0A", // ink
];

const KINDS: ItemKind[] = [
  "note",
  "sticker",
  "star",
  "heart",
  "clip",
  "pencil",
  "leaf",
  "tape",
  "squiggle",
  "triangle",
  "circle",
];

const NOTES = ["✂️", "💡", "📚", "🎨", "🎁", "✨", "🌱", "⭐"];
const STICKERS = ["😊", "🎉", "⭐", "💖", "✨", "🎨", "📚", "🎈"];

function renderItem(kind: ItemKind, color: string, size: number) {
  const s = Math.max(size, 16);
  switch (kind) {
    case "note": {
      const text = NOTES[Math.floor(Math.random() * NOTES.length)];
      return (
        <div
          className="relative rounded-sm border-2 border-ink/30 shadow-paper-sm"
          style={{
            width: s,
            height: s * 1.2,
            backgroundColor: color,
            opacity: 0.45,
          }}
        >
          <div
            className="absolute -top-1 -left-1 w-2 h-2 rounded-full border border-ink/20"
            style={{ backgroundColor: color }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{ fontSize: s * 0.35 }}
          >
            {text}
          </span>
        </div>
      );
    }
    case "sticker": {
      const text = STICKERS[Math.floor(Math.random() * STICKERS.length)];
      return (
        <div
          className="rounded-full border-2 border-ink/30 shadow-paper-sm flex items-center justify-center"
          style={{
            width: s,
            height: s,
            backgroundColor: color,
            opacity: 0.5,
            fontSize: s * 0.45,
          }}
        >
          {text}
        </div>
      );
    }
    case "star":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <path
            d="M20 4l4.5 9 10 1.5-7.2 7 1.7 10L20 27l-9 4.5 1.7-10L5.5 14.5l10-1.5z"
            fill={color}
            opacity="0.6"
          />
        </svg>
      );
    case "heart":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <path
            d="M20 35c-1.5-1.5-13-10.5-13-16.5C7 11 10.5 7 15 7c2.5 0 4.5 1 5 3 .5-2 2.5-3 5-3 4.5 0 8 4 8 11.5 0 6-11.5 15-13 16.5z"
            fill={color}
            opacity="0.6"
          />
        </svg>
      );
    case "clip":
      return (
        <svg width={s} height={s * 1.8} viewBox="0 0 20 36">
          <path
            d="M6 4 L6 28 Q6 32 10 32 Q14 32 14 28 L14 10 Q14 6 10 6 Q8 6 8 8 L8 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      );
    case "pencil":
      return (
        <svg width={s * 2.2} height={s * 0.6} viewBox="0 0 88 24">
          <rect x="0" y="6" width="70" height="12" fill={color} opacity="0.7" />
          <polygon points="70,6 82,12 70,18" fill="#FFDBA8" />
          <polygon points="82,12 88,12 82,12" fill="#0A0A0A" />
          <rect x="0" y="6" width="8" height="12" fill="#0A0A0A" opacity="0.3" />
        </svg>
      );
    case "leaf":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <path
            d="M20 4 C 30 10, 34 20, 20 36 C 6 20, 10 10, 20 4 Z"
            fill={color}
            opacity="0.55"
          />
          <path d="M20 4 L20 36" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.25" />
        </svg>
      );
    case "tape":
      return (
        <svg width={s * 2} height={s * 0.5} viewBox="0 0 80 20">
          <rect x="2" y="4" width="76" height="12" fill={color} opacity="0.5" />
          <path
            d="M2 4 L6 4 M10 4 L14 4 M18 4 L22 4 M26 4 L30 4 M34 4 L38 4 M42 4 L46 4 M50 4 L54 4 M58 4 L62 4 M66 4 L70 4 M74 4 L78 4"
            stroke="#0A0A0A"
            strokeWidth="0.8"
            opacity="0.25"
          />
        </svg>
      );
    case "squiggle":
      return (
        <svg width={s * 2} height={s * 0.7} viewBox="0 0 80 24">
          <path
            d="M4 12 Q 20 2, 36 12 T 68 12"
            stroke={color}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      );
    case "triangle":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <path d="M20 6 L34 34 L6 34 Z" fill={color} opacity="0.5" />
        </svg>
      );
    case "circle":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="14" fill={color} opacity="0.55" />
        </svg>
      );
    default:
      return null;
  }
}

function generateItems(count: number): FloatingItem[] {
  const items: FloatingItem[] = [];
  for (let i = 0; i < count; i++) {
    const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
    items.push({
      id: i,
      kind,
      x: 2 + Math.random() * 96,
      y: 5 + Math.random() * 90,
      size: 16 + Math.random() * 32,
      rotation: Math.random() * 360,
      floatDuration: 15 + Math.random() * 20,
      delay: Math.random() * -25,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.35 + Math.random() * 0.25,
      parallaxFactor: 0.2 + Math.random() * 0.4,
      layer: Math.floor(Math.random() * 3),
    });
  }
  return items;
}

export function CreativeBackground() {
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Generamos los items una sola vez en cliente
  const items = useMemo(() => {
    if (typeof window === "undefined") return [];
    const isMobile = window.innerWidth < 768;
    return generateItems(isMobile ? 14 : 26);
  }, []);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setMouse({
        x: (e.clientX / w - 0.5) * 2,
        y: (e.clientY / h - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduceMotion]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Elementos flotantes de papelería con parallax de capa */}
      {items.map((item) => {
        // Parallax multi-capa: capas más profundas se mueven menos
        const layerMult = [0, 0.5, 1][item.layer] || 0;
        const mouseOffsetX = reduceMotion ? 0 : mouse.x * item.parallaxFactor * 25 * layerMult;
        const mouseOffsetY = reduceMotion ? 0 : mouse.y * item.parallaxFactor * 25 * layerMult;
        const scrollOffset = reduceMotion
          ? 0
          : -scrollY * item.parallaxFactor * 0.15 * (1 + layerMult * 0.5);

        return (
          <div
            key={item.id}
            className="absolute will-change-transform"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              opacity: item.opacity,
              transform: `translate(-50%, -50%) translate(${mouseOffsetX}px, ${
                scrollOffset + mouseOffsetY
              }px)`,
              transition: "transform 0.8s cubic-bezier(.2,.7,.2,1)",
              zIndex: item.layer,
            }}
          >
            <div
              className={reduceMotion ? "" : "animate-float-bob"}
              style={
                reduceMotion
                  ? { transform: `rotate(${item.rotation}deg)` }
                  : {
                      animationDuration: `${item.floatDuration}s`,
                      animationDelay: `${item.delay}s`,
                      ["--float-rotate" as string]: `${item.rotation}deg`,
                    }
              }
            >
              {renderItem(item.kind, item.color, item.size)}
            </div>
          </div>
        );
      })}

      {/* Acentos de luz difuminada anatómicos con pulse sutil */}
      {!reduceMotion && (
        <div
          className="fixed z-0 rounded-full opacity-10 blur-3xl pointer-events-none animate-pulse-slow"
          style={{
            width: "460px",
            height: "460px",
            background: "radial-gradient(circle, #FFD000 0%, transparent 60%)",
            top: "18%",
            right: "5%",
            animationDuration: "14s",
          }}
        />
      )}
      {!reduceMotion && (
        <div
          className="fixed z-0 rounded-full opacity-8 blur-3xl pointer-events-none animate-pulse-slow"
          style={{
            width: "360px",
            height: "360px",
            background: "radial-gradient(circle, #5274E8 0%, transparent 60%)",
            bottom: "22%",
            left: "5%",
            animationDuration: "17s",
            animationDelay: "1.5s",
          }}
        />
      )}
      {!reduceMotion && (
        <div
          className="fixed z-0 rounded-full opacity-6 blur-3xl pointer-events-none animate-pulse-slow"
          style={{
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, #FF2B32 0%, transparent 60%)",
            top: "58%",
            left: "38%",
            animationDuration: "20s",
            animationDelay: "3s",
          }}
        />
      )}
    </div>
  );
}
