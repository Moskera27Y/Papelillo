// ============================================================
// API Route: POST /api/checkout
// Crea orden + genera firma Wompi Integrity para checkout Widget.
// Firma oficial: base64(sha256(integrity_key + reference + amount + currency + ...))
// ============================================================
import { db } from "@/lib/db";
import { getWompiConfig } from "@/services/wompi.service";
import crypto from "crypto";

export const runtime = "nodejs";
export const revalidate = 0; // Nunca cachear (firma única por request)

interface CheckoutRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDepartment: string;
  shippingPostalCode: string;
  customerData?: {
    fullName?: string;
    phoneNumber?: string;
    phoneNumberCountryCode?: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    customizations?: Record<string, string>;
  }>;
  subtotal: number; // en COP (no cents)
  shippingCost: number;
  taxAmount?: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as CheckoutRequest;

    // 1. Validación estricta de campos críticos
    if (!body.customerEmail || !body.customerName) {
      return Response.json({ error: "Faltan datos de cliente" }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return Response.json({ error: "Carrito vacío" }, { status: 400 });
    }

    // 2. Calcular amount de forma SERVER-SIDE (no confiar en cliente)
    const itemsWithProduct = await Promise.all(
      body.items.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: { price: true, name: true },
        });
        if (!product) throw new Error(`Producto no encontrado: ${item.productId}`);
        const unitPrice = product.price ?? 0;
        return {
          ...product,
          quantity: item.quantity,
          total: unitPrice * item.quantity,
        };
      })
    );

    const computedSubtotal = itemsWithProduct.reduce((sum, i) => sum + i.total, 0);
    const shippingCost = body.shippingCost ?? 10000;
    const amountInCents = Math.round((computedSubtotal + shippingCost) * 100);

    if (amountInCents <= 0) {
      return Response.json({ error: "Monto inválido" }, { status: 400 });
    }

    // 3. Crear orden en base de datos
    const order = await db.order.create({
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone ?? null,
        shippingAddress: body.shippingAddress,
        shippingCity: body.shippingCity,
        shippingDepartment: body.shippingDepartment,
        shippingPostalCode: body.shippingPostalCode,
        subtotal: computedSubtotal,
        shippingCost,
        taxAmount: body.taxAmount ?? 0,
        totalAmount: computedSubtotal + shippingCost + (body.taxAmount ?? 0),
        currency: "COP",
        status: "PENDING",
        items: {
          create: body.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            customizations: item.customizations ?? undefined,
          })),
        },
      },
    });

    // 4. Generar firma Wompi (integrity)
    const cfg = getWompiConfig();
    if (!cfg.publicKey) {
      return Response.json({ error: "Wompi no configurado" }, { status: 500 });
    }

    const reference = order.id.substring(0, 16) + Date.now().toString(36);
    const signatureString = `id:${order.id}|amount:${amountInCents}|currency:COP|reference:${reference}`;
    const signature = crypto
      .createHmac("sha256", cfg.integrityKey || process.env.WOMPI_INTEGRITY_KEY || "")
      .update(signatureString)
      .digest("hex");

    // 5. Devolver configuración para abrir Widget
    return Response.json({
      success: true,
      orderId: order.id,
      publicKey: cfg.publicKey,
      amountInCents,
      currency: "COP",
      reference,
      signature,
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://papelillo-web-lilac.vercel.app"}/checkout/success?orderId=${order.id}`,
      environment: cfg.environment,
    });
  } catch (err: any) {
    console.error("[checkout]", err);
    return Response.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}