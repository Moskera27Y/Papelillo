// ============================================================
// CONFIGURACIÓN GLOBAL — edita aquí para actualizar WhatsApp, redes, email.
// Valores empty indican datos "por definir" y el UI lo maneja con gracia.
// ============================================================

export const siteConfig = {
  brandName: "PAPELILLO",
  tagline: "Papelería creativa",
  locale: "es-CO",
  currency: "COP" as const,
  currencySymbol: "$",
  currencyCode: "COP",

  whatsappNumber: "573185171163",
  whatsappDefaultMessage: "Hola, estoy interesado en conocer más sobre Papelillo y sus productos personalizados.",
  email: "hola@papelillo.co",
  address: "Cali, Valle del Cauca, Colombia",
  hours: "Lun–Vie: 9:00 AM – 6:00 PM",

  instagramUrl: "https://instagram.com/papelillostudio",
  tiktokUrl: "https://tiktok.com/@papelillostudio",
  facebookUrl: "https://facebook.com/papelillostudio",

  logoSrc: "/images/logo.png",
  logoAlt: "Papelillo — papelería creativa",
  logoSvgSrc: "/images/logo.svg",
  faviconSrc: "/favicon.svg",

  siteName: "Papelillo",
  siteDescription:
    "Papelería creativa, productos para colorear, invitaciones, regalos, juegos y artículos personalizados. Hecho con detalle y color.",
  siteUrl: "https://papelillo.co",

  legal: {
    privacy: "/politica-privacidad",
    terms: "/terminos",
    shipping: "/envios",
    returns: "/cambios-devoluciones",
    faq: "/preguntas-frecuentes",
  },
};

export function buildWhatsAppLink(message?: string): string {
  if (!siteConfig.whatsappNumber) return "#";
  const msg = encodeURIComponent(message ?? siteConfig.whatsappDefaultMessage);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${msg}`;
}

export function buildProductMessage(productName: string): string {
  return `Hola, estoy interesado en el producto: ${productName}.`;
}

export function buildCustomMessage(): string {
  return "Hola, quiero solicitar un producto personalizado.";
}
