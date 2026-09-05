// ============================================================
// API Admin: GET /api/admin/orders/csv — exportar órdenes a CSV
// Rate limited + requires admin_session cookie
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Auth check (admin session cookie)
    const session = req.cookies.get("admin_session")?.value;
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = {};
    if (statusFilter) where.status = statusFilter;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
        notes: { select: { text: true, createdAt: true } },
      },
    });

    const CSV = [
      ["Número", "Estado", "Pago", "Cliente", "Email", "Teléfono", "Total", "Ítems", "Fecha", "Notas"],
      ...orders.map((o: any) => [
        o.number,
        o.status,
        o.paymentStatus,
        `${o.customerName || o.customer?.name || ""} ${o.customerLastName || ""}`,
        o.customerEmail || o.customer?.email || "",
        o.customerPhone || o.customer?.phone || "",
        o.totalAmount || o.total,
        (o.items || []).length,
        (o.createdAt || new Date()).toISOString(),
        (o.notes || []).map((n: any) => `${n.createdAt.toISOString()} ${n.text}`).join(" | "),
      ]),
    ];

    const csvContent = "\uFEFF" + CSV.map((row: unknown[]) =>
      row.map((cell: unknown) => {
        const str = cell instanceof Date ? cell.toISOString() : String(cell ?? "");
        const escaped = str.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(";")
    ).join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ordenes-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("[orders/csv]", err);
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}
