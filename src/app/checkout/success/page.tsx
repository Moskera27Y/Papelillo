"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ordersService, wompiService } from "@/services";
const { formatCOP } = wompiService;
import type { Order } from "@/types/admin";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      const o = ordersService.getOrderById(orderId);
      setOrder(o ?? null);
    }
    setLoading(false);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink-muted">Cargando...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl font-bold text-ink mb-4">
            Pedido no encontrado
          </h1>
          <p className="text-ink-muted mb-6">
            No pudimos encontrar el pedido solicitado.
          </p>
          <Link
            href="/"
            className="inline-block bg-ink text-paper font-bold rounded-full px-6 py-3"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.payment.status === "approved";
  const isPending = order.payment.status === "pending";

  return (
    <div className="min-h-screen bg-paper py-12 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 bg-brand-green rounded-full border-4 border-ink flex items-center justify-center shadow-sticker">
            <svg
              className="w-12 h-12 text-paper"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">
            {isPaid
              ? "¡Pedido confirmado!"
              : isPending
              ? "¡Pedido recibido!"
              : "Pedido registrado"}
          </h1>
          <p className="text-lg text-ink-muted">
            {isPaid
              ? "Tu pago fue aprobado. Prepararemos tu pedido con mucho cuidado."
              : isPending
              ? "Hemos recibido tu pedido. Te contactaremos pronto para coordinar el pago y envío."
              : "Hemos registrado tu pedido."}
          </p>
        </div>

        <div className="bg-paper-soft rounded-3xl border-2 border-ink/10 p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-ink/10">
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wide">
                Número de pedido
              </p>
              <p className="font-display text-2xl font-bold text-ink">
                {order.number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-muted uppercase tracking-wide">
                Estado
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  isPaid
                    ? "bg-brand-green text-paper"
                    : isPending
                    ? "bg-brand-yellow text-ink"
                    : "bg-ink/10 text-ink"
                }`}
              >
                {isPaid ? "Pagado" : isPending ? "Pendiente" : order.payment.status}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-ink mb-3">Productos</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-ink">
                    {item.name}
                    <span className="text-ink-muted"> × {item.quantity}</span>
                  </span>
                  <span className="font-bold text-ink">
                    {formatCOP(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-ink/10 space-y-2 text-sm">
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
            <div className="flex justify-between pt-3 border-t border-ink/10 text-base">
              <span className="font-display font-bold text-ink">Total</span>
              <span className="font-display text-xl font-bold text-ink">
                {formatCOP(order.total)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-ink/10">
            <h3 className="font-bold text-ink mb-3">Datos de envío</h3>
            <p className="text-sm text-ink-muted">
              {order.customer.name} {order.customer.lastName}
              <br />
              {order.shipping.address}
              {order.shipping.address2 && `, ${order.shipping.address2}`}
              <br />
              {order.shipping.city}, {order.shipping.department}
              <br />
              Tel: {order.customer.phone}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="bg-ink text-paper font-bold rounded-full px-6 py-3 text-center hover:bg-opacity-90 transition-colors"
          >
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="border-2 border-ink font-bold rounded-full px-6 py-3 text-center hover:bg-ink hover:text-paper transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
