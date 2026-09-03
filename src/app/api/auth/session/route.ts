// API route: GET /api/auth/session — devuelve la sesión actual del admin
import { getSessionAction } from "@/app/actions";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSessionAction();
    return Response.json({ session });
  } catch {
    return Response.json({ session: null });
  }
}
