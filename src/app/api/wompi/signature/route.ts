// ============================================================
// API Route: /api/wompi/signature
// Genera la firma de integridad para una transacción de Wompi.
// Esta firma usa la INTEGRITY KEY (secreta) y NUNCA debe
// hacerse en el frontend.
// ============================================================

import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reference, amountInCents, currency } = body as {
      reference: string;
      amountInCents: number;
      currency: string;
    };

    if (!reference || typeof amountInCents !== "number" || !currency) {
      return NextResponse.json(
        { error: "Faltan parámetros: reference, amountInCents, currency" },
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
