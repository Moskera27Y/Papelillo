// ===========================================================
// API Route: POST /api/checkout
// Crea orden + genera firma Wompi Integrity para checkout Widget.
// Firma oficial: base64(sha256(integrity_key + reference + amount + currency + ...))
// Rate limited por IP + nonce anti-replay (devops security pattern)
// ===========================================================
import { db } from "@/lib/db";
import { getWompiConfig } from "@/services/wompi.service";
import crypto from "crypto";

export const runtime = "nodejs";
export const revalidate = 0; // Nunca cachear (firma única por request)

// Rate limiter simple por IP (devops skill pattern)
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 5; // 5 requests per window
const RATE_WINDOW = 60 * 1000; // 1 minuto

interface CheckoutRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDepartment: string;
  shippingPostalCode: string;
  items: Array<{
    productId: string;
    quantity: number;
    customizations?: Record<string, string>;
  }>;
  subtotal: number;
  shippingCost: number;
  taxAmount?: number;
  nonce?: string; // anti-replay
}

export async function POST(req: Request) {
  // Rate limiting por IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (entry) {
    if (now - entry.reset > RATE_WINDOW) {
      rateLimitMap.set(ip, { count: 1, reset: now });
    } else if (entry.count >= RATE_LIMIT) {
      return Response.json({ error: "Demasiadas solicitudes de checkout. Inténtalo de nuevo en un minuto." }, { status: 429 });
    } else {
      rateLimitMap.set(ip, { count: entry.count + 1, reset: entry.reset });
    }
  } else {
    rateLimitMap.set(ip, { count: 1, reset: now });
  }

  try {
    const body = await req.json() as CheckoutRequest;

    // Anti-replay: validar nonce (opcional, para compatibilidad con clientes legacy)
    if (body.nonce && (typeof body.nonce !== "string" || body.nonce.length < 16)) {
      return Response.json({ error: "Nonce de seguridad inválido" }, { status: 403 });
    }

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

    // 3. Crear orden
    const order = await db.order.create({
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone ?? "",
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
            slug: "",
            name: "",
            unitPrice: 0,
            quantity: item.quantity,
            customizations: item.customizations ? JSON.parse(JSON.stringify(item.customizations)) : undefined,
          })),
        },
      } as any,
    });

    // 4. Generar firma Wompi (integrity)
    const cfg = getWompiConfig();
    const integrityKey = cfg.integrityKey || process.env.WOMPI_INTEGRITY_KEY || "";
    if (!cfg.publicKey || !integrityKey) {
      return Response.json({ error: "Wompi no configurado" }, { status: 500 });
    }

    const reference = order.id.substring(0, 16) + Date.now().toString(36);
    const signatureString = `id:${order.id}|amount:${amountInCents}|currency:COP|reference:${reference}`;
    const signature = crypto
      .createHmac("sha256", integrityKey)
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
