"use client";

import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductPrice } from "@/components/products/ProductPrice";
import { ProductBadge } from "@/components/products/ProductBadge";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink, buildProductMessage } from "@/lib/config";
import { useCart } from "@/context/CartContext";
import type { AdminProduct } from "@/types/admin";
import type { Product } from "@/types";
import { ProductGridSkeleton } from "@/components/shop/ProductSkeleton";

interface Props {
  params: { slug: string };
}

/**
 * Convierte AdminProduct → Product (para componentes heredados de la Fase 1).
 * AdminProduct es un superconjunto de Product, por lo que esto es seguro.
 */
function toPublicProduct(p: AdminProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    priceType: p.priceType,
    currency: p.currency,
    images: p.images,
    category: p.category,
    tags: p.tags,
    specs: p.specs,
    stock: p.stock,
    featured: p.featured,
    isNew: p.isNew,
    isPopular: p.isPopular,
    isCustomizable: p.isCustomizable,
    requiresQuote: p.requiresQuote,
    isActive: p.isActive,
    customFields: p.customFields,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    ctaLabel: p.ctaLabel,
  };
}

export default function ProductPage({ params }: Props) {
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<AdminProduct[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    // Cargar producto y relacionados desde la API (Prisma/Neón)
    async function load() {
      try {
        const [mainRes, allRes] = await Promise.all([
          fetch(`/api/products/slug/${encodeURIComponent(params.slug)}`),
          fetch("/api/products/active"),
        ]);
        const found = await mainRes.json();
        if (!found || !found.isActive) {
          setProduct(null);
        } else {
          setProduct(found);
          const all: AdminProduct[] = await allRes.json();
          setRelated(
            all
              .filter((p) => p.category === found.category && p.id !== found.id)
              .slice(0, 4)
          );
        }
      } catch {
        setProduct(null);
      }
      setLoading(false);
    }
    load();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="skeleton aspect-square rounded-3xl" />
            <div className="space-y-4">
              <div className="skeleton skeleton-text w-24 h-5" />
              <div className="skeleton skeleton-text w-3/4 h-10" />
              <div className="skeleton skeleton-text w-1/3 h-6" />
              <div className="skeleton skeleton-text w-full h-20 mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const publicProduct = toPublicProduct(product);
  const whatsappMsg = buildWhatsAppMessage(product);
  const whatsappHref = buildWhatsAppLink(whatsappMsg);

  const handleAddToCart = () => {
    if (product.requiresQuote) return;
    addItem({ productId: product.id, quantity });
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-ink-muted">
            <li><a href="/" className="hover:text-ink transition-colors">Inicio</a></li>
            <li aria-hidden="true">/</li>
            <li><a href="/shop" className="hover:text-ink transition-colors">Tienda</a></li>
            <li aria-hidden="true">/</li>
            <li className="text-ink font-semibold truncate">{product.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div>
            <ProductImage
              images={product.images}
              productName={product.name}
              color={product.isCustomizable ? "blue" : product.isPopular ? "red" : "yellow"}
              className="aspect-square w-full"
            />
          </div>

          {/* Info */}
          <div>
            <ProductBadge product={publicProduct} />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mt-4 mb-4 animate-fade-up">
              {product.name}
            </h1>

            <ProductPrice
              price={product.price}
              priceType={product.priceType}
              compareAtPrice={product.compareAtPrice}
              className="text-2xl mb-6"
            />

            <p className="text-lg text-ink-muted mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              {product.description}
            </p>

            {/* Specs / Características */}
            {(product.specs?.length || product.features?.length) ? (
              <div className="mb-8 animate-fade-up" style={{ animationDelay: "0.15s" }}>
                <h3 className="font-display text-xl font-bold text-ink mb-4">Características</h3>
                <ul className="space-y-2">
                  {product.specs?.map((spec, i) => (
                    <li key={i} className="flex justify-between border-b border-ink/10 pb-2">
                      <span className="text-ink-muted">{spec.label}</span>
                      <span className="font-semibold text-ink text-right">{spec.value}</span>
                    </li>
                  ))}
                  {product.features?.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 border-b border-ink/10 pb-2">
                      <svg className="w-4 h-4 text-brand-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-ink">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Dimensiones */}
            {product.dimensions && (
              <div className="mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <h3 className="font-display text-xl font-bold text-ink mb-4">Dimensiones</h3>
                <div className="bg-paper-cream rounded-2xl border-2 border-ink/10 p-4 inline-flex items-center gap-4">
                  <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <div className="text-sm">
                    {product.dimensions.approximate && (
                      <p className="text-ink-muted text-xs">Aproximadas</p>
                    )}
                    <p className="font-bold text-ink">
                      {[
                        product.dimensions.height && `Alto: ${product.dimensions.height}`,
                        product.dimensions.width && `Ancho: ${product.dimensions.width}`,
                        product.dimensions.depth && `Prof: ${product.dimensions.depth}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                      {" "}
                      {product.dimensions.unit || "cm"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity selector (solo para productos sin cotización) */}
            {!product.requiresQuote && (
              <div className="mb-6 animate-fade-up" style={{ animationDelay: "0.25s" }}>
                <label className="block text-sm font-bold text-ink mb-2">Cantidad</label>
                <div className="inline-flex items-center gap-1 border-2 border-ink rounded-full overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(product.minQuantity || 1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-ink hover:bg-paper-cream transition-colors"
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-bold text-ink">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.maxQuantity || 99, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-ink hover:bg-paper-cream transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
                {product.price !== null && product.priceType === "perUnit" && quantity > 1 && (
                  <p className="text-sm text-ink-muted mt-2">
                    Total:{" "}
                    <span className="font-bold text-ink">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0,
                      }).format(product.price * quantity)}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              {product.requiresQuote ? (
                <div>
                  <p className="text-sm text-ink-muted mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Este producto requiere cotización personalizada.
                  </p>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-ink text-paper text-center font-bold rounded-full px-8 py-4 hover:bg-opacity-90 transition-colors shadow-sticker hover:shadow-sticker-lg hover:-translate-y-0.5"
                  >
                    {product.ctaLabel || "Solicitar cotización"}
                  </a>
                </div>
              ) : product.isCustomizable ? (
                <div className="flex flex-col gap-3">
                  <a
                    href={`/crear-mi-producto?producto=${product.slug}`}
                    className="block w-full bg-ink text-paper text-center font-bold rounded-full px-8 py-4 hover:bg-opacity-90 transition-colors shadow-sticker hover:shadow-sticker-lg hover:-translate-y-0.5"
                  >
                    {product.ctaLabel || "Personalizar"}
                  </a>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-brand-green text-ink text-center font-bold rounded-full px-8 py-3 hover:bg-opacity-90 transition-colors"
                  >
                    Consultar por WhatsApp
                  </a>
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-ink text-paper font-bold rounded-full px-8 py-4 hover:bg-opacity-90 transition-all shadow-sticker hover:shadow-sticker-lg hover:-translate-y-0.5"
                  >
                    Agregar al carrito
                  </button>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-green text-ink font-bold rounded-full px-6 py-4 hover:bg-opacity-90 transition-colors"
                    aria-label="Consultar por WhatsApp"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-8">
              También te puede gustar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <a
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group bg-paper rounded-3xl border-2 border-ink shadow-sticker hover:shadow-sticker-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden block"
                >
                  <ProductImage
                    images={p.images}
                    productName={p.name}
                    color={p.isCustomizable ? "blue" : p.isPopular ? "red" : "yellow"}
                    className="aspect-square w-full"
                  />
                  <div className="p-4">
                    <h3 className="font-display text-lg font-bold text-ink group-hover:text-brand-red transition-colors">
                      {p.name}
                    </h3>
                    <ProductPrice
                      price={p.price}
                      priceType={p.priceType}
                      compareAtPrice={p.compareAtPrice}
                      className="mt-1"
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper para construir mensaje personalizado de WhatsApp
function buildWhatsAppMessage(product: AdminProduct): string {
  let msg = `Hola Papelillo 👋\n\nEstoy interesado en: *${product.name}*`;
  if (product.price !== null && product.priceType !== "quote") {
    const formatted = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(product.price);
    const prefix = product.priceType === "from" ? "Desde " : "";
    const suffix = product.priceType === "perUnit" ? " / unidad" : "";
    msg += `\nPrecio: ${prefix}${formatted}${suffix}`;
  }
  if (product.isCustomizable) {
    msg += "\n\nMe gustaría personalizarlo.";
  }
  msg += "\n\n¿Podrían darme más información?";
  return msg;
}
