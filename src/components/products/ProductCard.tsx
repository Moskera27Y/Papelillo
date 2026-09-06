"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProductPrice } from "./ProductPrice";
import { ProductBadge } from "./ProductBadge";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/context/CartContext";
import { buildWhatsAppLink, buildProductMessage } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";
import { Heart } from "@/components/ui/Doodles";
import { MessageCircle } from "lucide-react";

const QuickViewModalLazy = dynamic(() => import("@/components/products/QuickViewModal"), {
  ssr: false,
  loading: () => null,
});
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
          <Heart className="w-4 h-4" filled={inWishlist} />
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
                <MessageCircle className="w-4 h-4" />
              </a>
            </>
          )}
        </div>
      </div>

      <QuickViewModalLazy product={quickViewOpen ? product : null} onClose={() => setQuickViewOpen(false)} />
    </div>
  );
}
