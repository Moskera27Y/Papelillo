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

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className={`${color} rounded-2xl border-2 border-ink/10 p-4 text-center flex flex-col items-center gap-1`}>
      <span className="text-2xl">{icon}</span>
      <div className="text-2xl font-bold text-ink">{value}</div>
      <div className="text-xs text-ink-muted font-medium">{label}</div>
    </div>
  );
}

function OrdersTable({ orders, onExport }: { orders: any[]; onExport: () => void }) {
  if (!orders.length) {
    return (
      <div className="text-center py-12 bg-paper rounded-3xl border-2 border-ink/10">
        <p className="text-ink-muted">No hay pedidos todavía</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b-2 border-ink/10">
            <th className="py-3 text-xs font-bold uppercase text-ink-muted">Pedido</th>
            <th className="py-3 text-xs font-bold uppercase text-ink-muted">Cliente</th>
            <th className="py-3 text-xs font-bold uppercase text-ink-muted">Estado</th>
            <th className="py-3 text-xs font-bold uppercase text-ink-muted">Pago</th>
            <th className="py-3 text-xs font-bold uppercase text-ink-muted text-right">Total</th>
            <th className="py-3 text-xs font-bold uppercase text-ink-muted">Fecha</th>
            <th className="py-3 text-right"><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const statusLabel = STATUS_LABELS[order.status as OrderStatus] || { label: order.status, color: "bg-ink/10" };
            const payLabel = PAYMENT_LABELS[order.paymentStatus || "pending"] || { label: "Pendiente", color: "bg-brand-yellow/30" };
            return (
              <tr key={order.id} className="border-b border-ink/5 hover:bg-paper-soft/50">
                <td className="py-3 font-bold text-brand-red">#{order.number}</td>
                <td className="py-3">
                  <div className="font-medium">{order.customer?.name || order.customerName}</div>
                  <div className="text-xs text-ink-muted">{order.customer?.email || order.customerEmail}</div>
                </td>
                <td className="py-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${statusLabel.color}`}>{statusLabel.label}</span>
                </td>
                <td className="py-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${payLabel.color}`}>{payLabel.label}</span>
                </td>
                <td className="py-3 text-right font-bold">{formatCOP(order.totalAmount || order.total)}</td>
                <td className="py-3 text-sm text-ink-muted">{new Date(order.createdAt).toLocaleDateString("es-CO")}</td>
                <td className="py-3 text-right">
                  <Link href={`/admin/orders/${order.id}`} className="text-xs font-bold text-brand-blue hover:underline">Ver</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

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
          (o.customer?.name || (o as any).customerName || "").toLowerCase().includes(q) ||
          (o.customer?.email || (o as any).customerEmail || "").toLowerCase().includes(q) ||
          (o.customer?.phone || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  if (isLoading) {
    return (
      <AuthGuard>
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
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-paper-soft">
        <AdminSidebar />

        <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8">
          {/* Toolbar: filters + export */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-full border-2 border-ink/15 bg-paper text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl.label}</option>
                ))}
              </select>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número, nombre, email, teléfono..."
                className="px-4 py-1.5 rounded-full border-2 border-ink/15 bg-paper text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
              />
            </div>
            <button
              onClick={() => (window.location.href = "/api/admin/orders/csv")}
              className="bg-brand-green hover:bg-brand-green/90 text-ink font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
              Exportar CSV
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total" value={stats.total} icon="📦" color="bg-paper" />
            <StatCard label="Pendientes" value={stats.pending} icon="⏳" color="bg-brand-yellow/30" />
            <StatCard label="Pagados" value={stats.paymentApproved} icon="✅" color="bg-brand-green/30" />
            <StatCard label="Ingresos (30 días)" value={formatCOP(stats.revenue30d)} icon="💰" color="bg-brand-blue/30" />
          </div>

          <OrdersTable orders={filtered} onExport={() => {}} />
        </main>
      </div>
    </AuthGuard>
  );
}
