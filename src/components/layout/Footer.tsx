"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { siteContent } from "@/data/site-content";
import { useSiteSettings } from "@/hooks/useDataService";
import { SocialIcon } from "@/components/ui/SocialIcon";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings, isLoading } = useSiteSettings();

  return (
    <footer className="bg-ink text-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <img
                src={siteConfig.logoSrc}
                alt={siteConfig.logoAlt}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-paper/80 text-sm max-w-md mb-6">
              {siteContent.footerDescription}
            </p>
            <div className="flex gap-4">
              {SocialLinksList({ settings, isLoading })}
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-paper/70 hover:text-paper transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-paper/70 hover:text-paper transition-colors">
                  Tienda
                </Link>
              </li>
              <li>
                <Link href="/personalizados" className="text-paper/70 hover:text-paper transition-colors">
                  Personalizados
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-paper/70 hover:text-paper transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-paper/70 hover:text-paper transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={siteConfig.legal.faq} className="text-paper/70 hover:text-paper transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href={siteConfig.legal.shipping} className="text-paper/70 hover:text-paper transition-colors">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href={siteConfig.legal.returns} className="text-paper/70 hover:text-paper transition-colors">
                  Cambios y devoluciones
                </Link>
              </li>
              <li>
                <Link href={siteConfig.legal.terms} className="text-paper/70 hover:text-paper transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href={siteConfig.legal.privacy} className="text-paper/70 hover:text-paper transition-colors">
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-paper/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm md:text-base text-paper/70">
          <p>© {currentYear} Papelillo. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <p>Hecho con detalle y color en Colombia.</p>
            <Link
              href="/admin"
              className="text-paper/40 hover:text-paper/70 transition-colors text-xs"
              title="Panel administrativo"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ✅ Dynamic social links con fallback a siteConfig estático (rule: data-driven + fallback, no hardcode)
function SocialLinksList({ settings, isLoading }: { settings: any; isLoading: boolean }) {
  const activeLinks = settings?.socialLinks?.filter((l: any) => l.isActive ?? true).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) ?? [];

  // Fallback a valores estáticos si admin no configuró nada o carga
  if (isLoading || activeLinks.length === 0) {
    const staticLinks = [{ icon: "instagram", url: siteConfig.instagramUrl }, { icon: "facebook", url: siteConfig.facebookUrl }, { icon: "whatsapp", url: `https://wa.me/${siteConfig.whatsappNumber}` }].filter(l => l.url);
    return staticLinks.map(l => (
      <a key={l.icon} href={l.url} target="_blank" rel="noopener noreferrer" className="text-paper/70 hover:text-paper transition-colors" aria-label={l.icon}>
        <SocialIcon icon={l.icon} />
      </a>
    ));
  }

  return activeLinks.map((link: any) => (
    <a key={link.id ?? link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="text-paper/70 hover:text-paper transition-colors" aria-label={link.name}>
      <SocialIcon icon={link.icon} />
    </a>
  ));
}
