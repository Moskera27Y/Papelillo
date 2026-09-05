"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Cart, CartItem } from "@/types";
import type { AdminProduct } from "@/types/admin";
import { getWompiConfig } from "@/services/wompi.service";

const STORAGE_KEY = "papelillo-cart-v1";

export interface CartItemExt extends CartItem {
  product?: AdminProduct;
  lineTotal: number | null; // null si requiere cotización
}

interface CartContextValue {
  cart: Cart;
  count: number;
  subtotal: number;
  /** Detalle extendido con producto cargado */
  lines: CartItemExt[];
  /** True cuando la API de productos ha respondido (para loading states) */
  productsLoaded: boolean;
  itemCount: (productId: string) => number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  increment: (productId: string, variantId?: string) => void;
  decrement: (productId: string, variantId?: string) => void;
  clear: () => void;
  isEmpty: boolean;
  hasQuoteOnly: boolean;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): Cart {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed?.items) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
}

function writeCart(cart: Cart) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // ignore
  }
}

function sameLine(a: CartItem, b: CartItem): boolean {
  return a.productId === b.productId && (a.variantId ?? "") === (b.variantId ?? "");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [isOpen, setOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<AdminProduct[]>([]);
  const [productsVersion, setProductsVersion] = useState(0);
  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => {
    setCart(readCart());
    // Cargar productos desde la API (Prisma/Neón)
    fetch("/api/products/active")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAllProducts(data as AdminProduct[]);
        setProductsLoaded(true);
      })
      .catch(() => {
        /* fallback: products vacíos sin romper UX */
        setProductsLoaded(true);
      });
    // Inyectar config de Wompi a window para checkout sync access
    const cfg = getWompiConfig();
    if (typeof window !== "undefined") {
      (window as any).__PAPELILLO_WOMPI_CONFIG__ = {
        publicKey: cfg.publicKey || process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "",
        integrityKey: cfg.integrityKey || process.env.NEXT_PUBLIC_WOMPI_INTEGRITY_KEY || process.env.WOMPI_INTEGRITY_KEY || "",
        environment: cfg.environment,
        enabled: cfg.enabled,
      };
    }
    // Sincroniza cuando cambian los productos (desde admin, etc.)
    const handler = () => setProductsVersion((v) => v + 1);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    writeCart(cart);
  }, [cart]);

  const lines: CartItemExt[] = useMemo(() => {
    // referenciamos productsVersion para recalcular cuando cambian productos
    void productsVersion;
    const availableProducts = allProducts.length > 0 ? allProducts : [];
    return cart.items
      .map((item) => {
        const product = allProducts.find((p) => p.id === item.productId);
        if (!product) return null;
        let lineTotal: number | null = null;
        if (!product.requiresQuote && product.price !== null) {
          if (product.priceType === "perUnit") {
            lineTotal = product.price * Math.max(1, item.quantity);
          } else if (product.priceType === "fixed") {
            lineTotal = product.price * Math.max(1, item.quantity);
          } else if (product.priceType === "from") {
            // "desde": tomamos el precio como referencia mínima
            lineTotal = (product.price as number) * Math.max(1, item.quantity);
          }
        }
        return { ...item, product, lineTotal };
      })
      .filter((l): l is CartItemExt => l !== null);
  }, [cart, productsVersion]);

  const count = useMemo(
    () => cart.items.reduce((acc, it) => acc + it.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      lines.reduce((acc, l) => {
        if (l.lineTotal === null) return acc;
        return acc + l.lineTotal;
      }, 0),
    [lines]
  );

  const hasQuoteOnly = useMemo(
    () => lines.length > 0 && lines.every((l) => l.lineTotal === null),
    [lines]
  );

  const itemCount = (productId: string) =>
    cart.items.find((i) => i.productId === productId)?.quantity ?? 0;

  const addItem: CartContextValue["addItem"] = (item) => {
    setCart((prev) => {
      const idx = prev.items.findIndex((i) => sameLine(i, item));
      if (idx === -1) return { ...prev, items: [...prev.items, item] };
      const next = [...prev.items];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
      return { ...prev, items: next };
    });
    setOpen(true);
  };

  const removeItem = (productId: string, variantId?: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter(
        (i) => !(i.productId === productId && (i.variantId ?? "") === (variantId ?? ""))
      ),
    }));
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    setCart((prev) => {
      const q = Math.max(1, Math.min(999, quantity));
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.productId === productId && (i.variantId ?? "") === (variantId ?? "")
            ? { ...i, quantity: q }
            : i
        ),
      };
    });
  };

  const increment = (productId: string, variantId?: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.productId === productId && (i.variantId ?? "") === (variantId ?? "")
          ? { ...i, quantity: Math.min(999, i.quantity + 1) }
          : i
      ),
    }));
  };

  const decrement = (productId: string, variantId?: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items
        .map((i) =>
          i.productId === productId && (i.variantId ?? "") === (variantId ?? "")
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0),
    }));
  };

  const clear = () => setCart({ items: [] });

  const toggle = () => setOpen((v) => !v);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count,
      subtotal,
      lines,
      productsLoaded,
      itemCount,
      addItem,
      removeItem,
      updateQuantity,
      increment,
      decrement,
      clear,
      isEmpty: cart.items.length === 0,
      hasQuoteOnly,
      isOpen,
      setOpen,
      toggle,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, count, subtotal, lines, productsLoaded, isOpen, hasQuoteOnly]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
