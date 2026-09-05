"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProductPrice } from "./ProductPrice";
import { ProductBadge } from "./ProductBadge";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/context/CartContext";
import { buildWhatsAppLink, buildProductMessage } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { QuickViewModal } from "@/components/products/QuickViewModal";
import { useWishlist } from "@/hooks/useWishlist";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { has, add: wishAdd, remove: wishRemove } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const inWishlist = has(product.id);

  const toggleWishlist = () => {
    inWishlist ? wishRemove(product.id) : wishAdd(product.id);
  };

  const handleAddToCart = () => {
    if (product.requiresQuote) return;
    addItem({
      productId: product.id,
      quantity: 1,
      snapshot: {
        name: product.name,
        image: product.images?.[0] ?? undefined,
        slug: product.slug,
        unitPrice: product.price,
        priceType: product.priceType,
        requiresQuote: product.requiresQuote,
        isCustomizable: product.isCustomizable,
      },
    });
  };

  const whatsappMsg = buildProductMessage(product.name);
  const whatsappHref = buildWhatsAppLink(whatsappMsg);

  return (
    <div className="group bg-paper rounded-3xl border-2 border-ink shadow-sticker hover:shadow-sticker-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Image + Badges + Wishlist */}
      <Link href={`/product/${product.slug}`} className="block relative">
        <div className="aspect-square relative">
          <ProductImage images={product.images} alt={product.name} className="object-cover" />
        </div>
        <div className="absolute top-3 left-3">
          <ProductBadge product={product} />
        </div>
        <button
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            inWishlist ? "bg-brand-red text-paper scale-110" : "bg-white/80 text-ink/40 hover:text-brand-red hover:bg-white"
          }`}
          aria-label={inWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <svg className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318A4.49 4.49 0 0112 3.324M12 20.773l-1.447-1.324A6.5 6.5 0 014 10.8V8a8 8 0 0115.666-1.553M9 13h.01M15 13h.01" />
          </svg>
        </button>
      </Link>

      {/* Content */}
      <div className="p-5">
        <Link href={`/product/${product.slug}`} className="block mb-3">
          <h3 className="font-display text-lg sm:text-xl font-bold text-ink mb-1 group-hover:text-brand-red transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-ink-muted line-clamp-2">
            {product.shortDescription}
          </p>
        </Link>

        <ProductPrice
          price={product.price}
          priceType={product.priceType}
          compareAtPrice={product.compareAtPrice}
          className="mb-4"
        />

        {/* Actions */}
        <div className="flex gap-2">
          {product.requiresQuote ? (
            <Button href={whatsappHref} variant="primary" size="sm" className="flex-1">
              {product.ctaLabel || "Solicitar cotización"}
            </Button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                aria-label={`Agregar ${product.name} al carrito`}
                className="flex-1 bg-ink text-paper text-sm font-bold rounded-full px-4 py-2 hover:brightness-90 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
              >
                Agregar
              </button>
              <button
                onClick={() => setQuickViewOpen(true)}
                aria-label="Vista rápida"
                className="flex-1 bg-transparent text-ink border border-ink/20 text-sm font-bold rounded-full px-4 py-2 hover:bg-ink/5 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
              >
                Vista rápida
              </button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-green text-ink text-sm font-bold rounded-full px-4 py-2 hover:bg-opacity-90 transition-colors flex items-center justify-center"
                aria-label="Consultar por WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
            </>
          )}
        </div>
      </div>

      <QuickViewModal product={quickViewOpen ? product : null} onClose={() => setQuickViewOpen(false)} />
    </div>
  );
}
