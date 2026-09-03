// API route: GET /api/orders/:id — devuelve un pedido con items + notes (Prisma/Neón)
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        notes: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!order) {
      return Response.json(null, { status: 404 });
    }
    return Response.json(order);
  } catch {
    return Response.json(null, { status: 500 });
  }
}
