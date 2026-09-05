// ============================================================
// QUICK VIEW MODAL — overlay sin navegación (nextjs-debug-patterns)
// ============================================================
"use client";

import React, { useEffect } from "react";
import type { Product } from "@/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { formatCOP } from "@/services/wompi.service";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { has, add: wishAdd, remove: wishRemove } = useWishlist();
  const inWishlist = has(product?.id || "");

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-paper rounded-xl shadow-xl max-w-4xl w-full p-6 relative animate-fade-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-ink-muted hover:text-ink" aria-label="Cerrar">✕</button>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-square relative bg-gray-50 rounded-lg overflow-hidden">
            <ProductImage images={product.images} alt={product.name} className="object-cover w-full h-full" />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-ink">{product.name}</h2>
            <p className="text-sm text-ink-muted">{product.shortDescription || product.description}</p>
            {product.price && <p className="text-xl font-bold text-brand-red">{formatCOP(product.price)}</p>}

            <div className="flex gap-3">
              <Button onClick={() => { addItem(product, 1); onClose(); }} className="flex-1">Agregar al carrito</Button>
              <Button onClick={() => inWishlist ? wishRemove(product.id) : wishAdd(product.id)} variant="secondary" className="flex-1">
                {inWishlist ? "❤️ En favoritos" : "🤍 Añadir a favoritos"}
              </Button>
            </div>

            <Button href={`/product/${product.slug}`} variant="secondary">Ver producto completo</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
