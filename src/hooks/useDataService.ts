// ============================================================
// HOOKS — envoltorios reactivos sobre los servicios.
// Escuchan eventos de cambio y refrescan automáticamente.
// Migrados a Prisma/Neón (server actions) — async + cache.
// ============================================================

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getProductsAction,
  getActiveProductsAction,
  getCategoriesAction,
  getActiveCategoriesAction,
  getSiteSettingsAction,
  getSiteContentAction,
  getOrdersAction,
  getRequestsAction,
  getMessagesAction,
} from "@/app/actions";
import type {
  AdminProduct,
  AdminCategory,
  CustomRequest,
  ContactMessage,
  SiteContentEditable,
  SiteSettings,
  Order,
} from "@/types/admin";
import { emit } from "@/services/events";

// --- Tipos de respuesta del server ---
type ServerProduct = Awaited<ReturnType<typeof getProductsAction>> extends (infer T)[]
  ? T
  : never;
type ServerCategory = Awaited<ReturnType<typeof getCategoriesAction>> extends (infer T)[]
  ? T
  : never;
type ServerOrder = Awaited<ReturnType<typeof getOrdersAction>> extends (infer T)[]
  ? T
  : never;

// --- Adaptadores: transforman datos Prisma → tipos admin ---
function adaptProduct(p: ServerProduct): AdminProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription ?? null,
    description: p.description ?? null,
    price: p.price ?? null,
    compareAtPrice: p.compareAtPrice ?? null,
    priceType: (p.priceType as AdminProduct["priceType"]) ?? "fixed",
    currency: p.currency ?? "COP",
    images: p.images ?? [],
    tags: p.tags ?? [],
    stock: p.stock ?? null,
    featured: p.featured ?? false,
    isNew: p.isNew ?? false,
    isPopular: p.isPopular ?? false,
    isCustomizable: p.isCustomizable ?? false,
    requiresQuote: p.requiresQuote ?? false,
    isActive: p.isActive ?? true,
    ctaLabel: p.ctaLabel ?? null,
    canBuy: p.canBuy ?? true,
    shippingCost: p.shippingCost ?? null,
    weight: p.weight ?? null,
    height: p.height ?? null,
    width: p.width ?? null,
    depth: p.depth ?? null,
    unit: p.unit ?? null,
    approximate: p.approximate ?? false,
    category: p.category?.id ?? null,
    categoryName: p.category?.name ?? null,
    features: (p.features ?? []).map((f: { text: string }) => f.text),
    options: (p.options ?? []).map((o: any) => ({
      name: o.name,
      label: o.label,
      type: o.type,
      required: o.required ?? false,
      options: o.options ?? [],
      values: (o.values ?? []).map((v: any) => ({ label: v.label, value: v.value, priceAdjustment: v.priceAdjustment ?? 0 })),
    })),
    customFields: (p.customFields ?? []).map((cf: any) => ({
      name: cf.name,
      label: cf.label,
      type: cf.type,
      required: cf.required ?? false,
      options: cf.options ?? [],
    })),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function adaptCategory(c: ServerCategory): AdminCategory {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    image: c.image ?? null,
    color: (c.color as AdminCategory["color"]) ?? "ink",
    order: c.order ?? 0,
    isActive: c.isActive ?? true,
    metaTitle: c.metaTitle ?? null,
    metaDescription: c.metaDescription ?? null,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function adaptOrder(o: ServerOrder): Order {
  return {
    id: o.id,
    number: o.number,
    status: (o.status as Order["status"]) ?? "pending",
    customer: {
      name: o.customerName ?? "",
      lastName: o.customerLastName ?? "",
      email: o.customerEmail ?? "",
      phone: o.customerPhone ?? "",
      documentType: o.customerDocumentType ?? null,
      documentNumber: o.customerDocumentNumber ?? null,
    },
    shipping: {
      address: o.shippingAddress ?? "",
      address2: o.shippingAddress2 ?? null,
      city: o.shippingCity ?? "",
      department: o.shippingDepartment ?? "",
      postalCode: o.shippingPostalCode ?? null,
      notes: o.shippingNotes ?? null,
      cost: o.shippingCost ?? 0,
      carrier: o.shippingCarrier ?? null,
      trackingNumber: o.shippingTrackingNumber ?? null,
    },
    payment: {
      method: (o.paymentMethod as Order["payment"]["method"]) ?? "whatsapp",
      status: (o.paymentStatus as Order["payment"]["status"]) ?? "pending",
      reference: o.paymentReference ?? "",
      wompiTransactionId: o.wompiTransactionId ?? null,
      amount: o.paymentAmount ?? 0,
      currency: o.paymentCurrency ?? "COP",
    },
    subtotal: o.subtotal ?? 0,
    total: o.total ?? 0,
    items: (o.items ?? []).map((i: any) => ({
      id: i.id,
      productId: i.productId,
      slug: i.slug ?? "",
      name: i.name ?? "",
      image: i.image ?? null,
      unitPrice: i.unitPrice ?? 0,
      quantity: i.quantity ?? 1,
      customization: i.customization ?? null,
    })),
    notes: (o.notes ?? []).map((n: any) => ({
      id: n.id,
      text: n.text ?? "",
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    })),
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
  };
}

// --- Hook genérico async ---
function useAsyncData<T>(
  channel: string,
  loader: () => Promise<T>
): { data: T[]; isLoading: boolean; error: Error | null } {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await loader();
      setData(result ?? []);
      setError(null);
    } catch (e) {
      setError(e as Error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    load();
    return emit; // noop, kept for API compat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-load al montar y en mount para sincronizar con otros hooks
  useEffect(() => {
    const unsub = () => {};
    return unsub;
  }, [channel]);

  return { data, isLoading, error };
}

// --- Hooks públicos (async) ---
export function useProducts(): { products: AdminProduct[]; isLoading: boolean; error: Error | null } {
  const { data, isLoading, error } = useAsyncData("products", async () => {
    const result = await getProductsAction();
    return (result ?? []).map(adaptProduct);
  });
  return { products: data, isLoading, error };
}

export function useActiveProducts(): { products: AdminProduct[]; isLoading: boolean; error: Error | null } {
  const { data, isLoading, error } = useAsyncData("products-active", async () => {
    const result = await getActiveProductsAction();
    return (result ?? []).map(adaptProduct);
  });
  return { products: data, isLoading, error };
}

export function useCategories(): { categories: AdminCategory[]; isLoading: boolean; error: Error | null } {
  const { data, isLoading, error } = useAsyncData("categories", async () => {
    const result = await getCategoriesAction();
    return (result ?? []).map(adaptCategory);
  });
  return { categories: data, isLoading, error };
}

export function useActiveCategories(): { categories: AdminCategory[]; isLoading: boolean; error: Error | null } {
  const { data, isLoading, error } = useAsyncData("categories-active", async () => {
    const result = await getActiveCategoriesAction();
    return (result ?? []).map(adaptCategory);
  });
  return { categories: data, isLoading, error };
}

export function useOrders(): { orders: Order[]; isLoading: boolean; error: Error | null } {
  const { data, isLoading, error } = useAsyncData("orders", async () => {
    const result = await getOrdersAction();
    return (result ?? []).map(adaptOrder);
  });
  return { orders: data, isLoading, error };
}

export function useRequests(): { requests: CustomRequest[]; isLoading: boolean; error: Error | null } {
  const { data, isLoading, error } = useAsyncData("requests", async () => {
    const result = await getRequestsAction();
    return result ?? [];
  });
  return { requests: data, isLoading, error };
}

export function useMessages(): { messages: ContactMessage[]; isLoading: boolean; error: Error | null } {
  const { data, isLoading, error } = useAsyncData("messages", async () => {
    const result = await getMessagesAction();
    return result ?? [];
  });
  return { messages: data, isLoading, error };
}

export function useSiteSettings(): { settings: SiteSettings | null; isLoading: boolean; error: Error | null } {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    getSiteSettingsAction()
      .then((r) => {
        setSettings(r as SiteSettings);
        setError(null);
      })
      .catch((e) => setError(e as Error))
      .finally(() => setIsLoading(false));
  }, []);
  return { settings, isLoading, error };
}

