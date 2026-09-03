"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook para detectar cuando un elemento entra en viewport.
 * Respeta prefers-reduced-motion.
 */
export function useScrollReveal(options?: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  reduceMotion?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduceMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mq.addEventListener?.("change", handler);
      return () => mq.removeEventListener?.("change", handler);
    }
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options?.once !== false) {
            observer.unobserve(element);
          }
        } else if (options?.once === false) {
          setIsVisible(false);
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? "0px 0px -60px 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin, options?.once, reduceMotion]);

  return { ref, isVisible, reduceMotion };
}

/**
 * Hook para efecto parallax suave basado en scroll.
 * Devuelve un desplazamiento en píxeles (-max..+max) según la posición del elemento en viewport.
 */
export function useParallax(strength = 30) {
  const ref = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
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
    const element = ref.current;
    if (!element) return;

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 cuando entra por abajo, 1 cuando sale por arriba, 0.5 en el centro
        const progress = 1 - (rect.top + rect.height / 2) / vh;
        const clamped = Math.max(-1, Math.min(1, progress));
        setOffset(clamped * strength);
        rafId = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [strength, reduceMotion]);

  return { ref, offset, reduceMotion };
}

/**
 * Hook para efecto "mouse tilt" sutil — las tarjetas siguen ligeramente al cursor.
 */
export function useMouseTilt(strength = 4) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState({ rx: 0, ry: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const onMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      setTransform({
        rx: -dy * strength,
        ry: dx * strength,
        tx: dx * strength * 0.8,
        ty: dy * strength * 0.8,
      });
    };

    const onLeave = () => {
      setTransform({ rx: 0, ry: 0, tx: 0, ty: 0 });
    };

    element.addEventListener("mousemove", onMove);
    element.addEventListener("mouseleave", onLeave);
    return () => {
      element.removeEventListener("mousemove", onMove);
      element.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return { ref, transform };
}
