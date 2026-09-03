"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { siteContent } from "@/data/site-content";

export function CTASection() {
  const { ctaFinal } = siteContent;
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
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

  return (
    <section
      ref={ref}
      className="relative py-24 lg:py-40 bg-ink text-paper overflow-hidden"
    >
      {/* Elementos decorativos animados */}
      {!reduceMotion && visible && (
        <>
          {/* Círculo rojo flotante */}
          <div
            className="absolute top-12 left-12 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-brand-red rounded-full opacity-5 animate-pulse-slow"
            style={{ animationDelay: "0.3s" }}
          />
          {/* Anillo azul giratorio */}
          <div
            className="absolute bottom-12 right-12 w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 border-4 border-brand-blue/20 rounded-full animate-spin-slow"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-brand-red rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-brand-yellow rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-brand-green rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-brand-yellow rounded-full" />
          </div>

          {/* Squiggles animados */}
          <svg
            className="absolute top-1/3 left-0 w-32 h-10 sm:w-40 sm:h-12 opacity-30 animate-wiggle-soft"
            viewBox="0 0 120 20"
            style={{ animationDelay: "0.6s" }}
            aria-hidden="true"
          >
            <path
              d="M5 12 Q 20 2, 35 12 T 65 12 T 95 12"
              stroke="#78D64B"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <svg
            className="absolute bottom-1/4 right-0 w-40 h-12 sm:w-52 sm:h-14 opacity-25 animate-wiggle-soft"
            viewBox="0 0 120 20"
            style={{ animationDelay: "0.8s" }}
            aria-hidden="true"
          >
            <path
              d="M5 12 Q 20 2, 35 12 T 65 12 T 95 12 T 115 12"
              stroke="#FFD000"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </>
      )}

      {/* Puntos decorativos animados */}
      {!reduceMotion && (
        <>
          <div className="absolute top-[20%] left-[25%] w-2 h-2 bg-brand-yellow rounded-full animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse-slow" style={{ animationDelay: "0.7s" }} />
          <div className="absolute bottom-[30%] left-[15%] w-2.5 h-2.5 bg-brand-green rounded-full animate-pulse-slow" style={{ animationDelay: "0.9s" }} />
          <div className="absolute top-[60%] left-[80%] w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse-slow" style={{ animationDelay: "1.1s" }} />
        </>
      )}

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge "Empecemos" */}
        <div
          className={`inline-flex items-center gap-2 bg-brand-red border-2 border-paper rounded-full px-6 py-2 mb-8 shadow-sticker ${
            visible ? "animate-scale-in" : "opacity-0"
          }`}
          style={{ animationDelay: "0.1s" }}
        >
          <svg className="w-4 h-4 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-paper">
            Empecemos
          </span>
        </div>

        {/* Título principal */}
        <h2
          className={`font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-paper leading-tight mb-6 ${
            visible ? "animate-fade-up" : "opacity-0"
          }`}
          style={{ animationDelay: "0.2s" }}
        >
          {ctaFinal.title}
        </h2>

        {/* Descripción */}
        <p
          className={`text-lg sm:text-xl md:text-2xl text-paper/80 mb-16 max-w-2xl mx-auto ${
            visible ? "animate-fade-up" : "opacity-0"
          }`}
          style={{ animationDelay: "0.3s" }}
        >
          {ctaFinal.description}
        </p>

        {/* Botones CTA */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${
            visible ? "animate-fade-up" : "opacity-0"
          }`}
          style={{ animationDelay: "0.4s" }}
        >
          <Button
            href={ctaFinal.ctaPrimary.href}
            variant="secondary"
            size="lg"
            className="group relative overflow-hidden bg-brand-yellow text-ink font-black border-3 border-paper hover:bg-paper hover:text-ink hover:scale-105 hover:shadow-sticker-lg transition-all duration-300"
          >
            <span className="flex items-center gap-3 relative z-10">
              {ctaFinal.ctaPrimary.label}
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
            {/* Efecto shimmer en botón */}
            <div className="absolute -inset-1 -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute -inset-8 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm animate-pulse-soft" />
            </div>
          </Button>
          <Button
            href={ctaFinal.ctaSecondary.href}
            variant="outline"
            size="lg"
            className="border-2 border-paper text-paper hover:bg-paper hover:text-ink hover:scale-105 hover:shadow-sticker-lg transition-all duration-300 font-black"
          >
            {ctaFinal.ctaSecondary.label}
          </Button>
        </div>

        {/* Dots animados en bottom */}
        <div
          className={`mt-16 flex items-center justify-center gap-3 ${
            visible ? "animate-fade-in" : "opacity-0"
          }`}
          style={{ animationDelay: "0.6s" }}
          aria-hidden="true"
        >
          <span
            className={`inline-block w-3 h-3 bg-brand-red rounded-full ${!reduceMotion && "animate-pulse-slow"}`}
            style={{ animationDelay: "0.1s" }}
          />
          <span
            className={`inline-block w-3 h-3 bg-brand-yellow rounded-full ${!reduceMotion && "animate-pulse-slow"}`}
            style={{ animationDelay: "0.3s" }}
          />
          <span
            className={`inline-block w-3 h-3 bg-brand-green rounded-full ${!reduceMotion && "animate-pulse-slow"}`}
            style={{ animationDelay: "0.5s" }}
          />
          <span
            className={`inline-block w-3 h-3 bg-brand-blue rounded-full ${!reduceMotion && "animate-pulse-slow"}`}
            style={{ animationDelay: "0.7s" }}
          />
          {!reduceMotion && (
            <svg
              className="w-5 h-5 text-brand-yellow animate-wiggle-soft"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 17.27L18.18 21l-3.71-8.02L22 11.5l-4.55-.39L12 3 7.55 7.42 2 11.5l7.53 6.47z" />
            </svg>
          )}
        </div>
      </div>
    </section>
  );
}
