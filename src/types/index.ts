// ============================================================
// TIPOS DE PAPELILLO — Fase 1
// Preparados para crecer en Fase 2 (admin, checkout, inventario).
// ============================================================

export type PriceType = "fixed" | "from" | "perUnit" | "quote";
export type Currency = "COP";

export type FieldType = "text" | "textarea" | "number" | "select" | "file";

export interface CustomField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  hint?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number | null;
  compareAtPrice?: number | null;
  priceType: PriceType;
  currency: Currency;
  images: string[];
  category: string;
  tags?: string[];
  variants?: ProductVariant[];
  specs?: ProductSpec[];
  stock: number | null;
  featured: boolean;
  isNew: boolean;
  isPopular: boolean;
  isCustomizable: boolean;
  requiresQuote: boolean;
  isActive: boolean;
  customFields?: CustomField[];
  createdAt: string;
  updatedAt: string;
  ctaLabel?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  color: "red" | "yellow" | "green" | "blue" | "ink";
  order: number;
  isActive: boolean;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  customizations?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  note?: string;
}

export interface SiteContent {
  brandName: string;
  tagline: string;
  hero: {
    title: string;
    titleAccent?: string[];
    description: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
    marqueeWords: string[];
  };
  customHighlight: {
    eyebrow: string;
    title: string;
    description: string;
    cta: { label: string; href: string };
  };
  about: {
    eyebrow: string;
    title: string;
    intro: string;
    values: { label: string; color: "red" | "yellow" | "green" | "blue"; text: string }[];
  };
  personalized: {
    heroTitle: string;
    heroDescription: string;
    process: { step: string; title: string; description: string }[];
  };
  ctaFinal: {
    title: string;
    description: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
  };
  footerDescription: string;
}
