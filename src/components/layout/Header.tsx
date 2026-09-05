"use client";
// =============================================================
// Header — Isomorphic (SSR-safe) + client interactivity
// Pattern: React hydration safety (useSafeLocalStorage for theme)
// =============================================================
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/hooks/useTheme";
import { siteConfig, buildWhatsAppLink } from "@/lib/config";
import { cn } from "@/lib/utils";

// SSR-safe initial settings — avoids hydration mismatch between
// server render (isLoading=true, fallback logo) and client (loaded logo)
import { getSiteSettingsSync } from "@/services/db/site.service";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { count, toggle } = useCart();
  const { resolved: theme, toggle: toggleTheme } = useTheme();

  // Initial settings from sync fallback — isomorphic render safety
  const initialSettings = getSiteSettingsSync();
  const branding =
    (initialSettings?.branding ?? { logoSrc: siteConfig.logoSrc, logoDataUrl: null }) as {
      logoSrc: string;
      logoDataUrl: string | null;
    };
  // logoDataUrl from DB takes precedence; falls back to logoSrc → config
  const logoSrc = branding.logoDataUrl || branding.logoSrc || siteConfig.logoSrc;

  const navItems = [
    { label: "Inicio", href: "/" },
    { label: "Tienda", href: "/shop" },
    { label: "Personalizados", href: "/personalizados" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
  ];

  // Efecto de scroll: cambia el header al hacer scroll
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-paper/80 backdrop-blur-sm border-b border-ink/10 shadow-sm"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-22">
            <Link href="/" className="flex items-center group">
              <div className="relative flex items-center justify-center w-32 sm:w-36 lg:w-auto">
                <img
                  src={logoSrc}
                  alt={siteConfig.logoAlt}
                  className="h-10 sm:h-12 lg:h-16 w-auto transition-transform group-hover:scale-105"
                  loading="eager"
                  fetchPriority="high"
                  style={{ maxWidth: "120px", maxHeight: "64px" }}
                />
              </div>
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-base font-medium lg:text-lg transition-all duration-200 hover:text-brand-red hover:transform hover:-translate-y-0.5",
                    pathname === item.href
                      ? "text-brand-red"
                      : "text-ink"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="hidden lg:flex items-center gap-4">
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink hover:text-brand-green transition-all duration-200 hover:scale-110"
                aria-label="WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 3C6.7 3 2.4 6.8 1.2 11.6c0 .3.1.6.1 1H3.5c.1 0 .1-.1 0-.1-.2-.1-.3-.3-.4-.5C1 11.9 1 11.3 1 11 1 6.6 4.6 3 9 3h2.5c.3 0 .6.1.8.3.2.2.2.5.2.8v1.3c0 .3-.1.6-.3.7-.2.1-.4.2-.7.2h-2c-.3 0-.5-.2-.5-.5v-2c0-.3.2-.6.5-.7.2-.1.5-.1.7-.1h4c.8 0 1.5.7 1.5 1.5v6.9c0 .3-.1.6-.3.8-.2.1-.5.2-.7.2h-1c-.4 0-.7.3-.7.7 0 .8.7 1.5 1.5 1.5h2c.6 0 1 .5 1 1.1 0 .3-.1.6-.3.8-.2.2-.4.3-.7.4C21.7 18.4 24 15 24 11 24 6.6 21.3 3 18.5 3H17c-.3 0-.6-.1-.8-.3-.2-.2-.2-.5-.2-.8z" />
                </svg>
              </a>
                onClick={toggle}
                className="relative text-ink hover:text-brand-red transition-all duration-200 hover:scale-110"
                aria-label="Carrito"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-red text-paper text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            </div>

            <div className="flex lg:hidden items-center gap-3">
              <button
                onClick={toggleTheme}
                className="text-ink hover:text-brand-red transition-colors relative w-10 h-10 flex items-center justify-center"
                aria-label="Cambiar tema"
                title={theme === "dark" ? "Cambiar a claro" : "Cambiar a oscuro"}
              >
                {theme === "dark" ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m8.66-10.66h-1.32M5.64 12H4.32m1.62-7.02l.94.94M6.2 17.8l-.94.94m12.78 0l-.94-.94M6.2 6.2l-.94.94" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c.132 0 .264.011.393.034a1 1 0 0 1 .806 1.722c-.336-.254-.695-.439-1.077-.53.845-.227 1.762-.326 2.677-.326.915 0 1.832.099 2.677.326-.382.091-.74.276-1.077.53a1 1 0 0 1-.806-1.722A9.03 9.03 0 0 1 12 3z" /></svg>
                )}
              </button>
              <button
                onClick={toggle}
                className="relative text-ink hover:text-brand-red transition-colors"
                aria-label="Carrito"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-red text-paper text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-ink hover:text-brand-red transition-colors"
                aria-label="Menú"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-ink/10 bg-paper/95 backdrop-blur-sm">
            <nav className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block text-lg font-semibold transition-colors hover:text-brand-red",
                    pathname === item.href ? "text-brand-red" : "text-ink"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-lg font-semibold text-brand-green"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 3C6.7 3 2.4 6.8 1.2 11.6c0 .3.1.6.1 1H3.5c.1 0 .1-.1 0-.1-.2-.1-.3-.3-.4-.5C1 11.9 1 11.3 1 11 1 6.6 4.6 3 9 3h2.5c.3 0 .6.1.8.3.2.2.2.5.2.8v1.3c0 .3-.1.6-.3.7-.2.1-.4.2-.7.2h-2c-.3 0-.5-.2-.5-.5v-2c0-.3.2-.6.5-.7.2-.1.5-.1.7-.1h4c.8 0 1.5.7 1.5 1.5v6.9c0 .3-.1.6-.3.8-.2.1-.5.2-.7.2h-1c-.4 0-.7.3-.7.7 0 .8.7 1.5 1.5 1.5h2c.6 0 1 .5 1 1.1 0 .3-.1.6-.3.8-.2.2-.4.3-.7.4C21.7 18.4 24 15 24 11 24 6.6 21.3 3 18.5 3H17c-.3 0-.6-.1-.8-.3-.2-.2-.2-.5-.2-.8z" />
                </svg>
                WhatsApp
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
