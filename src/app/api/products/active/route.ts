// API route: GET /api/products/active — productos activos con relaciones (Prisma/Neón)
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: { isActive: true },
      include: {
        features: { orderBy: { order: "asc" } },
        options: {
          include: { values: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
        customFields: { orderBy: { order: "asc" } },
        category: { select: { id: true, name: true, slug: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(products);
  } catch {
    return Response.json([], { status: 500 });
  }
}
