"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCOP } from "@/services/wompi.service";
import { ProductImage } from "@/components/ui/ProductImage";
import { buildWhatsAppLink } from "@/lib/config";

export default function CartPage() {
  const { lines, count, subtotal, isEmpty, hasQuoteOnly, clear, updateQuantity, removeItem } =
    useCart();

  if (isEmpty) {
    return (
      <div className="min-h-[60vh] bg-paper flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-brand-yellow/30 rounded-full border-2 border-ink/10 flex items-center justify-center mx-auto mb-8">
            <svg className="w-16 h-16 text-ink/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-lg text-ink-muted mb-8">
            Aún no has agregado productos. Explora nuestro catálogo y encuentra algo especial.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-ink text-paper font-bold rounded-full px-8 py-4 hover:bg-opacity-90 transition-colors shadow-sticker"
          >
            Ir a la tienda
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-red mb-2">Tu carrito</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-ink mb-2">
            Revisa tus productos
          </h1>
          <p className="text-lg text-ink-muted">
            {count} {count === 1 ? "producto" : "productos"} listos para comprar
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {lines.map((line) => {
              const p = line.product;
              if (!p) return null;

              const unitPrice = p.price ?? 0;
              const displayPrice =
                p.priceType === "perUnit"
                  ? `${formatCOP(unitPrice)} / unidad`
                  : p.priceType === "from"
                  ? `Desde ${formatCOP(unitPrice)}`
                  : p.priceType === "quote"
                  ? "Cotizar"
                  : formatCOP(unitPrice);

              return (
                <article
                  key={`${p.id}-${line.variantId ?? ""}`}
                  className="bg-paper-soft rounded-3xl border-2 border-ink/10 p-4 md:p-6 hover:border-ink/30 transition-colors"
                >
                  <div className="flex gap-4 md:gap-6">
                    <Link
                      href={`/product/${p.slug}`}
                      className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-ink/10"
                    >
                      <ProductImage
                              images={p.images}
                              alt={p.name}
                              className="w-full h-full"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <Link
                            href={`/product/${p.slug}`}
                            className="font-display text-lg md:text-xl font-bold text-ink hover:text-brand-red transition-colors"
                          >
                            {p.name}
                          </Link>
                          <p className="text-sm text-ink-muted mt-1">{displayPrice}</p>
                        </div>
                        <button
                          onClick={() => removeItem(p.id, line.variantId)}
                          className="flex-shrink-0 w-8 h-8 rounded-full border border-ink/20 hover:bg-brand-red hover:text-paper hover:border-brand-red transition-colors flex items-center justify-center"
                          aria-label={`Quitar ${p.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                          </svg>
                        </button>
                      </div>

                      {line.customizations && Object.keys(line.customizations).length > 0 && (
                        <div className="mb-3 space-y-0.5 bg-paper rounded-xl px-3 py-2 border border-ink/10">
                          <p className="text-xs font-bold text-ink mb-1">Personalización:</p>
                          {Object.entries(line.customizations).map(([k, v]) => (
                            <p key={k} className="text-xs text-ink-muted">
                              <span className="font-semibold">{k}:</span> {v}
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 border-2 border-ink/15 rounded-full bg-paper">
                          <button
                            onClick={() => updateQuantity(p.id, Math.max(1, line.quantity - 1), line.variantId)}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-yellow hover:border-ink transition-colors text-lg font-bold"
                            aria-label="Disminuir cantidad"
                          >
                            −
                          </button>
                          <span className="w-10 text-center font-bold text-ink">{line.quantity}</span>
                          <button
                            onClick={() => updateQuantity(p.id, line.quantity + 1, line.variantId)}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-yellow hover:border-ink transition-colors text-lg font-bold"
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>

                        {line.lineTotal !== null ? (
                          <span className="font-display text-xl font-bold text-ink">
                            {formatCOP(line.lineTotal)}
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-brand-blue">Requiere cotización</span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            <button
              onClick={clear}
              className="text-sm font-bold text-ink-muted hover:text-brand-red transition-colors"
            >
              Vaciar carrito
            </button>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-paper-soft rounded-3xl border-2 border-ink/10 p-6 space-y-6">
              <h2 className="font-display text-2xl font-bold text-ink">Resumen del pedido</h2>

              <div className="space-y-3 pt-4 border-t border-ink/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted">Subtotal</span>
                  {hasQuoteOnly ? (
                    <span className="text-sm font-bold text-ink">Requiere cotización</span>
                  ) : (
                    <span className="font-display text-2xl font-bold text-ink">{formatCOP(subtotal)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">Envío</span>
                  <span className="text-ink-muted">Calculado en checkout</span>
                </div>
              </div>

              {!hasQuoteOnly && (
                <Link
                  href="/checkout"
                  className="block w-full bg-ink text-paper text-center font-bold rounded-full px-6 py-4 hover:bg-opacity-90 transition-colors shadow-sticker"
                >
                  Finalizar compra
                </Link>
              )}

              {hasQuoteOnly && (
                <a
                  href={buildWhatsAppLink(
                    `Hola, quiero cotizar los siguientes productos de mi carrito: ${lines
                      .map((l) => l.product?.name)
                      .filter(Boolean)
                      .join(", ")}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-brand-green text-ink text-center font-bold rounded-full px-6 py-4 hover:bg-opacity-90 transition-colors shadow-sticker"
                >
                  Solicitar cotización por WhatsApp
                </a>
              )}

              <Link
                href="/shop"
                className="block w-full text-center text-sm font-bold text-ink-muted hover:text-ink transition-colors py-2"
              >
                ← Seguir comprando
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
