// API route: GET /api/products/slug/:slug — un producto activo por slug (Prisma/Neón)
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const product = await db.product.findUnique({
      where: { slug: params.slug },
      include: {
        features: { orderBy: { order: "asc" } },
        options: {
          include: { values: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
        customFields: { orderBy: { order: "asc" } },
        category: { select: { id: true, name: true, slug: true, color: true } },
      },
    });
    if (!product || !product.isActive) {
      return Response.json(null, { status: 404 });
    }
    return Response.json(product);
  } catch {
    return Response.json(null, { status: 500 });
  }
}
