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
import { useSiteSettings } from "@/hooks/useDataService";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { ShoppingCart, Menu, X, Sun, Moon } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { count, toggle } = useCart();
  const { resolved: theme, toggle: toggleTheme } = useTheme();
  // ✅ useSiteSettings (SSR-safe, fallback a siteConfig) — elimina getSiteSettingsSync/sessionStorage (root cause #306)
  const { settings, isLoading } = useSiteSettings();
  const branding =
    (settings?.branding ?? { logoSrc: siteConfig.logoSrc, logoDataUrl: null }) as {
      logoSrc: string;
      logoDataUrl: string | null;
    };
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
          // ✅ Mejora 1: fondo sutil siempre visible, backdrop-blur + sombra más fuerte al scroll
          scrolled
            ? "bg-paper/80 backdrop-blur-sm border-b border-ink/10 shadow-sm"
            : "bg-paper/40 border-b border-ink/5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-22">
            <Link href="/" className="flex items-center group">
              {/* ✅ Mejora 2: logo ocupa más altura relativa al header, aspect ratio preservado */}
              <div className="relative flex items-center justify-center w-32 sm:w-36 lg:w-auto">
                <img
                  src={logoSrc}
                  alt={siteConfig.logoAlt}
                  className="h-10 sm:h-12 lg:h-16 w-auto transition-transform group-hover:scale-105"
                  loading="eager"
                  fetchPriority="high"
                  style={{ maxWidth: "140px", maxHeight: "64px" }}
                />
              </div>
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-base font-medium lg:text-lg transition-all duration-200 hover:text-brand-red hover:transform hover:-translate-y-0.5",
                    // ✅ Mejora 3: subrayado animado en active + hover wiggling
                    pathname === item.href
                      ? "text-brand-red"
                      : "text-ink"
                  )}
                >
                  {item.label}
                  {pathname === item.href && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-red rounded-full animate-float-gentle" />
                  )}
                </Link>
              ))}
            </nav>
            {/* ✅ Mejora 4: chips con fondo circular al hover */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink hover:text-brand-green hover:bg-ink/5 rounded-full p-2 transition-all duration-200 hover:scale-110"
                aria-label="WhatsApp"
              >
                <SocialIcon icon="whatsapp" className="w-5 h-5" />
              </a>
              <button
                onClick={toggle}
                className="relative text-ink hover:text-brand-red hover:bg-ink/5 rounded-full p-2 transition-all duration-200 hover:scale-110"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-red text-paper text-xs font-bold rounded-full flex items-center justify-center w-6 h-6 min-w-[1.5rem] px-[2px]">
                    {count}
                  </span>
                )}
              </button>
            </div>

            <div className="flex lg:hidden items-center gap-3">
              <button
                onClick={toggleTheme}
                className="text-ink hover:text-brand-red hover:bg-ink/5 rounded-full p-2 transition-colors relative w-10 h-10 flex items-center justify-center"
                aria-label="Cambiar tema"
                title={theme === "dark" ? "Cambiar a claro" : "Cambiar a oscuro"}
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={toggle}
                className="relative text-ink hover:text-brand-red hover:bg-ink/5 rounded-full p-2 transition-colors"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-red text-paper text-xs font-bold rounded-full flex items-center justify-center w-6 h-6 min-w-[1.5rem] px-[2px]">
                    {count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-ink hover:text-brand-red hover:bg-ink/5 rounded-full p-2 transition-colors"
                aria-label="Menú"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                <SocialIcon icon="whatsapp" className="w-5 h-5" />
                WhatsApp
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
