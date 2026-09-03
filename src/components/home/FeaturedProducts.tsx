"use client";

import React from "react";
import { useActiveProducts } from "@/hooks/useDataService";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { ProductGridSkeleton } from "@/components/shop/ProductSkeleton";
import type { Product } from "@/types";

export function FeaturedProducts() {
  const { products: activeProducts, isLoading, error } = useActiveProducts();
  const allProducts = activeProducts ?? [];
  const featured = allProducts.filter((p) => p.featured);

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="skeleton skeleton-text w-96 h-10 mx-auto mb-4" />
            <div className="skeleton skeleton-text w-64 h-5 mx-auto" />
          </div>
          <ProductGridSkeleton count={4} />
        </div>
      </section>
    );
  }

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-transparent relative overflow-hidden">
      {/* Doodles sutiles de fondo */}
      <svg
        className="absolute top-10 right-10 opacity-20 animate-wiggle-soft hidden lg:block"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M24 4l5.5 11 12.5 2-9 8.7 2.1 12.3L24 32l-11.1 6 2.1-12.3L6 17l12.5-2z"
          fill="#FFD000"
          stroke="#0A0A0A"
          strokeWidth="1.5"
        />
      </svg>
      <svg
        className="absolute bottom-20 left-10 opacity-20 animate-float-slow hidden lg:block"
        width="36"
        height="36"
        viewBox="0 0 36 36"
        aria-hidden="true"
      >
        <path
          d="M18 32c-1.4-1.2-12-10.3-12-16C6 9.4 10 6 14.5 6c2.3 0 4.4 1.1 5.5 2.8C21.1 7.1 23.2 6 25.5 6 30 6 34 9.4 34 16c0 5.7-10.6 14.8-12 16L18 32z"
          fill="#FF2B32"
          stroke="#0A0A0A"
          strokeWidth="1.5"
          transform="translate(-2, -2)"
        />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red mb-3">
            Los más queridos
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">
            LOS FAVORITOS DE PAPELILLO
          </h2>
          <p className="text-lg text-ink-muted">
            Los productos más queridos por nuestra comunidad.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featured.map((product, i) => (
            <div
              key={product.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <ProductCard product={product as unknown as Product} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button href="/shop" variant="secondary" size="lg">
            Ver todos los productos
          </Button>
        </div>
      </div>
    </section>
  );
}
