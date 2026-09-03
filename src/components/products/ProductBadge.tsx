import React from "react";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/types";

interface ProductBadgeProps {
  product: Product;
}

export function ProductBadge({ product }: ProductBadgeProps) {
  if (product.isNew) {
    return <Badge color="green">Nuevo</Badge>;
  }
  if (product.isPopular) {
    return <Badge color="red">Popular</Badge>;
  }
  if (product.isCustomizable) {
    return <Badge color="blue">Personalizado</Badge>;
  }
  if (product.requiresQuote) {
    return <Badge color="ink">Cotizar</Badge>;
  }
  return null;
}
