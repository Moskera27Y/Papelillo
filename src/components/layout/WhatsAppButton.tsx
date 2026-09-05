"use client";

import React from "react";
import { buildWhatsAppLink, siteConfig } from "@/lib/config";

export function WhatsAppButton() {
  const href = buildWhatsAppLink();
  const isConfigured = siteConfig.whatsappNumber !== "";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-brand-green text-ink rounded-full w-14 h-14 flex items-center justify-center shadow-sticker-lg hover:shadow-sticker hover:-translate-y-1 transition-all duration-300 group"
      aria-label={isConfigured ? "Contactar por WhatsApp" : "Configurar WhatsApp en src/lib/config.ts"}
    >
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 3C6.7 3 2.4 6.8 1.2 11.6c0 .3.1.6.1 1H3.5c.1 0 .1-.1 0-.1-.2-.1-.3-.3-.4-.5C1 11.9 1 11.3 1 11 1 6.6 4.6 3 9 3h2.5c.3 0 .6.1.8.3.2.2.2.5.2.8v1.3c0 .3-.1.6-.3.7-.2.1-.4.2-.7.2h-2c-.3 0-.5-.2-.5-.5v-2c0-.3.2-.6.5-.7.2-.1.5-.1.7-.1h4c.8 0 1.5.7 1.5 1.5v6.9c0 .3-.1.6-.3.8-.2.1-.5.2-.7.2h-1c-.4 0-.7.3-.7.7 0 .8.7 1.5 1.5 1.5h2c.6 0 1 .5 1 1.1 0 .3-.1.6-.3.8-.2.2-.4.3-.7.4C21.7 18.4 24 15 24 11 24 6.6 21.3 3 18.5 3H17c-.3 0-.6-.1-.8-.3-.2-.2-.2-.5-.2-.8z" />
      </svg>
      {!isConfigured && (
        <span className="absolute -top-1 -right-1 bg-brand-red text-paper text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
          !
        </span>
      )}
    </a>
  );
}
