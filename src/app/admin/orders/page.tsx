"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useOrders } from "@/hooks/useDataService";
import { getOrderStatsAction } from "@/app/actions";
import { formatCOP } from "@/services/wompi.service";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { Order, OrderStatus } from "@/types/admin";

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-brand-yellow text-ink" },
  paid: { label: "Pagado", color: "bg-brand-green text-paper" },
  processing: { label: "En preparación", color: "bg-brand-blue text-paper" },
  ready: { label: "Listo", color: "bg-brand-blue text-paper" },
  shipped: { label: "Enviado", color: "bg-ink text-paper" },
  delivered: { label: "Entregado", color: "bg-brand-green text-paper" },
  cancelled: { label: "Cancelado", color: "bg-brand-red text-paper" },
  refunded: { label: "Reembolsado", color: "bg-ink/20 text-ink" },
};

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  approved: { label: "Aprobado", color: "bg-brand-green text-paper" },
  pending: { label: "Pendiente", color: "bg-brand-yellow text-ink" },
  declined: { label: "Rechazado", color: "bg-brand-red text-paper" },
  expired: { label: "Expirado", color: "bg-ink/20 text-ink" },
  refunded: { label: "Reembolsado", color: "bg-ink/20 text-ink" },
  error: { label: "Error", color: "bg-brand-red text-paper" },
};

export default function AdminOrdersPage() {
  const { orders, isLoading } = useOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<any>({ total: 0, pending: 0, paymentApproved: 0, revenue30d: 0 });

  useEffect(() => {
    getOrderStatsAction().then((s) => setStats(s ?? stats)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.number.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.customer.phone.includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-paper-soft rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-paper-soft rounded-2xl border-2 border-ink/10"></div>
            ))}
          </div>
          <div className="h-12 bg-paper-soft rounded mb-4"></div>
          <div className="h-96 bg-paper-soft rounded-3xl border-2 border-ink/10"></div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-paper-soft">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-4xl font-bold text-ink mb-2">Pedidos</h1>
        <p className="text-ink-muted">
          Gestiona todos los pedidos de Papelillo
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total pedidos" value={stats.total} icon="📦" color="bg-paper-soft" />
        <StatCard label="Pendientes" value={stats.pending} icon="⏳" color="bg-brand-yellow/30" />
        <StatCard label="Pagados" value={stats.paymentApproved} icon="✅" color="bg-brand-green/30" />
        <StatCard label="Ingresos (30 días)" value={formatCOP(stats.revenue30d)} icon="💰" color="bg-brand-blue/30" />
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número, cliente, email..."
          className="flex-1 px-4 py-3 rounded-full border-2 border-ink/15 bg-paper focus:border-ink focus:outline-none transition-colors"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
          className="px-4 py-3 rounded-full border-2 border-ink/15 bg-paper focus:border-ink focus:outline-none transition-colors"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-paper-soft rounded-3xl border-2 border-ink/10">
          <p className="text-2xl mb-2">📭</p>
          <p className="font-display text-xl font-bold text-ink">
            No hay pedidos aún
          </p>
          <p className="text-ink-muted">
            Los pedidos aparecerán aquí cuando los clientes realicen compras.
          </p>
        </div>
      ) : (
        <div className="bg-paper rounded-3xl border-2 border-ink/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-paper-soft border-b-2 border-ink/10">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Pedido
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Fecha
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Pago
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-paper-soft transition-colors"
                  >
                    <td className="px-4 py-4">
                      <p className="font-display font-bold text-ink">
                        {order.number}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-ink">
                        {order.customer.name} {order.customer.lastName}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {order.customer.email}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-ink-muted">
                      {new Date(order.createdAt).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 font-bold text-ink">
                      {formatCOP(order.total)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          PAYMENT_LABELS[order.payment.status]?.color ??
                          "bg-ink/10 text-ink"
                        }`}
                      >
                        {PAYMENT_LABELS[order.payment.status]?.label ??
                          order.payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          STATUS_LABELS[order.status].color
                        }`}
                      >
                        {STATUS_LABELS[order.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-block bg-ink text-paper text-xs font-bold rounded-full px-3 py-1.5 hover:bg-opacity-90 transition-colors"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-2xl p-4 border-2 border-ink/10`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
