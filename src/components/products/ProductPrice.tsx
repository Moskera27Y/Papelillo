import React from "react";
import { cn } from "@/lib/utils";

interface ProductPriceProps {
  price: number | null;
  priceType: "fixed" | "from" | "perUnit" | "quote";
  compareAtPrice?: number | null;
  className?: string;
}

export function ProductPrice({ price, priceType, compareAtPrice, className }: ProductPriceProps) {
  if (priceType === "quote") {
    return (
      <p className={cn("text-sm font-semibold text-ink-muted", className)}>
        Precio bajo cotización
      </p>
    );
  }

  if (price === null) {
    return <p className={cn("text-sm text-ink-muted", className)}>—</p>;
  }

  const prefix = priceType === "from" ? "Desde " : "";
  const suffix = priceType === "perUnit" ? " / unidad" : "";

  const formatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      {compareAtPrice && (
        <span className="text-sm text-ink-muted line-through">
          {new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }).format(compareAtPrice)}
        </span>
      )}
      <span className="text-lg font-bold text-ink">
        {prefix}
        {formatted}
        {suffix}
      </span>
    </div>
  );
}
