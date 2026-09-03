// ============================================================
// API Route: /api/wompi/webhook
// Recibe los eventos enviados por Wompi cuando una transacción
// cambia de estado (APPROVED, DECLINED, etc.).
// Valida la firma HMAC-SHA256 usando EVENTS_SECRET.
// ============================================================

import { NextResponse } from "next/server";
import crypto from "crypto";

// Nota: en esta versión, los pedidos se guardan en localStorage
// (client-side). Los webhooks de Wompi requieren un backend
// persistente real (base de datos) para funcionar en producción.
// Esta ruta está preparada para recibir webhooks y registrarlos,
// pero NO puede actualizar pedidos que viven en localStorage.
// Para producción, migrar a Supabase/Prisma/etc.

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signatureHeader =
      req.headers.get("x-wompi-signature") ||
      req.headers.get("x-signature") ||
      req.headers.get("x-event-signature");

    const eventsSecret = process.env.WOMPI_EVENTS_SECRET;

    // Si hay secreto configurado, validar firma
    if (eventsSecret) {
      if (!signatureHeader) {
        return NextResponse.json(
          { error: "Falta firma en el webhook" },
          { status: 401 }
        );
      }

      // Wompi usa HMAC-SHA256 con hex como firma
      const expected = crypto
        .createHmac("sha256", eventsSecret)
        .update(rawBody)
        .digest("hex");

      if (
        !crypto.timingSafeEqual(
          Buffer.from(signatureHeader, "hex"),
          Buffer.from(expected, "hex")
        )
      ) {
        return NextResponse.json(
          { error: "Firma inválida" },
          { status: 401 }
        );
      }
    }

    // Parsear evento
    let event: {
      event?: string;
      data?: {
        transaction?: {
          id: string;
          reference: string;
          status: string;
          amount_in_cents: number;
          status_message?: string;
        };
      };
    };
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "JSON inválido" },
        { status: 400 }
      );
    }

    // Log del evento (en producción esto debería guardarse en una DB)
    console.log("[WOMPI WEBHOOK]", {
      event: event.event,
      transaction: event.data?.transaction,
      receivedAt: new Date().toISOString(),
    });

    // En una implementación real con DB, aquí actualizaríamos
    // el pedido correspondiente:
    // const order = getOrderByPaymentRef(event.data.transaction.reference);
    // updatePaymentStatus(order.id, mapStatus(tx.status), {...});

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error en /api/wompi/webhook:", err);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

// Wompi hace un GET para validar el endpoint
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
