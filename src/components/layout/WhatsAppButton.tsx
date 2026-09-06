"use client";

import React from "react";
import { siteConfig } from "@/lib/config";
import { useSiteSettings } from "@/hooks/useDataService";
import { SocialIcon } from "@/components/ui/SocialIcon";

export function WhatsAppButton() {
  const { data: settings, isLoading } = useSiteSettings();
  const whatsappLink = settings?.socialLinks?.find((l: any) => l.icon === "whatsapp" && (l.isActive ?? true)) ?? null;
  const href = whatsappLink?.url ?? `https://wa.me/${siteConfig.whatsappNumber}`;
  const isConfigured = !isLoading && !!whatsappLink?.url;
  // Fallback: si admin no configuró WhatsApp, usa number estático de config
  const fallbackHref = `https://wa.me/${siteConfig.whatsappNumber}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-brand-green text-ink rounded-full w-14 h-14 flex items-center justify-center shadow-sticker-lg hover:shadow-sticker hover:-translate-y-1 transition-all duration-300 group"
      aria-label={isConfigured ? "Contactar por WhatsApp" : "Configurar WhatsApp en src/lib/config.ts"}
    >
      <SocialIcon icon="whatsapp" ariaLabel="Contactar por WhatsApp" />
      {!isConfigured && (
        <span className="absolute -top-1 -right-1 bg-brand-red text-paper text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
          !
        </span>
      )}
    </a>
  );
}
