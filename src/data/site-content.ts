import type { SiteContent } from "@/types";

export const siteContent: SiteContent = {
  brandName: "PAPELILLO",
  tagline: "Papelería creativa",

  hero: {
    title: "IDEAS QUE SE CONVIERTEN EN MOMENTOS ESPECIALES.",
    titleAccent: ["IDEAS", "ESPECIALES"],
    description:
      "Papelería creativa, detalles personalizados y pequeños mundos hechos en papel.",
    ctaPrimary: { label: "Explorar productos", href: "/shop" },
    ctaSecondary: { label: "Crear algo personalizado", href: "/personalizados" },
    marqueeWords: [
      "PAPELERÍA CREATIVA",
      "PERSONALIZADOS",
      "INVITACIONES",
      "REGALOS ÚNICOS",
      "HECHO CON COLOR",
      "DETALLES CON ALMA",
    ],
  },

  customHighlight: {
    eyebrow: "Hecho a tu manera",
    title: "HECHO A TU MANERA.",
    description:
      "Porque cada celebración, cada idea y cada persona tiene su propio estilo.",
    cta: { label: "Crear mi producto", href: "/crear-mi-producto" },
  },

  about: {
    eyebrow: "Sobre nosotros",
    title: "HOLA, SOMOS PAPELILLO.",
    intro:
      "Papelillo nace de una idea sencilla: convertir el papel en algo mucho más especial.",
    values: [
      { label: "Creatividad", color: "red", text: "Diseños originales, con alma y con carácter." },
      { label: "Detalle", color: "yellow", text: "Cada pieza se cuida con la atención de quien ama lo que hace." },
      { label: "Color", color: "green", text: "Alegría visible en cada trazado, cada sticker y cada hoja." },
      { label: "Originalidad", color: "blue", text: "Nada genérico. Todo pensado para ti y tu idea." },
    ],
  },

  personalized: {
    heroTitle: "LO IMAGINASTE. LO HACEMOS REALIDAD.",
    heroDescription: "Cuéntanos tu idea y creemos juntos algo único para ti.",
    process: [
      {
        step: "01",
        title: "Cuéntanos tu idea",
        description: "Escríbenos por WhatsApp o el formulario y cuéntanos qué tienes en mente.",
      },
      {
        step: "02",
        title: "Elegimos juntos los detalles",
        description: "Revisamos tema, colores, cantidad, fecha y lo que necesites personalizar.",
      },
      {
        step: "03",
        title: "Lo creamos",
        description: "Diseñamos, imprimimos y cuidamos cada detalle con paciencia de artesano.",
      },
      {
        step: "04",
        title: "Disfruta tu producto",
        description: "Recibe tu pieza lista para compartir, regalar o guardar como un tesoro.",
      },
    ],
  },

  ctaFinal: {
    title: "¿QUÉ VAMOS A CREAR HOY?",
    description: "Una idea puede comenzar con una hoja de papel.",
    ctaPrimary: { label: "Explorar productos", href: "/shop" },
    ctaSecondary: { label: "Hablar por WhatsApp", href: "/contacto" },
  },

  footerDescription:
    "Papelería creativa, productos para colorear, invitaciones, regalos, juegos y artículos personalizados. Hecho con detalle y color.",
};
