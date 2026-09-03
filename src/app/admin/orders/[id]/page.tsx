"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useOrder, useSiteSettings } from "@/hooks/useDataService";
import {
  updateOrderStatusAction,
  updateOrderPaymentStatusAction,
  updateOrderShippingAction,
  addOrderNoteAction,
  deleteOrderAction,
} from "@/app/actions";
import { formatCOP } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types/admin";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "ready",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  processing: "En preparación",
  ready: "Listo",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { order, isLoading } = useOrder(orderId);
  const { settings } = useSiteSettings();

  const [note, setNote] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState(order?.shipping.carrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(order?.shipping.trackingNumber ?? "");

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-paper-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-muted">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    await updateOrderStatusAction(orderId, newStatus);
  };

  const handlePaymentStatusChange = async (newStatus: PaymentStatus) => {
    await updateOrderPaymentStatusAction(orderId, newStatus);
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    await addOrderNoteAction(orderId, note.trim());
    setNote("");
  };

  const handleUpdateShipping = async () => {
    await updateOrderShippingAction(orderId, {
      carrier: shippingCarrier || undefined,
      trackingNumber: trackingNumber || undefined,
    });
  };

  const handleDelete = async () => {
    if (confirm("¿Seguro que deseas eliminar este pedido? Esta acción no se puede deshacer.")) {
      await deleteOrderAction(orderId);
      router.push("/admin/orders");
    }
  };

  const whatsappNumber = settings?.contact?.whatsapp;
  const waMsg = encodeURIComponent(
    `Hola ${order.customer.name}, te escribimos de Papelillo sobre tu pedido ${order.number}...`
  );
  const waLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${waMsg}`
    : "#";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="text-sm text-ink-muted hover:text-brand-red transition-colors"
        >
          ← Volver a pedidos
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-ink-muted uppercase tracking-wide">Pedido</p>
          <h1 className="font-display text-4xl font-bold text-ink">{order.number}</h1>
          <p className="text-sm text-ink-muted mt-1">
            Creado el{" "}
            {new Date(order.createdAt).toLocaleString("es-CO", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-green text-ink font-bold rounded-full px-4 py-2 text-sm hover:bg-opacity-90 transition-colors"
          >
            💬 Contactar por WhatsApp
          </a>
          <button
            onClick={handleDelete}
            className="bg-brand-red text-paper font-bold rounded-full px-4 py-2 text-sm hover:bg-opacity-90 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productos */}
          <section className="bg-paper-soft rounded-3xl border-2 border-ink/10 p-6">
            <h2 className="font-display text-xl font-bold text-ink mb-4">Productos</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 pb-3 border-b border-ink/10 last:border-0"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-ink/10"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-ink/5 border-2 border-ink/10 flex items-center justify-center text-2xl">
                      📦
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink">{item.name}</p>
                    <p className="text-sm text-ink-muted">
                      {formatCOP(item.unitPrice)} × {item.quantity}
                    </p>
                    {item.customization &&
                      Object.keys(item.customization).length > 0 && (
                        <div className="mt-1 text-xs text-ink-muted">
                          {Object.entries(item.customization).map(([k, v]) => (
                            <span key={k} className="mr-2">
                              <span className="font-semibold">{k}:</span> {v}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                  <p className="font-bold text-ink">
                    {formatCOP(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-ink/10 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Subtotal</span>
                <span className="font-bold text-ink">{formatCOP(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Envío</span>
                <span className="font-bold text-ink">
                  {formatCOP(order.shipping.cost)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-ink/10 text-base">
                <span className="font-display font-bold text-ink">Total</span>
                <span className="font-display text-xl font-bold text-ink">
                  {formatCOP(order.total)}
                </span>
              </div>
            </div>
          </section>

          {/* Cliente y envío */}
          <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-paper-soft rounded-3xl border-2 border-ink/10 p-6">
              <h3 className="font-display text-lg font-bold text-ink mb-3">Cliente</h3>
              <p className="font-bold text-ink">
                {order.customer.name} {order.customer.lastName}
              </p>
              <p className="text-sm text-ink-muted">{order.customer.email}</p>
              <p className="text-sm text-ink-muted">{order.customer.phone}</p>
              {order.customer.documentNumber && (
                <p className="text-sm text-ink-muted mt-2">
                  {order.customer.documentType}: {order.customer.documentNumber}
                </p>
              )}
            </div>

            <div className="bg-paper-soft rounded-3xl border-2 border-ink/10 p-6">
              <h3 className="font-display text-lg font-bold text-ink mb-3">Envío</h3>
              <p className="text-sm text-ink">
                {order.shipping.address}
                {order.shipping.address2 && `, ${order.shipping.address2}`}
              </p>
              <p className="text-sm text-ink">
                {order.shipping.city}, {order.shipping.department}
              </p>
              {order.shipping.postalCode && (
                <p className="text-sm text-ink-muted">CP: {order.shipping.postalCode}</p>
              )}
              {order.shipping.notes && (
                <p className="text-xs text-ink-muted mt-2 italic">
                  Nota: {order.shipping.notes}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-ink/10 space-y-2">
                <label className="block text-xs font-bold text-ink">Transportadora</label>
                <input
                  type="text"
                  value={shippingCarrier}
                  onChange={(e) => setShippingCarrier(e.target.value)}
                  placeholder="Servientrega, Interrapidísimo..."
                  className="w-full px-3 py-2 rounded-full border-2 border-ink/15 bg-paper text-sm focus:border-ink focus:outline-none"
                />
                <label className="block text-xs font-bold text-ink">N° de guía</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Número de seguimiento"
                  className="w-full px-3 py-2 rounded-full border-2 border-ink/15 bg-paper text-sm focus:border-ink focus:outline-none"
                />
                <button
                  onClick={handleUpdateShipping}
                  className="w-full bg-ink text-paper text-xs font-bold rounded-full py-2 hover:bg-opacity-90 transition-colors"
                >
                  Guardar datos de envío
                </button>
              </div>
            </div>
          </section>

          {/* Notas */}
          <section className="bg-paper-soft rounded-3xl border-2 border-ink/10 p-6">
            <h3 className="font-display text-lg font-bold text-ink mb-3">
              Notas internas
            </h3>
            {order.notes.length > 0 ? (
              <div className="space-y-2 mb-4">
                {order.notes.map((n) => (
                  <div
                    key={n.id}
                    className="bg-paper rounded-2xl px-4 py-3 border border-ink/10"
                  >
                    <p className="text-sm text-ink">{n.text}</p>
                    <p className="text-xs text-ink-muted mt-1">
                      {new Date(n.createdAt).toLocaleString("es-CO")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted mb-4">Sin notas aún.</p>
            )}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Agregar una nota..."
              rows={2}
              className="w-full px-4 py-2 rounded-2xl border-2 border-ink/15 bg-paper text-sm focus:border-ink focus:outline-none"
            />
            <button
              onClick={handleAddNote}
              className="mt-2 bg-ink text-paper text-xs font-bold rounded-full px-4 py-2 hover:bg-opacity-90 transition-colors"
            >
              Agregar nota
            </button>
          </section>
        </div>

        {/* Sidebar con estado y pago */}
        <aside className="space-y-6">
          <div className="bg-paper-soft rounded-3xl border-2 border-ink/10 p-6">
            <h3 className="font-display text-lg font-bold text-ink mb-3">
              Estado del pedido
            </h3>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-ink/15 bg-paper focus:border-ink focus:outline-none font-bold"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            {order.shipping.shippedAt && (
              <p className="text-xs text-ink-muted mt-3">
                📤 Enviado:{" "}
                {new Date(order.shipping.shippedAt).toLocaleDateString("es-CO")}
              </p>
            )}
            {order.shipping.deliveredAt && (
              <p className="text-xs text-ink-muted mt-1">
                ✅ Entregado:{" "}
                {new Date(order.shipping.deliveredAt).toLocaleDateString("es-CO")}
              </p>
            )}
          </div>

          <div className="bg-paper-soft rounded-3xl border-2 border-ink/10 p-6">
            <h3 className="font-display text-lg font-bold text-ink mb-3">Pago</h3>
            <p className="text-sm text-ink-muted mb-2">
              Método: <span className="font-bold text-ink uppercase">{order.payment.method}</span>
            </p>
            <p className="text-sm text-ink-muted mb-3">
              Referencia:{" "}
              <span className="font-mono text-xs text-ink">
                {order.payment.reference}
              </span>
            </p>
            {order.payment.wompiTransactionId && (
              <p className="text-xs text-ink-muted mb-3">
                Wompi TX:{" "}
                <span className="font-mono">{order.payment.wompiTransactionId}</span>
              </p>
            )}

            <label className="block text-xs font-bold text-ink mb-2">
              Cambiar estado de pago
            </label>
            <select
              value={order.payment.status}
              onChange={(e) =>
                handlePaymentStatusChange(e.target.value as PaymentStatus)
              }
              className="w-full px-3 py-2 rounded-2xl border-2 border-ink/15 bg-paper text-sm focus:border-ink focus:outline-none"
            >
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="declined">Rechazado</option>
              <option value="expired">Expirado</option>
              <option value="refunded">Reembolsado</option>
            </select>

            {order.payment.paidAt && (
              <p className="text-xs text-brand-green mt-3">
                ✓ Pagado el{" "}
                {new Date(order.payment.paidAt).toLocaleString("es-CO")}
              </p>
            )}
            {order.payment.failureReason && (
              <p className="text-xs text-brand-red mt-3">
                ⚠ {order.payment.failureReason}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
