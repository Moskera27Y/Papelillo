"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useDataService";
import { getRequestStatsAction } from "@/app/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/products", label: "Productos", icon: "products" },
  { href: "/admin/categories", label: "Categorías", icon: "categories" },
  { href: "/admin/orders", label: "Pedidos", icon: "orders" },
  { href: "/admin/requests", label: "Solicitudes", icon: "requests" },
  { href: "/admin/messages", label: "Mensajes", icon: "messages" },
  { href: "/admin/home", label: "Home", icon: "home" },
  { href: "/admin/about", label: "Nosotros", icon: "about" },
  { href: "/admin/contact", label: "Contacto", icon: "contact" },
  { href: "/admin/social", label: "Redes sociales", icon: "social" },
  { href: "/admin/settings", label: "Configuración", icon: "settings" },
] as const;

function NavIcon({ name }: { name: string }) {
  const common = "w-5 h-5";
  switch (name) {
    case "dashboard":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "products":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "categories":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      );
    case "orders":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    case "requests":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case "messages":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      );
    case "home":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      );
    case "about":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      );
    case "contact":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "social":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case "settings":
      return (
        <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, session } = useAuth();
  const [requestStats, setRequestStats] = useState<any>({ total: 0, new: 0, review: 0 });

  useEffect(() => {
    getRequestStatsAction()
      .then((s) => setRequestStats(s ?? { total: 0, new: 0, review: 0 }))
      .catch(() => {});
  }, []);

  const newCount = (requestStats?.new ?? 0) + (requestStats?.review ?? 0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const content = (
    <aside className="w-full lg:w-72 bg-paper border-r-2 border-ink/10 flex flex-col min-h-screen">
      <div className="p-6 border-b-2 border-ink/10">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center shadow-sticker-sm">
            <span className="font-display font-bold text-paper">P</span>
          </div>
          <div>
            <p className="font-display font-bold text-ink">PAPELILLO</p>
            <p className="text-xs text-ink-muted">Panel admin</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map((item) => {
          const active = isActive(item.href, (item as { exact?: boolean }).exact);
          const showBadge = item.href === "/admin/requests" && newCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all",
                active
                  ? "bg-ink text-paper shadow-sticker-sm"
                  : "text-ink hover:bg-paper-soft"
              )}
            >
              <NavIcon name={item.icon} />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="bg-brand-red text-paper text-xs font-bold rounded-full px-2 py-0.5">
                  {newCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t-2 border-ink/10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Ver sitio público
        </Link>
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs">
            <p className="font-semibold text-ink">{session?.username}</p>
            <p className="text-ink-muted">Admin</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.replace("/admin/login");
            }}
            className="text-xs bg-paper-soft hover:bg-paper-cream border-2 border-ink/10 rounded-full px-3 py-1 font-semibold"
          >
            Salir
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden sticky top-0 z-40 bg-paper border-b-2 border-ink/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center">
            <span className="font-display font-bold text-paper text-sm">P</span>
          </div>
          <span className="font-display font-bold">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="bg-ink text-paper rounded-full px-4 py-2 text-sm font-bold"
        >
          {mobileOpen ? "Cerrar" : "Menú"}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[56px] z-30 bg-paper border-b-2 border-ink/10 max-h-[80vh] overflow-y-auto">
          {content}
        </div>
      )}

      <div className="hidden lg:block">{content}</div>
    </>
  );
}
