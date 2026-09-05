// ============================================================
// API Route: /api/wompi/signature
// Genera la firma de integridad para una transacción de Wompi.
// Esta firma usa la INTEGRITY KEY (secreta) y NUNCA debe
// hacerse en el frontend.
// ============================================================

import { NextResponse } from "next/server";
import crypto from "crypto";

// 🔐 Security: cache simple anti-replay (reference única por ventana)
const signatureCache = new Map<string, number>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hora (larga vida de firma)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reference, amountInCents, currency } = body as {
      reference: string;
      amountInCents: number;
      currency: string;
    };

    // 🔐 Security: validación estricta de tipos (evita type coercion)
    if (
      typeof reference !== "string" ||
      typeof amountInCents !== "number" ||
      !Number.isFinite(amountInCents) ||
      amountInCents < 0 ||
      typeof currency !== "string"
    ) {
      return NextResponse.json(
        { error: "Faltan o son inválidos parámetros: reference, amountInCents, currency" },
        { status: 400 }
      );
    }

    const integrityKey = process.env.WOMPI_INTEGRITY_KEY;
    if (!integrityKey) {
      return NextResponse.json(
        { error: "WOMPI_INTEGRITY_KEY no está configurada en el servidor" },
        { status: 500 }
      );
    }

    // 🔐 Security: anti-replay — misma reference dentro del TTL rechaza
    const now = Date.now();
    const cached = signatureCache.get(reference);
    if (cached && now - cached < CACHE_TTL_MS) {
      console.warn("[security] replay attempt on wompi signature:", reference);
      return NextResponse.json(
        { error: "Firma duplicada (replay) rechazada" },
        { status: 409 }
      );
    }
    signatureCache.set(reference, now);

    // Limpieza de cache viejo
    if (signatureCache.size > 1000) {
      signatureCache.forEach((ts, key) => {
        if (now - ts > CACHE_TTL_MS) signatureCache.delete(key);
      });
    }

    // Wompi requiere SHA-256 hex de:
    // reference + amountInCents + currency + integrityKey
    const message = `${reference}${amountInCents}${currency}${integrityKey}`;
    const signature = crypto
      .createHash("sha256")
      .update(message)
      .digest("hex");

    return NextResponse.json({ signature });
  } catch (err) {
    console.error("Error en /api/wompi/signature:", err);
    return NextResponse.json(
      { error: "Error interno al generar la firma" },
      { status: 500 }
    );
  }
}