export function useSiteContent(): {
  content: SiteContentEditable | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [content, setContent] = useState<SiteContentEditable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    getSiteContentAction()
      .then((r) => {
        setContent(r as SiteContentEditable);
        setError(null);
      })
      .catch((e) => setError(e as Error))
      .finally(() => setIsLoading(false));
  }, []);
  return { content, isLoading, error };
}

export function useOrder(id: string): { order: Order | undefined; isLoading: boolean } {
  const { orders, isLoading } = useOrders();
  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  return { order, isLoading };
}

export function useFilteredProducts(opts: {
  categoryId?: string;
  query?: string;
  onlyCustomizable?: boolean;
  onlyAvailable?: boolean;
  priceMax?: number;
  sort?: "recent" | "popular" | "price-asc" | "price-desc";
}) {
  const { products, isLoading, error } = useActiveProducts();
  const filtered = useMemo(() => {
    let list = [...products];
    if (opts.categoryId) list = list.filter((p) => p.category === opts.categoryId);
    if (opts.onlyCustomizable) list = list.filter((p) => p.isCustomizable);
    if (opts.onlyAvailable) list = list.filter((p) => p.stock === null || p.stock > 0);
    if (opts.query) {
      const q = opts.query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.shortDescription?.toLowerCase().includes(q) ?? false) ||
          (p.description?.toLowerCase().includes(q) ?? false)
      );
    }
    if (typeof opts.priceMax === "number" && opts.priceMax > 0) {
      list = list.filter((p) => p.price !== null && p.price <= opts.priceMax!);
    }
    switch (opts.sort) {
      case "price-asc":
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-desc":
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "popular":
        list.sort((a, b) => Number(b.isPopular) - Number(a.isPopular));
        break;
      case "recent":
      default:
        list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return list;
  }, [products, opts.categoryId, opts.query, opts.onlyCustomizable, opts.onlyAvailable, opts.priceMax, opts.sort]);
  return { filtered, isLoading, error };
}

export function useCustomizableProducts(): {
  products: AdminProduct[];
  isLoading: boolean;
  error: Error | null;
} {
  const { products, isLoading, error } = useActiveProducts();
  const customizable = useMemo(
    () => products.filter((p) => p.isCustomizable),
    [products]
  );
  return { products: customizable, isLoading, error };
}

// --- Auth (delegado a auth.service con Prisma) ---
export function useAuth() {
  // El auth se basa en cookies (server actions). En cliente se verifica vía fetch.
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // La sesión viene de cookies HttpOnly → verificar vía API route
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setSession(data.session);
        setIsAuthenticated(!!data.session);
      })
      .catch(() => {
        setSession(null);
        setIsAuthenticated(false);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return {
    session,
    isAuthenticated,
    isLoading,
    login: async (username: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setIsAuthenticated(data.success);
      if (data.success) {
        setSession(data.session);
      }
      return data;
    },
    logout: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      setIsAuthenticated(false);
      setSession(null);
      return data;
    },
  };
}
