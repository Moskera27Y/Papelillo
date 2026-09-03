import { siteConfig } from "./config";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: siteConfig.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPrice(
  price: number | null,
  priceType: "fixed" | "from" | "perUnit" | "quote",
  compareAt?: number | null
): string {
  if (priceType === "quote") return "Precio bajo cotización";
  if (price === null) return "—";
  const prefix = priceType === "from" ? "Desde " : "";
  const suffix = priceType === "perUnit" ? " / unidad" : "";
  return `${prefix}${formatCOP(price)}${suffix}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const brandColors = {
  red: "#FF2B32",
  yellow: "#FFD000",
  green: "#78D64B",
  blue: "#5274E8",
  ink: "#0A0A0A",
  paper: "#FFFDF9",
} as const;

export function getBrandColorClass(color: "red" | "yellow" | "green" | "blue" | "ink"): string {
  const map: Record<string, string> = {
    red: "bg-brand-red text-ink",
    yellow: "bg-brand-yellow text-ink",
    green: "bg-brand-green text-ink",
    blue: "bg-brand-blue text-paper",
    ink: "bg-ink text-paper",
  };
  return map[color] ?? map.ink;
}
