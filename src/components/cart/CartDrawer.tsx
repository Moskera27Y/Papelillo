"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCOP } from "@/services/wompi.service";
import { buildWhatsAppLink } from "@/lib/config";
import { ProductImage } from "@/components/ui/ProductImage";
import { ShoppingCart, X } from "lucide-react";

// ============================================================
// CART DRAWER — Drawer lateral con todo el carrito.
// Reemplaza la necesidad de navegar a /cart.
// ============================================================

export function CartDrawer() {
  const { isOpen, setOpen, lines, count, subtotal, isEmpty, hasQuoteOnly, clear, productsLoaded } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, setOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-ink/40 z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 right-0 bottom-0 z-[101] w-full max-w-md max-h-screen bg-paper shadow-[-8px_0_24px_rgba(10,10,10,0.15)] flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Carrito de compras"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-yellow border-2 border-ink rounded-full flex items-center justify-center shadow-sticker-sm">
              <ShoppingCart className="w-5 h-5 text-ink" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Tu carrito</h2>
              <p className="text-xs text-ink-muted">
                {count} {count === 1 ? "producto" : "productos"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-10 h-10 rounded-full border-2 border-ink bg-paper hover:bg-brand-red hover:text-paper transition-colors flex items-center justify-center"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Contenedor scrollable: grow + min-h-0 garantiza scroll de items */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          {!productsLoaded ? (
            <LoadingCartItems count={count} />
          ) : isEmpty ? (
            <EmptyCart onClose={() => setOpen(false)} />
          ) : (
            <div className="space-y-4">
              {lines.map((line) => (
                <CartItemRow
                  key={`${line.productId}-${line.variantId ?? ""}`}
                  line={line}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer fijo: siempre visible + accesible */}
        {!isEmpty && productsLoaded && (
          <div className="border-t border-ink/10 px-6 py-5 shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">Subtotal</span>
              {hasQuoteOnly ? (
                <span className="text-sm font-bold text-ink">Requiere cotización</span>
              ) : (
                <span className="font-display text-2xl font-bold text-ink">
                  {formatCOP(subtotal)}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted">Envío calculado en el checkout.</p>

            <div className="space-y-2">
              {!hasQuoteOnly && (
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="block w-full bg-ink text-paper text-center font-bold rounded-full px-6 py-4 hover:brightness-90 active:scale-[0.98] transition-all duration-200 shadow-sticker-sm focus-visible:ring-2 focus-visible:ring-brand-yellow"
                >
                  Finalizar compra
                </Link>
              )}

              {hasQuoteOnly && lines.length > 0 && (
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="block w-full bg-brand-yellow text-ink text-center font-bold rounded-full px-6 py-4 hover:brightness-90 active:scale-[0.98] transition-all duration-200 shadow-sticker-sm"
                >
                  Ir a pagar (cotizar productos)
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
                  onClick={() => setOpen(false)}
                  className="block w-full bg-brand-green text-ink text-center font-bold rounded-full px-6 py-4 hover:brightness-90 active:scale-[0.98] transition-all duration-200 shadow-sticker-sm"
                >
                  Solicitar cotización por WhatsApp
                </a>
              )}

              <button
                onClick={clear}
                className="w-full text-xs font-bold text-ink-muted hover:text-brand-red transition-colors py-2"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

// Shimmer loading rows mientras products API carga
function LoadingCartItems({ count }: { count: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count || 1 }).map((_, i) => (
        <div key={i} className="flex gap-4 bg-paper rounded-2xl border-2 border-ink/10 p-3">
          <div className="w-20 h-20 flex-shrink-0 rounded-xl skeleton skeleton-circle" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 skeleton skeleton-text w-3/4 rounded" />
            <div className="h-3 skeleton skeleton-text w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CartItemRow({ line }: { line: ReturnType<typeof useCart>["lines"][number] }) {
  const { updateQuantity, removeItem } = useCart();
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

  // Snapshot image: usa localStorage snapshot cuando product aún no cargó
  const productName = p.name || line.snapshot?.name || "Producto";
  const imageSources: string[] = p.images?.length ? p.images : line.snapshot?.image ? [line.snapshot.image] : [];

  return (
    <article className="flex gap-4 bg-paper rounded-2xl border-2 border-ink/10 p-3 hover:border-ink/30 transition-colors">
      <Link
        href={p.slug ? `/product/${p.slug}` : "#"}
        className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 border-ink/10"
      >
        <ProductImage
          images={imageSources}
          productName={productName}
          color={p.isCustomizable ? "blue" : line.snapshot?.requiresQuote ? "blue" : "yellow"}
          className="w-full h-full"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={p.slug ? `/product/${p.slug}` : "#"}
            className="font-display text-base font-bold text-ink hover:text-brand-red transition-colors line-clamp-2"
          >
            {p.name || line.snapshot?.name || "Producto"}
          </Link>
          <button
            onClick={() => removeItem(p.id, line.variantId)}
            className="flex-shrink-0 w-7 h-7 rounded-full border border-ink/20 hover:bg-brand-red hover:text-paper hover:border-brand-red transition-colors flex items-center justify-center"
            aria-label={`Quitar ${p.name || "producto"}`}
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>

        <p className="text-xs text-ink-muted mb-2">{displayPrice}</p>
        {line.customizations && Object.keys(line.customizations).length > 0 && (
          <div className="mb-2 space-y-0.5">
            {Object.entries(line.customizations).map(([k, v]) => (
              <p key={k} className="text-[11px] text-ink-muted">
                <span className="font-semibold">{k}:</span> {v}
              </p>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 border-2 border-ink/15 rounded-full bg-paper">
            <button
              onClick={() => updateQuantity(p.id, Math.max(1, line.quantity - 1), line.variantId)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand-yellow hover:border-ink transition-colors text-lg font-bold"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="w-8 text-center font-bold text-ink">{line.quantity}</span>
            <button
              onClick={() => updateQuantity(p.id, line.quantity + 1, line.variantId)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand-yellow hover:border-ink transition-colors text-lg font-bold"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          {line.lineTotal !== null ? (
            <span className="font-display text-base font-bold text-ink">
              {formatCOP(line.lineTotal)}
            </span>
          ) : (
            <span className="text-xs font-bold text-brand-blue">Cotizar</span>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <div className="w-28 h-28 bg-brand-yellow/30 rounded-full border-2 border-ink/10 flex items-center justify-center mb-6">
        <svg className="w-14 h-14 text-ink/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 className="font-display text-2xl font-bold text-ink mb-2">Tu carrito está vacío</h3>
      <p className="text-sm text-ink-muted mb-8 max-w-xs">
        Aún no has agregado productos. Explora nuestro catálogo y encuentra algo especial.
      </p>
      <div className="space-y-2 w-full max-w-xs">
        <Link
          href="/shop"
          onClick={onClose}
          className="block w-full bg-ink text-paper text-center font-bold rounded-full px-6 py-3 hover:bg-opacity-90 transition-colors"
        >
          Ir a la tienda
        </Link>
        <button
          onClick={onClose}
          className="block w-full text-sm font-bold text-ink-muted hover:text-ink transition-colors py-2"
        >
          Seguir explorando
        </button>
      </div>
    </div>
  );
}
