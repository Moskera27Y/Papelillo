"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StatCard } from "@/components/admin/StatCard";
import { AdminCard, AdminBadge, EmptyState } from "@/components/admin/AdminUI";
import {
  useProducts,
  useCategories,
  useRequests,
  useMessages,
  useOrders,
} from "@/hooks/useDataService";
import { getOrderStatsAction, getRequestStatsAction } from "@/app/actions";
import { formatCOP } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS } from "@/services/requests.service";
import type { RequestStatus } from "@/types/admin";

function DashboardContent() {
  const { products, isLoading: productsLoading } = useProducts();
  const { categories, isLoading: catsLoading } = useCategories();
  const { requests, isLoading: requestsLoading } = useRequests();
  const { messages, isLoading: messagesLoading } = useMessages();
  const { orders, isLoading: ordersLoading } = useOrders();
  const [orderStats, setOrderStats] = useState<any>({ total: 0, pending: 0, paymentApproved: 0, revenue30d: 0 });
  const [stats, setStats] = useState<any>({ total: 0, new: 0, review: 0 });

  useEffect(() => {
    getOrderStatsAction().then(setOrderStats).catch(() => {});
    getRequestStatsAction().then(setStats).catch(() => {});
  }, []);

  const isLoading = productsLoading || catsLoading || requestsLoading || messagesLoading || ordersLoading;
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-10 bg-paper-soft rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-paper-soft rounded-2xl border-2 border-ink/10"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }


  const activeProducts = products.filter((p) => p.isActive);
  const outOfStock = products.filter((p) => p.stock !== null && p.stock <= 0);
  const customizable = products.filter((p) => p.isCustomizable);
  const unreadMessages = messages.filter((m) => m.status === "new");

  const recentRequests = requests.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-paper-soft">
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />

        <div className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
              Dashboard
            </h1>
            <p className="text-ink-muted">
              Un vistazo rápido a lo que está pasando en Papelillo.
            </p>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
            <StatCard label="Productos totales" value={products.length} color="yellow" delay={0} />
            <StatCard label="Productos activos" value={activeProducts.length} color="green" delay={0.1} />
            <StatCard label="Agotados" value={outOfStock.length} color="red" delay={0.2} />
            <StatCard label="Personalizables" value={customizable.length} color="blue" delay={0.3} />
            <StatCard label="Categorías" value={categories.length} color="paper" delay={0.4} />
            <StatCard
              label="Pedidos"
              value={orderStats.total}
              color="green"
              hint={`${orderStats.paymentApproved} pagados`}
              delay={0.5}
            />
            <StatCard
              label="Ingresos (30d)"
              value={formatCOP(orderStats.revenue30d)}
              color="blue"
              hint={`${orderStats.orders30d} pedidos`}
              delay={0.6}
            />
            <StatCard
              label="Solicitudes nuevas"
              value={stats.new}
              color="blue"
              hint={`${stats.total} totales`}
              delay={0.7}
            />
            <StatCard
              label="En revisión"
              value={stats.review + stats.contacted}
              color="yellow"
              delay={0.8}
            />
            <StatCard
              label="Mensajes sin leer"
              value={unreadMessages.length}
              color="red"
              delay={0.9}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <AdminCard
              title="Pedidos recientes"
              description="Las últimas compras realizadas."
              action={
                <Link
                  href="/admin/orders"
                  className="text-sm font-bold text-ink hover:text-brand-red"
                >
                  Ver todos →
                </Link>
              }
            >
              {recentOrders.length === 0 ? (
                <EmptyState
                  title="Sin pedidos todavía"
                  description="Cuando los clientes compren, sus pedidos aparecerán aquí."
                />
              ) : (
                <ul className="divide-y divide-ink/10">
                  {recentOrders.map((o) => (
                    <li key={o.id} className="py-3 first:pt-0 last:pb-0">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="flex items-center justify-between gap-4 hover:bg-paper-soft -mx-2 px-2 py-1 rounded-xl transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">
                            {o.number} · {o.customer.name}
                          </p>
                          <p className="text-sm text-ink-muted truncate">
                            {o.items.length} {o.items.length === 1 ? "producto" : "productos"} · {formatCOP(o.total)}
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5">
                            {new Date(o.createdAt).toLocaleString("es-CO")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-ink">{o.status}</p>
                          <p className="text-xs text-ink-muted">{o.payment.status}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCard>

            <AdminCard
              title="Solicitudes recientes"
              description="Las últimas ideas que han llegado a Papelillo."
              action={
                <Link
                  href="/admin/requests"
                  className="text-sm font-bold text-ink hover:text-brand-red"
                >
                  Ver todas →
                </Link>
              }
            >
              {recentRequests.length === 0 ? (
                <EmptyState
                  title="Sin solicitudes todavía"
                  description="Cuando alguien cree su producto personalizado desde el configurador, aparecerá aquí."
                />
              ) : (
                <ul className="divide-y divide-ink/10">
                  {recentRequests.map((r) => (
                    <li key={r.id} className="py-3 first:pt-0 last:pb-0">
                      <Link
                        href={`/admin/requests/${r.id}`}
                        className="flex items-center justify-between gap-4 hover:bg-paper-soft -mx-2 px-2 py-1 rounded-xl transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-ink truncate">
                            {r.customer.name || "Sin nombre"}
                          </p>
                          <p className="text-sm text-ink-muted truncate">
                            {r.config.productName}
                            {r.isOutOfCatalog && " · Fuera de catálogo"}
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5">
                            {new Date(r.createdAt).toLocaleString("es-CO")}
                          </p>
                        </div>
                        <AdminBadge className={STATUS_COLORS[r.status as RequestStatus]}>
                          {STATUS_LABELS[r.status as RequestStatus]}
                        </AdminBadge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCard>

            <AdminCard
              title="Resumen rápido"
              description="Accesos directos para empezar a trabajar."
            >
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/admin/products/new"
                  className="bg-brand-yellow rounded-2xl border-2 border-ink shadow-sticker-sm p-4 hover:-translate-y-0.5 transition-transform"
                >
                  <p className="font-display font-bold text-ink">+ Nuevo producto</p>
                  <p className="text-xs text-ink-muted mt-1">
                    Agrega algo nuevo al catálogo.
                  </p>
                </Link>
                <Link
                  href="/admin/categories"
                  className="bg-brand-green rounded-2xl border-2 border-ink shadow-sticker-sm p-4 hover:-translate-y-0.5 transition-transform"
                >
                  <p className="font-display font-bold text-ink">Categorías</p>
                  <p className="text-xs text-ink-muted mt-1">
                    Organiza el catálogo.
                  </p>
                </Link>
                <Link
                  href="/admin/home"
                  className="bg-brand-red text-paper rounded-2xl border-2 border-ink shadow-sticker-sm p-4 hover:-translate-y-0.5 transition-transform"
                >
                  <p className="font-display font-bold">Editar home</p>
                  <p className="text-xs opacity-90 mt-1">
                    Textos y secciones del inicio.
                  </p>
                </Link>
                <Link
                  href="/admin/settings"
                  className="bg-brand-blue text-paper rounded-2xl border-2 border-ink shadow-sticker-sm p-4 hover:-translate-y-0.5 transition-transform"
                >
                  <p className="font-display font-bold">Configuración</p>
                  <p className="text-xs opacity-90 mt-1">
                    WhatsApp, email, redes, SEO.
                  </p>
                </Link>
              </div>

              <div className="mt-6 bg-paper-soft rounded-2xl border-2 border-ink/10 p-4">
                <p className="font-semibold text-ink mb-2 text-sm">Valor del catálogo</p>
                <p className="font-display text-3xl font-bold text-ink">
                  {formatCOP(
                    products.reduce(
                      (acc, p) => acc + (p.price ?? 0),
                      0
                    )
                  )}
                </p>
                <p className="text-xs text-ink-muted mt-1">
                  Suma de precios fijos y desde (sin cotizaciones).
                </p>
              </div>
            </AdminCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
