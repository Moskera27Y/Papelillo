import type { Category } from "@/types";

export const categories: Category[] = [
  {
    id: "cat-color",
    name: "Para colorear",
    slug: "para-colorear",
    description: "Mini libros, libros medianos y grandes llenos de dibujos para colorear.",
    image: "",
    color: "red",
    order: 1,
    isActive: true,
  },
  {
    id: "cat-act",
    name: "Actividades",
    slug: "actividades",
    description: "Trípticos, sopas de letras, crucigramas y pizarras para jugar.",
    image: "",
    color: "green",
    order: 2,
    isActive: true,
  },
  {
    id: "cat-inv",
    name: "Invitaciones",
    slug: "invitaciones",
    description: "Diseños digitales e impresos con tu temática favorita.",
    image: "",
    color: "blue",
    order: 3,
    isActive: true,
  },
  {
    id: "cat-cajas",
    name: "Cajas y regalos",
    slug: "cajas-y-regalos",
    description: "Cajitas sencillas y cajas con relieve personalizadas.",
    image: "",
    color: "yellow",
    order: 4,
    isActive: true,
  },
  {
    id: "cat-stickers",
    name: "Stickers",
    slug: "stickers",
    description: "Stickers por unidad con diseños originales y divertidos.",
    image: "",
    color: "blue",
    order: 5,
    isActive: true,
  },
  {
    id: "cat-juegos",
    name: "Juegos",
    slug: "juegos",
    description: "Rompecabezas personalizados y más juegos con tu imagen.",
    image: "",
    color: "green",
    order: 6,
    isActive: true,
  },
  {
    id: "cat-material",
    name: "Material creativo",
    slug: "material-creativo",
    description: "Material especial para proyectos creativos y escolares.",
    image: "",
    color: "red",
    order: 7,
    isActive: true,
  },
  {
    id: "cat-person",
    name: "Personalizados",
    slug: "personalizados",
    description: "Creaciones únicas hechas a la medida de tu idea.",
    image: "",
    color: "ink",
    order: 8,
    isActive: true,
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryByName(name: string) {
  return categories.find((c) => c.name === name || c.slug === name);
}
